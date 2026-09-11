from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.spareparts_agent import SparePartsAgent
from db.database import get_machine_data

router = APIRouter()
agent = SparePartsAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/spare-parts")
async def spare_parts(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
