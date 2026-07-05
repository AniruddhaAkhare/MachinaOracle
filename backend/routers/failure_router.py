"""Failure prediction router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.failure_agent import FailurePredictionAgent
from db.database import SessionLocal, MachineLog
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
agent = FailurePredictionAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

def get_machine_data(session_id: str, machine_id: str):
    db = SessionLocal()
    try:
        machine = db.query(MachineLog).filter(
            MachineLog.session_id == session_id,
            MachineLog.machine_id == machine_id
        ).first()
        if not machine:
            raise HTTPException(404, "Machine not found")
        return machine.raw_data
    finally:
        db.close()

@router.post("/predict-failure")
async def predict_failure(req: AgentRequest):
    machine_data = get_machine_data(req.session_id, req.machine_id)
    return agent.run(machine_data, req.session_id)
