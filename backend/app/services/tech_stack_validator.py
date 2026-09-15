import re
from typing import List, Tuple, Optional

# List of known common tech names for fast-path validation (case-insensitive match)
# ============================================================
# KNOWN TECH STACK
# Used for fast-path technology/tool validation
# Case-insensitive matching
# ============================================================

KNOWN_TECH_STACK_SET = {
    # --------------------------------------------------------
    # PROGRAMMING LANGUAGES
    # --------------------------------------------------------
    "python", "javascript", "typescript", "java", "c", "c++", "c#",
    "r", "go", "golang", "rust", "php", "ruby", "swift", "kotlin",
    "scala", "dart", "perl", "lua", "objective-c", "matlab",
    "groovy", "haskell", "elixir", "erlang", "fortran", "cobol",
    "assembly", "solidity", "vba", "powershell", "bash", "shell",

    # --------------------------------------------------------
    # FRONTEND / WEB
    # --------------------------------------------------------
    "html", "html5", "css", "css3", "sass", "scss", "less",
    "javascript", "typescript", "react", "react.js", "vue", "vue.js",
    "angular", "svelte", "solidjs", "next.js", "nuxt", "gatsby",
    "astro", "remix", "jquery", "bootstrap", "tailwind",
    "tailwind css", "material ui", "mui", "chakra ui", "ant design",
    "shadcn", "three.js", "threejs", "webgl", "webpack",
    "vite", "parcel", "rollup",

    # --------------------------------------------------------
    # BACKEND / FRAMEWORKS
    # --------------------------------------------------------
    "node", "node.js", "express", "express.js", "nestjs",
    "fastapi", "django", "flask", "spring", "spring boot",
    "spring cloud", "laravel", "symfony", "rails",
    "ruby on rails", "asp.net", ".net", "dotnet", "gin",
    "fiber", "actix", "axum", "phoenix", "cakephp",
    "codeigniter", "strapi",

    # --------------------------------------------------------
    # API / COMMUNICATION
    # --------------------------------------------------------
    "rest", "rest api", "rest apis", "graphql", "grpc",
    "websocket", "websockets", "soap", "soap api",
    "swagger", "openapi", "postman", "insomnia",
    "api gateway", "webhooks", "oauth", "oauth2", "jwt",
    "sso", "openid", "openid connect",

    # --------------------------------------------------------
    # DATABASES - SQL
    # --------------------------------------------------------
    "mysql", "postgresql", "postgres", "sqlite", "oracle",
    "sql server", "microsoft sql server", "mariadb",
    "cockroachdb", "mssql", "teradata", "ibm db2",
    "access", "microsoft access",

    # --------------------------------------------------------
    # DATABASES - NOSQL
    # --------------------------------------------------------
    "mongodb", "cassandra", "couchdb", "dynamodb",
    "firebase", "firestore", "redis", "memcached",
    "neo4j", "arangodb", "cosmos db", "amazon dynamodb",
    "supabase", "planetscale", "fauna",

    # --------------------------------------------------------
    # DATA WAREHOUSE / ANALYTICS DATABASES
    # --------------------------------------------------------
    "snowflake", "bigquery", "redshift", "databricks",
    "elasticsearch", "opensearch", "clickhouse",
    "duckdb", "presto", "trino", "hive",

    # --------------------------------------------------------
    # CLOUD - GENERAL
    # --------------------------------------------------------
    "aws", "amazon web services", "azure", "microsoft azure",
    "gcp", "google cloud", "google cloud platform",
    "oracle cloud", "ibm cloud", "digitalocean",
    "heroku", "vercel", "netlify", "cloudflare",
    "render", "railway",

    # --------------------------------------------------------
    # AWS
    # --------------------------------------------------------
    "aws ec2", "aws s3", "aws lambda", "aws rds",
    "aws dynamodb", "aws ecs", "aws eks", "aws fargate",
    "aws cloudfront", "aws api gateway", "aws sqs",
    "aws sns", "aws glue", "aws athena", "aws redshift",
    "aws textract", "aws comprehend", "aws bedrock",
    "aws step functions", "aws cloudwatch",

    # --------------------------------------------------------
    # AZURE
    # --------------------------------------------------------
    "azure functions", "azure blob storage", "azure sql",
    "azure cosmos db", "azure devops", "azure kubernetes",
    "azure data factory", "azure synapse",
    "azure machine learning", "azure openai",
    "azure document intelligence", "azure monitor",

    # --------------------------------------------------------
    # GOOGLE CLOUD
    # --------------------------------------------------------
    "google cloud storage", "google compute engine",
    "google cloud functions", "google kubernetes engine",
    "google cloud run", "bigquery", "google dataflow",
    "google vertex ai", "google document ai",
    "google cloud vision",

    # --------------------------------------------------------
    # DEVOPS / CONTAINERS
    # --------------------------------------------------------
    "docker", "docker compose", "podman",
    "kubernetes", "k8s", "terraform", "ansible",
    "puppet", "chef", "vagrant", "helm",
    "argocd", "istio", "linkerd", "nomad",

    # --------------------------------------------------------
    # CI/CD
    # --------------------------------------------------------
    "jenkins", "github actions", "gitlab ci",
    "gitlab ci/cd", "circleci", "travis ci",
    "azure devops", "teamcity", "bamboo",
    "argo cd", "spinnaker",

    # --------------------------------------------------------
    # VERSION CONTROL
    # --------------------------------------------------------
    "git", "github", "gitlab", "bitbucket",
    "svn", "subversion", "mercurial",

    # --------------------------------------------------------
    # DATA SCIENCE
    # --------------------------------------------------------
    "pandas", "numpy", "scipy", "matplotlib", "seaborn",
    "plotly", "bokeh", "altair", "statsmodels",
    "jupyter", "jupyter notebook", "jupyterlab",
    "streamlit", "gradio",

    # --------------------------------------------------------
    # MACHINE LEARNING
    # --------------------------------------------------------
    "scikit-learn", "sklearn", "tensorflow", "pytorch",
    "keras", "xgboost", "lightgbm", "catboost",
    "prophet", "h2o", "mlpack",
    "opencv", "spacy", "nltk", "gensim",

    # --------------------------------------------------------
    # DEEP LEARNING
    # --------------------------------------------------------
    "tensorflow", "pytorch", "keras", "jax",
    "onnx", "onnx runtime", "cuda", "cuDNN",
    "huggingface", "hugging face", "transformers",

    # --------------------------------------------------------
    # GENERATIVE AI / LLM
    # --------------------------------------------------------
    "openai", "openai api", "chatgpt",
    "anthropic", "claude", "claude api",
    "gemini", "google gemini", "gemini api",
    "mistral", "mistral ai", "llama", "meta llama",
    "llama 2", "llama 3", "llama 4",
    "cohere", "ollama", "groq",
    "huggingface", "hugging face",
    "openrouter",

    # --------------------------------------------------------
    # AI AGENT / LLM FRAMEWORKS
    # --------------------------------------------------------
    "langchain", "langgraph", "llamaindex",
    "llamaindex", "crewai", "autogen",
    "microsoft autogen", "semantic kernel",
    "dspy", "haystack",
    "openai agents sdk", "agents sdk",

    # --------------------------------------------------------
    # VECTOR DATABASES / RAG
    # --------------------------------------------------------
    "pinecone", "qdrant", "weaviate", "chromadb",
    "chroma", "milvus", "pgvector", "faiss",
    "redis vector", "elasticsearch vector",
    "opensearch vector", "vector database",
    "vector db", "rag",
    "retrieval augmented generation",

    # --------------------------------------------------------
    # OCR / DOCUMENT AI
    # --------------------------------------------------------
    "tesseract", "tesseract ocr", "pytesseract",
    "aws textract", "google document ai",
    "azure document intelligence", "abbyy",
    "pdfplumber", "pypdf", "pymupdf", "fitz",
    "python-docx", "docx", "openpyxl",
    "camelot", "tabula", "tabula-py",
    "opencv",

    # --------------------------------------------------------
    # DATA ENGINEERING
    # --------------------------------------------------------
    "apache spark", "spark", "pyspark",
    "apache kafka", "kafka", "rabbitmq",
    "apache airflow", "airflow",
    "prefect", "dagster", "dbt",
    "airbyte", "fivetran", "talend",
    "informatica", "apache flink", "flink",
    "databricks", "snowflake",
    "hadoop", "hdfs", "mapreduce",
    "apache nifi", "nifi",

    # --------------------------------------------------------
    # MESSAGE QUEUES / STREAMING
    # --------------------------------------------------------
    "kafka", "apache kafka", "rabbitmq",
    "apache pulsar", "pulsar",
    "amazon sqs", "aws sqs",
    "amazon sns", "aws sns",
    "azure service bus",
    "google pubsub", "celery",
    "dramatiq", "redis streams",

    # --------------------------------------------------------
    # AUTOMATION / RPA
    # --------------------------------------------------------
    "uipath", "power automate",
    "microsoft power automate",
    "automation anywhere", "blue prism",
    "zapier", "make", "make.com", "n8n",
    "workato", "tray.io", "mulesoft",
    "boomi", "robotic process automation",
    "rpa",

    # --------------------------------------------------------
    # WEB SCRAPING / BROWSER AUTOMATION
    # --------------------------------------------------------
    "beautifulsoup", "beautifulsoup4",
    "scrapy", "selenium", "playwright",
    "puppeteer", "requests", "httpx",
    "curl", "cheerio",

    # --------------------------------------------------------
    # BUSINESS INTELLIGENCE
    # --------------------------------------------------------
    "power bi", "powerbi", "power query", "dax",
    "tableau", "looker", "looker studio",
    "qlik", "qlik sense", "qlikview",
    "microstrategy", "sap analytics cloud",
    "thoughtspot", "metabase", "superset",
    "apache superset",

    # --------------------------------------------------------
    # EXCEL / SPREADSHEETS
    # --------------------------------------------------------
    "excel", "microsoft excel", "power pivot",
    "google sheets", "libreoffice calc",
    "vba", "macros",

    # --------------------------------------------------------
    # ENTERPRISE SOFTWARE
    # --------------------------------------------------------
    "sap", "sap s4hana", "sap hana",
    "oracle erp", "oracle fusion",
    "salesforce", "dynamics 365",
    "microsoft dynamics", "tally",
    "tallyprime", "tally prime", "tally api",
    "servicenow", "workday",
    "zoho", "zoho crm",
    "hubspot", "hubspot crm",
    "odoo",

    # --------------------------------------------------------
    # PROJECT MANAGEMENT / COLLABORATION
    # --------------------------------------------------------
    "jira", "confluence", "trello", "asana",
    "monday.com", "monday", "clickup",
    "notion", "microsoft project",
    "smartsheet", "basecamp",
    "slack", "microsoft teams",
    "sharepoint", "google workspace",

    # --------------------------------------------------------
    # TESTING
    # --------------------------------------------------------
    "pytest", "unittest", "jest", "mocha",
    "junit", "testng", "mockito",
    "selenium", "playwright", "cypress",
    "postman", "newman", "soapui",
    "cucumber", "appium",

    # --------------------------------------------------------
    # MONITORING / OBSERVABILITY
    # --------------------------------------------------------
    "grafana", "prometheus", "elasticsearch",
    "kibana", "logstash", "elk",
    "elk stack", "opentelemetry",
    "datadog", "new relic", "sentry",
    "splunk", "dynatrace",
    "aws cloudwatch", "azure monitor",

    # --------------------------------------------------------
    # LOGGING
    # --------------------------------------------------------
    "log4j", "fluentd", "fluent bit",
    "logstash", "graylog",

    # --------------------------------------------------------
    # MOBILE DEVELOPMENT
    # --------------------------------------------------------
    "android", "android studio", "ios",
    "swift", "kotlin", "flutter",
    "dart", "react native", "ionic",
    "xamarin", ".net maui", "cordova",

    # --------------------------------------------------------
    # BLOCKCHAIN / WEB3
    # --------------------------------------------------------
    "ethereum", "solidity", "web3",
    "web3.js", "ethers.js", "hardhat",
    "truffle", "polygon", "binance smart chain",
    "smart contracts",

    # --------------------------------------------------------
    # SECURITY
    # --------------------------------------------------------
    "oauth", "oauth2", "jwt", "sso",
    "openid", "openid connect",
    "okta", "auth0",
    "keycloak", "hashicorp vault",
    "cybersecurity", "penetration testing",
    "burp suite", "wireshark",

    # --------------------------------------------------------
    # OPERATING SYSTEMS / SERVERS
    # --------------------------------------------------------
    "linux", "ubuntu", "debian", "centos",
    "red hat", "rhel", "fedora",
    "windows server", "windows",
    "macos", "unix",
    "nginx", "apache", "iis",
    "caddy", "traefik",

    # --------------------------------------------------------
    # ARCHITECTURE
    # --------------------------------------------------------
    "microservices", "monolith", "serverless",
    "event driven architecture",
    "event-driven architecture",
    "service oriented architecture",
    "soa", "service mesh",
    "distributed systems",
    "event driven", "event-driven",
    "cloud native", "api first",
    "api-first",

    # --------------------------------------------------------
    # FILE / STORAGE
    # --------------------------------------------------------
    "amazon s3", "aws s3",
    "azure blob storage",
    "google cloud storage",
    "minio", "ceph",
    "ftp", "sftp",

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------
    "elasticsearch", "opensearch",
    "algolia", "solr",
    "apache solr",

    # --------------------------------------------------------
    # CACHE
    # --------------------------------------------------------
    "redis", "memcached", "varnish",

    # --------------------------------------------------------
    # CRM / MARKETING
    # --------------------------------------------------------
    "salesforce", "hubspot", "zoho crm",
    "marketo", "mailchimp",
    "activecampaign", "pipedrive",
    "freshsales",

    # --------------------------------------------------------
    # LOW-CODE / NO-CODE
    # --------------------------------------------------------
    "power apps", "microsoft power apps",
    "power automate", "power pages",
    "appsheet", "google appsheet",
    "bubble", "webflow",
    "airtable", "zapier", "make", "n8n",

    # --------------------------------------------------------
    # VERSION / PACKAGE MANAGEMENT
    # --------------------------------------------------------
    "npm", "yarn", "pnpm", "pip",
    "poetry", "conda", "maven",
    "gradle", "nuget", "composer",
    "cargo", "homebrew",

    # --------------------------------------------------------
    # DEVELOPMENT ENVIRONMENTS
    # --------------------------------------------------------
    "visual studio code", "vs code",
    "visual studio", "intellij idea",
    "pycharm", "webstorm", "eclipse",
    "android studio", "xcode",
    "jupyter notebook", "jupyterlab",

    # --------------------------------------------------------
    # DOCUMENTATION / API TOOLS
    # --------------------------------------------------------
    "swagger", "openapi", "postman",
    "insomnia", "redoc", "readme",

    # --------------------------------------------------------
    # CLOUD DEVOPS / IaC
    # --------------------------------------------------------
    "terraform", "pulumi", "cloudformation",
    "aws cloudformation", "azure bicep",
    "ansible", "packer", "vagrant",

    # --------------------------------------------------------
    # DATA QUALITY / GOVERNANCE
    # --------------------------------------------------------
    "great expectations", "openmetadata",
    "datahub", "collibra",
    "alation", "informatica",
    "data catalog", "data governance",

    # --------------------------------------------------------
    # ETL / ELT
    # --------------------------------------------------------
    "etl", "elt", "ssis",
    "azure data factory",
    "aws glue", "google dataflow",
    "airbyte", "fivetran",
    "talend", "informatica",
    "matillion", "pentaho",

    # --------------------------------------------------------
    # ERP / FINANCE
    # --------------------------------------------------------
    "sap", "oracle erp", "tally",
    "tallyprime", "tally prime",
    "quickbooks", "xero",
    "netsuite", "dynamics 365",

    # --------------------------------------------------------
    # AI / COMPUTER VISION
    # --------------------------------------------------------
    "opencv", "yolo", "yolov5", "yolov8",
    "yolov9", "yolov10", "detectron2",
    "mediapipe", "roboflow",

    # --------------------------------------------------------
    # NLP
    # --------------------------------------------------------
    "nltk", "spacy", "gensim",
    "transformers", "huggingface",
    "bert", "roberta", "gpt",
    "llm", "natural language processing",
    "nlp",

    # --------------------------------------------------------
    # ML OPS
    # --------------------------------------------------------
    "mlflow", "kubeflow", "wandb",
    "weights & biases", "dvc",
    "feast", "metaflow",
    "sagemaker", "vertex ai",
    "azure machine learning",

    # --------------------------------------------------------
    # BUSINESS PROCESS MANAGEMENT
    # --------------------------------------------------------
    "bpm", "business process management",
    "process mining", "celonis",
    "signavio", "sap signavio",
    "bizagi", "camunda",
    "appian", "pega",

    # --------------------------------------------------------
    # E-COMMERCE
    # --------------------------------------------------------
    "shopify", "woocommerce",
    "magento", "bigcommerce",
    "salesforce commerce cloud",

    # --------------------------------------------------------
    # CMS
    # --------------------------------------------------------
    "wordpress", "drupal", "joomla",
    "contentful", "strapi", "sanity",
    "ghost",

    # --------------------------------------------------------
    # ANALYTICS / PRODUCT ANALYTICS
    # --------------------------------------------------------
    "google analytics", "google analytics 4",
    "mixpanel", "amplitude",
    "hotjar", "heap",
    "segment",

    # --------------------------------------------------------
    # VERSION CONTROL / CODE HOSTING
    # --------------------------------------------------------
    "github", "gitlab", "bitbucket",
    "azure repos", "gitea",

    # --------------------------------------------------------
    # DATABASE TOOLS
    # --------------------------------------------------------
    "dbeaver", "pgadmin", "mysql workbench",
    "mongodb compass", "redis insight",
    "datagrip", "sql developer",

    # --------------------------------------------------------
    # CLOUD DATABASE / BACKEND SERVICES
    # --------------------------------------------------------
    "firebase", "supabase", "appwrite",
    "convex", "neon",

    # --------------------------------------------------------
    # COMMON TECHNOLOGY TERMS
    # --------------------------------------------------------
    "api", "database", "sql", "nosql",
    "cloud computing", "machine learning",
    "deep learning", "artificial intelligence",
    "generative ai", "data science",
    "data analytics", "business intelligence",
    "automation", "rpa", "ocr",
    "computer vision", "nlp",
    "predictive analytics", "data engineering",
    "data warehouse", "data lake",
    "data lakehouse", "big data",
    "digital transformation",
    "digitalization", "workflow automation"
}

