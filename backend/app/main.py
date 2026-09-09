import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.db import init_db
from app.routes.api_router import router as api_router

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("digitalization_advisor.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing Digitalization Advisor API backend...")
    os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
    yield
    # Shutdown actions
    logger.info("Shutting down Digitalization Advisor API backend...")

app = FastAPI(
    title="Digitalization Advisor API",
    description="AI Consulting Agent Backend powered by Google Gemini",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev frontend from 5173/3000/any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated document exports static files
app.mount("/static/exports", StaticFiles(directory=settings.EXPORTS_DIR), name="exports")

# Include API Router under /api prefix and root
app.include_router(api_router, prefix="/api", tags=["Digitalization Advisor Endpoints"])
app.include_router(api_router, tags=["Root Endpoints"])

@app.get("/")
def read_root():
    return {
        "app": "Digitalization Advisor - AI Consulting Agent",
        "status": "online",
        "model": settings.GEMINI_MODEL,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
