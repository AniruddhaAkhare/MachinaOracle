from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from agents.whatif_agent import WhatIfAgent
from db.database import get_machine_data

router = APIRouter()
agent = WhatIfAgent()

class WhatIfRequest(BaseModel):
    session_id: str
    machine_id: str
    scenario: Optional[Dict] = None

@router.post("/what-if")
async def what_if(req: WhatIfRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id, req.scenario)