# ============================================================
# FORBIDDEN NON-TECH WORDS
# Generic conversational / business terms that are NOT valid
# technology or library names — rejected during validation
# ============================================================
FORBIDDEN_NON_TECH_WORDS = {
    # conversational / filler
    "yes", "no", "ok", "okay", "sure", "good", "bad",
    "nice", "great", "fine", "done", "help", "thanks",
    "thank you", "please", "hello", "hi", "hey", "bye",

    # generic business terms
    "solution", "solutions", "platform", "system", "tool",
    "tools", "service", "services", "product", "products",
    "software", "application", "app", "apps", "technology",
    "technologies", "tech", "project", "projects",
    "business", "enterprise", "company", "organization",
    "management", "strategy", "consulting", "digital",
    "innovation", "transformation", "integration",
    "implementation", "deployment", "migration",
    "process", "workflow", "pipeline",

    # generic descriptors
    "new", "old", "modern", "legacy", "best", "top",
    "free", "open", "closed", "fast", "slow", "easy",
    "hard", "simple", "complex", "basic", "advanced",
    "custom", "general", "specific", "standard",

    # random / test inputs
    "test", "testing", "demo", "example", "sample",
    "dummy", "fake", "temp", "temporary", "none", "null",
    "undefined", "na", "n/a", "tbd", "todo",
}

