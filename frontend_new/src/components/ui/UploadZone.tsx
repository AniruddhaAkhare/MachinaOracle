"use client";
import { useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Props { onUpload: (f: File) => void; uploading: boolean; error: string; }

export default function UploadZone({ onUpload, uploading, error }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") onUpload(f);
  }, [onUpload]);

  return (
    <div style={{ minHeight: "calc(100vh - 48px)" }} className="flex flex-col items-center justify-center px-6">
      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
        className="text-center mb-16"
      >
        {/* Blueprint crosshair decoration */}
        <div className="flex justify-center mb-8">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="opacity-60">
            <circle cx="32" cy="32" r="30" stroke="var(--amber)" strokeWidth="0.75" strokeDasharray="4 4" />
            <circle cx="32" cy="32" r="18" stroke="var(--amber)" strokeWidth="0.5" strokeOpacity="0.5" />
            <circle cx="32" cy="32" r="4"  fill="none" stroke="var(--amber)" strokeWidth="1" />
            <line x1="32" y1="2"  x2="32" y2="14" stroke="var(--amber)" strokeWidth="0.75" />
            <line x1="32" y1="50" x2="32" y2="62" stroke="var(--amber)" strokeWidth="0.75" />
            <line x1="2"  y1="32" x2="14" y2="32" stroke="var(--amber)" strokeWidth="0.75" />
            <line x1="50" y1="32" x2="62" y2="32" stroke="var(--amber)" strokeWidth="0.75" />
            <circle cx="32" cy="32" r="1.5" fill="var(--amber)" />
          </svg>
        </div>

        <h1 className="font-display text-5xl font-800 mb-3" style={{ color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Factory<br />Intelligence
        </h1>
        <p className="font-mono text-xs mt-4" style={{ color: "var(--text-3)", letterSpacing: "0.2em" }}>
          PREDICTIVE MAINTENANCE · 14 AI AGENTS · GEMINI 2.5 FLASH
        </p>
      </motion.div>

      {/* Upload area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16,1,0.3,1] }}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className="corner-marks"
          style={{
            background: drag ? "rgba(245,166,35,0.04)" : "var(--bg-2)",
            border: `1px solid ${drag ? "rgba(245,166,35,0.4)" : "var(--line-2)"}`,
            padding: "48px 32px",
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            transition: "all 0.2s",
            borderRadius: "2px",
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />

          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="loader" />
              <div>
                <p className="font-mono text-xs" style={{ color: "var(--amber)", letterSpacing: "0.15em" }}>
                  PROCESSING PDF
                </p>
                <p className="font-mono text-2xs mt-1" style={{ color: "var(--text-3)" }}>
                  Extracting machines · Building vector index...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* PDF icon — blueprint style */}
              <svg width="40" height="48" viewBox="0 0 40 48" fill="none" className="mx-auto mb-5 opacity-50">
                <rect x="1" y="1" width="28" height="36" stroke="var(--text-3)" strokeWidth="1" />
                <path d="M29 1 L39 11 L29 11 Z" stroke="var(--text-3)" strokeWidth="1" fill="none" />
                <line x1="29" y1="1"  x2="29" y2="11" stroke="var(--text-3)" strokeWidth="1" />
                <line x1="29" y1="11" x2="39" y2="11" stroke="var(--text-3)" strokeWidth="1" />
                <line x1="6" y1="18" x2="24" y2="18" stroke="var(--text-3)" strokeWidth="0.75" strokeOpacity="0.5" />
                <line x1="6" y1="22" x2="24" y2="22" stroke="var(--text-3)" strokeWidth="0.75" strokeOpacity="0.5" />
                <line x1="6" y1="26" x2="18" y2="26" stroke="var(--text-3)" strokeWidth="0.75" strokeOpacity="0.5" />
                <circle cx="32" cy="40" r="7" fill="none" stroke="var(--amber)" strokeWidth="1" />
                <line x1="32" y1="36" x2="32" y2="40" stroke="var(--amber)" strokeWidth="1" strokeLinecap="round" />
                <circle cx="32" cy="41.5" r="0.75" fill="var(--amber)" />
              </svg>

              <p className="font-display text-base font-600 mb-1" style={{ color: "var(--text-1)" }}>
                Drop machine log PDF
              </p>
              <p className="font-mono text-2xs mb-6" style={{ color: "var(--text-3)", letterSpacing: "0.1em" }}>
                OR CLICK TO SELECT
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {["Multi-machine detection","Sensor extraction","Vector RAG"].map(f => (
                  <span key={f} className="tag tag-muted">{f}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--red-dim)", border: "1px solid rgba(232,71,63,0.25)" }}>
            <p className="font-mono text-2xs" style={{ color: "var(--red)" }}>⚠ {error}</p>
          </div>
        )}
      </motion.div>

      {/* Feature list — bottom */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-16 flex gap-8"
        style={{ flexWrap: "wrap", justifyContent: "center" }}
      >
        {[
          ["14", "AI Agents"],
          ["15", "Analysis Tabs"],
          ["5K", "Log Dataset"],
          ["3D", "Machine View"],
        ].map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="font-display text-xl font-700" style={{ color: "var(--amber)" }}>{n}</div>
            <div className="font-mono text-2xs mt-1" style={{ color: "var(--text-3)", letterSpacing: "0.12em" }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
