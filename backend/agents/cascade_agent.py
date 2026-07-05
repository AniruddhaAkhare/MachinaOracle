"""
Cascade Intelligence Engine Agent — MachinaOracle
==================================================
Uses Gemini to generate:
  • Narrative root-failure analysis
  • Containment strategy per step
  • Executive summary

Purely additive — does not modify BaseAgent or any other agent.
"""
from __future__ import annotations

import logging
from typing import Dict, Any, List

from agents.base_agent import BaseAgent
from services.gemini_service import generate_json_response
from services.cascade_service import (
    build_dependency_graph,
    simulate_bfs_cascade,
    compute_total_impact,
    build_graph_nodes_edges,
)
from db.database import SessionLocal, MachineLog

logger = logging.getLogger(__name__)


class CascadeIntelligenceAgent(BaseAgent):
    """
    Orchestrates the full cascade simulation pipeline:
      1. Load all machines for the session from SQLite
      2. Build dependency graph (rule-based + RAG-augmented)
      3. BFS simulate propagation
      4. Compute financial/operational impact
      5. Call Gemini for containment strategy & narrative
      6. Return combined structured response
    """

    def __init__(self):
        super().__init__(
            "Cascade Intelligence Engine",
            "Simulates factory-wide failure propagation from a root machine",
        )

    # ── Public entry point ────────────────────────────────────────────────────
    def run(self, machine_data: Dict, session_id: str) -> Dict[str, Any]:
        root_id   = machine_data.get("machine_id", "")
        root_name = machine_data.get("machine_name", root_id)

        # 1. Load all machines in session
        all_machines = self._load_session_machines(session_id)
        if not all_machines:
            logger.warning(f"[CascadeAgent] No machines found for session {session_id}")
            all_machines = [machine_data]

        machine_by_id = {m["machine_id"]: m for m in all_machines}

        # 2. Build dependency graph
        logger.info(f"[CascadeAgent] Building dependency graph for {len(all_machines)} machines")
        graph = build_dependency_graph(session_id, all_machines)

        # 3. BFS cascade simulation
        logger.info(f"[CascadeAgent] Running BFS cascade from root: {root_id}")
        propagation_steps = simulate_bfs_cascade(root_id, graph, machine_by_id)

        # 4. Compute impact
        total_impact = compute_total_impact(machine_data, propagation_steps)

        # 5. Build graph topology for frontend
        graph_data = build_graph_nodes_edges(root_id, all_machines, graph, propagation_steps)

        # 6. Gemini — containment + narrative
        containment, narrative = self._generate_containment(
            machine_data, propagation_steps, total_impact, session_id
        )

        return {
            "root_machine_id":   root_id,
            "root_failure":      root_name,
            "root_machine_type": machine_data.get("machine_type", "Unknown"),
            "root_health":       float(
                machine_data.get("sensor_data", {}).get("health_score") or
                machine_data.get("health_score") or 50
            ),
            "propagation_steps": propagation_steps,
            "total_impact":      total_impact,
            "containment":       containment,
            "narrative":         narrative,
            "graph":             graph_data,
            "metadata": {
                "total_machines_in_session": len(all_machines),
                "cascade_depth":             total_impact.get("cascade_depth", 0),
                "severity":                  total_impact.get("severity", "UNKNOWN"),
            },
        }

    # ── Private helpers ───────────────────────────────────────────────────────

    def _load_session_machines(self, session_id: str) -> List[Dict]:
        """Fetch all machines for this session from SQLite."""
        db = SessionLocal()
        try:
            rows = db.query(MachineLog).filter(
                MachineLog.session_id == session_id
            ).all()
            machines = []
            for row in rows:
                data = row.raw_data or {}
                # Ensure consistent keys
                data.setdefault("machine_id",   row.machine_id)
                data.setdefault("machine_name", row.machine_name)
                data.setdefault("machine_type", row.machine_type)
                machines.append(data)
            return machines
        except Exception as e:
            logger.error(f"[CascadeAgent] DB load error: {e}")
            return []
        finally:
            db.close()

    def _generate_containment(
        self,
        root_machine: Dict,
        propagation_steps: List[Dict],
        total_impact: Dict,
        session_id: str,
    ) -> tuple[List[str], str]:
        """
        Ask Gemini to produce:
        • Ordered containment actions list
        • Plain-English executive narrative

        Falls back to rule-based containment if Gemini fails.
        """
        root_name  = root_machine.get("machine_name", "Unknown")
        step_lines = "\n".join(
            f"  Step {s['step']}: {s['machine']} ({s['machine_type']}) — "
            f"impact score {s['impact_score']}/100, "
            f"downtime est. {s['estimated_downtime_hours']}h"
            for s in propagation_steps[:8]
        )

        # RAG context
        ctx = ""
        try:
            ctx = self.get_context(root_machine, session_id)
        except Exception:
            pass

        prompt = f"""You are a senior industrial process engineer and reliability expert.

ROOT FAILURE MACHINE: {root_name} ({root_machine.get("machine_type", "Unknown")})
ROOT HEALTH SCORE: {root_machine.get("sensor_data", {}).get("health_score", "N/A")}/100

CASCADE PROPAGATION:
{step_lines}

TOTAL IMPACT:
- Affected units: {total_impact.get("affected_units", 0)}
- Production downtime: {total_impact.get("downtime", "N/A")}
- Estimated cost: {total_impact.get("cost", "N/A")}
- Severity: {total_impact.get("severity", "UNKNOWN")}

HISTORICAL CONTEXT:
{ctx}

Return ONLY valid JSON matching this exact schema:
{{
  "containment": [
    "<action 1>",
    "<action 2>",
    "<action 3>",
    "<action 4>",
    "<action 5>"
  ],
  "narrative": "<3-4 sentence executive summary of the cascade scenario and response strategy>"
}}

Rules:
- containment: 4-6 specific, actionable steps ordered by urgency
- narrative: plain English, no bullet points, written for a plant manager
- Return ONLY the JSON object"""

        try:
            result = generate_json_response(prompt, temperature=0.25)
            if "error" not in result:
                containment = result.get("containment", [])
                narrative   = result.get("narrative", "")
                if isinstance(containment, list) and containment:
                    return containment, narrative
        except Exception as e:
            logger.error(f"[CascadeAgent] Gemini containment generation failed: {e}")

        # Rule-based fallback
        return self._rule_based_containment(root_machine, propagation_steps), (
            f"A failure originating at {root_name} has the potential to cascade across "
            f"{total_impact.get('affected_units', 0)} production units with an estimated "
            f"downtime of {total_impact.get('downtime', 'N/A')} and cost of "
            f"{total_impact.get('cost', 'N/A')}. Immediate isolation of the root machine "
            f"and downstream equipment is recommended to prevent full production stoppage."
        )

    def _rule_based_containment(
        self, root_machine: Dict, steps: List[Dict]
    ) -> List[str]:
        root_name = root_machine.get("machine_name", "Root Machine")
        top_affected = [s["machine"] for s in sorted(
            steps, key=lambda x: x.get("impact_score", 0), reverse=True
        )[:3]]

        actions = [
            f"Immediately isolate {root_name} from production line and trigger emergency stop protocol",
            f"Deploy maintenance crew to inspect and assess {root_name} within 30 minutes",
        ]
        if top_affected:
            actions.append(
                f"Place {', '.join(top_affected[:2])} in safe-hold mode to prevent secondary damage"
            )
        actions += [
            "Activate backup/redundant production route if available — reroute throughput to Line B",
            "Notify plant manager, maintenance supervisor, and safety officer immediately",
            "Initiate root-cause logging and document all sensor readings at time of failure",
        ]
        return actions
