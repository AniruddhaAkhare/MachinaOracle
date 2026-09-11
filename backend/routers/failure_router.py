"""Failure prediction router"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.failure_agent import FailurePredictionAgent
from db.database import get_machine_data
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
agent = FailurePredictionAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/predict-failure")
async def predict_failure(req: AgentRequest):
    machine_data = get_machine_data(req.session_id, req.machine_id)
    return agent.run(machine_data, req.session_id)
