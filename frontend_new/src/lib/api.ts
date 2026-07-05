import axios from "axios";

// ─── Axios instance ─────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: API_BASE, timeout: 120000 });

// ─── PDF Upload ────────────────────────────────────────────────────────────────
export const uploadPDF = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
};

// ─── Helper for agent POST requests ─────────────────────────────────────────────
const agentPost = (
  endpoint: string,
  session_id: string,
  machine_id: string,
  extra: Record<string, any> = {}
) => api.post(endpoint, { session_id, machine_id, ...extra });

// ─── Agent Endpoints ───────────────────────────────────────────────────────────
export const predictFailure  = (s: string, m: string) => agentPost("/api/predict-failure", s, m);
export const getRootCause    = (s: string, m: string) => agentPost("/api/root-cause", s, m);
export const getMaintenance  = (s: string, m: string) => agentPost("/api/maintenance-plan", s, m);
export const getCostAnalysis = (s: string, m: string) => agentPost("/api/cost-analysis", s, m);
export const getSpareParts   = (s: string, m: string) => agentPost("/api/spare-parts", s, m);
export const getTimeline     = (s: string, m: string) => agentPost("/api/timeline", s, m);
export const getAlerts       = (s: string, m: string) => agentPost("/api/alerts", s, m);
export const getWorkforce    = (s: string, m: string) => agentPost("/api/workforce", s, m);
export const getStrategy     = (s: string, m: string) => agentPost("/api/strategy", s, m);
export const getDigitalTwin  = (s: string, m: string, days = 30) =>
  agentPost("/api/digital-twin", s, m, { simulation_days: days });
export const getWhatIf       = (s: string, m: string, scenario: Record<string, any> = {}) =>
  agentPost("/api/what-if", s, m, { scenario });
export const getAnomaly      = (s: string, m: string) => agentPost("/api/anomaly-detection", s, m);
export const sendChat        = (s: string, m: string, message: string, history: any[]) =>
  agentPost("/api/chat", s, m, { message, history });

// ─── Cascade Simulation ────────────────────────────────────────────────────────
export const simulateCascade = (s: string, m: string) => agentPost("/api/simulate-cascade", s, m);

// ─── Human-in-the-Loop (HITL) Refinement ───────────────────────────────────────
export const refineWithHITL = (
  session_id: string,
  machine_id: string,
  agent_type: string,
  previous_response: Record<string, any>,
  correction: string
) =>
  api.post("/api/hitl-refine", {
    session_id,
    machine_id,
    agent_type,
    previous_response,
    correction,
  });

// ─── Default export ────────────────────────────────────────────────────────────
export default api;