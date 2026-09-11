from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.rootcause_agent import RootCauseAgent
from db.database import get_machine_data

router = APIRouter()
agent = RootCauseAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/root-cause")
async def root_cause(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
