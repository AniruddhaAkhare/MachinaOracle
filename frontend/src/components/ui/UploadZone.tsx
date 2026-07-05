"use client";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onUpload: (file: File) => void;
  uploading: boolean;
  error: string;
}

export default function UploadZone({ onUpload, uploading, error }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") onUpload(file);
  }, [onUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-center mb-16 max-w-4xl"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
              className="opacity-20"
              style={{ fontSize: `${20 + i * 6}px` }}
            >
              ⚙️
            </motion.div>
          ))}
        </div>
        <h2 className="font-display text-5xl md:text-7xl font-black mb-4 tracking-tight">
          <span className="neon-text-cyan">MACHINA</span>
          <span className="text-orange-400">ORACLE</span>
        </h2>
        <p className="text-xl md:text-2xl text-metal-300 font-body mb-3">
          Autonomous AI Factory Brain
        </p>
        <p className="text-sm text-metal-300/60 font-mono tracking-widest uppercase">
          Predictive Maintenance · Failure Intelligence · Digital Twin · 14 AI Agents
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-2xl"
      >
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative glass-panel rounded-2xl p-12 text-center transition-all duration-300 ${
            dragOver ? "border-cyan-400/70 bg-cyan-500/10 scale-[1.02]" : "border-cyan-500/20"
          }`}
        >
          {/* Corner decorations */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-6 h-6 border-cyan-400/40 ${
              i === 0 ? "border-t-2 border-l-2 rounded-tl-lg" :
              i === 1 ? "border-t-2 border-r-2 rounded-tr-lg" :
              i === 2 ? "border-b-2 border-l-2 rounded-bl-lg" :
              "border-b-2 border-r-2 rounded-br-lg"
            }`} />
          ))}

          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="loading-ring" />
              <p className="neon-text-cyan font-mono text-sm tracking-wider animate-pulse">
                SCANNING PDF · EXTRACTING MACHINES · BUILDING VECTOR DB...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="72" height="72" viewBox="0 0 72 72" className="text-cyan-400 opacity-80">
                    <rect x="12" y="8" width="36" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M32 8 L48 8 L48 24 L32 24 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M44 8 L48 12 L44 12 Z" fill="currentColor" opacity="0.5"/>
                    <line x1="18" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                    <line x1="18" y1="38" x2="38" y2="38" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                    <line x1="18" y1="44" x2="34" y2="44" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                    <circle cx="54" cy="52" r="12" fill="#050810" stroke="currentColor" strokeWidth="2"/>
                    <path d="M54 46 L54 58 M48 52 L60 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                DROP MACHINE LOG PDF
              </h3>
              <p className="text-metal-300 text-sm mb-6">
                Supports multi-machine PDFs · Auto-detects all machines · Processes sensor data
              </p>
              <label className="inline-block cursor-pointer">
                <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
                <span className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm px-6 py-3 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/70 transition-all tracking-wider">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  SELECT PDF FILE
                </span>
              </label>
            </>
          )}
          {error && (
            <p className="mt-4 text-red-400 text-sm font-mono border border-red-400/20 bg-red-400/5 rounded px-3 py-2">
              ⚠ {error}
            </p>
          )}
        </div>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-3 mt-10 max-w-3xl"
      >
        {["14 AI Agents","Gemini 2.5 Flash","Vector RAG","Digital Twin","3D Visualization","What-If Sim","ChromaDB","Real-time Alerts"].map((f) => (
          <span key={f} className="text-xs font-mono text-cyan-400/60 border border-cyan-500/10 bg-cyan-500/5 px-3 py-1 rounded-full">
            {f}
          </span>
        ))}
      </motion.div>
    </div>
  );
}