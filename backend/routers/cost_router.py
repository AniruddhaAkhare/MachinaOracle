from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.cost_agent import CostAnalysisAgent
from db.database import SessionLocal, MachineLog

router = APIRouter()
agent = CostAnalysisAgent()

class AgentRequest(BaseModel):
    session_id: str
    machine_id: str

def get_machine_data(session_id, machine_id):
    db = SessionLocal()
    try:
        m = db.query(MachineLog).filter(MachineLog.session_id == session_id, MachineLog.machine_id == machine_id).first()
        if not m: raise HTTPException(404, "Not found")
        return m.raw_data
    finally:
        db.close()

@router.post("/cost-analysis")
async def cost_analysis(req: AgentRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id)
