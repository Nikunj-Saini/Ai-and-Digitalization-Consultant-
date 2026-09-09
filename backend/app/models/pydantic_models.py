from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Problem Analysis Context Model ---

class ProblemAnalysisContext(BaseModel):
    problem_domain: str = Field(..., description="Target business domain e.g. Demand Forecasting & Capacity Planning, Invoice Reconciliation, Customer Support KB")
    business_objective: str = Field(..., description="Primary business goal to achieve")
    current_process: str = Field(..., description="Current operational state and tools used")
    pain_points: List[str] = Field(default_factory=list, description="Extracted friction points and root causes")
    decision_to_support: str = Field(..., description="Specific decisions or planning actions being made")
    forecasting_or_prediction_required: bool = Field(False, description="True if problem requires time-series forecasting, predictive modeling, or trend estimation")
    automation_required: bool = Field(False, description="True if problem requires robotic/workflow automation or document parsing")
    analytics_required: bool = Field(False, description="True if problem requires BI dashboards, telemetry, or reporting metrics")
    optimization_required: bool = Field(False, description="True if problem requires resource, capacity, or scheduling optimization")
    data_sources: List[str] = Field(default_factory=list, description="Input data streams e.g. historical sales data, POs, Jira tickets")
    time_horizon: str = Field("Near-term", description="Target planning or execution horizon e.g. several months ahead, real-time")
    constraints: List[str] = Field(default_factory=list, description="Business, budget, regulatory, or technical constraints")


class SolutionEvaluationScore(BaseModel):
    problem_alignment: float = Field(..., description="Relevance score (0.0 to 1.0) against original problem domain and pain points")
    business_value: float = Field(..., description="Expected impact score (0.0 to 1.0)")
    technical_fit: float = Field(..., description="Technical appropriateness score (0.0 to 1.0)")
    implementation_complexity: float = Field(..., description="Feasibility score (0.0 to 1.0)")
    data_feasibility: float = Field(..., description="Data requirement feasibility (0.0 to 1.0)")
    scalability: float = Field(..., description="Scalability score (0.0 to 1.0)")
    is_relevant: bool = Field(..., description="True if solution directly addresses the primary pain point")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection if is_relevant is False or problem_alignment < 0.7")


# --- LLM Structured Output Models ---

class ClarityCheckResponse(BaseModel):
    is_clear: bool = Field(..., description="True if problem statement is clear enough to formulate technical solutions")
    missing_info: List[str] = Field(default_factory=list, description="List of missing details or ambiguous aspects")
    question: Optional[str] = Field(None, description="Direct clarification question to ask the user if is_clear is False")


class SolutionItem(BaseModel):
    id: Optional[int] = None
    title: str = Field(..., description="Short descriptive title of the proposed solution")
    approach: str = Field(..., description="Overview of implementation methodology and architecture")
    effort: str = Field(..., description="Estimated effort level e.g. Low (2-4 wks), Medium (1-2 mos), High (3+ mos)")
    cost_tier: str = Field(..., description="Cost tier e.g. Low ($), Medium ($$), High ($$$)")
    tools: List[str] = Field(default_factory=list, description="Recommended technology stack, frameworks, software, or APIs")
    pros: List[str] = Field(default_factory=list, description="Key benefits and advantages")
    cons: List[str] = Field(default_factory=list, description="Potential drawbacks or constraints")
    risk: str = Field(..., description="Risk assessment and mitigation strategy")
    is_selected: bool = False


class SolutionListResponse(BaseModel):
    solutions: List[SolutionItem] = Field(..., min_length=3, description="Minimum of 3 structured solutions")


class SolutionAnalysisResponse(BaseModel):
    implementation_approach: str = Field(..., description="Detailed step-by-step implementation approach")
    key_considerations: List[str] = Field(default_factory=list, description="Critical architectural, security, and operational considerations")
    dependencies: List[str] = Field(default_factory=list, description="External systems, team skills, or infrastructure prerequisites")


class SuccessCriteriaBenefits(BaseModel):
    key_performance_indicators: List[str] = Field(default_factory=list, description="Quantifiable metrics for success")
    business_benefits: List[str] = Field(default_factory=list, description="Expected strategic and ROI outcomes")
    risk_mitigations: List[str] = Field(default_factory=list, description="Risk mitigation controls")


