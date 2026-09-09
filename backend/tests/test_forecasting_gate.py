from app.services.ai_service import (
    _text_indicates_forecasting,
    ai_service,
)
from app.models.pydantic_models import SolutionItem, ProblemAnalysisContext

PROBLEM = (
    "Our operations team needs to determine staffing and infrastructure requirements "
    "several months in advance. Current forecasts are based mainly on historical averages "
    "and manual adjustments, resulting in overcapacity during low-demand periods and "
    "insufficient capacity during demand spikes."
)


def test_detects_forecasting_problem():
    assert _text_indicates_forecasting(PROBLEM)


def test_rejects_generic_automation_for_forecasting():
    analysis = ProblemAnalysisContext(
        problem_domain="Demand Forecasting & Capacity Planning",
        business_objective="Staffing months ahead",
        current_process="Historical averages",
        pain_points=["overcapacity", "spikes"],
        decision_to_support="staffing",
        forecasting_or_prediction_required=True,
    )
    bad_solutions = [
        SolutionItem(
            title="Automated Operations Team Needs Quick-Win Assistant",
            approach="Deploy a targeted low-code digital solution using Python and FastAPI to automate key repetitive steps in: 'Our operations team needs...'",
            effort="Low",
            cost_tier="Low",
            tools=["FastAPI", "Python", "React"],
            pros=["x"],
            cons=["y"],
            risk="z",
        ),
        SolutionItem(
            title="Multi-Agent AI Operations Team Needs Automation Engine",
            approach="CrewAI multi-agent pipeline",
            effort="Medium",
            cost_tier="Medium",
            tools=["CrewAI", "LangChain", "Redis"],
            pros=["x"],
            cons=["y"],
            risk="z",
        ),
        SolutionItem(
            title="Enterprise Operations Team Needs Digitalization Hub",
            approach="RAG vector search hub",
            effort="High",
            cost_tier="High",
            tools=["Qdrant", "Claude API"],
            pros=["x"],
            cons=["y"],
            risk="z",
        ),
    ]
    for sol in bad_solutions:
        ok, _reason = ai_service._local_relevance_pass(analysis, sol, PROBLEM)
        assert ok is False, sol.title


def test_accepts_forecasting_engine():
    analysis = ProblemAnalysisContext(
        problem_domain="Demand Forecasting & Capacity Planning",
        business_objective="Staffing months ahead",
        current_process="Historical averages",
        pain_points=["overcapacity", "spikes"],
        decision_to_support="staffing",
        forecasting_or_prediction_required=True,
    )
    good = SolutionItem(
        title="ML Demand Forecasting & Capacity Recommendation Engine",
        approach="Train Prophet/XGBoost models on historical demand to recommend staffing and infrastructure months ahead; monitor MAPE.",
        effort="Medium",
        cost_tier="Medium",
        tools=["Python", "Prophet", "XGBoost", "Pandas", "Power BI"],
        pros=["Reduce overcapacity"],
        cons=["Data quality"],
        risk="Drift",
    )
    ok, reason = ai_service._local_relevance_pass(analysis, good, PROBLEM)
    assert ok is True, reason
