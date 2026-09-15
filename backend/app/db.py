import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("digitalization_advisor.db")

Base = declarative_base()

def get_engine_and_session():
    db_url = settings.DATABASE_URL
    # If DATABASE_URL is configured explicitly as SQLite (e.g. sqlite:////var/data/digitalization_advisor.db)
    if db_url.startswith("sqlite"):
        db_path = db_url.replace("sqlite:///", "")
        if db_path and not db_path.startswith(":memory:"):
            abs_dir = os.path.dirname(os.path.abspath(db_path))
            if abs_dir:
                os.makedirs(abs_dir, exist_ok=True)
        logger.info(f"Using SQLite Database directly at: {db_url}")
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        return engine, sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Attempt connecting to MySQL
    try:
        engine = create_engine(db_url, pool_pre_ping=True, pool_recycle=3600)
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected successfully to MySQL Database: {settings.MYSQL_DATABASE}")
        return engine, sessionmaker(autocommit=False, autoflush=False, bind=engine)
    except Exception as e:
        logger.warning(f"Could not connect to MySQL at {db_url}: {e}. Falling back to SQLite local database.")
        fallback_url = "sqlite:///./digitalization_advisor.db"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        return engine, sessionmaker(autocommit=False, autoflush=False, bind=engine)

engine, SessionLocal = get_engine_and_session()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import db_models  # Ensure models are imported
    Base.metadata.create_all(bind=engine)
