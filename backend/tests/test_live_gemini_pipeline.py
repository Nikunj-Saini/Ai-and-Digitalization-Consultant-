import asyncio
import logging
from app.services.ai_service import ai_service
from app.services.solution_validator import validate_solution_context_semantics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_live_pipeline")

async def run_live_tests():
    test_cases = [
        {
            "id": "TEST 1 (Demand Forecasting & Capacity)",
            "problem": "Our operations team needs to determine staffing and infrastructure requirements several months in advance. Current forecasts are based mainly on historical averages and manual adjustments, resulting in overcapacity during low-demand periods and insufficient capacity during demand spikes.",
            "forbidden_terms": ["chatbot", "ocr", "invoice", "rag", "vector db", "crewai"]
        },
        {
            "id": "TEST 2 (Invoice Reconciliation)",
            "problem": "Our finance team manually reconciles invoices against purchase orders and payment records, causing delays and frequent exceptions.",
            "forbidden_terms": ["chatbot", "time-series", "forecasting", "staffing requirements"]
        },
        {
            "id": "TEST 3 (Customer Support KB)",
            "problem": "Our customer support team spends significant time answering repetitive questions that are already documented in internal knowledge bases.",
            "forbidden_terms": ["invoice reconciliation", "purchase order matching", "staffing requirements"]
        }
    ]

    for tc in test_cases:
        print(f"\n==================================================")
        print(f"RUNNING {tc['id']}")
        print(f"==================================================")
        print(f"Problem: {tc['problem']}")

        # Step 1: Analyze problem
        analysis = await ai_service.analyze_problem(tc['problem'])
        print(f"[PROBLEM DOMAIN] {analysis.problem_domain}")
        print(f"[BUSINESS OBJECTIVE] {analysis.business_objective}")
        print(f"[PAIN POINTS] {analysis.pain_points}")
        print(f"[FLAGS] forecasting={analysis.forecasting_or_prediction_required}, automation={analysis.automation_required}, analytics={analysis.analytics_required}")

        # Step 2: Generate Solutions with Relevance Gate
        analysis_res, solutions = await ai_service.generate_solutions_with_relevance_gate(tc['problem'])
        print(f"[SOLUTIONS GENERATED] Count: {len(solutions)}")
        for idx, sol in enumerate(solutions):
            print(f"  Option {idx+1}: {sol.title}")
            print(f"    Tools: {sol.tools}")
            print(f"    Approach: {sol.approach[:100]}...")
            print(f"    Pros: {sol.pros}")

            # Check that forbidden terms aren't randomly introduced
            title_tools_str = (sol.title + " " + " ".join(sol.tools)).lower()
            for term in tc['forbidden_terms']:
                assert term not in title_tools_str, f"Forbidden term '{term}' found in solution '{sol.title}' for {tc['id']}"

        # Step 3: Deep Analysis & Canonical Context Generation for Option 1
        selected_sol = solutions[0]
        deep_analysis = await ai_service.analyze_selected_solution(analysis, selected_sol)
        canonical_context = await ai_service.generate_selected_solution_context(analysis, selected_sol, deep_analysis)
        
        print(f"[CANONICAL CONTEXT] Generated for '{canonical_context.solution_name}'")
        print(f"  KPIs: {canonical_context.kpis}")
        print(f"  Benefits: {canonical_context.expected_benefits}")
        print(f"  Success Criteria: {canonical_context.success_criteria}")
        print(f"  Phases: {[p.get('phase') for p in canonical_context.implementation_phases]}")

        # Step 4: Semantic Validation
        validated = validate_solution_context_semantics(canonical_context.model_dump(), analysis.model_dump(), selected_sol.title)
        print(f"[SEMANTIC VALIDATION] Passed cleanly!")

if __name__ == "__main__":
    asyncio.run(run_live_tests())
