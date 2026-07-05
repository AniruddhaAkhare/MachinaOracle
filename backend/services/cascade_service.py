"""
Cascade Service — MachinaOracle
================================
Builds a dependency graph from machines in the current session,
then runs BFS-based cascade failure simulation.

Nothing here touches any existing service.
"""
from __future__ import annotations

import logging
from collections import defaultdict, deque
from typing import Dict, List, Any, Tuple

from db.database import SessionLocal, MachineLog
from services.vector_service import query_similar_logs, query_dataset

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Dependency topology rules
# Each machine TYPE has downstream types it feeds into.
# These model a generic manufacturing flow:
#   Raw Input → Processing → Assembly → Quality → Packaging → Output
# ─────────────────────────────────────────────────────────────────────────────
DOWNSTREAM_TYPE_MAP: Dict[str, List[str]] = {
    "pump":          ["conveyor", "compressor", "boiler", "mixer"],
    "compressor":    ["conveyor", "assembly", "packaging", "pneumatic"],
    "boiler":        ["conveyor", "dryer", "mixer", "steriliser"],
    "conveyor":      ["assembly", "packaging", "sorter", "inspection"],
    "motor":         ["conveyor", "pump", "fan", "compressor", "mixer"],
    "turbine":       ["generator", "compressor", "pump"],
    "generator":     ["motor", "conveyor", "packaging", "assembly"],
    "mixer":         ["conveyor", "packaging", "filling"],
    "assembly":      ["packaging", "inspection", "quality", "conveyor"],
    "inspection":    ["packaging", "sorter", "quality"],
    "quality":       ["packaging", "output", "warehouse"],
    "packaging":     ["output", "warehouse", "labeller"],
    "sorter":        ["packaging", "warehouse", "output"],
    "robot":         ["conveyor", "assembly", "inspection"],
    "crane":         ["assembly", "warehouse", "conveyor"],
    "dryer":         ["packaging", "conveyor", "output"],
    "fan":           ["conveyor", "packaging", "assembly"],
    "default":       ["conveyor", "assembly", "packaging"],
}

# Cascade probability at each hop (simulates weakening signal)
PROPAGATION_PROBABILITIES = [1.0, 0.85, 0.70, 0.55, 0.40, 0.28, 0.18]

# Cost multipliers per machine type (USD per hour of downtime)
DOWNTIME_COST_PER_HOUR: Dict[str, float] = {
    "pump": 3200, "compressor": 4800, "boiler": 6000, "conveyor": 2800,
    "motor": 2500, "turbine": 8500, "generator": 9000, "mixer": 2200,
    "assembly": 5500, "inspection": 3000, "quality": 3000, "packaging": 3500,
    "sorter": 2800, "robot": 6500, "crane": 4200, "dryer": 2600,
    "fan": 1800, "default": 3000,
}


