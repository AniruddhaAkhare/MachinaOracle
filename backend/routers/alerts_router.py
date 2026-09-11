from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.alerts_agent import AlertsAgent
from db.database import get_machine_data

router = APIRouter()
agent = AlertsAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/alerts")
async def alerts(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
