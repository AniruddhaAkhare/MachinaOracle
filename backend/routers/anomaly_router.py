from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.anomaly_agent import AnomalyAgent
from db.database import get_machine_data

router = APIRouter()
agent = AnomalyAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/anomaly-detection")
async def anomaly_detection(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
