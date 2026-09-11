"""PDF extraction and machine detection service"""
try:
    import pymupdf as fitz
except ImportError:
    import fitz
import re
import json
import uuid
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

MACHINE_PATTERNS = [
    r"(?i)machine[:\s]+([A-Za-z0-9_\-\s]+?)(?:\n|,|;|\.)",
    r"(?i)equipment[:\s]+([A-Za-z0-9_\-\s]+?)(?:\n|,|;|\.)",
    r"(?i)unit[:\s]+([A-Za-z0-9_\-\s]+?)(?:\n|,|;|\.)",
    r"(?i)device\s*id[:\s]+([A-Za-z0-9_\-]+)",
    r"(?i)machine\s*id[:\s]+([A-Za-z0-9_\-]+)",
    r"(?i)asset[:\s]+([A-Za-z0-9_\-\s]+?)(?:\n|,|;|\.)",
    r"(?i)\[([A-Z]{2,}[_\-]?\d+[A-Za-z0-9_\-]*)\]",
    r"(?i)(pump\s*[A-Z0-9]+|motor\s*[A-Z0-9]+|turbine\s*[A-Z0-9]+|conveyor\s*[A-Z0-9]+|compressor\s*[A-Z0-9]+|generator\s*[A-Z0-9]+|boiler\s*[A-Z0-9]+|valve\s*[A-Z0-9]+)",
]

SENSOR_PATTERNS = {
    "temperature": r"(?i)temp(?:erature)?[:\s]*([0-9]+\.?[0-9]*)\s*(?:°?[CF]|deg)?",
    "vibration": r"(?i)vibr(?:ation)?[:\s]*([0-9]+\.?[0-9]*)\s*(?:mm\/s|g)?",
    "pressure": r"(?i)press(?:ure)?[:\s]*([0-9]+\.?[0-9]*)\s*(?:psi|bar|kPa)?",
    "rpm": r"(?i)rpm[:\s]*([0-9]+\.?[0-9]*)",
    "voltage": r"(?i)volt(?:age)?[:\s]*([0-9]+\.?[0-9]*)\s*[Vv]?",
    "current": r"(?i)curr(?:ent)?[:\s]*([0-9]+\.?[0-9]*)\s*[Aa]?",
    "health_score": r"(?i)health[_\s]?score[:\s]*([0-9]+\.?[0-9]*)",
}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()
    return full_text

def detect_machines(text: str) -> List[Dict[str, Any]]:
    machines = {}
    lines = text.split("\n")
    current_machine = None
    current_block = []

    for i, line in enumerate(lines):
        machine_found = None
        for pattern in MACHINE_PATTERNS:
            match = re.search(pattern, line)
            if match:
                name = match.group(1).strip().title()
                if len(name) > 2 and len(name) < 60:
                    machine_found = name
                    break

        if machine_found:
            if current_machine and current_block:
                block_text = "\n".join(current_block)
                if current_machine not in machines:
                    machines[current_machine] = {
                        "machine_id": f"MCH_{uuid.uuid4().hex[:8].upper()}",
                        "machine_name": current_machine,
                        "sections": [],
                        "log_text": "",
                        "sensor_data": {},
                    }
                machines[current_machine]["sections"].append(block_text)

            current_machine = machine_found
            current_block = [line]
        elif current_machine:
            current_block.append(line)

    if current_machine and current_block:
        block_text = "\n".join(current_block)
        if current_machine not in machines:
            machines[current_machine] = {
                "machine_id": f"MCH_{uuid.uuid4().hex[:8].upper()}",
                "machine_name": current_machine,
                "sections": [],
                "log_text": "",
                "sensor_data": {},
            }
        machines[current_machine]["sections"].append(block_text)

    if not machines:
        machines["Primary Machine"] = {
            "machine_id": f"MCH_{uuid.uuid4().hex[:8].upper()}",
            "machine_name": "Primary Machine",
            "sections": [text],
            "log_text": text[:2000],
            "sensor_data": {},
        }

    result = []
    for name, data in machines.items():
        full_log = "\n\n".join(data["sections"])
        data["log_text"] = full_log[:3000]
        data["sensor_data"] = extract_sensor_data(full_log)
        data["machine_type"] = infer_machine_type(name + " " + full_log[:500])
        result.append(data)

    return result

def extract_sensor_data(text: str) -> Dict[str, float]:
    sensors = {}
    for key, pattern in SENSOR_PATTERNS.items():
        match = re.search(pattern, text)
        if match:
            try:
                sensors[key] = float(match.group(1))
            except:
                pass
    return sensors

def infer_machine_type(text: str) -> str:
    text_lower = text.lower()
    types = {
        "pump": "Centrifugal Pump",
        "motor": "Electric Motor",
        "turbine": "Steam Turbine",
        "conveyor": "Conveyor Belt",
        "compressor": "Air Compressor",
        "generator": "Power Generator",
        "boiler": "Industrial Boiler",
        "valve": "Control Valve",
        "robot": "Industrial Robot",
        "cnc": "CNC Machine",
        "press": "Hydraulic Press",
        "fan": "Industrial Fan",
        "blower": "Centrifugal Blower",
    }
    for key, machine_type in types.items():
        if key in text_lower:
            return machine_type
    return "Industrial Equipment"
