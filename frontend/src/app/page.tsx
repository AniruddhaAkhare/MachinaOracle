"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadZone from "@/components/ui/UploadZone";
import MachineSelector from "@/components/ui/MachineSelector";
import MainDashboard from "@/components/MainDashboard";
import { uploadPDF } from "@/lib/api";

type AppState = "upload" | "select" | "dashboard";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [sessionId, setSessionId] = useState("");
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const { data } = await uploadPDF(file);
      setSessionId(data.session_id);
      setMachines(data.machines_detected || []);
      setState("select");
    } catch (e: any) {
      setUploadError(e?.response?.data?.detail || "Upload failed. Check backend is running.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSelectMachine = useCallback((machine: any) => {
    setSelectedMachine(machine);
    setState("dashboard");
  }, []);

  const handleReset = () => {
    setState("upload");
    setSessionId("");
    setMachines([]);
    setSelectedMachine(null);
  };

  return (
    <main className="min-h-screen bg-forge-900 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 circuit-bg opacity-100 pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 border-b border-cyan-500/10 bg-forge-900/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-cyan-400">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                <path d="M20 8 L24 14 L20 12 L16 14 Z M20 32 L24 26 L20 28 L16 26 Z M8 20 L14 16 L12 20 L14 24 Z M32 20 L26 16 L28 20 L26 24 Z" fill="currentColor" opacity="0.7"/>
                <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="20" r="2" fill="currentColor"/>
              </svg>
              <div className="absolute inset-0 animate-ping">
                <svg width="40" height="40" viewBox="0 0 40 40" className="text-cyan-400 opacity-20">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold neon-text-cyan tracking-wider">
                MACHINA<span className="text-orange-400">ORACLE</span>
              </h1>
              <p className="text-xs text-metal-300 font-mono tracking-widest uppercase">
                Autonomous AI Factory Brain
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-metal-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              SYSTEM ONLINE
            </div>
            {state !== "upload" && (
              <button
                onClick={handleReset}
                className="text-xs font-mono text-metal-300 hover:text-cyan-400 transition-colors border border-cyan-500/20 px-3 py-1.5 rounded hover:border-cyan-500/50"
              >
                ← NEW SCAN
              </button>
            )}
            <div className="text-xs font-mono text-metal-300 hidden md:block">
              GEMINI 2.5 FLASH · LANGCHAIN · RAG
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {state === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <UploadZone
                onUpload={handleUpload}
                uploading={uploading}
                error={uploadError}
              />
            </motion.div>
          )}
          {state === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              <MachineSelector
                machines={machines}
                onSelect={handleSelectMachine}
              />
            </motion.div>
          )}
          {state === "dashboard" && selectedMachine && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MainDashboard
                sessionId={sessionId}
                machine={selectedMachine}
                allMachines={machines}
                onChangeMachine={handleSelectMachine}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}