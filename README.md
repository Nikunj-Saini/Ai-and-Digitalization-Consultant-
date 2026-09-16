# Al Strategy & Consulting Hub

An AI-powered enterprise consulting platform that transforms complex business and operational problems into structured technical solutions, architecture designs, implementation roadmaps, and executive-level documentation.

The platform combines **LLM orchestration, enterprise technology-stack validation, technical solution generation, architecture visualization, session persistence, and automated document generation** into a single guided consulting workflow.

---

## Overview

Traditional digitalization consulting often involves multiple stages of requirement gathering, clarification, solution evaluation, technical analysis, architecture design, and documentation.

This platform digitizes that workflow using AI.

A user can provide a business problem along with their existing enterprise technology stack. The system then guides them through a structured consulting process:

```text
Business Problem
       |
       v
Problem Intake
       |
       v
Interactive Clarification
       |
       v
Customized Solutions
       |
       v
Technical Analysis
       |
       v
Architecture & Roadmap
       |
       v
Executive Documents
(BRD / PRD / Implementation Plan)
```

---

## Key Features

### 1. Problem Intake

Users provide:

* Business or operational problem
* Existing technology stack
* Business constraints
* Requirements and objectives
* Additional contextual information

The platform uses this information as the foundation for the consulting workflow.

---

### 2. Interactive Clarification

Before generating solutions, the AI analyzes the submitted problem and identifies missing or ambiguous requirements.

The system follows a structured clarification process to collect the necessary information.

This helps reduce assumptions and improves the relevance of generated solutions.

---

### 3. Customized Solutions Deck

The platform generates multiple distinct architectural approaches based on:

* Business requirements
* Existing technology stack
* Technical constraints
* Implementation complexity
* Expected timeline

Each solution contains:

* Solution overview
* Architecture approach
* Technology stack
* Advantages
* Limitations
* Estimated timeline
* Complexity assessment

---

### 4. Deep Technical Analysis

After selecting a solution, the platform performs a deeper technical analysis.

Generated outputs include:

* Technical architecture
* Phased implementation roadmap
* Success criteria
* Security considerations
* Implementation risks
* Technical dependencies
* Architecture workflow

---

### 5. Dynamic Architecture Diagrams

The platform generates architecture diagrams using **Mermaid**.

Example workflow:

```text
Frontend
   |
   v
FastAPI Backend
   |
   +--------> LLM Routing Layer
   |
   +--------> MySQL
   |
   +--------> Redis
   |
   v
Document Generation
```

Architecture diagrams can be dynamically generated according to the selected solution.

---

### 6. Executive Document Hub

The platform automatically generates professional enterprise documentation.

Supported documents include:

* Business Requirements Document (BRD)
* Product Requirements Document (PRD)
* Phased Implementation Plan

Documents are generated as `.docx` files using **python-docx**.

---

## Multi-LLM Architecture

The platform is designed with an LLM routing and fallback architecture.

Supported AI providers/models include:

* Google Gemini
* Groq
* DeepSeek
* Local Ollama models

The routing layer provides resilience against:

* API failures
* Rate limits
* Temporary service unavailability
* Model-specific failures

A simplified flow:

```text
                User Request
                     |
                     v
              LLM Router
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Gemini      Groq      DeepSeek
          |
          | Failure / Rate Limit
          v
       Ollama
```

The objective is to maintain application availability even when an individual model provider becomes temporarily unavailable.

---

## Technology Stack Validator

The platform includes an enterprise technology-stack validation layer.

Users can provide technologies such as:

```text
Salesforce
AWS
React
Python
FastAPI
MySQL
Redis
```

The validation engine checks submitted technologies against an internal enterprise technology lookup dictionary before using them for solution generation.

This helps prevent invalid or unsupported technology names from entering the solution-generation workflow.

---

## Session State & Persistence

The application uses a state-machine-based workflow to maintain the user's progress across the consulting stages.

The system supports:

* Session persistence
* Session restoration
* Workflow state tracking
* Historical session information
* Audit-oriented data tracking

### Persistence Technologies

**MySQL**

Used for structured and persistent application data.

**Redis**

Used for session-related caching and fast state access.

---

# System Architecture

```text
                         React + Vite
                              |
                              v
                     FastAPI REST API
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
       Session Engine    LLM Router      Tech Validator
             |                |                |
             v                v                v
           Redis       +------+------+     Tech Dictionary
                       |      |      |
                       v      v      v
                    Gemini   Groq  DeepSeek
                                      |
                                      v
                                    Ollama

                              |
                              v
                            MySQL
                              |
                +-------------+-------------+
                |                           |
                v                           v
        Mermaid Diagram              Document Engine
                                      |
                                      v
                                  .docx Files
```

