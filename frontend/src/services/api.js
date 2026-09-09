const API_BASE_URL = '/api';

export async function submitProblem(problemStatement) {
  const response = await fetch(`${API_BASE_URL}/submit-problem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem_statement: problemStatement }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit problem statement');
  }
  return response.json();
}

export async function submitClarification(sessionId, answer) {
  const response = await fetch(`${API_BASE_URL}/clarify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit clarification');
  }
  return response.json();
}

export async function generateSolutions(sessionId) {
  const response = await fetch(`${API_BASE_URL}/generate-solutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate solution options');
  }
  return response.json();
}

export async function selectSolution(sessionId, solutionId) {
  const response = await fetch(`${API_BASE_URL}/select-solution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, solution_id: solutionId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to select solution');
  }
  return response.json();
}

export async function generateDocuments(sessionId) {
  const response = await fetch(`${API_BASE_URL}/generate-documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate documents');
  }
  return response.json();
}

export async function getSessionStatus(sessionId) {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/status`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch session status');
  }
  return response.json();
}
