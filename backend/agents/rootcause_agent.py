"""Root Cause Analysis Agent"""
from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from typing import Dict, Any

class RootCauseAgent(BaseAgent):
    def __init__(self):
        super().__init__("Root Cause Analysis Agent", "Deep root cause analysis of machine failures")

    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        context = self.get_context(machine_data, session_id)
        machine_ctx = self.format_machine_context(machine_data)
        
        prompt = f"""You are an expert Root Cause Analysis (RCA) engineer. Perform deep RCA on this machine.

{machine_ctx}

HISTORICAL CONTEXT:
{context}

Return JSON:
{{
  "primary_root_cause": "<detailed cause>",
  "cause_category": "<mechanical|electrical|thermal|chemical|operational|environmental>",
  "contributing_factors": [
    {{"factor": "<name>", "impact": "<HIGH|MEDIUM|LOW>", "description": "<detail>"}}
  ],
  "causal_chain": [
    {{"step": 1, "event": "<event>", "consequence": "<what it leads to>"}}
  ],
  "fault_tree": {{
    "top_event": "<main failure>",
    "branches": [
      {{"cause": "<cause>", "sub_causes": ["<sub1>", "<sub2>"]}}
    ]
  }},
  "timeline_of_degradation": [
    {{"phase": "<Early|Progressive|Critical>", "timeframe": "<period>", "indicators": ["<ind1>"]}}
  ],
  "similar_failure_patterns": ["<pattern1>", "<pattern2>"],
  "corrective_actions": [
    {{"action": "<action>", "priority": "<HIGH|MEDIUM|LOW>", "timeline": "<when>"}}
  ],
  "preventive_measures": ["<measure1>", "<measure2>"],
  "rca_narrative": "<detailed 3-4 sentence explanation>"
}}"""
        
        # Inside rootcause_agent.py
        return generate_json_response(
            prompt,
            provider="huggingface",
            model="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", # Excellent at logic + JSON
            temperature=0.1
        )
