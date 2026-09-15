import asyncio
import json
import logging
import re
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
try:
    from groq import Groq as GroqClient
except ImportError:
    GroqClient = None
try:
    from ollama import AsyncClient as OllamaAsyncClient
except ImportError:
    OllamaAsyncClient = None
from app.config import settings
from app.models.pydantic_models import (
    ProblemAnalysisContext,
    SolutionEvaluationScore,
    ClarityCheckResponse,
    SolutionListResponse,
    SolutionItem,
    SolutionAnalysisResponse,
    SelectedSolutionContext,
)

logger = logging.getLogger("digitalization_advisor.ai")

FORECASTING_KEYWORDS = (
    "forecast", "forecasts", "forecasting", "predict", "prediction", "predictive",
    "capacity", "staffing", "overcapacity", "demand spike", "demand spikes",
    "infrastructure requirements", "months in advance", "historical averages",
    "low-demand", "low demand", "demand planning", "workforce planning",
)

GENERIC_SOLUTION_MARKERS = (
    "crewai", "langchain", "multi-agent", "vector db", "qdrant", "rag ",
    "rag,", "retrieval-augmented", "chatbot", "digitalization hub",
    "quick-win assistant", "low-code digital solution", "repetitive steps",
)


def _text_indicates_forecasting(text: str) -> bool:
    lowered = (text or "").lower()
    hits = sum(1 for k in FORECASTING_KEYWORDS if k in lowered)
    # Strong signals: forecasting language OR capacity + demand/staffing combo
    if hits >= 2:
        return True
    if "forecast" in lowered or "forecasting" in lowered:
        return True
    if ("staffing" in lowered or "capacity" in lowered) and (
        "demand" in lowered or "months" in lowered or "infrastructure" in lowered
    ):
        return True
    return False


def _looks_like_generic_automation(solution: "SolutionItem") -> bool:
    blob = f"{solution.title} {solution.approach} {' '.join(solution.tools)}".lower()
    return any(m in blob for m in GENERIC_SOLUTION_MARKERS)


def _looks_like_forecasting_solution(solution: "SolutionItem") -> bool:
    blob = f"{solution.title} {solution.approach} {' '.join(solution.tools)}".lower()
    markers = (
        "forecast", "predict", "time-series", "timeseries", "prophet", "xgboost",
        "capacity planning", "staffing", "demand", "mape", "seasonality",
    )
def _get_heuristic_tech_stack(problem_text: str) -> tuple[List[str], Dict[str, List[str]]]:
    lowered = (problem_text or "").lower()

    # 1. Demand Forecasting / Capacity / Staffing
    if _text_indicates_forecasting(problem_text) or any(k in lowered for k in ("staffing", "capacity", "forecast", "demand", "predict", "time-series")):
        return (
            ["Python", "Pandas", "Prophet", "PostgreSQL", "Power BI"],
            {
                "Languages & Core Runtimes": ["Python", "R", "SQL"],
                "Frameworks & Libraries": ["Pandas", "Prophet", "Scikit-learn", "XGBoost", "Statsmodels", "FastAPI"],
                "Enterprise APIs & Integrations": ["REST APIs", "Power BI", "Tableau", "Airflow", "Celery"],
                "Data, DB & Analytics": ["PostgreSQL", "Snowflake", "BigQuery", "DuckDB", "SQL Server"]
            }
        )

    # 2. Invoice / Document Processing / OCR / Scanning
    if any(k in lowered for k in ("invoice", "ocr", "pdf", "receipt", "document", "scan", "extraction", "bill", "tally")):
        return (
            ["Python", "AWS Textract", "Google Document AI", "PostgreSQL", "FastAPI"],
            {
                "Languages & Core Runtimes": ["Python", "TypeScript", "SQL"],
                "Frameworks & Libraries": ["pdfplumber", "PyPDF", "FastAPI", "Celery", "OpenCV"],
                "Enterprise APIs & Integrations": ["AWS Textract", "Google Document AI", "Tally API", "REST APIs", "Zapier / Make"],
                "Data, DB & Analytics": ["PostgreSQL", "Redis", "Amazon S3", "MongoDB"]
            }
        )

    # 3. Customer Support / Knowledge Base / RAG / Chatbot
    if any(k in lowered for k in ("support", "kb", "knowledge", "chat", "customer", "ticket", "faq", "qna", "helpdesk")):
        return (
            ["Python", "FastAPI", "LangChain", "Qdrant", "React"],
            {
                "Languages & Core Runtimes": ["Python", "TypeScript", "Node.js"],
                "Frameworks & Libraries": ["FastAPI", "LangChain", "LlamaIndex", "React", "Next.js"],
                "Enterprise APIs & Integrations": ["OpenAI API", "Claude API", "Zendesk API", "Freshdesk API", "REST APIs"],
                "Data, DB & Analytics": ["Qdrant", "Pinecone", "PostgreSQL pgvector", "Redis"]
            }
        )

    # 4. ERP / Workflow Automation / SAP / RPA
    if any(k in lowered for k in ("sap", "erp", "uipath", "automation", "rpa", "workflow", "manual entry", "data entry", "excel")):
        return (
            ["UiPath", "Power Automate", "Python", "REST APIs", "PostgreSQL"],
            {
                "Languages & Core Runtimes": ["Python", "C# / .NET", "SQL"],
                "Frameworks & Libraries": ["UiPath", "Power Automate", "Selenium", "FastAPI"],
                "Enterprise APIs & Integrations": ["SAP GUI Scripting API", "REST APIs", "Salesforce API", "Zapier / Make"],
                "Data, DB & Analytics": ["PostgreSQL", "SQL Server", "Oracle DB", "Excel / CSV"]
            }
        )

    # 5. Data Analytics / BI / Dashboard / Reporting
    if any(k in lowered for k in ("dashboard", "bi", "report", "analytics", "kpi", "telemetry", "metrics")):
        return (
            ["Python", "Pandas", "Power BI", "Snowflake", "SQL"],
            {
                "Languages & Core Runtimes": ["Python", "SQL", "R"],
                "Frameworks & Libraries": ["Pandas", "FastAPI", "Streamlit", "Plotly"],
                "Enterprise APIs & Integrations": ["Power BI", "Tableau", "Looker API", "Airflow"],
                "Data, DB & Analytics": ["Snowflake", "BigQuery", "PostgreSQL", "Redshift"]
            }
        )

    # 6. Default General Digital Transformation
    return (
        ["Python", "FastAPI", "React", "PostgreSQL", "REST APIs"],
        {
            "Languages & Core Runtimes": ["Python", "Node.js", "TypeScript"],
            "Frameworks & Libraries": ["FastAPI", "React", "Next.js", "Celery"],
            "Enterprise APIs & Integrations": ["REST APIs", "Power Automate", "Zapier / Make", "Docker"],
            "Data, DB & Analytics": ["PostgreSQL", "Redis", "MongoDB", "Snowflake"]
        }
    )


