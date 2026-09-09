import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.db_models import DocumentModel
from app.models.pydantic_models import (
    SubmitProblemRequest, SubmitProblemResponse,
    ClarifyAnswerRequest, ClarifyResponse,
    GenerateSolutionsRequest, SolutionsResponse,
    SelectSolutionRequest, SelectSolutionResponse,
    GenerateDocumentsRequest, GenerateDocumentsResponse,
    SessionStatusResponse
)
from app.services.state_machine import state_machine_engine

router = APIRouter()

@router.post("/submit-problem", response_model=SubmitProblemResponse, status_code=status.HTTP_201_CREATED)
async def submit_problem(payload: SubmitProblemRequest, db: Session = Depends(get_db)):
    """
    Stage 1 & 2: Captures user's business problem statement, initializes session,
    and runs initial clarity check with Gemini AI.
    """
    try:
        return await state_machine_engine.submit_problem(payload.problem_statement, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/clarify", response_model=ClarifyResponse)
async def answer_clarification(payload: ClarifyAnswerRequest, db: Session = Depends(get_db)):
    """
    Stage 3: Submits clarification answer (Max 2 rounds tracked via Redis).
    """
    try:
        return await state_machine_engine.answer_clarification(payload.session_id, payload.answer, db)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-solutions", response_model=SolutionsResponse)
async def generate_solutions(payload: GenerateSolutionsRequest, db: Session = Depends(get_db)):
    """
    Stage 4: Invokes Solution Generation Agent to return a minimum of 3 structured solutions.
    """
    try:
        return await state_machine_engine.generate_solutions(payload.session_id, db)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/select-solution", response_model=SelectSolutionResponse)
async def select_solution(payload: SelectSolutionRequest, db: Session = Depends(get_db)):
    """
    Stage 5 & 6: Saves selected solution choice to MySQL and invokes Solution Analysis Agent.
    """
    try:
        return await state_machine_engine.select_solution(payload.session_id, payload.solution_id, db)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-documents", response_model=GenerateDocumentsResponse)
async def generate_documents(payload: GenerateDocumentsRequest, db: Session = Depends(get_db)):
    """
    Stage 7: Generates BRD, PRD, Implementation Plan (.docx) and Success Criteria & Benefits.
    """
    try:
        return await state_machine_engine.generate_documents(payload.session_id, db)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/session/{session_id}/status", response_model=SessionStatusResponse)
def get_session_status(session_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full session history and current state machine progress.
    """
    try:
        return state_machine_engine.get_session_status(session_id, db)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/download/{doc_id}")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    """
    Downloads generated Word (.docx) document file.
    """
    doc_rec = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if not doc_rec or not os.path.exists(doc_rec.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requested document file not found")
    
    filename = os.path.basename(doc_rec.file_path)
    return FileResponse(
        path=doc_rec.file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
