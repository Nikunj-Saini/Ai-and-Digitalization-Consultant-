import pytest
import asyncio
from app.models.pydantic_models import ProblemAnalysisContext, SolutionItem, SelectedSolutionContext
from app.services.ai_service import ai_service
from app.services.solution_validator import validate_solution_context_semantics

def test_problem_analysis_parsing():
    analysis = ProblemAnalysisContext(
        problem_domain="Demand Forecasting & Capacity Planning",
        business_objective="Determine staffing and infrastructure requirements months in advance",
        current_process="Historical averages and manual adjustments",
        pain_points=["Overcapacity during low demand", "Capacity shortages during spikes"],
        decision_to_support="Staffing and infrastructure procurement",
        forecasting_or_prediction_required=True,
        automation_required=False,
        analytics_required=True,
        optimization_required=True,
        data_sources=["Historical operational logs", "Staffing rosters"],
        time_horizon="Several months ahead",
        constraints=["Budget limits"]
    )
    assert analysis.problem_domain == "Demand Forecasting & Capacity Planning"
    assert analysis.forecasting_or_prediction_required is True

def test_semantic_validator_success():
    context = {
        "solution_name": "Predictive Capacity Planning Engine",
        "solution_type": "Demand Forecasting & Capacity Planning",
        "problem_statement": "Determine staffing and infrastructure requirements several months in advance",
        "executive_summary": "This solution provides predictive demand forecasting and capacity planning to eliminate overcapacity and shortages.",
        "proposed_solution_details": "Using time-series forecasting models (Prophet / XGBoost), the system predicts workload.",
        "workflow_steps": [{"step": "Step 1", "title": "Data Ingestion", "description": "Historical demand data clean"}],
        "technologies": ["Python", "Pandas", "Scikit-learn", "XGBoost", "FastAPI", "Power BI"],
        "functional_requirements": [{"module": "Forecasting Module", "description": "Time-series prediction", "priority": "P0 (Must Have)"}],
        "technical_requirements": ["Sub-second SLA"],
        "dependencies": ["Historical data access"],
        "risks_and_mitigations": [{"risk": "Data drift", "mitigation": "Retrain model"}],
        "expected_benefits": ["Reduce overstaffing during low demand", "Prevent shortages during peak spikes"],
        "success_criteria": ["Achieve 95%+ forecast accuracy", "Reduce overcapacity by 30%"],
        "kpis": ["Forecast Accuracy (MAPE)", "Capacity Utilization Rate", "Overcapacity Rate"],
        "implementation_phases": [{"phase": "Phase 1: Model Dev", "duration": "Weeks 1-2", "tasks": "Train models", "deliverables": "Trained model"}],
        "quick_structure_preview": [{"name": "1. Forecast Model", "content": "Generates 3-month forecast"}]
    }

    problem_analysis = {
        "problem_domain": "Demand Forecasting & Capacity Planning",
        "forecasting_or_prediction_required": True
    }

    res = validate_solution_context_semantics(context, problem_analysis, "Predictive Capacity Planning Engine")
    assert res["solution_name"] == "Predictive Capacity Planning Engine"

def test_semantic_validator_rejection_on_missing_fields():
    incomplete_context = {
        "solution_name": "Generic Solution",
        "executive_summary": "Some summary",
        # missing proposed_solution_details, workflow_steps, etc.
    }
    with pytest.raises(ValueError) as exc_info:
        validate_solution_context_semantics(incomplete_context, {}, "Generic Solution")
    assert "Missing or empty required context field" in str(exc_info.value)