class SelectedSolutionContext(BaseModel):
    solution_id: Optional[int] = None
    solution_name: str = Field(..., description="Name/Title of selected solution")
    solution_type: str = Field(..., description="Category archetype e.g. Predictive Demand Forecasting & Capacity Engine, OCR Pipeline")
    problem_statement: str = Field(..., description="Original/clarified problem statement being addressed")
    executive_summary: str = Field(..., description="Solution-specific executive summary")
    proposed_solution_details: str = Field(..., description="Detailed operational and architectural explanation of selected solution")
    workflow_steps: List[Dict[str, str]] = Field(default_factory=list, description="Step-by-step workflow sequence unique to this solution")
    technologies: List[str] = Field(default_factory=list, description="Recommended technology stack and tools")
    functional_requirements: List[Dict[str, str]] = Field(default_factory=list, description="Functional module requirements")
    technical_requirements: List[str] = Field(default_factory=list, description="Technical SLAs, security, data formats")
    dependencies: List[str] = Field(default_factory=list, description="External system, API, and skill prerequisites")
    risks_and_mitigations: List[Dict[str, str]] = Field(default_factory=list, description="Solution-specific risks and mitigations")
    expected_benefits: List[str] = Field(default_factory=list, description="Strategic and operational benefits resulting from this solution")
    roi_impact: Dict[str, str] = Field(default_factory=dict, description="Payback period, cost savings, and efficiency ROI metrics")
    success_criteria: List[str] = Field(default_factory=list, description="Category-aware quantifiable success criteria")
    kpis: List[str] = Field(default_factory=list, description="Target performance indicators specifically bound to this solution")
    implementation_phases: List[Dict[str, str]] = Field(default_factory=list, description="Phased delivery roadmap with tasks and deliverables")
    quick_structure_preview: List[Dict[str, str]] = Field(default_factory=list, description="Dynamic preview structure representing actual solution workflow")
    resource_allocation: List[str] = Field(default_factory=list, description="Team resource allocation and skills")
    governance_controls: Optional[str] = Field(None, description="Governance, quality and audit controls")
    project_charter: Optional[str] = Field(None, description="Executive project charter summary")
    conclusion: str = Field(..., description="Solution-specific strategic conclusion and recommendation")



# --- API Request Payload Schemas ---

class SubmitProblemRequest(BaseModel):
    problem_statement: str = Field(..., min_length=5, description="User's initial business problem statement")


class ClarifyAnswerRequest(BaseModel):
    session_id: str
    answer: str = Field(..., description="User response to clarification question")


class GenerateSolutionsRequest(BaseModel):
    session_id: str


class SelectSolutionRequest(BaseModel):
    session_id: str
    solution_id: int


class GenerateDocumentsRequest(BaseModel):
    session_id: str


# --- API Response Schemas ---

class SubmitProblemResponse(BaseModel):
    session_id: str
    stage: str
    is_clear: bool
    clarification_round: int
    question: Optional[str] = None
    missing_info: List[str] = []
    message: str


class ClarifyResponse(BaseModel):
    session_id: str
    stage: str
    is_clear: bool
    clarification_round: int
    question: Optional[str] = None
    missing_info: List[str] = []
    message: str


class SolutionsResponse(BaseModel):
    session_id: str
    stage: str
    solutions: List[SolutionItem]


class SelectSolutionResponse(BaseModel):
    session_id: str
    stage: str
    selected_solution: SolutionItem
    analysis: SolutionAnalysisResponse
    context: Optional[SelectedSolutionContext] = None


class DocumentItemInfo(BaseModel):
    doc_id: int
    type: str
    title: str
    download_url: str
    description: Optional[str] = None
    key_highlights: List[str] = Field(default_factory=list)
    sections: List[Dict[str, Any]] = Field(default_factory=list)


class GenerateDocumentsResponse(BaseModel):
    session_id: str
    stage: str
    documents: List[DocumentItemInfo]
    success_criteria_benefits: SuccessCriteriaBenefits


class SessionStatusResponse(BaseModel):
    session_id: str
    stage: str
    created_at: str
    raw_problem: Optional[str] = None
    clarified_problem: Optional[str] = None
    clarification_round: int
    clarifications: List[Dict[str, Any]] = []
    solutions: List[SolutionItem] = []
    selected_solution: Optional[SolutionItem] = None
    analysis: Optional[SolutionAnalysisResponse] = None
    documents: List[DocumentItemInfo] = []
