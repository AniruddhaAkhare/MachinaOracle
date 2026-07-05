"""Smart Alert Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class AlertsAgent(BaseAgent):
    def __init__(self):
        super().__init__("Smart Alert Agent", "Generates intelligent alerts and notifications")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        prompt = f"""You are an industrial alert management expert. Generate smart alerts.

{machine_ctx}
CONTEXT: {context}

Return JSON:
{{
  "active_alerts": [
    {{
      "alert_id": "<A001>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW|INFO>",
      "title": "<alert title>",
      "message": "<detailed message>",
      "component": "<affected component>",
      "triggered_by": "<sensor/condition>",
      "timestamp": "<relative time>",
      "action_required": "<action>",
      "auto_escalate": <true/false>
    }}
  ],
  "alert_summary": {{
    "critical": <count>,
    "high": <count>,
    "medium": <count>,
    "low": <count>
  }},
  "notification_recipients": ["<role1>", "<role2>"],
  "escalation_path": ["<step1>", "<step2>"],
  "sms_alert": "<short SMS text>",
  "email_subject": "<email subject>",
  "overall_status": "<EMERGENCY|WARNING|CAUTION|NORMAL>"
}}"""
# Inside chat_agent.py
        return generate_json_response( # Note: plain response, not JSON
            prompt,
            provider="gemini",
            model="gemini-3.1-flash-lite-preview", # Super fast text generation
            temperature=0.4
        )
