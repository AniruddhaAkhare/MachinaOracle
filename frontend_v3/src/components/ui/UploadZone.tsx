"use client";
import { useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Props { onUpload: (f: File) => void; uploading: boolean; error: string; }

export default function UploadZone({ onUpload, uploading, error }: Props) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") onUpload(f);
  }, [onUpload]);

  return (
    <div style={{ minHeight:"calc(100vh - 58px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 24px" }}>

      {/* Hero */}
      <motion.div initial={{ opacity:0, y:-18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.65, ease:[0.16,1,0.3,1] }}
        style={{ textAlign:"center", marginBottom:52, maxWidth:600 }}>
        {/* Icon */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <motion.div animate={{ y:[0,-5,0] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
            style={{ width:72, height:72, background:"var(--blue-muted)", border:"1px solid rgba(59,130,246,0.28)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M7 4h16l7 7v21H7V4z" stroke="#60A5FA" strokeWidth="1.5" fill="none"/>
              <path d="M23 4v7h7" stroke="#60A5FA" strokeWidth="1.5" fill="none"/>
              <line x1="11" y1="17" x2="25" y2="17" stroke="#60A5FA" strokeWidth="1.2" strokeOpacity="0.6"/>
              <line x1="11" y1="21" x2="25" y2="21" stroke="#60A5FA" strokeWidth="1.2" strokeOpacity="0.6"/>
              <line x1="11" y1="25" x2="19" y2="25" stroke="#60A5FA" strokeWidth="1.2" strokeOpacity="0.6"/>
            </svg>
          </motion.div>
        </div>
        <h1 style={{ fontFamily:"var(--f-cond)", fontSize:56, fontWeight:800, color:"var(--t1)", letterSpacing:"-0.02em", lineHeight:1, marginBottom:16 }}>
          Machine Log Analysis
        </h1>
        <p style={{ fontSize:17, color:"var(--t3)", lineHeight:1.7, marginBottom:24 }}>
          Upload a machine log PDF to activate 14 specialized AI agents for predictive maintenance, failure analysis, and operational intelligence.
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {["Gemini 2.5 Flash","14 AI Agents","ChromaDB RAG","Multi-Machine Support"].map(t => (
            <span key={t} className="badge b-blue">{t}</span>
          ))}
        </div>
      </motion.div>

      {/* Drop zone */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12, duration:0.5, ease:[0.16,1,0.3,1] }}
        style={{ width:"100%", maxWidth:520 }}>
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onClick={() => !uploading && ref.current?.click()}
          style={{
            background: drag ? "rgba(59,130,246,0.07)" : "var(--bg-2)",
            border: `2px dashed ${drag ? "rgba(59,130,246,0.55)" : "var(--bd-2)"}`,
            borderRadius: 10, padding:"52px 40px", textAlign:"center",
            cursor: uploading ? "default" : "pointer", transition:"all 0.2s",
          }}>
          <input ref={ref} type="file" accept=".pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />

          {uploading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
              <div className="spinner" />
              <div>
                <p style={{ fontFamily:"var(--f-sans)", fontSize:16, fontWeight:600, color:"var(--t1)", marginBottom:6 }}>Processing Document</p>
                <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t4)" }}>Extracting machines · Building vector index...</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ width:48, height:48, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.22)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p style={{ fontFamily:"var(--f-sans)", fontSize:17, fontWeight:600, color:"var(--t1)", marginBottom:8 }}>
                Drop PDF here or click to select
              </p>
              <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t4)" }}>Supports multi-machine log documents</p>
            </>
          )}
        </div>
        {error && (
          <div style={{ marginTop:12, padding:"12px 16px", background:"var(--r-mute)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, display:"flex", gap:10, alignItems:"center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="var(--red)"/></svg>
            <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--red)" }}>{error}</p>
          </div>
        )}
      </motion.div>

      {/* Bottom stats */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.38 }}
        style={{ marginTop:56, display:"flex", gap:48, flexWrap:"wrap", justifyContent:"center" }}>
        {[["14","AI Agents"],["15","Analysis Tabs"],["5,000","Log Records"],["3D","Blueprint View"]].map(([n,l]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"var(--f-cond)", fontSize:32, fontWeight:800, color:"var(--blue-light)" }}>{n}</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"var(--t4)", marginTop:4, letterSpacing:"0.13em" }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
