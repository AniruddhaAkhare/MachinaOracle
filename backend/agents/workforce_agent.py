"""Workforce Planner Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class WorkforceAgent(BaseAgent):
    def __init__(self):
        super().__init__("Workforce Planner Agent", "Plans workforce for maintenance operations")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are a workforce planning expert for industrial maintenance.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "team_required": [
    {{"role": "<role>", "count": <number>, "skills": ["<skill>"], "shift": "<shift>", "hours": <number>}}
  ],
  "total_man_hours": <number>,
  "labor_cost_estimate": <USD>,
  "shift_schedule": [
    {{"shift": "<name>", "team": ["<role>"], "tasks": ["<task>"], "duration_hours": <number>}}
  ],
  "skill_certifications_required": ["<cert1>"],
  "external_contractors_needed": <true/false>,
  "contractor_specialization": "<if needed>",
  "safety_officer_required": <true/false>,
  "workforce_narrative": "<explanation>"
}}"""
        return generate_json_response( # Note: plain response, not JSON
            prompt,
            provider="gemini",
            model="gemini-3.1-flash-lite-preview", # Super fast text generation
            temperature=0.4
        )
