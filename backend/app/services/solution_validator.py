import logging
from typing import Dict, Any, List
from app.models.pydantic_models import SelectedSolutionContext, ProblemAnalysisContext

logger = logging.getLogger("digitalization_advisor.validator")

def validate_solution_context_semantics(
    context: Dict[str, Any],
    problem_analysis: Dict[str, Any] = None,
    solution_title: str = ""
) -> Dict[str, Any]:
    """
    Semantic validation check verifying that the generated canonical solution context
    strictly corresponds to the business problem and selected solution option.
    Ensures zero generic boilerplate leakage across solution selections.
    """
    sol_name = context.get("solution_name", solution_title or "").strip()
    exec_summary = context.get("executive_summary", "")
    proposed_details = context.get("proposed_solution_details", "")
    
    validation_issues: List[str] = []

    # 1. Structural Non-Empty Validation
    required_fields = [
        "solution_name",
        "executive_summary",
        "proposed_solution_details",
        "workflow_steps",
        "technologies",
        "functional_requirements",
        "success_criteria",
        "kpis",
        "expected_benefits",
        "risks_and_mitigations",
        "implementation_phases",
        "quick_structure_preview",
    ]

    for field in required_fields:
        val = context.get(field)
        if not val:
            validation_issues.append(f"Missing or empty required context field: '{field}'")

    # 2. Semantic Relevance Check
    if sol_name.lower() not in exec_summary.lower() and sol_name.lower() not in proposed_details.lower():
        logger.warning(f"Executive summary / details do not reference solution name '{sol_name}'")

    if problem_analysis:
        domain = problem_analysis.get("problem_domain", "").lower()
        is_forecasting = problem_analysis.get("forecasting_or_prediction_required", False)
        
        # Check domain alignment for forecasting problems
        if is_forecasting or any(k in domain for k in ["forecast", "predict", "capacity"]):
            exec_and_tech_text = (exec_summary + " " + proposed_details + " " + " ".join(context.get("technologies", []))).lower()
            if not any(k in exec_and_tech_text for k in ["forecast", "predict", "capacity", "time-series", "workload", "staffing", "demand", "utilization"]):
                validation_issues.append(f"Forecasting problem domain '{domain}' lacks forecasting/capacity planning terms in generated context.")
        else:
            # Reject forecasting-centric leakage when the problem is not about forecasting
            combined = (
                sol_name + " " + exec_summary + " " + proposed_details + " " +
                " ".join(context.get("kpis", [])) + " " +
                str(context.get("problem_statement", ""))
            ).lower()
            forecast_leak = any(k in combined for k in [
                "forecast accuracy", "mape", "capacity utilization",
                "staffing overcapacity", "demand forecasting", "predictive capacity"
            ])
            if forecast_leak and not any(k in domain for k in ["forecast", "capacity", "staffing", "demand", "predict"]):
                validation_issues.append(
                    f"Generated context injects forecasting/capacity language unrelated to domain '{domain}'."
                )

    if validation_issues:
        error_msg = f"[CONTEXT VALIDATION] failed for '{sol_name}': " + "; ".join(validation_issues)
        logger.error(error_msg)
        raise ValueError(error_msg)

    logger.info(f"[CONTEXT VALIDATION] passed for solution: '{sol_name}'")
    return context
