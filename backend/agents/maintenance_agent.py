"""Maintenance Planner Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class MaintenancePlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__("Maintenance Planner Agent", "Creates detailed maintenance schedules")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are an expert maintenance planning engineer. Create a comprehensive maintenance plan.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "maintenance_urgency": "<IMMEDIATE|SCHEDULED|ROUTINE>",
  "recommended_maintenance_date": "<date string>",
  "maintenance_type": "<Corrective|Preventive|Predictive|Condition-based>",
  "tasks": [
    {{
      "task_id": "<T001>",
      "description": "<task>",
      "priority": "<HIGH|MED|LOW>",
      "duration_hours": <number>,
      "skill_required": "<skill>",
      "parts_needed": ["<part1>"],
      "procedure": "<step-by-step>"
    }}
  ],
  "shutdown_required": <true/false>,
  "estimated_downtime_hours": <number>,
  "maintenance_window": "<suggested time>",
  "inspection_checklist": ["<item1>", "<item2>"],
  "safety_precautions": ["<precaution1>"],
  "tools_required": ["<tool1>"],
  "post_maintenance_tests": ["<test1>"],
  "schedule": [
    {{"week": 1, "activities": ["<act1>"]}},
    {{"week": 2, "activities": ["<act2>"]}}
  ],
  "maintenance_narrative": "<detailed explanation>"
}}"""
        # Inside digitaltwin_agent.py
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="Qwen/Qwen2.5-72B-Instruct", # The JSON array master
            temperature=0.1
        )
