"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
interface Props { agentName: string; fetchFn: () => Promise<any>; children: (data: any) => React.ReactNode; cacheKey?: string; }
const CACHE: Record<string, any> = {};
export default function AgentPanel({ agentName, fetchFn, children, cacheKey }: Props) {
  const [data, setData]     = useState<any>(cacheKey ? CACHE[cacheKey] : null);
  const [loading, setLoading] = useState(!data);
  const [error, setError]   = useState("");
  const load = useCallback(async () => {
    if (cacheKey && CACHE[cacheKey]) { setData(CACHE[cacheKey]); setLoading(false); return; }
    setLoading(true); setError("");
    try { const r = await fetchFn(); if (cacheKey) CACHE[cacheKey] = r.data; setData(r.data); }
    catch (e: any) { setError(e?.response?.data?.detail || "Agent error — check backend."); }
    finally { setLoading(false); }
  }, [fetchFn, cacheKey]);
  useEffect(() => { if (!data) load(); }, []);
  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"90px 32px", gap:20 }}>
      <div className="spinner" />
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"var(--f-sans)", fontSize:16, fontWeight:600, color:"var(--t2)", marginBottom:6 }}>{agentName}</p>
        <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t4)" }}>Querying Gemini 2.5 Flash with ChromaDB context...</p>
      </div>
    </div>
  );
  if (error) return (
    <div style={{ padding:32 }}>
      <div style={{ background:"var(--r-mute)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"20px 24px" }}>
        <p style={{ fontFamily:"var(--f-sans)", fontSize:15, fontWeight:600, color:"var(--red)", marginBottom:8 }}>Agent Error</p>
        <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t3)", marginBottom:14 }}>{error}</p>
        <button onClick={load} className="btn btn-secondary" style={{ fontSize:13 }}>Retry</button>
      </div>
    </div>
  );
  if (!data) return null;
  return <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }} className="fade-up">{children(data)}</motion.div>;
}
