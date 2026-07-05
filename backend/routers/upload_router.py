"""Upload router - handles PDF upload and machine detection"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uuid
import logging
import os
from datetime import datetime

from services.pdf_service import extract_text_from_pdf, detect_machines
from services.vector_service import store_machine_embeddings, store_dataset_embeddings
from db.database import init_db, SessionLocal, MachineLog, Session as DBSession

logger = logging.getLogger(__name__)
router = APIRouter()

SAMPLE_PDF_PATH = os.getenv("SAMPLE_PDF_PATH", "./data/sample_machine_logs.pdf")


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(None)):
    """
    Upload a PDF file and process it.
    If no file is provided, uses a predefined sample PDF.
    """
    try:
        init_db()

        # Read file or load sample PDF
        if file:
            if not file.filename.endswith(".pdf"):
                raise HTTPException(400, "Only PDF files accepted")
            file_bytes = await file.read()
            filename = file.filename
        else:
            if not os.path.exists(SAMPLE_PDF_PATH):
                raise HTTPException(500, "Sample PDF not found on server")
            with open(SAMPLE_PDF_PATH, "rb") as f:
                file_bytes = f.read()
            filename = os.path.basename(SAMPLE_PDF_PATH)

        # Extract text and detect machines
        text = extract_text_from_pdf(file_bytes)
        machines = detect_machines(text)
        session_id = uuid.uuid4().hex

        # Store embeddings
        store_machine_embeddings(session_id, machines)
        dataset_path = os.getenv("DATASET_PATH", "./data/machine_logs.json")
        if os.path.exists(dataset_path):
            store_dataset_embeddings(dataset_path)

        # Save to DB
        db = SessionLocal()
        try:
            db_session = DBSession(
                session_id=session_id,
                filename=filename,
                machines_detected=[m["machine_name"] for m in machines],
            )
            db.add(db_session)

            for machine in machines:
                sensors = machine.get("sensor_data", {})
                log = MachineLog(
                    session_id=session_id,
                    machine_id=machine["machine_id"],
                    machine_name=machine["machine_name"],
                    machine_type=machine.get("machine_type", "Unknown"),
                    timestamp=datetime.utcnow().isoformat(),  # ✅ proper timestamp
                    temperature=sensors.get("temperature"),
                    vibration=sensors.get("vibration"),
                    pressure=sensors.get("pressure"),
                    rpm=sensors.get("rpm"),
                    voltage=sensors.get("voltage"),
                    current=sensors.get("current"),
                    health_score=sensors.get("health_score"),
                    log_text=machine.get("log_text", ""),
                    raw_data=machine,
                )
                db.add(log)
            db.commit()
        finally:
            db.close()

        return {
            "session_id": session_id,
            "filename": filename,
            "machines_detected": machines,
            "total_machines": len(machines),
            "status": "processed",
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(500, f"Processing failed: {str(e)}")