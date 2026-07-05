"""Failure Timeline Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class TimelineAgent(BaseAgent):
    def __init__(self):
        super().__init__("Timeline Agent", "Generates failure timeline predictions")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are a predictive analytics expert. Generate a detailed failure timeline.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "timeline_events": [
    {{
      "day": <number>,
      "event": "<event description>",
      "severity": "<INFO|WARNING|CRITICAL>",
      "probability": <0-100>,
      "component": "<affected component>",
      "recommended_action": "<action>"
    }}
  ],
  "degradation_curve": [
    {{"day": <number>, "health_score": <0-100>, "failure_probability": <0-100>}}
  ],
  "critical_threshold_day": <number>,
  "failure_window": {{"earliest": <days>, "most_likely": <days>, "latest": <days>}},
  "milestones": [
    {{"milestone": "<name>", "day": <number>, "description": "<desc>"}}
  ],
  "timeline_narrative": "<explanation>"
}}"""
        # Inside digitaltwin_agent.py
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="Qwen/Qwen2.5-72B-Instruct", # The JSON array master
            temperature=0.1
        )