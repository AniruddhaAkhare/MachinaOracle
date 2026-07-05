"""SQLite database setup with SQLAlchemy"""
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "./db/machina.db")
engine = create_engine(f"sqlite:///{SQLITE_DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MachineLog(Base):
    __tablename__ = "machine_logs"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    machine_id = Column(String, index=True)
    machine_name = Column(String)
    machine_type = Column(String)
    timestamp = Column(String)
    temperature = Column(Float, nullable=True)
    vibration = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    rpm = Column(Float, nullable=True)
    voltage = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)
    failure_label = Column(String, nullable=True)
    failure_in_days = Column(Float, nullable=True)
    log_text = Column(Text)
    raw_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    filename = Column(String)
    machines_detected = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    os.makedirs(os.path.dirname(SQLITE_DB_PATH) if os.path.dirname(SQLITE_DB_PATH) else ".", exist_ok=True)
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
