from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.digitaltwin_agent import DigitalTwinAgent
from db.database import SessionLocal, MachineLog

router = APIRouter()
agent = DigitalTwinAgent()

class DTRequest(BaseModel):
    session_id: str
    machine_id: str
    simulation_days: Optional[int] = 30

def get_machine_data(session_id, machine_id):
    db = SessionLocal()
    try:
        m = db.query(MachineLog).filter(MachineLog.session_id == session_id, MachineLog.machine_id == machine_id).first()
        if not m: raise HTTPException(404, "Not found")
        return m.raw_data
    finally:
        db.close()

@router.post("/digital-twin")
async def digital_twin(req: DTRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id, req.simulation_days)
