"""Digital Twin Simulation Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class DigitalTwinAgent(BaseAgent):
    def __init__(self):
        super().__init__("Digital Twin Agent", "Simulates machine digital twin behavior")

    def run(self, machine_data: Dict, session_id: str, simulation_days: int = 30) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are a digital twin simulation engine for industrial machinery.

{machine_ctx}
SIMULATION: Run for {simulation_days} days
CONTEXT: {context}

Return JSON:
{{
  "simulation_summary": {{
    "days_simulated": {simulation_days},
    "final_health_score": <0-100>,
    "failure_occurred": <true/false>,
    "failure_day": <number or null>,
    "critical_events_count": <number>
  }},
  "daily_simulation": [
    {{"day": <number>, "health_score": <0-100>, "temperature": <num>, "vibration": <num>, "status": "<OK|WARNING|CRITICAL>", "event": "<event or null>"}}
  ],
  "component_wear": [
    {{"component": "<n>", "wear_percentage": <0-100>, "remaining_life_days": <number>}}
  ],
  "intervention_points": [
    {{"day": <number>, "intervention": "<action>", "impact": "<what it prevents>"}}
  ],
  "twin_narrative": "<simulation story and findings>"
}}"""
        # Inside digitaltwin_agent.py
        # Inside digitaltwin_agent.py
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="Qwen/Qwen2.5-72B-Instruct", # The JSON array master
            temperature=0.1
        )
