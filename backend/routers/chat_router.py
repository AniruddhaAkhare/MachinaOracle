from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from agents.chat_agent import ChatAgent
from db.database import get_machine_data

router = APIRouter()
agent = ChatAgent()

class ChatRequest(BaseModel):
    session_id: str
    machine_id: str
    message: str
    history: Optional[List[Dict]] = []

@router.post("/chat")
async def chat(req: ChatRequest):
    return agent.run(get_machine_data(req.session_id, req.machine_id), req.session_id, req.message, req.history)
