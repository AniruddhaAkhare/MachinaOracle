<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status Active" />
  <img src="https://img.shields.io/badge/Python-3.10+-blue.svg" alt="Python 3.10+" />
  <img src="https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" />

  <h1>🏭 MachinaOracle</h1>
  <p><strong>Autonomous AI Factory Brain for Predictive Maintenance & Intelligent Decision Making</strong></p>
  <p>Hackathon-Grade Industrial AI Platform built to revolutionize predictive maintenance and facility management through the power of Google's Gemini 2.5 Flash.</p>
</div>

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [🚀 Tech Stack](#-tech-stack)
- [⚙️ Architecture & Agents](#️-architecture--agents)
- [📁 Project Structure](#-project-structure)
- [⚡ Setup & Installation](#-setup--installation)
- [🎯 Demo Walkthrough](#-demo-walkthrough)
- [🔌 API Endpoints](#-api-endpoints)
- [☁️ Deployment](#️-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

- **Automated PDF Parsing**: Upload unstructured machine logs, automatically parse and detect machines with advanced NLP.
- **Predictive Maintenance**: 14 Specialized AI Agents providing real-time probability and timeline mapping for machine failure.
- **Root Cause Analysis (RCA)**: Deep causal chains and fault trees pinpointing the exact origin of anomalies.
- **Cost & ROI Projections**: Actionable financial forecasts of repair costs, downtime impact, and investment recovery.
- **Interactive 3D Digital Twin**: Visualize equipment health intuitively with React Three Fiber, featuring live status heatmaps.
- **What-If Simulations**: Simulate the impact of hypothetical maintenance scenarios in milliseconds.
- **RAG-Powered Conversational AI**: Natural language interactions with historical logs, real-time sensor data, and strategy recommendations.

---

## 🚀 Tech Stack

MachinaOracle embraces a modern, high-performance architecture suited for production-grade environments:

| Layer | Technology | Description |
|-------|-----------|-------------|
| **AI Model** | **Gemini 2.5 Flash** | Ultra-fast reasoning and context comprehension |
| **Backend** | **FastAPI + Python** | High-performance async API processing |
| **Vector DB** | **ChromaDB** | Semantic search for RAG implementations |
| **Relational DB**| **SQLite** | Lightweight structural data management |
| **Frontend** | **Next.js 14 + TS** | React framework with Server Components |
| **Styling** | **Tailwind CSS** | Utility-first, highly customizable styling |
| **Animation** | **Framer Motion** | Fluid user interface transitions |
| **Visualization**| **Three.js / R3F** | 3D Digital Twin rendering |
| **Charts** | **Recharts** | Interactive data and metric graphs |
| **Parsing** | **PyMuPDF** | Rapid document and log extraction |

---

## ⚙️ Architecture & Agents

MachinaOracle is driven by **14 specialized AI agents** acting collaboratively. Each agent focuses on a distinct industrial domain, accessible via individual API endpoints and dashboard tabs:

1. **Failure Agent**: Assesses immediate component risks and probability %.
2. **Root Cause Agent (RCA)**: Investigates fault trees and primary triggers.
3. **Maintenance Agent**: Generates actionable checklists and safety protocols.
4. **Cost Agent**: Computes repair margins and 12-month projections.
5. **Spare Parts Agent**: Tracks critical parts, pricing, and lead times.
6. **Timeline Agent**: Plots degradation curves and life cycles.
7. **Alert Agent**: Drafts escalating SMS/Email alerts for operators.
8. **Anomaly Agent**: Runs ML-based outlier detection on sensor values.
9. **Workforce Agent**: Plans shift requirements and specialized labor needs.
10. **Strategy Agent**: Prescribes long-term KPIs and operational strategy.
11. **Digital Twin Agent**: Projects simulated wear and tear up to 90 days ahead.
12. **What-If Agent**: Compares user-defined scenarios and interventions.
13. **Chat Agent**: Answers ad-hoc queries via conversational interface.
14. *(Base Agent)*: Handles foundational context aggregation for the rest.

---

## 📁 Project Structure

```text
MachinaOracle/
├── backend/                     # Python / FastAPI Backend
│   ├── main.py                  # API entry point
│   ├── agents/                  # 14 distinct AI agent modules
│   ├── data/                    # Sample JSON datasets and PDF logs
│   ├── db/                      # SQLAlchemy models & SQLite setup
│   ├── routers/                 # Endpoint definitions
│   ├── services/                # RAG, Vector DB, and PDF integrations
│   └── requirements.txt         # Python dependencies
└── frontend/                    # Next.js 14 Frontend
    ├── src/
    │   ├── app/                 # Pages, layout, globals
    │   ├── components/          # Reusable UI (Dashboards, Stats)
    │   │   ├── 3d/              # React Three Fiber components
    │   │   └── tabs/            # 15 distinct feature views
    │   └── lib/                 # Utilities and API wrappers
    └── package.json             # Node dependencies
```

---

## ⚡ Setup & Installation

### 1. Prerequisites
- **Python** `3.10+`
- **Node.js** `18+`
- **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

### 2. Backend Environment
```bash
cd MachinaOracle/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY
```

**Start the backend server:**
```bash
python main.py
# Running at http://localhost:8000
```

### 3. Frontend Environment
```bash
cd MachinaOracle/frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local to update NEXT_PUBLIC_API_URL if needed
```

**Start the frontend development server:**
```bash
npm run dev
# Running at http://localhost:3000
```

---

## 🎯 Demo Walkthrough

### Step 1: Ingestion
- Upload the provided `backend/data/sample_machine_logs.pdf` or any industrial machine log.
- The system automatically extracts embedded machine entities, health metrics, and historical incidents.

### Step 2: Selection
- Navigate the detected machines displayed as summary cards.
- Instantly review high-level health scores and live sensor constraints.
- Click a machine to enter its deep-dive dashboard.

### Step 3: Insight Generation
- **Cycle through 15 powerful tabs** (Overview, Failure Prediction, RCA, Digital Twin, etc.).
- Each tab dynamically summons the relevant AI Agent, aggregating live metrics, historical data, and Gemini's contextual intelligence to deliver precise insights and charts.

---

## 🔌 API Endpoints

The API is fully stateless, async, and rigorously typed:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Ingests PDF logs and identifies machinery |
| `GET`  | `/api/session/{id}` | Retrieves session telemetry |
| `GET`  | `/api/machine/{s_id}/{m_id}` | Fetches real-time machine profiles |
| `POST` | `/api/{agent-name}` | Triggers specialized agent endpoints (e.g. `predict-failure`, `root-cause`, `digital-twin`) |

---

## ☁️ Deployment

### Backend via Railway / Render
- **Railway:** Use Railway CLI `railway up` or connect your GitHub repository. Ensure `GEMINI_API_KEY` is set in the dashboard.
- **Render:** Connect repo, set build to `pip install -r requirements.txt`, and start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### Frontend via Vercel
- Use Vercel CLI `vercel --prod` or link the GitHub repo.
- Configure `NEXT_PUBLIC_API_URL` to point to your live backend domain.

---

## 🎨 UI Design Language

- **Theme**: Dark industrial forge aesthetic
- **Palette**: Cyan neon (`#00f5ff`), Warning Orange (`#ff6b00`), Critical Red (`#ff2d55`), Safe Green (`#00ff88`)
- **Typography**: *Orbitron* (Display), *Exo 2* (Body), *Share Tech Mono* (Data)
- **Effects**: Glassmorphism, subtle neon luminescence, responsive framer-motion transitions.

---

## ⚡ Performance Optimization

- **Client-Side Caching**: Agent responses are memoized per session to ensure zero-latency tab switching.
- **Vector Persistence**: ChromaDB automatically snapshots to disk between sessions.
- **Async Processing**: Fast streaming responses from Gemini ensure the UI never blocks during heavy predictive modeling.

---

<div align="center">
  <p><i>Built with ❤️ for the future of industrial automation — MachinaOracle v1.0</i></p>
</div>
