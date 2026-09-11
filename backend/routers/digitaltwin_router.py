from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.digitaltwin_agent import DigitalTwinAgent
from db.database import get_machine_data

router = APIRouter()
agent = DigitalTwinAgent()

class DTRequest(BaseModel):
    session_id: str
    machine_id: str
    simulation_days: Optional[int] = 30

@router.post("/digital-twin")
async def digital_twin(req: DTRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id, req.simulation_days)
