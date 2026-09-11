from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.maintenance_agent import MaintenancePlannerAgent
from db.database import get_machine_data

router = APIRouter()
agent = MaintenancePlannerAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/maintenance-plan")
async def maintenance_plan(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
