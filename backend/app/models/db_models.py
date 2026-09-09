from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="INTAKE")

    problem_statements = relationship("ProblemStatementModel", back_populates="session", cascade="all, delete-orphan")
    clarifications = relationship("ClarificationModel", back_populates="session", cascade="all, delete-orphan")
    solutions = relationship("SolutionModel", back_populates="session", cascade="all, delete-orphan")
    documents = relationship("DocumentModel", back_populates="session", cascade="all, delete-orphan")


class ProblemStatementModel(Base):
    __tablename__ = "problem_statements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    clarified_text = Column(Text, nullable=True)

    session = relationship("SessionModel", back_populates="problem_statements")


class ClarificationModel(Base):
    __tablename__ = "clarifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    round = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)

    session = relationship("SessionModel", back_populates="clarifications")


class SolutionModel(Base):
    __tablename__ = "solutions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    data = Column(Text, nullable=False)  # JSON formatted solution data
    is_selected = Column(Boolean, default=False)

    session = relationship("SessionModel", back_populates="solutions")


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    type = Column(String(50), nullable=False)  # 'brd', 'prd', 'plan'
    file_path = Column(String(500), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionModel", back_populates="documents")
