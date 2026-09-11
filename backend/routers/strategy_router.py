from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.strategy_agent import StrategyAgent
from db.database import get_machine_data

router = APIRouter()
agent = StrategyAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

@router.post("/strategy")
async def strategy(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
