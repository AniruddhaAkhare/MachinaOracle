"""What-If Simulation Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class WhatIfAgent(BaseAgent):
    def __init__(self):
        super().__init__("What-If Agent", "Runs what-if scenario simulations")

    def run(self, machine_data: Dict, session_id: str, scenario: Dict = None) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        scenario_text = str(scenario) if scenario else "Increase operating load by 20%, skip next maintenance cycle"
        
        prompt = f"""You are a what-if scenario analysis expert for industrial systems.

{machine_ctx}
SCENARIO TO ANALYZE: {scenario_text}
CONTEXT: {context}

Return JSON:
{{
  "scenario_description": "<what was analyzed>",
  "baseline_state": {{
    "health_score": <0-100>,
    "failure_probability": <0-100>,
    "days_to_failure": <number>
  }},
  "scenario_outcomes": [
    {{
      "scenario_name": "<n>",
      "parameters_changed": {{"param": "value"}},
      "new_health_score": <0-100>,
      "new_failure_probability": <0-100>,
      "new_days_to_failure": <number>,
      "cost_impact": <USD>,
      "risk_change": "<increased|decreased|unchanged>",
      "recommendation": "<action>"
    }}
  ],
  "sensitivity_analysis": [
    {{"parameter": "<n>", "impact_level": "<HIGH|MED|LOW>", "description": "<effect>"}}
  ],
  "best_case_scenario": "<description>",
  "worst_case_scenario": "<description>",
  "optimal_operating_conditions": {{
    "temperature_max": <number>,
    "vibration_max": <number>,
    "load_percentage": <number>
  }},
  "whatif_narrative": "<comprehensive analysis>"
}}"""
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", # Excellent at logic + JSON
            temperature=0.1
        )
