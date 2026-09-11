from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.timeline_agent import TimelineAgent
from db.database import get_machine_data

router = APIRouter()
agent = TimelineAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/timeline")
async def timeline(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
