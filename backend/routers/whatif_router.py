from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from agents.whatif_agent import WhatIfAgent
from db.database import SessionLocal, MachineLog

router = APIRouter()
agent = WhatIfAgent()

class WhatIfRequest(BaseModel):
    session_id: str
    machine_id: str
    scenario: Optional[Dict] = None

def get_machine_data(session_id, machine_id):
    db = SessionLocal()
    try:
        m = db.query(MachineLog).filter(MachineLog.session_id == session_id, MachineLog.machine_id == machine_id).first()
        if not m: raise HTTPException(404, "Not found")
        return m.raw_data
    finally:
        db.close()

@router.post("/what-if")
async def what_if(req: WhatIfRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id, req.scenario)