def validate_single_tool(tool_name: str) -> Tuple[bool, Optional[str]]:
    """
    Validates an individual tech tool name string.
    Returns (is_valid, failure_reason).
    """
    if not tool_name or not isinstance(tool_name, str):
        return False, "Tool name cannot be empty."

    trimmed = tool_name.strip()
    if not trimmed:
        return False, "Tool name cannot be blank space."

    lowered = trimmed.lower()
    if lowered in FORBIDDEN_NON_TECH_WORDS:
        return False, f"'{trimmed}' is a conversational term or generic word, not a valid technology or library name."

    # Fast path: matches known tech name list
    if lowered in KNOWN_TECH_STACK_SET:
        return True, None

    # Length checks
    if len(trimmed) < 2:
        if trimmed.upper() in ["C", "R"]:
            return True, None
        return False, f"'{trimmed}' is too short to be a valid technology name."

    if len(trimmed) > 50:
        return False, f"'{trimmed}' exceeds maximum technology name length (50 characters)."

    # Must contain at least one letter
    if not re.search(r"[a-zA-Z]", trimmed):
        return False, f"'{trimmed}' must contain valid alphabetical characters."

    # Reject numbers/symbols only
    if re.match(r"^[0-9\W_]+$", trimmed):
        return False, f"'{trimmed}' is not a valid technology name."

    # Reject 3+ repeating identical characters (e.g., "aaaa", "zzzz", "ffff")
    if re.search(r"(.)\1{2,}", lowered):
        return False, f"'{trimmed}' contains invalid repeating characters."

    # Reject common keyboard mashing sequences
    keyboard_mash_patterns = [
        r"asdf", r"dfgh", r"fghj", r"ghjk", r"hjkl",
        r"qwert", r"werty", r"ertyu", r"rtyui", r"tyuio", r"yuiop",
        r"zxcv", r"xcvb", r"cvbn", r"vbnm",
        r"lkjh", r"kjhg", r"jhgf", r"hgfd", r"gfdsa",
        r"1234", r"2345", r"3456", r"4567", r"5678", r"6789"
    ]
    for pattern in keyboard_mash_patterns:
        if re.search(pattern, lowered) and len(trimmed) < 16:
            return False, f"'{trimmed}' appears to be keyboard mashing / invalid input."

    # Reject 5+ consecutive consonants unless it's a known acronym exception
    consecutive_consonants = re.search(r"[bcdfghjklmnpqrstvwxyz]{5,}", lowered)
    if consecutive_consonants:
        known_acronyms = ["pdf", "sdk", "api", "html", "css", "grpc", "rtsp", "xlsx", "json", "graphql", "docx"]
        if not any(ac in lowered for ac in known_acronyms):
            return False, f"'{trimmed}' contains invalid consonant sequences."

    return True, None


def validate_tech_stack(tools: List[str]) -> Tuple[bool, List[str], str]:
    """
    Validates a list of technology stack names.
    Returns (is_valid, invalid_tools, error_message).
    """
    if not tools or not isinstance(tools, list) or len(tools) == 0:
        return False, [], "Please specify at least one valid technology or tool in your tech stack."

    invalid_tools = []
    reasons = []

    for tool in tools:
        is_val, reason = validate_single_tool(str(tool))
        if not is_val:
            invalid_tools.append(str(tool))
            if reason:
                reasons.append(reason)

    if invalid_tools:
        msg = f"Invalid tech stack item(s) detected: {', '.join(invalid_tools)}. " + " ".join(reasons)
        return False, invalid_tools, msg

    return True, [], "Tech stack is valid."
