"""Spare Parts Prediction Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class SparePartsAgent(BaseAgent):
    def __init__(self):
        super().__init__("Spare Parts Agent", "Predicts spare parts requirements")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are an industrial spare parts optimization expert.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "critical_parts": [
    {{
      "part_name": "<n>",
      "part_number": "<PN-XXX>",
      "quantity_needed": <number>,
      "urgency": "<IMMEDIATE|SOON|PLANNED>",
      "estimated_cost": <USD>,
      "lead_time_days": <number>,
      "stock_recommendation": "<recommendation>"
    }}
  ],
  "preventive_parts": [
    {{"part_name": "<n>", "quantity": <number>, "replacement_interval": "<period>"}}
  ],
  "total_parts_cost": <USD>,
  "procurement_timeline": "<timeline>",
  "supplier_recommendations": ["<supplier1>"],
  "inventory_action": "<action>",
  "parts_narrative": "<explanation>"
}}"""
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="Qwen/Qwen2.5-72B-Instruct", # The JSON array master
            temperature=0.1
        )