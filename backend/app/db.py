import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("digitalization_advisor.db")

Base = declarative_base()

def get_engine_and_session():
    # Attempt connecting to MySQL
    mysql_url = settings.DATABASE_URL
    try:
        engine = create_engine(mysql_url, pool_pre_ping=True, pool_recycle=3600)
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected successfully to MySQL Database: {settings.MYSQL_DATABASE}")
        return engine, sessionmaker(autocommit=False, autoflush=False, bind=engine)
    except Exception as e:
        logger.warning(f"Could not connect to MySQL at {mysql_url}: {e}. Falling back to SQLite local database.")
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