# ─────────────────────────────────────────────────────────────────────────────
# Graph builder
# ─────────────────────────────────────────────────────────────────────────────
def build_dependency_graph(
    session_id: str, all_machines: List[Dict]
) -> Dict[str, List[str]]:
    """
    Build an adjacency list: machine_id -> [downstream machine_ids]

    Strategy:
    1. Use DOWNSTREAM_TYPE_MAP to connect machines by type.
    2. Augment with RAG: query ChromaDB for mentions of machine names
       co-occurring (e.g. "Conveyor feeds Assembly").
    3. Deduplicate edges.
    """
    graph: Dict[str, List[str]] = defaultdict(list)
    machine_by_id  = {m["machine_id"]: m for m in all_machines}
    machine_by_type: Dict[str, List[str]] = defaultdict(list)

    for m in all_machines:
        mtype = (m.get("machine_type") or "default").lower().strip()
        # Normalise type key (take first word)
        key = mtype.split()[0]
        machine_by_type[key].append(m["machine_id"])

    # Rule-based edges
    for m in all_machines:
        src_id = m["machine_id"]
        mtype  = (m.get("machine_type") or "default").lower().split()[0]
        downstream_types = DOWNSTREAM_TYPE_MAP.get(mtype, DOWNSTREAM_TYPE_MAP["default"])

        for dt in downstream_types:
            for tgt_id in machine_by_type.get(dt, []):
                if tgt_id != src_id and tgt_id not in graph[src_id]:
                    graph[src_id].append(tgt_id)

    # RAG-augmented edges: query ChromaDB for dependency mentions
    try:
        for m in all_machines:
            query = f"{m['machine_name']} feeds depends downstream connected"
            results = query_similar_logs(query, session_id, n_results=3)
            for res in results:
                text = res["text"].lower()
                for other in all_machines:
                    if (
                        other["machine_id"] != m["machine_id"]
                        and other["machine_name"].lower() in text
                        and other["machine_id"] not in graph[m["machine_id"]]
                    ):
                        graph[m["machine_id"]].append(other["machine_id"])
    except Exception as e:
        logger.warning(f"[CascadeService] RAG augmentation failed (non-fatal): {e}")

    # Ensure every machine has an entry (even if no outgoing edges)
    for m in all_machines:
        if m["machine_id"] not in graph:
            graph[m["machine_id"]] = []

    # If still no edges (single-machine scenario), create minimal chain
    if all(len(v) == 0 for v in graph.values()) and len(all_machines) > 1:
        for i in range(len(all_machines) - 1):
            graph[all_machines[i]["machine_id"]].append(
                all_machines[i + 1]["machine_id"]
            )

    return dict(graph)


# ─────────────────────────────────────────────────────────────────────────────
# BFS cascade simulator
# ─────────────────────────────────────────────────────────────────────────────
def simulate_bfs_cascade(
    root_id: str,
    graph: Dict[str, List[str]],
    machine_by_id: Dict[str, Dict],
    max_depth: int = 6,
) -> List[Dict]:
    """
    BFS from root_id through the dependency graph.
    Returns ordered propagation steps with impact metadata.
    """
    visited   = {root_id}
    queue     = deque([(root_id, 1)])  # (machine_id, depth)
    steps: List[Dict] = []

    while queue and len(steps) < 20:
        current_id, depth = queue.popleft()
        if depth > max_depth:
            continue

        prob = PROPAGATION_PROBABILITIES[min(depth - 1, len(PROPAGATION_PROBABILITIES) - 1)]
        neighbors = graph.get(current_id, [])

        for neighbor_id in neighbors:
            if neighbor_id in visited:
                continue
            visited.add(neighbor_id)
            queue.append((neighbor_id, depth + 1))

            machine = machine_by_id.get(neighbor_id, {})
            mtype   = (machine.get("machine_type") or "unknown").lower().split()[0]
            hs      = float(machine.get("sensor_data", {}).get("health_score") or
                            machine.get("health_score") or 70)
            # Machines with lower health are more vulnerable
            impact_score = min(100, round((1 - hs / 100) * 60 + prob * 40))

            steps.append({
                "step":              len(steps) + 1,
                "machine_id":        neighbor_id,
                "machine":           machine.get("machine_name", neighbor_id),
                "machine_type":      machine.get("machine_type", "Unknown"),
                "depth":             depth,
                "propagation_prob":  round(prob * 100),
                "impact_score":      impact_score,
                "impact":            _describe_impact(machine, depth, prob, impact_score),
                "estimated_downtime_hours": _estimate_downtime(mtype, impact_score),
            })

    return steps


def _describe_impact(machine: Dict, depth: int, prob: float, impact_score: int) -> str:
    name  = machine.get("machine_name", "Unknown")
    mtype = (machine.get("machine_type") or "unit").title()
    hs    = float(machine.get("sensor_data", {}).get("health_score") or
                  machine.get("health_score") or 70)
    severity = "critical" if impact_score > 70 else "significant" if impact_score > 45 else "moderate"
    chain_word = ["directly", "immediately", "subsequently", "eventually", "progressively"][min(depth - 1, 4)]
    return (
        f"{name} ({mtype}) {chain_word} affected at hop {depth}. "
        f"Cascade probability {prob*100:.0f}%. "
        f"Current health {hs:.0f}/100. "
        f"Expected {severity} operational disruption — "
        f"{'emergency shutdown likely' if impact_score > 75 else 'performance degradation imminent' if impact_score > 50 else 'monitoring required'}."
    )


