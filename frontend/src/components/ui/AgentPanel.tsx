"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  agentName: string;
  fetchFn: () => Promise<any>;
  children: (data: any) => React.ReactNode;
  cacheKey?: string;
}

const cache: Record<string, any> = {};

export default function AgentPanel({ agentName, fetchFn, children, cacheKey }: Props) {
  const [data, setData] = useState<any>(cacheKey ? cache[cacheKey] : null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (cacheKey && cache[cacheKey]) {
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchFn();
      const d = result.data;
      if (cacheKey) cache[cacheKey] = d;
      setData(d);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Agent failed. Check backend.");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey]);

  useEffect(() => {
    if (!data) load();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="loading-ring" />
      <div className="text-center">
        <p className="font-mono text-cyan-400 text-sm tracking-wider mb-1">
          🤖 {agentName.toUpperCase()} RUNNING
        </p>
        <p className="text-metal-300 text-xs">Querying Gemini 2.5 Flash + Vector DB...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="glass-panel rounded-xl p-6 border-red-500/20">
        <p className="text-red-400 font-mono text-sm">⚠ Agent Error: {error}</p>
        <button onClick={load} className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-mono border border-cyan-500/20 px-3 py-1 rounded">
          RETRY
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children(data)}
    </motion.div>
  );
}