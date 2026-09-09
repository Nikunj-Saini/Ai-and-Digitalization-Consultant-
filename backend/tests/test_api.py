import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

client = TestClient(app)

def test_root_endpoint():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"

def test_full_consulting_flow():
    with TestClient(app) as client:
        # 1. Submit Problem Statement
        problem_payload = {
            "problem_statement": "Excessive manual effort spent by project managers compiling slide decks and executive reports every week."
        }
        res = client.post("/submit-problem", json=problem_payload)
        assert res.status_code == 201
        submit_data = res.json()
        assert "session_id" in submit_data
        session_id = submit_data["session_id"]
        
        # 2. Check Clarification or Solution generation step
        if not submit_data["is_clear"] and submit_data["question"]:
            # Answer clarification
            clarify_payload = {
                "session_id": session_id,
                "answer": "We have 50 project managers spending around 10 hours per week manually formatting PowerPoint slides using data from Jira and Excel."
            }
            res_clarify = client.post("/clarify", json=clarify_payload)
            assert res_clarify.status_code == 200

        # 3. Generate Solutions
        res_sol = client.post("/generate-solutions", json={"session_id": session_id})
        assert res_sol.status_code == 200
        sol_data = res_sol.json()
        assert len(sol_data["solutions"]) >= 3
        selected_sol_id = sol_data["solutions"][0]["id"]

        # 4. Select Solution
        res_select = client.post("/select-solution", json={"session_id": session_id, "solution_id": selected_sol_id})
        assert res_select.status_code == 200
        select_data = res_select.json()
        assert select_data["selected_solution"]["id"] == selected_sol_id
        assert "implementation_approach" in select_data["analysis"]

        # 5. Generate Documents
        res_docs = client.post("/generate-documents", json={"session_id": session_id})
        assert res_docs.status_code == 200
        docs_data = res_docs.json()
        assert len(docs_data["documents"]) == 3
        assert len(docs_data["success_criteria_benefits"]["key_performance_indicators"]) > 0

        # 6. Check Session Status
        res_status = client.get(f"/session/{session_id}/status")
        assert res_status.status_code == 200
        status_data = res_status.json()
        assert status_data["stage"] == "DOCUMENTS_GENERATED"