def _estimate_downtime(mtype: str, impact_score: int) -> float:
    base = {
        "pump": 6, "compressor": 8, "boiler": 12, "conveyor": 4,
        "motor": 5, "turbine": 16, "generator": 18, "assembly": 10,
        "packaging": 6, "sorter": 5, "robot": 12, "crane": 8,
    }.get(mtype, 7)
    multiplier = 0.4 + (impact_score / 100) * 1.6
    return round(base * multiplier, 1)


# ─────────────────────────────────────────────────────────────────────────────
# Total impact aggregator
# ─────────────────────────────────────────────────────────────────────────────
def compute_total_impact(
    root_machine: Dict,
    propagation_steps: List[Dict],
    root_downtime_hours: float = 8.0,
) -> Dict:
    """Aggregate cost, downtime, and affected unit count."""
    affected_ids   = {s["machine_id"] for s in propagation_steps}
    affected_count = len(affected_ids) + 1  # +1 for root

    total_downtime = root_downtime_hours + sum(
        s.get("estimated_downtime_hours", 6) for s in propagation_steps
    )
    # Production loss is correlated but not additive (parallel lines)
    production_downtime = round(total_downtime * 0.65, 1)

    root_type  = (root_machine.get("machine_type") or "default").lower().split()[0]
    root_rate  = DOWNTIME_COST_PER_HOUR.get(root_type, 3000)
    cascade_cost = sum(
        DOWNTIME_COST_PER_HOUR.get(
            s.get("machine_type", "default").lower().split()[0], 3000
        ) * s.get("estimated_downtime_hours", 6)
        for s in propagation_steps
    )
    total_cost = root_rate * root_downtime_hours + cascade_cost

    critical_units = [
        s["machine"] for s in propagation_steps if s.get("impact_score", 0) > 70
    ]

    return {
        "affected_units":          affected_count,
        "downtime":                f"{production_downtime:.1f} hours",
        "total_downtime_hours":    round(total_downtime, 1),
        "cost":                    f"${total_cost:,.0f}",
        "cost_raw":                round(total_cost, 2),
        "critical_units":          critical_units,
        "cascade_depth":           max((s["depth"] for s in propagation_steps), default=0),
        "severity":                (
            "CATASTROPHIC" if affected_count >= 5 else
            "CRITICAL"     if affected_count >= 3 else
            "HIGH"         if affected_count >= 2 else "MODERATE"
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Graph metadata for frontend visualisation
# ─────────────────────────────────────────────────────────────────────────────
def build_graph_nodes_edges(
    root_id: str,
    all_machines: List[Dict],
    graph: Dict[str, List[str]],
    propagation_steps: List[Dict],
) -> Dict:
    """
    Return nodes and edges in a format the SVG renderer can consume directly.
    """
    affected_ids = {s["machine_id"] for s in propagation_steps}
    step_by_id   = {s["machine_id"]: s for s in propagation_steps}

    nodes = []
    for m in all_machines:
        mid    = m["machine_id"]
        is_root   = mid == root_id
        is_affected = mid in affected_ids
        step_info  = step_by_id.get(mid, {})

        nodes.append({
            "id":          mid,
            "label":       m["machine_name"],
            "type":        m.get("machine_type", "Unknown"),
            "health":      float(m.get("sensor_data", {}).get("health_score") or
                                 m.get("health_score") or 70),
            "is_root":     is_root,
            "is_affected": is_affected,
            "depth":       0 if is_root else step_info.get("depth", 99),
            "impact_score":step_info.get("impact_score", 0),
        })

    edges = []
    for src, targets in graph.items():
        for tgt in targets:
            is_active = (
                (src == root_id or src in affected_ids) and tgt in affected_ids
            )
            edges.append({
                "source":    src,
                "target":    tgt,
                "is_active": is_active,
            })

    return {"nodes": nodes, "edges": edges}
