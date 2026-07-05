"""Cost Analysis Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class CostAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("Cost Analysis Agent", "Predicts costs and financial impact")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are an industrial cost analysis expert. Analyze financial impact of machine failure.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "immediate_repair_cost": <USD number>,
  "preventive_maintenance_cost": <USD number>,
  "failure_replacement_cost": <USD number>,
  "downtime_cost_per_hour": <USD number>,
  "estimated_downtime_hours": <number>,
  "total_downtime_cost": <USD number>,
  "production_loss_estimate": <USD number>,
  "roi_of_preventive_maintenance": "<percentage>",
  "cost_breakdown": [
    {{"category": "<n>", "amount": <USD>, "percentage": <0-100>}}
  ],
  "cost_comparison": {{
    "fix_now": <USD>,
    "fix_later": <USD>,
    "savings_by_acting_now": <USD>
  }},
  "monthly_maintenance_budget": <USD>,
  "annual_projected_costs": <USD>,
  "cost_trend": [
    {{"month": "<Jan>", "predicted_cost": <USD>}}
  ],
  "financial_risk_level": "<CRITICAL|HIGH|MEDIUM|LOW>",
  "cost_narrative": "<explanation>"
}}"""
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="Qwen/Qwen2.5-72B-Instruct", # The JSON array master
            temperature=0.1
        )