---

# Technology Stack

## Backend

| Technology  | Purpose                  |
| ----------- | ------------------------ |
| Python      | Core backend language    |
| FastAPI     | REST API framework       |
| Pydantic v2 | Validation and schemas   |
| SQLAlchemy  | ORM                      |
| MySQL       | Persistent database      |
| Redis       | Session caching          |
| python-docx | Word document generation |

## AI Layer

| Technology    | Purpose                     |
| ------------- | --------------------------- |
| Google Gemini | Primary/fallback LLM        |
| Groq          | High-speed inference        |
| DeepSeek      | Alternative reasoning model |
| Ollama        | Local LLM execution         |

## Frontend

| Technology   | Purpose               |
| ------------ | --------------------- |
| React.js     | UI framework          |
| Vite         | Frontend build tool   |
| CSS3         | Responsive styling    |
| Lucide React | UI icons              |
| Mermaid      | Architecture diagrams |

---

# Consulting Workflow

The application is built around a five-stage state machine:

```text
STAGE 1
PROBLEM_INTAKE
       |
       v
STAGE 2
CLARIFICATION
       |
       v
STAGE 3
SOLUTION_DECK
       |
       v
STAGE 4
TECHNICAL_ANALYSIS
       |
       v
STAGE 5
DOCUMENT_HUB
```

Each stage receives the output of the previous stage as contextual input.

This creates a continuous consulting flow rather than independent AI prompts.

---

# Example Use Case

Consider an organization facing the following problem:

> "Our service team manually processes customer requests across multiple systems, resulting in delays and inconsistent tracking."

The user provides the existing stack:

```text
Salesforce
AWS
React
Python
MySQL
```

The platform can then:

1. Analyze the problem.
2. Identify missing requirements.
3. Ask clarification questions.
4. Generate multiple solution architectures.
5. Adapt those architectures to Salesforce and AWS.
6. Allow the user to select a solution.
7. Perform deep technical analysis.
8. Generate an implementation roadmap.
9. Create architecture diagrams.
10. Generate BRD, PRD and implementation documents.

---

# Project Structure

```text
enterprise-ai-consulting/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routers/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── exports/
│   └── generated-documents/
│
└── README.md
```

---

# Installation

## 1. Clone the Repository

```bash
git clone <repository-url>

cd enterprise-ai-consulting
```

---

## 2. Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will typically run at:

```text
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file for the backend.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

DATABASE_URL=mysql+pymysql://username:password@localhost/database_name

REDIS_URL=redis://localhost:6379/0
```

API keys should never be committed to GitHub.

Add the following to `.gitignore`:

```text
.env
venv/
__pycache__/
node_modules/
```

---

# API Workflow

A simplified API workflow:

```text
POST /api/problem
        |
        v
POST /api/clarification
        |
        v
POST /api/solutions
        |
        v
POST /api/analysis
        |
        v
POST /api/documents
```

The exact endpoints may vary depending on the implementation.

---

# Document Generation

The document engine uses `python-docx` to generate structured Word documents.

Generated documents can contain:

* Executive Summary
* Business Requirements
* Functional Requirements
* Non-Functional Requirements
* Technical Architecture
* Implementation Phases
* Risks
* Security Considerations
* Success Criteria
* Expected Benefits

---

# Design

The frontend follows a modern enterprise UI approach featuring:

* Dark glassmorphism interface
* Responsive layout
* Guided multi-stage workflow
* Stepper navigation
* Error boundaries
* History drawer
* Dynamic solution cards
* Architecture visualization
* Document generation interface

The design focuses on making a complex consulting workflow understandable and navigable for business and technical users.

---

# Project Value

This platform demonstrates how generative AI can be integrated into an enterprise consulting workflow rather than being used only as a conversational chatbot.

It combines:

```text
Business Problem
       +
Enterprise Context
       +
AI Reasoning
       +
Technical Architecture
       +
Implementation Planning
       +
Executive Documentation
```

into a single end-to-end workflow.

The result is an AI-assisted digitalization platform capable of supporting organizations from **problem discovery through technical solution design and implementation planning**.

---

# Future Enhancements

Potential future improvements include:

* Enterprise SSO authentication
* Role-based access control
* Multi-tenant architecture
* Advanced audit logging
* Vector database and enterprise knowledge retrieval
* RAG-based organizational knowledge
* Cloud deployment
* Cost estimation engine
* Architecture export to additional formats
* Integration with Jira, ServiceNow and Salesforce
* Real-time collaboration
* Advanced analytics and consulting dashboards

---

# License

This project is intended for educational, portfolio, and development purposes. Add an appropriate license before distributing the project publicly.
