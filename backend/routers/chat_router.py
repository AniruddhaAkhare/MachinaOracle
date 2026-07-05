from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from agents.chat_agent import ChatAgent
from db.database import SessionLocal, MachineLog

router = APIRouter()
agent = ChatAgent()

class ChatRequest(BaseModel):
    session_id: str
    machine_id: str
    message: str
    history: Optional[List[Dict]] = []

def get_machine_data(session_id, machine_id):
    db = SessionLocal()
    try:
        m = db.query(MachineLog).filter(MachineLog.session_id == session_id, MachineLog.machine_id == machine_id).first()
        if not m: raise HTTPException(404, "Not found")
        return m.raw_data
    finally:
        db.close()

@router.post("/chat")
async def chat(req: ChatRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id, req.message, req.history)
