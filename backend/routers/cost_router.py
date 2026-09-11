from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.cost_agent import CostAnalysisAgent
from db.database import get_machine_data

router = APIRouter()
agent = CostAnalysisAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/cost-analysis")
async def cost_analysis(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
