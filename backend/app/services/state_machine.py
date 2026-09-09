import uuid
import json
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.db_models import (
    SessionModel,
    ProblemStatementModel,
    ClarificationModel,
    SolutionModel,
    DocumentModel
)
from app.redis_client import redis_store
from app.services.ai_service import ai_service
from app.services.claude_service import claude_service
from app.services.doc_generator import doc_generator
from app.services.solution_validator import validate_solution_context_semantics
from app.models.pydantic_models import (
    SubmitProblemResponse,
    ClarifyResponse,
    SolutionsResponse,
    SolutionItem,
    SelectSolutionResponse,
    SolutionAnalysisResponse,
    GenerateDocumentsResponse,
    DocumentItemInfo,
    SuccessCriteriaBenefits,
    SessionStatusResponse
)

logger = logging.getLogger("digitalization_advisor.state_machine")

class StateMachineEngine:

    async def submit_problem(self, problem_statement: str, db: Session) -> SubmitProblemResponse:
        session_id = str(uuid.uuid4())
        
        # Create MySQL Session record
        session_rec = SessionModel(id=session_id, status="UNDERSTANDING")
        db.add(session_rec)
        
        # Save raw problem statement
        prob_rec = ProblemStatementModel(session_id=session_id, raw_text=problem_statement)
        db.add(prob_rec)
        db.commit()

        # Set Redis state & round counter = 0
        redis_store.set_session_stage(session_id, "UNDERSTANDING")
        
        # Stage 2: Understanding Agent Clarity Check via Gemini AI
        clarity_res = await claude_service.check_problem_clarity(problem_statement)

        if clarity_res.is_clear:
            session_rec.status = "SOLUTIONS_READY"
            prob_rec.clarified_text = problem_statement
            db.commit()
            redis_store.set_session_stage(session_id, "SOLUTIONS_READY")

            return SubmitProblemResponse(
                session_id=session_id,
                stage="SOLUTIONS_READY",
                is_clear=True,
                clarification_round=0,
                question=None,
                missing_info=[],
                message="Problem statement is clear! Ready to generate solution options."
            )
        else:
            session_rec.status = "CLARIFICATION"
            db.commit()
            redis_store.set_session_stage(session_id, "CLARIFICATION")
            
            # Record clarification question round 1
            clar_rec = ClarificationModel(
                session_id=session_id,
                round=1,
                question=clarity_res.question or "Could you provide more context regarding your requirements?",
                answer=None
            )
            db.add(clar_rec)
            db.commit()

            return SubmitProblemResponse(
                session_id=session_id,
                stage="CLARIFICATION",
                is_clear=False,
                clarification_round=1,
                question=clar_rec.question,
                missing_info=clarity_res.missing_info,
                message="We need a bit more clarity to give you the best solutions."
            )

    async def answer_clarification(self, session_id: str, answer: str, db: Session) -> ClarifyResponse:
        session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session_rec:
            raise ValueError("Session not found")

        # Get current clarification count from Redis
        current_round = redis_store.get_clarify_count(session_id) + 1
        redis_store.increment_clarify_count(session_id)

        # Update answer in database
        clar_rec = db.query(ClarificationModel).filter(
            ClarificationModel.session_id == session_id,
            ClarificationModel.round == current_round
        ).first()

        if clar_rec:
            clar_rec.answer = answer
        else:
            clar_rec = ClarificationModel(session_id=session_id, round=current_round, question="Clarification round", answer=answer)
            db.add(clar_rec)
        db.commit()

        # Fetch problem statement & history
        prob_rec = db.query(ProblemStatementModel).filter(ProblemStatementModel.session_id == session_id).first()
        raw_problem = prob_rec.raw_text if prob_rec else ""
        
        all_qa = db.query(ClarificationModel).filter(ClarificationModel.session_id == session_id).all()
        qa_history = [{"round": q.round, "question": q.question, "answer": q.answer or ""} for q in all_qa]

        # Check if max rounds (2) reached
        if current_round >= 2:
            session_rec.status = "SOLUTIONS_READY"
            if prob_rec:
                prob_rec.clarified_text = raw_problem + " | " + " ".join([f"Q: {q['question']} A: {q['answer']}" for q in qa_history])
            db.commit()
            redis_store.set_session_stage(session_id, "SOLUTIONS_READY")

            return ClarifyResponse(
                session_id=session_id,
                stage="SOLUTIONS_READY",
                is_clear=True,
                clarification_round=current_round,
                question=None,
                missing_info=[],
                message="Clarification limit reached (2 rounds). Proceeding to solution generation!"
            )

        # Check clarity with updated answers
        clarity_res = await claude_service.check_problem_clarity(raw_problem, qa_history)

        if clarity_res.is_clear:
            session_rec.status = "SOLUTIONS_READY"
            if prob_rec:
                prob_rec.clarified_text = raw_problem + " | " + " ".join([f"Q: {q['question']} A: {q['answer']}" for q in qa_history])
            db.commit()
            redis_store.set_session_stage(session_id, "SOLUTIONS_READY")

            return ClarifyResponse(
                session_id=session_id,
                stage="SOLUTIONS_READY",
                is_clear=True,
                clarification_round=current_round,
                question=None,
                missing_info=[],
                message="Thank you! The requirements are now clear. Ready to generate solution options."
            )
        else:
            next_round = current_round + 1
            next_question = clarity_res.question or "Could you clarify additional technical or operational constraints?"
            
            new_clar = ClarificationModel(session_id=session_id, round=next_round, question=next_question, answer=None)
            db.add(new_clar)
            db.commit()

            return ClarifyResponse(
                session_id=session_id,
                stage="CLARIFICATION",
                is_clear=False,
                clarification_round=next_round,
                question=next_question,
                missing_info=clarity_res.missing_info,
                message="Additional clarification requested."
            )

    async def generate_solutions(self, session_id: str, db: Session) -> SolutionsResponse:
        session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session_rec:
            raise ValueError("Session not found")

        prob_rec = db.query(ProblemStatementModel).filter(ProblemStatementModel.session_id == session_id).first()
        raw_problem = prob_rec.raw_text if prob_rec else ""
        
        all_qa = db.query(ClarificationModel).filter(ClarificationModel.session_id == session_id).all()
        qa_history = [{"round": q.round, "question": q.question, "answer": q.answer or ""} for q in all_qa if q.answer]

        # Call Gemini AI via solution pipeline with Relevance Gate
        analysis, solutions = await ai_service.generate_solutions_with_relevance_gate(raw_problem, qa_history)

        # Clear existing solution records for this session if re-generating
        db.query(SolutionModel).filter(SolutionModel.session_id == session_id).delete()
        
        saved_items = []
        for sol in solutions:
            sol_rec = SolutionModel(
                session_id=session_id,
                title=sol.title,
                data=json.dumps(sol.model_dump()),
                is_selected=False
            )
            db.add(sol_rec)
            db.flush()
            sol.id = sol_rec.id
            saved_items.append(sol)

        session_rec.status = "SOLUTIONS_GENERATED"
        db.commit()
        redis_store.set_session_stage(session_id, "SOLUTIONS_GENERATED")

        return SolutionsResponse(
            session_id=session_id,
            stage="SOLUTIONS_GENERATED",
            solutions=saved_items
        )

    async def select_solution(self, session_id: str, solution_id: int, db: Session) -> SelectSolutionResponse:
        session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session_rec:
            raise ValueError("Session not found")

        # Mark selected solution
        solutions_recs = db.query(SolutionModel).filter(SolutionModel.session_id == session_id).all()
        selected_rec = None
        for s in solutions_recs:
            if s.id == solution_id:
                s.is_selected = True
                selected_rec = s
            else:
                s.is_selected = False
        
        if not selected_rec:
            raise ValueError(f"Solution ID {solution_id} not found in session")

        db.commit()

        sol_item = SolutionItem(**json.loads(selected_rec.data))
        sol_item.id = selected_rec.id
        sol_item.is_selected = True

        prob_rec = db.query(ProblemStatementModel).filter(ProblemStatementModel.session_id == session_id).first()
        raw_problem = prob_rec.raw_text if prob_rec else ""
        all_qa = db.query(ClarificationModel).filter(ClarificationModel.session_id == session_id).all()
        qa_history = [{"round": q.round, "question": q.question, "answer": q.answer or ""} for q in all_qa]

        # Extract problem analysis and run Stage 6 Deep Analysis via Gemini AI
        problem_analysis = await ai_service.analyze_problem(raw_problem, qa_history)
        analysis = await ai_service.analyze_selected_solution(problem_analysis, sol_item, raw_problem)

        session_rec.status = "SOLUTION_SELECTED"
        db.commit()
        redis_store.set_session_stage(session_id, "SOLUTION_SELECTED")

        return SelectSolutionResponse(
            session_id=session_id,
            stage="SOLUTION_SELECTED",
            selected_solution=sol_item,
            analysis=analysis
        )

    async def generate_documents(self, session_id: str, db: Session) -> GenerateDocumentsResponse:
        session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session_rec:
            raise ValueError("Session not found")

        selected_sol_rec = db.query(SolutionModel).filter(
            SolutionModel.session_id == session_id,
            SolutionModel.is_selected == True
        ).first()
        
        if not selected_sol_rec:
            selected_sol_rec = db.query(SolutionModel).filter(SolutionModel.session_id == session_id).first()

        if not selected_sol_rec:
            raise ValueError("No solutions generated or selected yet")

        sol_item = SolutionItem(**json.loads(selected_sol_rec.data))
        sol_item.id = selected_sol_rec.id

        prob_rec = db.query(ProblemStatementModel).filter(ProblemStatementModel.session_id == session_id).first()
        raw_problem = prob_rec.raw_text if prob_rec else ""
        all_qa = db.query(ClarificationModel).filter(ClarificationModel.session_id == session_id).all()
        qa_history = [{"round": q.round, "question": q.question, "answer": q.answer or ""} for q in all_qa]

        # Extract problem analysis and generate single canonical SelectedSolutionContext
        problem_analysis = await ai_service.analyze_problem(raw_problem, qa_history)
        analysis = await ai_service.analyze_selected_solution(problem_analysis, sol_item, raw_problem)
        doc_contents = await claude_service.generate_document_contents(raw_problem, sol_item, analysis, problem_analysis)

        context_dict = doc_contents.get("context", {})
        
        # Run Semantic Validation
        validated_context = validate_solution_context_semantics(context_dict, problem_analysis.model_dump(), sol_item.title)
        doc_contents["context"] = validated_context

        # Generate .docx files passing canonical validated context
        brd_path = doc_generator.generate_brd(session_id, doc_contents.get("brd", {}), validated_context)
        prd_path = doc_generator.generate_prd(session_id, doc_contents.get("prd", {}), doc_contents.get("success_criteria_benefits", {}), validated_context)
        plan_path = doc_generator.generate_plan(session_id, doc_contents.get("plan", {}), validated_context)

        # Clear existing doc records for session if regenerating
        db.query(DocumentModel).filter(DocumentModel.session_id == session_id).delete()

        doc_brd_rec = DocumentModel(session_id=session_id, type="brd", file_path=brd_path)
        doc_prd_rec = DocumentModel(session_id=session_id, type="prd", file_path=prd_path)
        doc_plan_rec = DocumentModel(session_id=session_id, type="plan", file_path=plan_path)

        db.add_all([doc_brd_rec, doc_prd_rec, doc_plan_rec])
        session_rec.status = "DOCUMENTS_GENERATED"
        db.commit()
        redis_store.set_session_stage(session_id, "DOCUMENTS_GENERATED")

        brd_c = doc_contents.get("brd", {})
        prd_c = doc_contents.get("prd", {})
        plan_c = doc_contents.get("plan", {})

        # Build dynamic solution-isolated Quick Structure Preview from canonical context
        workflow_preview = [
            {"name": f"{step.get('step', f'Step {idx+1}')}: {step.get('title', 'Workflow Task')}", "content": step.get('description', '')}
            for idx, step in enumerate(validated_context.get("workflow_steps", []))
        ] if validated_context.get("workflow_steps") else validated_context.get("quick_structure_preview", [])

        doc_items = [
            DocumentItemInfo(
                doc_id=doc_brd_rec.id,
                type="brd",
                title=brd_c.get("title", f"Business Requirement Document - {sol_item.title}"),
                download_url=f"/api/download/{doc_brd_rec.id}",
                description=brd_c.get("description", f"Executive strategic document for {sol_item.title}."),
                key_highlights=[
                    f"Executive Rationale ({sol_item.title})",
                    f"Solution Type: {validated_context.get('solution_type', 'Automation Engine')}",
                    f"In-Scope Timeline: {sol_item.effort}",
                    "Stakeholder Governance Matrix"
                ],
                sections=workflow_preview if workflow_preview else [
                    {"name": f"1. Executive Rationale ({sol_item.title[:25]})", "content": brd_c.get("executive_summary", "")},
                    {"name": "2. Expected Benefits", "content": "; ".join(validated_context.get("expected_benefits", []))},
                    {"name": "3. Scope Boundaries", "content": f"In-Scope: {'; '.join(brd_c.get('scope_in', [])[:2])}"}
                ]
            ),
            DocumentItemInfo(
                doc_id=doc_prd_rec.id,
                type="prd",
                title=prd_c.get("title", f"Project Requirement Document - {sol_item.title}"),
                download_url=f"/api/download/{doc_prd_rec.id}",
                description=prd_c.get("description", f"Technical product specification for {sol_item.title}."),
                key_highlights=[
                    f"Product Vision & Architecture ({sol_item.title})",
                    f"Tech Stack: {', '.join(validated_context.get('technologies', [])[:3])}",
                    f"Success Criteria ({len(validated_context.get('success_criteria', []))} metrics)",
                    "Non-Functional SLA Specs"
                ],
                sections=[
                    {"name": "1. System Functional Modules", "content": "; ".join([f"{f.get('module')}: {f.get('description')}" for f in validated_context.get("functional_requirements", [])[:3]])},
                    {"name": "2. Technical & Security SLAs", "content": "; ".join(validated_context.get("technical_requirements", [])[:3])},
                    {"name": "3. Target Solution KPIs", "content": "; ".join(validated_context.get("kpis", [])[:3])}
                ]
            ),
            DocumentItemInfo(
                doc_id=doc_plan_rec.id,
                type="plan",
                title=plan_c.get("title", f"Implementation Plan - {sol_item.title}"),
                download_url=f"/api/download/{doc_plan_rec.id}",
                description=plan_c.get("description", f"Execution roadmap for {sol_item.title}."),
                key_highlights=[
                    f"{sol_item.effort} Phased Development Roadmap",
                    f"Phased Deliverables ({len(validated_context.get('implementation_phases', []))} Phases)",
                    f"RACI Resource Allocation ({sol_item.cost_tier})",
                    "Governance Protocol"
                ],
                sections=[
                    {"name": f"Phase {idx+1}: {p.get('phase', f'Phase {idx+1}')}", "content": f"Tasks: {p.get('tasks', '')} | Deliverable: {p.get('deliverables', '')}"}
                    for idx, p in enumerate(validated_context.get("implementation_phases", []))
                ]
            )
        ]

        sc_b = SuccessCriteriaBenefits(
            key_performance_indicators=validated_context.get("kpis", []),
            business_benefits=validated_context.get("expected_benefits", []),
            risk_mitigations=[f"Risk: {r.get('risk')} | Mitigation: {r.get('mitigation')}" if isinstance(r, dict) else str(r) for r in validated_context.get("risks_and_mitigations", [])]
        )

        return GenerateDocumentsResponse(
            session_id=session_id,
            stage="DOCUMENTS_GENERATED",
            documents=doc_items,
            success_criteria_benefits=sc_b
        )

    def get_session_status(self, session_id: str, db: Session) -> SessionStatusResponse:
        session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session_rec:
            raise ValueError("Session not found")

        prob_rec = db.query(ProblemStatementModel).filter(ProblemStatementModel.session_id == session_id).first()
        clarifications_recs = db.query(ClarificationModel).filter(ClarificationModel.session_id == session_id).all()
        solutions_recs = db.query(SolutionModel).filter(SolutionModel.session_id == session_id).all()
        documents_recs = db.query(DocumentModel).filter(DocumentModel.session_id == session_id).all()

        round_count = redis_store.get_clarify_count(session_id)

        sol_list = []
        selected_sol = None
        for s in solutions_recs:
            item = SolutionItem(**json.loads(s.data))
            item.id = s.id
            item.is_selected = s.is_selected
            sol_list.append(item)
            if s.is_selected:
                selected_sol = item

        doc_items = [
            DocumentItemInfo(
                doc_id=d.id,
                type=d.type,
                title=f"{d.type.upper()} Document",
                download_url=f"/api/download/{d.id}"
            ) for d in documents_recs
        ]

        return SessionStatusResponse(
            session_id=session_id,
            stage=session_rec.status,
            created_at=session_rec.created_at.isoformat(),
            raw_problem=prob_rec.raw_text if prob_rec else None,
            clarified_problem=prob_rec.clarified_text if prob_rec else None,
            clarification_round=round_count,
            clarifications=[{"round": c.round, "question": c.question, "answer": c.answer} for c in clarifications_recs],
            solutions=sol_list,
            selected_solution=selected_sol,
            documents=doc_items
        )

state_machine_engine = StateMachineEngine()