class AIService:
    def __init__(self):
        # 1. Initialize Gemini Client (Primary API Provider)
        self.model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.configured_models = [
            m.strip() for m in [
                settings.GEMINI_MODEL,
                settings.GEMINI_MODEL_2,
                settings.GEMINI_MODEL_3,
                settings.GEMINI_MODEL_4,
                settings.GEMINI_MODEL_5,
                getattr(settings, "GEMINI_MODEL_6", "gemini-1.5-flash-8b"),
            ] if m and m.strip()
        ]
        self.api_keys = [k for k in [settings.GEMINI_API_KEY, settings.GEMINI_API_KEY_2, getattr(settings, "GEMINI_API_KEY_3", "")] if k and k.strip()]
        self.clients = []
        for idx, key in enumerate(self.api_keys):
            try:
                c = genai.Client(api_key=key)
                self.clients.append((f"Key-{idx+1}", c))
                logger.info(f"[AI PROVIDER] Initialized Gemini API client #{idx+1} with models: {self.configured_models}")
            except Exception as e:
                logger.error(f"[AI PROVIDER] Failed to initialize Gemini API client #{idx+1}: {e}")

        # 2. Initialize Groq Client (Secondary API Provider)
        self.groq_client = None
        self.groq_models = [
            m.strip() for m in [
                getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile"),
                getattr(settings, "GROQ_MODEL_2", "deepseek-r1-distill-llama-70b"),
                getattr(settings, "GROQ_MODEL_3", "qwen-qwq-32b"),
                getattr(settings, "GROQ_MODEL_4", "llama-3.1-8b-instant"),
            ] if m and m.strip()
        ]
        groq_api_key = getattr(settings, "GROQ_API_KEY", "")
        if GroqClient and groq_api_key and groq_api_key.strip():
            try:
                self.groq_client = GroqClient(api_key=groq_api_key.strip())
                logger.info(f"[AI PROVIDER] Initialized Groq API fallback client with models: {self.groq_models}")
            except Exception as e:
                logger.error(f"[AI PROVIDER] Failed to initialize Groq API client: {e}")
        else:
            logger.info("[AI PROVIDER] Groq API not configured.")

        # 3. Initialize Local Ollama Client (Fallback / Used Last)
        self.ollama_host = getattr(settings, "OLLAMA_HOST", "http://localhost:11434")
        self.ollama_model = getattr(settings, "OLLAMA_MODEL", "qwen3:8b")
        self.ollama_client = None
        if OllamaAsyncClient:
            try:
                self.ollama_client = OllamaAsyncClient(host=self.ollama_host)
                logger.info(f"[AI PROVIDER] Initialized local Ollama client (host={self.ollama_host}, model={self.ollama_model}) [Used as last fallback]")
            except Exception as e:
                logger.warning(f"[AI PROVIDER] Failed to initialize Ollama client: {e}")
        else:
            logger.warning("[AI PROVIDER] 'ollama' Python package not installed.")

        if not self.clients and not self.groq_client and not self.ollama_client:
            logger.warning("[AI PROVIDER] No AI providers configured (No GEMINI_API_KEY, GROQ_API_KEY, or local Ollama).")

    @property
    def has_ai_provider(self) -> bool:
        return bool(self.clients or self.groq_client or self.ollama_client)

    @property
    def client(self):
        return self.clients[0][1] if self.clients else None

    def _ground_analysis(self, analysis: ProblemAnalysisContext, problem_text: str) -> ProblemAnalysisContext:
        """Force-correct domain flags when the raw problem clearly needs forecasting."""
        if _text_indicates_forecasting(problem_text):
            analysis.forecasting_or_prediction_required = True
            analysis.analytics_required = True
            analysis.optimization_required = True
            domain_l = (analysis.problem_domain or "").lower()
            if not any(k in domain_l for k in ("forecast", "capacity", "staffing", "demand", "predict")):
                analysis.problem_domain = "Demand Forecasting & Capacity Planning"
            if not analysis.decision_to_support or "staff" not in analysis.decision_to_support.lower():
                analysis.decision_to_support = (
                    "Determine staffing and infrastructure capacity several months ahead "
                    "to avoid overcapacity and shortage during demand spikes"
                )
            logger.info("[PROBLEM DOMAIN] Forced forecasting/capacity grounding from problem keywords")
        return analysis

    def _local_relevance_pass(
        self, analysis: ProblemAnalysisContext, solution: SolutionItem, problem_text: str
    ) -> tuple[bool, Optional[str]]:
        """Hard local gate so generic automation/RAG cannot pass a forecasting problem."""
        if analysis.forecasting_or_prediction_required or _text_indicates_forecasting(problem_text):
            if _looks_like_generic_automation(solution) and not _looks_like_forecasting_solution(solution):
                return False, "Generic automation/RAG/multi-agent solution rejected for forecasting problem"
            if not _looks_like_forecasting_solution(solution):
                return False, "Solution does not center on forecasting/capacity/staffing prediction"
            # Reject approaches that only paste the problem into a boilerplate wrapper
            if "in: '" in (solution.approach or "").lower() or 'in: "' in (solution.approach or "").lower():
                return False, "Approach looks like a boilerplate template wrapping the problem text"
            return True, None

        # Non-forecasting problems: reject forecasting leakage and generic RAG stacks unless needed
        if _looks_like_generic_automation(solution):
            domain_l = (analysis.problem_domain or "").lower()
            if not any(k in domain_l for k in ("support", "knowledge", "chat", "document", "kb")):
                if any(m in f"{solution.title} {solution.approach}".lower() for m in ("rag", "crewai", "vector db", "multi-agent")):
                    return False, "Unrelated RAG/multi-agent stack for this problem"
        return True, None

    async def _call_groq_with_retry(self, prompt: str, temperature: float = 0.2, max_retries: int = 2) -> str:
        """Call Groq API with fast thread execution and model fallback."""
        if not self.groq_client:
            raise RuntimeError("Groq client not configured.")

        groq_model_pool = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"]
        last_error = None
        for attempt in range(1, max_retries + 1):
            target_model = groq_model_pool[(attempt - 1) % len(groq_model_pool)]
            try:
                logger.info(f"[GROQ FALLBACK] Attempt {attempt}/{max_retries} using model: {target_model}")
                def _do_groq():
                    return self.groq_client.chat.completions.create(
                        model=target_model,
                        messages=[
                            {"role": "system", "content": "You are an expert enterprise AI & digitalization consultant. Always respond with valid JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=temperature,
                        max_tokens=8192,
                    )
                response = await asyncio.wait_for(asyncio.to_thread(_do_groq), timeout=7.0)
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                logger.warning(f"[GROQ FALLBACK] Call failed on {target_model}: {e}")
                if attempt < max_retries:
                    await asyncio.sleep(0.3)

        raise RuntimeError(f"Groq API call failed after {max_retries} attempts: {last_error}")

    async def _call_ollama_with_retry(self, prompt: str, temperature: float = 0.2, max_retries: int = 1) -> str:
        """Call local Ollama instance with short connection timeout."""
        if not self.ollama_client:
            raise RuntimeError("Ollama client not configured or unavailable.")

        try:
            logger.info(f"[OLLAMA] Generating with model '{self.ollama_model}'")
            response = await asyncio.wait_for(
                self.ollama_client.chat(
                    model=self.ollama_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a Principal Enterprise Cloud, AI & Digital Transformation Architect. Always respond strictly with valid JSON matching the specified schema."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    format="json",
                    options={"temperature": temperature}
                ),
                timeout=3.0
            )
            raw_text = response["message"]["content"] if isinstance(response, dict) else response.message.content
            if raw_text and raw_text.strip():
                return raw_text
            raise ValueError("Empty response received from Ollama.")
        except Exception as e:
            raise RuntimeError(f"Ollama call failed: {e}")

    async def _call_gemini_models(self, prompt: str, temperature: float = 0.2, max_retries: int = 3) -> str:
        """Helper to call Gemini API using non-blocking threads, valid production models, and fast timeouts."""
        if not self.clients:
            raise RuntimeError("No Gemini clients configured.")

        valid_models = []
        for m in self.configured_models + ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite"]:
            clean_m = m.replace("gemini-2.5-", "gemini-2.0-").replace("gemini-3.5-", "gemini-2.0-").replace("gemini-3.6-", "gemini-2.0-").replace("gemini-3.7-", "gemini-2.0-")
            if clean_m and clean_m not in valid_models:
                valid_models.append(clean_m)

        last_error = None
        for attempt in range(1, max_retries + 1):
            key_label, client = self.clients[(attempt - 1) % len(self.clients)]
            target_model = valid_models[(attempt - 1) % len(valid_models)]
            try:
                logger.info(f"[AI PROVIDER] Attempt {attempt}/{max_retries}: Sending request using {key_label} on model: {target_model}")
                def _do_gemini():
                    return client.models.generate_content(
                        model=target_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=temperature
                        )
                    )

                response = await asyncio.wait_for(asyncio.to_thread(_do_gemini), timeout=8.0)
                if response and hasattr(response, "text") and response.text:
                    return response.text
                raise ValueError("Empty response received from Gemini API.")
            except Exception as e:
                last_error = e
                logger.warning(f"[AI PROVIDER] Call failed on {key_label} ({target_model}): {e}")
                if attempt < max_retries:
                    await asyncio.sleep(0.3)

        raise RuntimeError(f"Gemini API call failed after {max_retries} attempts: {last_error}")

    async def _call_llm_with_retry(self, prompt: str, temperature: float = 0.2) -> str:
        """
        Unified LLM caller.
        Prioritizes external APIs (Gemini, Groq) first for speed and capabilities.
        Falls back to local Ollama last if cloud APIs fail or are unavailable.
        """
        # 1. Primary: Gemini API
        if self.clients:
            try:
                return await self._call_gemini_models(prompt, temperature=temperature)
            except Exception as gemini_err:
                logger.warning(f"[AI PROVIDER] Gemini API call failed: {gemini_err}. Checking Groq API fallback...")
                if not self.groq_client and not self.ollama_client:
                    raise RuntimeError(f"Gemini API generation failed: {gemini_err}")

        # 2. Secondary Fallback: Groq API
        if self.groq_client:
            try:
                return await self._call_groq_with_retry(prompt, temperature=temperature)
            except Exception as groq_err:
                logger.warning(f"[AI PROVIDER] Groq API call failed: {groq_err}. Checking local Ollama fallback...")
                if not self.ollama_client:
                    raise RuntimeError(f"Cloud APIs failed. Gemini error occurred and Groq failed: {groq_err}")

        # 3. Final Fallback (Sabse Last): Local Ollama
        if self.ollama_client:
            try:
                logger.info(f"[AI PROVIDER] Using local Ollama as final fallback ({self.ollama_model})...")
                return await self._call_ollama_with_retry(prompt, temperature=temperature)
            except Exception as ollama_err:
                logger.error(f"[AI PROVIDER] Ollama fallback call failed: {ollama_err}")
                raise RuntimeError(f"All AI providers failed. APIs failed and Ollama error: {ollama_err}")

        raise RuntimeError(
            f"No AI provider available. Please configure GEMINI_API_KEY / GROQ_API_KEY, or ensure Ollama is running locally at "
            f"{self.ollama_host} with model '{self.ollama_model}'."
        )

    async def _call_gemini_with_retry(self, prompt: str, temperature: float = 0.2, max_retries: int = 3) -> str:
        """Maintains backward compatibility: delegates directly to unified _call_llm_with_retry."""
        return await self._call_llm_with_retry(prompt, temperature=temperature)

    def _extract_json(self, text: str) -> str:
        """Extracts clean JSON string from LLM response text, stripping reasoning tags if present."""
        text = re.sub(r"<think>[\s\S]*?</think>", "", text).strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        start_brace = text.find('{')
        start_bracket = text.find('[')
        
        if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
            end_brace = text.rfind('}')
            if end_brace != -1:
                return text[start_brace:end_brace+1]
        elif start_bracket != -1:
            end_bracket = text.rfind(']')
            if end_bracket != -1:
                return text[start_bracket:end_bracket+1]
        return text.strip()

    def _build_solution_prompt(
        self, problem_text: str, qa_block: str, analysis: ProblemAnalysisContext, tech_stack: Optional[List[str]] = None
    ) -> str:
        needs_forecast = analysis.forecasting_or_prediction_required or _text_indicates_forecasting(problem_text)

        tech_stack_str = ", ".join(tech_stack) if tech_stack and len(tech_stack) > 0 else "(None specified by user — use domain defaults)"

        tech_stack_instruction = ""
        if tech_stack and len(tech_stack) > 0:
            tech_stack_instruction = f"""
CONFIRMED USER ENTERPRISE TECH STACK & TOOLS:
{tech_stack_str}

CRITICAL MANDATORY INSTRUCTION ON TECH STACK:
The user has specifically selected/edited their tech stack to ONLY include: {tech_stack_str}.
- You MUST construct all 3 proposed solutions to strictly use, integrate with, and build upon ONLY these user-selected tools: {tech_stack_str}.
- The 'tools' array in your JSON output for EVERY solution MUST contain ONLY tools from this user confirmed list: {tech_stack_str}. Do NOT invent or append outside default tools.
- Explain in each solution's 'approach' how these specific tools ({tech_stack_str}) are utilized to solve the user's challenge.
"""

        if needs_forecast:
            domain_rules = f"""
THIS PROBLEM IS ABOUT DEMAND FORECASTING & CAPACITY / STAFFING PLANNING.
The user currently relies on historical averages and manual adjustments, causing overcapacity in low demand and shortages during spikes.

YOU MUST generate forecasting solutions. DO NOT propose:
- Generic FastAPI/React "automation assistants"
- Multi-agent / CrewAI / LangChain pipelines
- RAG / vector DB / chatbot hubs
- Titles that paste the problem sentence (e.g. "Automated Operations Team Needs ...")

REQUIRED OPTION SHAPE:
- Option 1 (Quick Win): Excel/Python time-series baseline (moving average, Prophet/statsmodels) + simple dashboard for staffing/infra months ahead.
- Option 2 (Core Engine): Dedicated ML forecasting service (Prophet/XGBoost/sklearn) with feature pipeline, forecast accuracy monitoring (MAPE), and capacity recommendation outputs.
- Option 3 (Advanced Platform): Enterprise demand & capacity planning platform with scenario simulation, what-if planning, alerting for spikes/shortfalls, and BI governance.

TOOLS SHOULD INCLUDE: Confirmed user tools ({tech_stack_str}) + forecasting items like Python, Pandas, Prophet / XGBoost / Scikit-learn, SQL, Power BI — NOT CrewAI, Qdrant, RAG.

Titles must be concrete, e.g.:
- "Baseline Demand Forecast Workbook & Staffing Planner"
- "ML Demand Forecasting & Capacity Recommendation Engine"
- "Enterprise Scenario-Based Capacity Planning Platform"

Approach text must explain HOW forecasting works for staffing/infrastructure — never append the raw problem in quotes after "for:" or "in:".
"""
        else:
            domain_rules = f"""
Match the user's actual domain. Do NOT invent demand forecasting / capacity planning unless the user asked for it.
Do NOT use multi-agent/CrewAI/RAG/vector DB unless the problem clearly needs conversational knowledge retrieval.
Do NOT paste the raw problem statement into the approach after "for:" or "in:".
Titles must be short product-like names for the solution, not a mashup of the problem sentence.

Option 1: Quick win for THIS problem using confirmed tools ({tech_stack_str}).
Option 2: Core end-to-end system for THIS problem using confirmed tools ({tech_stack_str}).
Option 3: Advanced enterprise version of the SAME problem solution using confirmed tools ({tech_stack_str}).

Domain hints:
- Document / PPT / report friction → Office automation, templates, generation APIs, RPA, document AI.
- Invoice / OCR → OCR, parsers, rules, exception workflows.
- Support / KB → RAG only if knowledge retrieval is the core need.
- Workflow automation → workflow engines, APIs, queues.
"""

        return f"""You are a Principal AI & Digitalization Strategy Consultant.
Recommend solutions that solve the user's stated problem — nothing else.

USER'S EXACT PROBLEM STATEMENT:
\"\"\"{problem_text}\"\"\"

CLARIFICATIONS / Q&A:
{qa_block}

STRUCTURED ANALYSIS:
- Problem Domain: {analysis.problem_domain}
- Business Objective: {analysis.business_objective}
- Current Process: {analysis.current_process}
- Pain Points: {', '.join(analysis.pain_points)}
- Decision to Support: {analysis.decision_to_support}
- Forecasting Required: {analysis.forecasting_or_prediction_required}
- Automation Required: {analysis.automation_required}
- Analytics Required: {analysis.analytics_required}
- Optimization Required: {analysis.optimization_required}
- Input Data Sources: {', '.join(analysis.data_sources)}
- Target Time Horizon: {analysis.time_horizon}
- Constraints: {', '.join(analysis.constraints)}

{tech_stack_instruction}

{domain_rules}

TASK:
Return exactly 3 DISTINCT solutions as JSON. Each solution's 'tools' array MUST include user's confirmed tech stack ({tech_stack_str}).

Output JSON matching schema:
{{
  "solutions": [
    {{
      "title": "Concrete solution product name (do not paste the problem sentence)",
      "approach": "How this solution technically solves the problem using {tech_stack_str}. Do not wrap the problem text in quotes.",
      "effort": "Low (1-2 weeks)" or "Medium (1 month)" or "High (2-3 months)",
      "cost_tier": "Low ($)" or "Medium ($$)" or "High ($$$)",
      "tools": ["Confirmed Tool 1", "Confirmed Tool 2", "Specialized Tool 3"],
      "pros": ["Benefit tied to overcapacity/shortage or the stated pain", "Benefit 2"],
      "cons": ["Tradeoff 1", "Tradeoff 2"],
      "risk": "Solution-specific risk and mitigation"
    }}
  ]
}}
"""

    async def analyze_problem(self, problem_text: str, qa_history: List[Dict[str, str]] = None) -> ProblemAnalysisContext:
        """
        Extracts structured business & operational context from problem statement.
        """
        qa_context = ""
        if qa_history:
            qa_context = "\nClarifications Q&A:\n" + "\n".join([f"Q: {q.get('question')}\nA: {q.get('answer')}" for q in qa_history])

        prompt = f"""You are a Lead Digital Transformation & Enterprise Solution Architect.
Analyze the following business problem statement and optional clarification Q&A.

USER'S EXACT PROBLEM STATEMENT:
\"\"\"{problem_text}\"\"\"
{qa_context}

CRITICAL GROUNDING RULES:
- Stay faithful to the user's exact problem. Do NOT reframe it into a different domain.
- If the user mentions forecasts, staffing/infrastructure months ahead, historical averages, overcapacity, or demand spikes, set:
  problem_domain = "Demand Forecasting & Capacity Planning"
  forecasting_or_prediction_required = true
  analytics_required = true
  optimization_required = true
- Only use forecasting domain when the problem is actually about prediction/capacity/staffing planning.
- For other problems (PPT automation, invoices, support KB, etc.), name the domain from the user's words and set forecasting_or_prediction_required=false.

Perform a rigorous structured problem analysis and extract:
1. problem_domain
2. business_objective
3. current_process
4. pain_points
5. decision_to_support
6. boolean requirement flags:
   - forecasting_or_prediction_required
   - automation_required
   - analytics_required
   - optimization_required
7. data_sources
8. time_horizon
9. constraints

Respond STRICTLY in valid JSON matching this schema:
{{
  "problem_domain": "...",
  "business_objective": "...",
  "current_process": "...",
  "pain_points": ["...", "..."],
  "decision_to_support": "...",
  "forecasting_or_prediction_required": boolean,
  "automation_required": boolean,
  "analytics_required": boolean,
  "optimization_required": boolean,
  "data_sources": ["...", "..."],
  "time_horizon": "...",
  "constraints": ["...", "..."]
}}
"""
        if not self.has_ai_provider:
            raise RuntimeError("No AI provider configured. Please set API keys (GEMINI_API_KEY / GROQ_API_KEY) or ensure Ollama is running locally.")

        try:
            logger.info(f"[AI PROVIDER] Calling AI provider for Problem Analysis on domain extraction")
            response_text = await self._call_gemini_with_retry(prompt, temperature=0.1)
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)
            analysis = ProblemAnalysisContext(**data)
            analysis = self._ground_analysis(analysis, problem_text)
            logger.info(
                f"[PROBLEM DOMAIN] Identified domain: {analysis.problem_domain} "
                f"(forecasting={analysis.forecasting_or_prediction_required})"
            )
            return analysis
        except Exception as e:
            logger.warning(f"[AI PROVIDER] Problem analysis error: {e}. Falling back to rule-based analysis.")
            is_forecast = _text_indicates_forecasting(problem_text)
            domain = "Demand Forecasting & Capacity Planning" if is_forecast else "Digital Transformation & Automation"
            analysis = ProblemAnalysisContext(
                problem_domain=domain,
                business_objective=f"Resolve operational challenges: {problem_text[:100]}",
                current_process="Manual operations, spreadsheets, or historical baseline estimates",
                pain_points=["Manual effort and human error", "Lack of automated data integration", "Operational bottlenecks"],
                decision_to_support="Determine operational capacity and technical automation workflow",
                forecasting_or_prediction_required=is_forecast,
                automation_required=True,
                analytics_required=True,
                optimization_required=is_forecast,
                data_sources=["Internal Databases", "Operational Spreadsheets", "REST APIs"],
                time_horizon="Near-term (1-3 months)",
                constraints=["Data security SLA", "Existing infrastructure compatibility"]
            )
            return self._ground_analysis(analysis, problem_text)

    async def check_problem_clarity(self, problem_text: str, qa_history: List[Dict[str, str]] = None) -> ClarityCheckResponse:
        """
        Stage 2 & 3: Evaluates problem statement clarity.
        """
        qa_context = ""
        if qa_history:
            qa_context = "\nPrevious Clarification Q&A:\n" + "\n".join(
                [f"Q (Round {item.get('round', idx+1)}): {item.get('question')}\nA: {item.get('answer')}" for idx, item in enumerate(qa_history)]
            )

        prompt = f"""You are an elite Digital Transformation & Enterprise AI Consulting Advisor.
Analyze the following user problem statement ONLY — do not invent a different problem.

USER'S EXACT PROBLEM STATEMENT:
\"\"\"{problem_text}\"\"\"
{qa_context}

Determine if this problem statement contains enough context to recommend solutions that solve THIS specific problem.
If key information (scale, current tools, who is affected, desired output) is missing, mark is_clear as false and ask one focused clarification question about THIS problem.
If clear enough (or enough detail was gathered), mark is_clear as true.
Clarification questions must stay on the user's stated problem — never switch topics.

Respond strictly in valid JSON format matching this schema:
{{
  "is_clear": boolean,
  "missing_info": ["item 1", "item 2"],
  "question": "Single clear follow-up question if is_clear is false, or null if is_clear is true"
}}
"""
        if not self.has_ai_provider:
            words = problem_text.split()
            if len(words) < 8 and not qa_history:
                return ClarityCheckResponse(
                    is_clear=False,
                    missing_info=["Target department/team", "Current tool stack", "Scale of operations"],
                    question="Could you please specify which team or process is experiencing this issue, what tools you currently use, and the scale of operation?"
                )
            return ClarityCheckResponse(is_clear=True, missing_info=[], question=None)

        try:
            response_text = await self._call_gemini_with_retry(prompt, temperature=0.2)
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)
            return ClarityCheckResponse(**data)
        except Exception as e:
            logger.warning(f"[AI PROVIDER] Clarity check error: {e}. Falling back to rule-based clarity check.")
            words = problem_text.split()
            if len(words) < 8 and not qa_history:
                return ClarityCheckResponse(
                    is_clear=False,
                    missing_info=["Target department/team", "Current tool stack", "Scale of operations"],
                    question="Could you please specify which team or process is experiencing this issue, what tools you currently use, and the scale of operation?"
                )
            return ClarityCheckResponse(is_clear=True, missing_info=[], question=None)




    async def recommend_tech_stack_for_problem(
        self, problem_text: str, analysis: Optional[ProblemAnalysisContext] = None
    ) -> tuple[List[str], Dict[str, List[str]]]:
        """
        Dynamically analyzes the business problem and recommends:
        1. An initial tailored selection of 3-5 primary tools for the problem.
        2. Categorized relevant tool chips across Languages, Frameworks, Integrations/APIs, and Databases.
        """
        if not analysis:
            try:
                analysis = await self.analyze_problem(problem_text)
            except Exception as e:
                logger.warning(f"Problem analysis fallback during tech recommendation: {e}")

        domain_str = analysis.problem_domain if analysis else "General Digital Transformation"
        needs_forecast = (analysis.forecasting_or_prediction_required if analysis else False) or _text_indicates_forecasting(problem_text)

        safe_problem = (problem_text or "").replace('"', "'")
        prompt = f"""You are a Principal Enterprise Cloud & AI Architect.
Recommend the most suitable modern technology stack, libraries, and enterprise software for this specific business problem:

USER'S PROBLEM STATEMENT:
\"\"\"{safe_problem}\"\"\"

PROBLEM DOMAIN: {domain_str}
FORECASTING REQUIRED: {needs_forecast}

CRITICAL RULES:
1. ONLY recommend tools and technologies that directly fit THIS problem domain.
   - For Demand Forecasting / Capacity Planning: Recommend tools like Python, Pandas, Prophet, XGBoost, Scikit-learn, SQL, Power BI, PostgreSQL.
   - For Invoice / Document Processing / OCR: Recommend tools like Python, AWS Textract, Google Document AI, pdfplumber, PostgreSQL, FastAPI.
   - For Customer Support / KB / RAG: Recommend tools like Python, FastAPI, LangChain, OpenAI / Claude / Gemini API, Qdrant, React.
   - For ERP / Workflow Automation: Recommend tools like UiPath, Power Automate, Python, REST APIs, SAP GUI Scripting API.
2. Ensure tools are genuine industry software names, libraries, frameworks, or database names.
3. Provide:
   - "initial_selected_tools": A list of 4-5 core recommended tools that should be selected by default for this exact problem.
   - "categories": An object with categorized lists of relevant tools:
     - "Languages & Core Runtimes": (e.g. Python, Node.js, etc.)
     - "Frameworks & Libraries": relevant domain-specific frameworks/libraries
     - "Enterprise APIs & Integrations": relevant domain APIs or workflow tools
     - "Data, DB & Analytics": relevant databases, data warehouses, or BI tools

Respond STRICTLY in valid JSON matching this schema:
{{
  "initial_selected_tools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4"],
  "categories": {{
    "Languages & Core Runtimes": ["...", "..."],
    "Frameworks & Libraries": ["...", "..."],
    "Enterprise APIs & Integrations": ["...", "..."],
    "Data, DB & Analytics": ["...", "..."]
  }}
}}
"""
        if not self.has_ai_provider:
            return _get_heuristic_tech_stack(problem_text)

        try:
            response_text = await self._call_gemini_with_retry(prompt, temperature=0.2)
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)
            initial_tools = data.get("initial_selected_tools", [])
            categories = data.get("categories", {})
            if not initial_tools or len(initial_tools) == 0:
                initial_tools, categories = _get_heuristic_tech_stack(problem_text)
            return initial_tools, categories
        except Exception as e:
            logger.error(f"[AI PROVIDER] Tech stack recommendation error: {e}")
            return _get_heuristic_tech_stack(problem_text)

    async def evaluate_solution_relevance(
        self,
        problem_analysis: ProblemAnalysisContext,
        solution: SolutionItem,
        problem_text: str = "",
    ) -> SolutionEvaluationScore:
        """
        Evaluates a candidate solution against the problem_analysis to ensure direct problem alignment.
        Rejects solutions that introduce irrelevant tech or do not solve the main pain point.
        """
        prompt = f"""You are an Enterprise Solution Quality Auditor.
Evaluate the following proposed solution against the ORIGINAL user problem.

USER'S EXACT PROBLEM STATEMENT:
\"\"\"{problem_text}\"\"\"

PROBLEM CONTEXT:
- Problem Domain: {problem_analysis.problem_domain}
- Business Objective: {problem_analysis.business_objective}
- Current Process: {problem_analysis.current_process}
- Pain Points: {', '.join(problem_analysis.pain_points)}
- Decision to Support: {problem_analysis.decision_to_support}
- Forecasting Required: {problem_analysis.forecasting_or_prediction_required}
- Automation Required: {problem_analysis.automation_required}
- Analytics Required: {problem_analysis.analytics_required}

PROPOSED SOLUTION TO EVALUATE:
- Title: {solution.title}
- Approach: {solution.approach}
- Tools: {', '.join(solution.tools)}
- Pros: {', '.join(solution.pros)}
- Risk: {solution.risk}

RELEVANCE CRITERIA:
1. Does this solution DIRECTLY solve the user's stated problem?
2. If Forecasting Required is true (staffing/capacity/demand months ahead): the solution MUST center on forecasting / predictive capacity planning (time-series, MAPE, staffing recommendations). REJECT generic FastAPI assistants, multi-agent/CrewAI, RAG/vector DB hubs, and chatbot platforms.
3. If Forecasting Required is false: REJECT forecasting/capacity solutions the user did not ask for, and REJECT unrelated RAG/multi-agent stacks.
4. Reject solutions whose approach only pastes the problem statement after "for:" / "in:".
5. Technology stack must fit THIS problem.

Evaluate and output JSON matching:
{{
  "problem_alignment": score between 0.0 and 1.0 (must be >= 0.7 to pass),
  "business_value": score between 0.0 and 1.0,
  "technical_fit": score between 0.0 and 1.0,
  "implementation_complexity": score between 0.0 and 1.0,
  "data_feasibility": score between 0.0 and 1.0,
  "scalability": score between 0.0 and 1.0,
  "is_relevant": true if problem_alignment >= 0.7 and directly solves the primary problem, else false,
  "rejection_reason": "Explanation if rejected, else null"
}}
"""
        if not self.has_ai_provider:
            raise RuntimeError("AI provider is not configured.")

        # Hard local gate first (prevents generic automation for forecasting problems)
        local_ok, local_reason = self._local_relevance_pass(problem_analysis, solution, problem_text)
        if not local_ok:
            logger.warning(f"[RELEVANCE GATE] Local reject '{solution.title}': {local_reason}")
            return SolutionEvaluationScore(
                problem_alignment=0.2,
                business_value=0.2,
                technical_fit=0.2,
                implementation_complexity=0.5,
                data_feasibility=0.3,
                scalability=0.3,
                is_relevant=False,
                rejection_reason=local_reason,
            )

        try:
            response_text = await self._call_gemini_with_retry(prompt, temperature=0.1)
            json_str = self._extract_json(response_text)
            data = json.loads(json_str)
            score = SolutionEvaluationScore(**data)
            # Re-apply local gate in case the LLM was too lenient
            local_ok, local_reason = self._local_relevance_pass(problem_analysis, solution, problem_text)
            if not local_ok:
                score.is_relevant = False
                score.problem_alignment = min(score.problem_alignment, 0.4)
                score.rejection_reason = local_reason
            logger.info(f"[RELEVANCE SCORE] Solution '{solution.title}': alignment={score.problem_alignment}, relevant={score.is_relevant}")
            return score
        except Exception as e:
            logger.error(f"[AI PROVIDER] Relevance evaluation error: {e}")
            aligned = score_heuristic(problem_analysis, solution)
            return SolutionEvaluationScore(
                problem_alignment=0.85 if aligned else 0.4,
                business_value=0.8,
                technical_fit=0.8,
                implementation_complexity=0.7,
                data_feasibility=0.8,
                scalability=0.8,
                is_relevant=aligned,
                rejection_reason=None if aligned else "Misaligned with problem domain"
            )

    async def generate_solutions_with_relevance_gate(
        self, problem_text: str, qa_history: List[Dict[str, str]] = None, tech_stack: Optional[List[str]] = None
    ) -> tuple[ProblemAnalysisContext, List[SolutionItem]]:
        """
        Stage 4: Generates problem domain analysis, candidate solutions, evaluates each solution for relevance,
        and filters/regenerates options if any candidate is rejected.
        Returns (problem_analysis, solutions_list).
        """
        # Step 1: Extract Problem Analysis
        analysis = await self.analyze_problem(problem_text, qa_history)

        qa_block = "(none)"
        if qa_history:
            qa_block = "\n".join(
                [f"Q: {q.get('question')}\nA: {q.get('answer')}" for q in qa_history]
            )

        # Step 2: Generate 3 Distinct Solution Candidates
        max_attempts = 2
        for attempt in range(1, max_attempts + 1):
            logger.info(
                f"[AI PROVIDER] Solution generation attempt {attempt}/{max_attempts} "
                f"for domain: {analysis.problem_domain} forecasting={analysis.forecasting_or_prediction_required}"
            )
            prompt = self._build_solution_prompt(problem_text, qa_block, analysis, tech_stack=tech_stack)
            try:
                response_text = await self._call_gemini_with_retry(prompt, temperature=0.25)
                json_str = self._extract_json(response_text)
                data = json.loads(json_str)
                solution_list = SolutionListResponse(**data)
                
                # Relevance Gate Check & Tech Stack Enforcer
                valid_solutions = []
                for sol in solution_list.solutions:
                    # Guarantee confirmed user tech_stack is used for solution tools
                    if tech_stack and isinstance(tech_stack, list) and len(tech_stack) > 0:
                        sol.tools = list(dict.fromkeys(tech_stack))

                    eval_res = await self.evaluate_solution_relevance(analysis, sol, problem_text)
                    if eval_res.is_relevant and eval_res.problem_alignment >= 0.7:
                        valid_solutions.append(sol)
                    else:
                        logger.warning(f"[RELEVANCE GATE] Rejected solution '{sol.title}': {eval_res.rejection_reason}")

                if len(valid_solutions) >= 3:
                    logger.info(f"[CONTEXT GENERATED] Successfully generated 3 relevant solution options for {analysis.problem_domain}")
                    return analysis, valid_solutions[:3]
                elif len(valid_solutions) > 0:
                    logger.info(f"[CONTEXT GENERATED] Returning {len(valid_solutions)} validated solutions")
                    return analysis, valid_solutions
            except Exception as e:
                logger.warning(f"[AI PROVIDER] Error generating solutions attempt {attempt}: {e}")

        logger.warning("[AI PROVIDER] Fast fallback to rule-based structured solutions.")
        fallback_tools = tech_stack if (tech_stack and len(tech_stack) > 0) else ["Python", "FastAPI", "PostgreSQL", "REST APIs"]
        is_forecast = analysis.forecasting_or_prediction_required or _text_indicates_forecasting(problem_text)

        prob_snippet = problem_text[:70].strip() if problem_text else "target operational workflow"
        domain_title = analysis.problem_domain or "Digital Transformation"

        if is_forecast:
            sol1 = SolutionItem(
                title="Baseline Demand Forecast Workbook & Staffing Planner",
                approach=f"Excel/Python time-series baseline model (Prophet/statsmodels) with historical data intake to address: {prob_snippet}.",
                effort="Low (1-2 weeks)",
                cost_tier="Low ($)",
                tools=fallback_tools,
                pros=["Fast deployment", "Immediate visibility into staffing and capacity trends", "Low cost"],
                cons=["Requires manual data export updates", "Basic trend forecasting without deep ML"],
                risk="Historical data anomalies require manual review before adjusting staffing schedules."
            )
            sol2 = SolutionItem(
                title="ML Demand Forecasting & Capacity Recommendation Engine",
                approach=f"Dedicated Python microservice with automated data pipeline, MAPE accuracy monitoring, and capacity alerts to resolve: {prob_snippet}.",
                effort="Medium (1 month)",
                cost_tier="Medium ($$)",
                tools=fallback_tools,
                pros=["Automated data ingestion", "High forecast accuracy with MAPE tracking", "Proactive alerts"],
                cons=["Requires initial data cleansing", "Integration overhead with scheduling software"],
                risk="Model retraining needed periodically as seasonal demand patterns shift."
            )
            sol3 = SolutionItem(
                title="Enterprise Scenario-Based Capacity Planning Platform",
                approach=f"Full-scale enterprise demand & capacity management platform with scenario simulation, what-if planning, BI integration, and alert routing for: {prob_snippet}.",
                effort="High (2-3 months)",
                cost_tier="High ($$$)",
                tools=fallback_tools,
                pros=["Multi-scenario simulation", "Enterprise governance and audit logging", "Seamless BI dashboards"],
                cons=["Longer implementation cycle", "Higher initial infrastructure investment"],
                risk="Requires cross-departmental alignment for adoption and data governance."
            )
        else:
            sol1 = SolutionItem(
                title=f"Lightweight Rapid {domain_title} Engine",
                approach=f"Targeted quick-win script and API workflow utilizing {', '.join(fallback_tools)} to automate core friction points in: {prob_snippet}.",
                effort="Low (1-2 weeks)",
                cost_tier="Low ($)",
                tools=fallback_tools,
                pros=["Rapid time-to-market", "Low implementation complexity", "Immediate efficiency gains"],
                cons=["Limited scalability for complex edge cases", "Basic UI capabilities"],
                risk="Process changes may require script adjustments."
            )
            sol2 = SolutionItem(
                title=f"Core {domain_title} Platform",
                approach=f"End-to-end modular solution leveraging {', '.join(fallback_tools)} with centralized backend processing and workflow UI for: {prob_snippet}.",
                effort="Medium (1 month)",
                cost_tier="Medium ($$)",
                tools=fallback_tools,
                pros=["Robust automation pipeline", "Scalable data architecture", "Comprehensive monitoring"],
                cons=["Moderate development effort", "Requires user onboarding"],
                risk="Ensure legacy data interfaces have reliable uptime."
            )
            sol3 = SolutionItem(
                title=f"Enterprise {domain_title} Architecture",
                approach=f"Comprehensive enterprise architecture combining {', '.join(fallback_tools)} with automated monitoring, governance, and BI reporting for: {prob_snippet}.",
                effort="High (2-3 months)",
                cost_tier="High ($$$)",
                tools=fallback_tools,
                pros=["Enterprise grade security & SLA", "Full integration across systems", "Maximum long-term ROI"],
                cons=["Higher operational cost", "Longer implementation timeline"],
                risk="Organizational change management is required for adoption."
            )
        return analysis, [sol1, sol2, sol3]

    async def analyze_selected_solution(
        self, problem_analysis: ProblemAnalysisContext, selected_solution: SolutionItem, problem_text: str = ""
    ) -> SolutionAnalysisResponse:
        """
        Stage 6: Performs deep technical analysis for selected solution.
        """
        prompt = f"""You are a Chief Technical Architect.
The user selected a solution for THEIR exact business problem. Stay grounded in that problem.

USER'S EXACT PROBLEM STATEMENT:
\"\"\"{problem_text}\"\"\"

PROBLEM DOMAIN: {problem_analysis.problem_domain}
BUSINESS OBJECTIVE: {problem_analysis.business_objective}
PAIN POINTS: {', '.join(problem_analysis.pain_points)}

SELECTED SOLUTION:
- Title: {selected_solution.title}
- Approach: {selected_solution.approach}
- Tools: {', '.join(selected_solution.tools)}
- Risk: {selected_solution.risk}

Provide a deep technical and operational architecture analysis that solves the user's stated problem (not a different domain).
Return JSON strictly matching:
{{
  "implementation_approach": "Comprehensive step-by-step technical implementation roadmap for {selected_solution.title} addressing the user's problem",
  "key_considerations": ["Architecture consideration 1 for {selected_solution.title}", "Security & data governance 2", "Operational adoption 3"],
  "dependencies": ["Prerequisite system 1", "Required API access 2", "Team competency 3"]
}}
"""
        if self.has_ai_provider:
            try:
                response_text = await self._call_gemini_with_retry(prompt, temperature=0.2)
                json_str = self._extract_json(response_text)
                data = json.loads(json_str)
                return SolutionAnalysisResponse(**data)
            except Exception as e:
                logger.warning(f"[AI PROVIDER] Solution analysis error: {e}. Returning fallback analysis.")

        return SolutionAnalysisResponse(
            implementation_approach=f"Structured implementation roadmap for {selected_solution.title} utilizing {', '.join(selected_solution.tools or ['modern tech'])}. Phase 1: Environment setup and data pipeline connection. Phase 2: Core workflow logic and processing build. Phase 3: Integration testing and UAT rollout.",
            key_considerations=[
                f"Ensure smooth integration with user's confirmed tech stack: {', '.join(selected_solution.tools or ['tools'])}",
                "Enforce enterprise data governance, encryption, and access controls",
                "Provide user training and documentation to ensure operational adoption"
            ],
            dependencies=[
                "Read/write access to target database or external REST APIs",
                "Configured staging and production deployment environments",
                "Domain SME validation for workflow accuracy"
            ]
        )

    async def generate_selected_solution_context(
        self,
        problem_analysis: ProblemAnalysisContext,
        selected_solution: SolutionItem,
        analysis: SolutionAnalysisResponse,
        problem_text: str = "",
    ) -> SelectedSolutionContext:
        """
        Stage 7: Generates the single canonical SelectedSolutionContext object.
        This canonical object powers UI, BRD, PRD, and Implementation Plan documents.
        """
        tools_str = ", ".join(selected_solution.tools) if selected_solution.tools else "selected technologies"
        original_problem = (problem_text or problem_analysis.business_objective or "").replace('"', "'")
        
        prompt = f"""You are a Lead Business Analyst and Enterprise Solution Architect.
Generate the complete canonical SelectedSolutionContext for the selected solution.
Stay 100% grounded in the user's exact problem — do not substitute a different domain.

USER'S EXACT PROBLEM STATEMENT:
\"\"\"{problem_text}\"\"\"

DERIVED CONTEXT:
- Domain: {problem_analysis.problem_domain}
- Business Objective: {problem_analysis.business_objective}
- Pain Points: {', '.join(problem_analysis.pain_points)}
- Decision Supported: {problem_analysis.decision_to_support}
- Forecasting Required: {problem_analysis.forecasting_or_prediction_required}

SELECTED SOLUTION:
- Title: {selected_solution.title}
- Approach: {selected_solution.approach}
- Effort: {selected_solution.effort}
- Cost Tier: {selected_solution.cost_tier}
- Tech Stack: {tools_str}
- Pros: {', '.join(selected_solution.pros)}
- Risk & Mitigation: {selected_solution.risk}

DEEP ANALYSIS:
- Implementation Approach: {analysis.implementation_approach}
- Key Considerations: {', '.join(analysis.key_considerations)}
- Dependencies: {', '.join(analysis.dependencies)}

RULES FOR GENERATION:
1. ALL sections MUST be specific to {selected_solution.title} solving the USER'S EXACT PROBLEM STATEMENT.
2. problem_statement MUST be the user's original problem text (or a faithful paraphrase), never a different invented problem.
3. DO NOT use generic statements like "improves efficiency" without tying them to this problem.
4. If forecasting/capacity/staffing is the problem (or Forecasting Required): KPIs MUST include Forecast Accuracy (MAPE), Capacity Utilization, Overcapacity Rate, Shortfall/Spike Alert Rate. Workflow MUST include data prep → forecast model → capacity recommendation → review. Technologies MUST include forecasting/ML tooling (not CrewAI/RAG/vector DB unless truly needed).
5. If the problem is NOT forecasting, do NOT inject MAPE/capacity forecasting KPIs.
6. Workflow steps MUST reflect the actual technical sequence for solving THIS problem with {selected_solution.title}.
7. Never paste the problem into a boilerplate "automate repetitive steps for: '...'" style summary.

Return JSON matching schema:
{{
  "solution_name": "{selected_solution.title}",
  "solution_type": "Category archetype matching the user's problem (not an unrelated domain)",
  "problem_statement": "{original_problem}",
  "executive_summary": "How {selected_solution.title} directly solves the user's stated problem",
  "proposed_solution_details": "Detailed operational and architectural breakdown of {selected_solution.title} for this problem",
  "workflow_steps": [
    {{"step": "Step 1", "title": "Step 1 Title", "description": "Step 1 description specific to {selected_solution.title}"}},
    {{"step": "Step 2", "title": "Step 2 Title", "description": "Step 2 description specific to {selected_solution.title}"}},
    {{"step": "Step 3", "title": "Step 3 Title", "description": "Step 3 description specific to {selected_solution.title}"}},
    {{"step": "Step 4", "title": "Step 4 Title", "description": "Step 4 description specific to {selected_solution.title}"}},
    {{"step": "Step 5", "title": "Step 5 Title", "description": "Step 5 description specific to {selected_solution.title}"}}
  ],
  "technologies": ["Tool 1", "Tool 2", "Tool 3"],
  "functional_requirements": [
    {{"module": "Module Name 1", "description": "Module description for {selected_solution.title}", "priority": "P0 (Must Have)"}},
    {{"module": "Module Name 2", "description": "Module description for {selected_solution.title}", "priority": "P0 (Must Have)"}},
    {{"module": "Module Name 3", "description": "Module description for {selected_solution.title}", "priority": "P1 (High)"}}
  ],
  "technical_requirements": ["Technical SLA 1 specific to {selected_solution.title}", "Security / Data SLA 2", "Latency SLA 3"],
  "dependencies": ["Prerequisite system 1", "Required API / database access 2"],
  "risks_and_mitigations": [
    {{"risk": "Specific risk for {selected_solution.title}", "mitigation": "Targeted mitigation strategy"}}
  ],
  "expected_benefits": ["Solution-specific benefit 1 solving the stated pain", "Solution-specific benefit 2"],
  "roi_impact": {{
    "payback_period": "Estimated payback period within {selected_solution.effort}",
    "cost_savings_tier": "ROI impact at {selected_solution.cost_tier}",
    "operational_gain": "Specific efficiency gain for {selected_solution.title}"
  }},
  "success_criteria": [
    "Quantifiable success criteria 1 for {selected_solution.title}",
    "Quantifiable success criteria 2 for {selected_solution.title}",
    "Quantifiable success criteria 3 for {selected_solution.title}"
  ],
  "kpis": [
    "Solution-specific KPI 1 tied to this problem",
    "Solution-specific KPI 2 tied to this problem",
    "Solution-specific KPI 3 tied to this problem"
  ],
  "implementation_phases": [
    {{"phase": "Phase 1: Phase Name", "duration": "Week 1", "tasks": "Specific tasks for {selected_solution.title}", "deliverables": "Deliverable 1"}},
    {{"phase": "Phase 2: Phase Name", "duration": "Weeks 2-3", "tasks": "Specific dev tasks", "deliverables": "Deliverable 2"}},
    {{"phase": "Phase 3: Phase Name", "duration": "Week 4", "tasks": "Specific integration tasks", "deliverables": "Deliverable 3"}},
    {{"phase": "Phase 4: Phase Name", "duration": "Week 5", "tasks": "Deployment tasks", "deliverables": "Deliverable 4"}}
  ],
  "quick_structure_preview": [
    {{"name": "1. Structure Step 1", "content": "Content summary"}},
    {{"name": "2. Structure Step 2", "content": "Content summary"}},
    {{"name": "3. Structure Step 3", "content": "Content summary"}}
  ],
  "resource_allocation": ["Role 1", "Role 2", "Role 3"],
  "governance_controls": "Governance and quality assurance controls for {selected_solution.title}",
  "project_charter": "Executive project charter summary for {selected_solution.title}",
  "conclusion": "Strategic recommendation and rollout conclusion for {selected_solution.title}"
}}
"""
        if self.has_ai_provider:
            try:
                logger.info(f"[AI PROVIDER] Generating canonical SelectedSolutionContext for '{selected_solution.title}'")
                response_text = await self._call_gemini_with_retry(prompt, temperature=0.2)
                json_str = self._extract_json(response_text)
                data = json.loads(json_str)
                if problem_text:
                    data["problem_statement"] = problem_text
                if problem_analysis.forecasting_or_prediction_required or _text_indicates_forecasting(problem_text):
                    kpis = data.get("kpis") or []
                    required_kpi_bits = ["mape", "forecast", "capacity", "overcapacit", "shortfall", "staffing"]
                    kpi_blob = " ".join(kpis).lower()
                    if not any(b in kpi_blob for b in required_kpi_bits):
                        data["kpis"] = [
                            "Forecast Accuracy (MAPE)",
                            "Capacity Utilization Rate",
                            "Overcapacity during low-demand periods",
                            "Shortage / spike shortfall rate",
                        ]
                    if not data.get("solution_type") or "forecast" not in str(data.get("solution_type", "")).lower():
                        data["solution_type"] = "Demand Forecasting & Capacity Planning Engine"
                context = SelectedSolutionContext(**data)
                logger.info(f"[CONTEXT GENERATED] success for '{context.solution_name}'")
                return context
            except Exception as e:
                logger.warning(f"[AI PROVIDER] Context generation error: {e}. Returning fallback context.")

        is_forecast = problem_analysis.forecasting_or_prediction_required or _text_indicates_forecasting(problem_text)
        return SelectedSolutionContext(
            solution_name=selected_solution.title,
            solution_type="Demand Forecasting & Capacity Planning Engine" if is_forecast else "Digital Transformation & Automation Engine",
            problem_statement=problem_text or problem_analysis.business_objective,
            executive_summary=f"Deployment of {selected_solution.title} to systematically resolve operational friction and automate core workflows using {tools_str}.",
            proposed_solution_details=f"Technical architecture and operational deployment of {selected_solution.title} incorporating {tools_str}.",
            workflow_steps=[
                {"step": "Step 1", "title": "Data Ingestion & Setup", "description": f"Ingest operational data and configure integration pipelines with {tools_str}."},
                {"step": "Step 2", "title": "Engine Processing & Business Logic", "description": f"Execute core algorithms and rules in {selected_solution.title}."},
                {"step": "Step 3", "title": "User Interface & Recommendation Dashboard", "description": "Present structured output, recommendations, and operational insights."},
                {"step": "Step 4", "title": "Review, Approval & Document Generation", "description": "Enable stakeholder review and automated document generation."}
            ],
            technologies=selected_solution.tools or ["Python", "FastAPI", "PostgreSQL"],
            functional_requirements=[
                {"module": "Data Integration Module", "description": f"Connects to internal data sources using {tools_str}", "priority": "P0 (Must Have)"},
                {"module": "Core Processing Module", "description": f"Executes business logic for {selected_solution.title}", "priority": "P0 (Must Have)"},
                {"module": "Reporting & Export Module", "description": "Exports analysis and documents", "priority": "P1 (High)"}
            ],
            technical_requirements=[
                "Sub-second API response time for data queries",
                "AES-256 data encryption at rest and TLS 1.3 in transit",
                "99.9% uptime availability SLA"
            ],
            dependencies=["Database & API network access", "Staging environment access"],
            risks_and_mitigations=[{"risk": selected_solution.risk, "mitigation": "Establish staging testing and rollback protocols"}],
            expected_benefits=selected_solution.pros or ["Operational efficiency gains", "Automated processing"],
            roi_impact={
                "payback_period": f"Payback within {selected_solution.effort}",
                "cost_savings_tier": f"Cost tier {selected_solution.cost_tier}",
                "operational_gain": "Reduction in manual processing effort by 60-80%"
            },
            success_criteria=["Successful end-to-end integration", "User adoption across target team", "Reduction in operational delay"],
            kpis=["Forecast Accuracy (MAPE)", "Capacity Utilization Rate", "Shortfall / Spike Alert Rate"] if is_forecast else ["Processing Time Reduction (%)", "Workflow Completion Rate (%)", "Error Rate Reduction (%)"],
            implementation_phases=[
                {"phase": "Phase 1: Discovery & Architecture", "duration": "Week 1", "tasks": "Requirement validation and environment setup", "deliverables": "Architecture Diagram & Setup"},
                {"phase": "Phase 2: Core Development", "duration": "Weeks 2-3", "tasks": f"Build core logic with {tools_str}", "deliverables": "Functional Engine Prototype"},
                {"phase": "Phase 3: Integration & UAT", "duration": "Week 4", "tasks": "Perform end-to-end integration and UAT", "deliverables": "UAT Signoff"},
                {"phase": "Phase 4: Deployment & Handoff", "duration": "Week 5", "tasks": "Production release and user training", "deliverables": "Production System"}
            ],
            quick_structure_preview=[
                {"name": "1. Data Connection & Validation", "content": "Ingest and validate input streams"},
                {"name": "2. Core Logic Execution", "content": "Execute processing algorithms"},
                {"name": "3. Output & Document Export", "content": "Generate final reports and exports"}
            ],
            resource_allocation=["Lead Architect", "Senior Full-Stack Developer", "Domain Subject Matter Expert"],
            governance_controls="Role-based access control (RBAC) and audit logging on all transaction endpoints.",
            project_charter=f"Executive charter to implement {selected_solution.title} within {selected_solution.effort}.",
            conclusion=f"Implementing {selected_solution.title} delivers high-impact digital transformation and strategic business value."
        )


def score_heuristic(analysis: ProblemAnalysisContext, solution: SolutionItem) -> bool:
    """Helper heuristic for score evaluation fallback."""
    if analysis.forecasting_or_prediction_required:
        return _looks_like_forecasting_solution(solution) and not (
            _looks_like_generic_automation(solution) and not _looks_like_forecasting_solution(solution)
        )

    # Reject forecasting-centric answers when the problem is not about forecasting
    domain_lower = analysis.problem_domain.lower()
    if _looks_like_forecasting_solution(solution):
        if not any(k in domain_lower for k in ["forecast", "capacity", "staffing", "demand", "predict"]):
            return False
    if _looks_like_generic_automation(solution):
        return False
    return True


ai_service = AIService()
