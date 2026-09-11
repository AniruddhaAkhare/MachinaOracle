from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.workforce_agent import WorkforceAgent
from db.database import get_machine_data

router = APIRouter()
agent = WorkforceAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/workforce")
async def workforce(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
