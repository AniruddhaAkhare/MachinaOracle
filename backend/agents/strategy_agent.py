"""Strategy Optimizer Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class StrategyAgent(BaseAgent):
    def __init__(self):
        super().__init__("Strategy Optimizer Agent", "Optimizes long-term maintenance strategy")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are a strategic maintenance advisor for industrial operations.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "recommended_strategy": "<Corrective|Preventive|Predictive|Condition-Based|Proactive>",
  "strategy_rationale": "<why this strategy>",
  "kpis": [
    {{"kpi": "<n>", "current": "<val>", "target": "<val>", "improvement": "<pct>"}}
  ],
  "implementation_roadmap": [
    {{"phase": "<n>", "duration": "<period>", "actions": ["<action>"], "investment": <USD>}}
  ],
  "risk_mitigation": [
    {{"risk": "<n>", "probability": "<H/M/L>", "mitigation": "<action>"}}
  ],
  "technology_recommendations": ["<tech1>"],
  "iot_sensors_to_add": ["<sensor1>"],
  "expected_outcomes": {{
    "downtime_reduction": "<pct>",
    "cost_savings": "<USD/year>",
    "lifespan_extension": "<years>"
  }},
  "strategy_narrative": "<comprehensive explanation>"
}}"""
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", # Excellent at logic + JSON
            temperature=0.1
        )