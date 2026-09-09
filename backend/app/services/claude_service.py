import json
import logging
from typing import List, Dict, Any
from app.services.ai_service import ai_service
from app.models.pydantic_models import (
    ClarityCheckResponse,
    SolutionItem,
    SolutionAnalysisResponse,
    ProblemAnalysisContext,
    SelectedSolutionContext
)

logger = logging.getLogger("digitalization_advisor.claude_adapter")

class ClaudeServiceAdapter:
    """
    Adapter layer routing calls to Gemini AIService.
    Removes legacy Anthropic Claude API dependency and eliminates hardcoded archetype fallbacks.
    """
    def __init__(self):
        self.ai = ai_service

    async def check_problem_clarity(self, problem_text: str, previous_qa: List[Dict[str, str]] = None) -> ClarityCheckResponse:
        return await self.ai.check_problem_clarity(problem_text, previous_qa)

    async def generate_solutions(self, problem_text: str, clarifications: List[Dict[str, str]] = None) -> List[SolutionItem]:
        analysis, solutions = await self.ai.generate_solutions_with_relevance_gate(problem_text, clarifications)
        return solutions

    async def analyze_selected_solution(self, problem_text: str, solution: SolutionItem, problem_analysis: ProblemAnalysisContext = None) -> SolutionAnalysisResponse:
        if not problem_analysis:
            problem_analysis = await self.ai.analyze_problem(problem_text)
        return await self.ai.analyze_selected_solution(problem_analysis, solution, problem_text)

    async def generate_document_contents(
        self, problem_text: str, solution: SolutionItem, analysis: SolutionAnalysisResponse, problem_analysis: ProblemAnalysisContext = None
    ) -> Dict[str, Any]:
        if not problem_analysis:
            problem_analysis = await self.ai.analyze_problem(problem_text)
        
        context_obj: SelectedSolutionContext = await self.ai.generate_selected_solution_context(
            problem_analysis, solution, analysis, problem_text
        )
        context_dict = context_obj.model_dump()
        if problem_text:
            context_dict["problem_statement"] = problem_text

        # Build doc_contents package for BRD, PRD, Implementation Plan, Success Criteria & Benefits
        tools_list_str = ", ".join(context_dict.get("technologies", []))
        
        brd_data = {
            "title": f"Business Requirement Document - {context_dict.get('solution_name')}",
            "description": f"Executive strategic document defining business objectives, operational workflows, scope, and governance for {context_dict.get('solution_name')}.",
            "executive_summary": context_dict.get("executive_summary"),
            "problem_statement": context_dict.get("problem_statement"),
            "proposed_solution_details": context_dict.get("proposed_solution_details"),
            "workflow_steps": context_dict.get("workflow_steps", []),
            "current_vs_target_state": {
                "current_state": (
                    f"Current process relies on historical averages and manual adjustments: {problem_text}"
                    if len(problem_text) <= 400 else f"{problem_text[:400]}..."
                ),
                "target_state": (
                    f"Replace manual averages with {context_dict.get('solution_name')} "
                    f"({tools_list_str}) to forecast staffing and infrastructure needs and reduce "
                    f"overcapacity / shortage risk."
                    if (problem_analysis and problem_analysis.forecasting_or_prediction_required)
                    else f"Execute {context_dict.get('solution_name')} using {tools_list_str} to resolve the stated operational problem."
                )
            },
            "business_objectives": context_dict.get("expected_benefits", []),
            "scope_in": [f"Core engine for {context_dict.get('solution_name')}", f"Integration with {tools_list_str}", "Document Exporters & Monitoring"],
            "scope_out": ["Legacy hardware infrastructure replacement", "Unrelated third-party database migrations"],
            "stakeholders": ["Executive Sponsor", "Digital Transformation Director", "Solution Architect", "Technical Lead"],
            "conclusion": context_dict.get("conclusion")
        }

        prd_data = {
            "title": f"Project Requirement Document - {context_dict.get('solution_name')}",
            "description": f"Technical product specification mapping architecture, microservices data flow, functional requirement tables, and NFR SLAs for {context_dict.get('solution_name')}.",
            "product_overview": context_dict.get("proposed_solution_details"),
            "user_persona": f"Operational team lead seeking automated execution of {context_dict.get('solution_name')}",
            "functional_requirements": context_dict.get("functional_requirements", []),
            "technical_requirements": context_dict.get("technical_requirements", []),
            "dependencies": context_dict.get("dependencies", []),
            "non_functional_requirements": context_dict.get("technical_requirements", [])
        }

        plan_data = {
            "title": f"Implementation Plan - {context_dict.get('solution_name')}",
            "description": f"Tactical execution roadmap detailing {solution.effort} delivery milestones, RACI team allocation, risk management protocols, and UAT criteria for {context_dict.get('solution_name')}.",
            "project_charter": context_dict.get("project_charter") or f"Execution roadmap for deploying {context_dict.get('solution_name')} within {solution.effort}.",
            "phases": context_dict.get("implementation_phases", []),
            "resource_allocation": context_dict.get("resource_allocation") or ["Lead Solution Architect", "Full-Stack Engineer", "Domain Subject Matter Expert"],
            "risk_management": f"Risk Mitigation: {solution.risk}"
        }

        success_criteria_benefits = {
            "key_performance_indicators": context_dict.get("kpis", []),
            "business_benefits": context_dict.get("expected_benefits", []),
            "risk_mitigations": [f"Risk: {r.get('risk')} | Mitigation: {r.get('mitigation')}" if isinstance(r, dict) else str(r) for r in context_dict.get("risks_and_mitigations", [])]
        }

        return {
            "context": context_dict,
            "brd": brd_data,
            "prd": prd_data,
            "plan": plan_data,
            "success_criteria_benefits": success_criteria_benefits
        }

claude_service = ClaudeServiceAdapter()
