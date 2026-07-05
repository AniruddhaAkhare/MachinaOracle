"""
MachinaOracle - Autonomous AI Factory Brain
FastAPI Backend Entry Point (Combined & Production Ready)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from dotenv import load_dotenv

# ── Load Environment Variables ─────────────────
load_dotenv()

# ── Logging Setup ──────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MachinaOracle")

# ── Import Routers ─────────────────────────────
from routers.upload_router import router as upload_router
from routers.failure_router import router as failure_router
from routers.rootcause_router import router as rootcause_router
from routers.maintenance_router import router as maintenance_router
from routers.cost_router import router as cost_router
from routers.spareparts_router import router as spareparts_router
from routers.timeline_router import router as timeline_router
from routers.alerts_router import router as alerts_router
from routers.workforce_router import router as workforce_router
from routers.strategy_router import router as strategy_router
from routers.digitaltwin_router import router as digitaltwin_router
from routers.whatif_router import router as whatif_router
from routers.anomaly_router import router as anomaly_router
from routers.chat_router import router as chat_router
from routers.cascade_router import router as cascade_router
from routers.websocket_router import router as websocket_router
from routers.hitl_router import router as hitl_router

# ── Initialize App ─────────────────────────────
app = FastAPI(
    title="MachinaOracle API",
    description="Autonomous AI Factory Brain for Predictive Maintenance",
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔒 tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ───────────────────────────
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(failure_router, prefix="/api", tags=["Failure Prediction"])
app.include_router(rootcause_router, prefix="/api", tags=["Root Cause"])
app.include_router(maintenance_router, prefix="/api", tags=["Maintenance"])
app.include_router(cost_router, prefix="/api", tags=["Cost Analysis"])
app.include_router(spareparts_router, prefix="/api", tags=["Spare Parts"])
app.include_router(timeline_router, prefix="/api", tags=["Timeline"])
app.include_router(alerts_router, prefix="/api", tags=["Alerts"])
app.include_router(workforce_router, prefix="/api", tags=["Workforce"])
app.include_router(strategy_router, prefix="/api", tags=["Strategy"])
app.include_router(digitaltwin_router, prefix="/api", tags=["Digital Twin"])
app.include_router(whatif_router, prefix="/api", tags=["What-If"])
app.include_router(anomaly_router, prefix="/api", tags=["Anomaly"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(cascade_router, prefix="/api", tags=["Cascade Intelligence"])
app.include_router(hitl_router, prefix="/api", tags=["Human-in-the-Loop"])

# ✅ WebSocket Router (no /api prefix)
app.include_router(websocket_router)

# ── Health Endpoints ───────────────────────────
@app.get("/")
async def root():
    return {
        "message": "MachinaOracle API",
        "status": "operational",
        "version": "2.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "MachinaOracle",
        "version": "2.0.0"
    }

# ── Run Server ─────────────────────────────────
if __name__ == "__main__":
    logger.info("🔥 Starting MachinaOracle Backend...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )