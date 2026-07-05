"""Anomaly Detection Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class AnomalyAgent(BaseAgent):
    def __init__(self):
        super().__init__("Anomaly Detection Agent", "Detects anomalies in machine behavior")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are an anomaly detection expert for industrial IoT systems.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "anomalies_detected": [
    {{
      "anomaly_id": "<AN001>",
      "type": "<spike|drift|oscillation|flatline|outlier>",
      "sensor": "<sensor name>",
      "description": "<what was detected>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
      "value_detected": "<value>",
      "expected_range": "<min-max>",
      "deviation_percentage": <number>,
      "first_detected": "<relative time>",
      "pattern": "<recurring|one-time|trending>"
    }}
  ],
  "anomaly_score": <0-100>,
  "baseline_deviation": "<percentage>",
  "pattern_analysis": {{
    "trend": "<degrading|stable|improving>",
    "seasonality": "<detected or not>",
    "cycles": "<description>"
  }},
  "ml_confidence": <0-100>,
  "false_positive_probability": <0-100>,
  "anomaly_narrative": "<detailed explanation>"
}}"""
# Inside chat_agent.py
        return generate_json_response( # Note: plain response, not JSON
            prompt,
            provider="gemini",
            model="gemini-3.1-flash-lite-preview", # Super fast text generation
            temperature=0.4
        )