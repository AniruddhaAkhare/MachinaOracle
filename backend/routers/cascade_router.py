"""Cascade Intelligence Engine router — MachinaOracle"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.cascade_agent import CascadeIntelligenceAgent
from db.database import get_machine_data
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
agent  = CascadeIntelligenceAgent()


class CascadeRequest(BaseModel):
    session_id: str
    machine_id: str


@router.post("/simulate-cascade")
async def simulate_cascade(req: CascadeRequest):
    """
    Run cascade failure simulation from the specified root machine.

    Returns:
      root_failure, propagation_steps, total_impact, containment,
      narrative, graph (nodes + edges for frontend visualisation),
      metadata
    """
    logger.info(f"[CascadeRouter] Cascade simulation: session={req.session_id} root={req.machine_id}")
    machine_data = get_machine_data(req.session_id, req.machine_id)
    return agent.run(machine_data, req.session_id)
