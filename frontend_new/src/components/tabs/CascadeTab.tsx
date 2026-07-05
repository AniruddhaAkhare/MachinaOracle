"use client";
/**
 * CascadeTab.tsx — Impact Simulation tab
 * MachinaOracle · Cascade Intelligence Engine
 *
 * Layout:
 *   Controls bar
 *   ┌─────────────────────────────────────┬────────────────┐
 *   │  CascadeGraph (animated SVG)        │  ImpactPanel   │
 *   └─────────────────────────────────────┴────────────────┘
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { simulateCascade } from "@/lib/api";
import CascadeGraph  from "@/components/cascade/CascadeGraph";
import ImpactPanel   from "@/components/cascade/ImpactPanel";
import HumanInTheLoop from "@/components/ui/HumanInTheLoop";

interface Props { sessionId: string; machineId: string; machineName: string; }

type SimState = "idle" | "loading" | "ready" | "animating";

const SPEEDS = [
  { label:"0.5×", value:1 },
  { label:"1×",   value:2 },
  { label:"2×",   value:3 },
];

export default function CascadeTab({ sessionId, machineId, machineName }: Props) {
  const [simState,  setSimState]   = useState<SimState>("idle");
  const [hitlIteration, setHitlIteration] = useState(0);
  const [data,      setData]       = useState<any>(null);
  const [error,     setError]      = useState("");
  const [speed,     setSpeed]      = useState(2);
  const [activeStep,setActiveStep] = useState<number>(-1); // -1 = show all
  const [isPlaying, setIsPlaying]  = useState(false);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all pending timers
  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  // ── Run simulation ────────────────────────────────────────────────────────
  const runSimulation = useCallback(async () => {
    clearTimers();
    setSimState("loading");
    setError("");
    setActiveStep(-1);
    setIsPlaying(false);
    setData(null);

    try {
      const res = await simulateCascade(sessionId, machineId);
      setData(res.data);
      setSimState("ready");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Simulation failed — check backend connection.");
      setSimState("idle");
    }
  }, [sessionId, machineId, clearTimers]);

  // ── Replay animation ──────────────────────────────────────────────────────
  const playAnimation = useCallback(() => {
    if (!data) return;
    clearTimers();
    setActiveStep(0);
    setIsPlaying(true);
    setSimState("animating");

    const steps = data.propagation_steps || [];
    const delays: Record<number, number> = { 1: 900, 2: 480, 3: 200 };
    const msPerStep = delays[speed] || 480;

    steps.forEach((_: any, i: number) => {
      const t = setTimeout(() => {
        setActiveStep(i + 1);
      }, (i + 1) * msPerStep);
      timerRef.current.push(t);
    });

    const final = setTimeout(() => {
      setActiveStep(-1);
      setIsPlaying(false);
      setSimState("ready");
    }, (steps.length + 1) * msPerStep + 400);
    timerRef.current.push(final);
  }, [data, speed, clearTimers]);

  // ── Stop animation ────────────────────────────────────────────────────────
  const stopAnimation = useCallback(() => {
    clearTimers();
    setActiveStep(-1);
    setIsPlaying(false);
    if (data) setSimState("ready");
  }, [data, clearTimers]);

  const handleCascadeRefined = useCallback((refined: any) => {
    setData(refined);
    setHitlIteration(prev => prev + 1);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  const hasData = simState === "ready" || simState === "animating";

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"calc(100vh - 200px)" }}>

      {/* ── Top control bar ── */}
      <div style={{
        padding:"16px 26px", background:"var(--bg-1)",
        borderBottom:"1px solid var(--bd-1)",
        display:"flex", alignItems:"center", gap:14, flexWrap:"wrap",
        flexShrink: 0,
      }}>
        {/* Title */}
        <div style={{ marginRight:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8l4 4-4 4M8 12h8"/>
            </svg>
            <span style={{ fontFamily:"var(--f-cond)", fontSize:17, fontWeight:700, color:"var(--t1)" }}>
              CASCADE INTELLIGENCE ENGINE
            </span>
          </div>
          <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--t4)", marginTop:2 }}>
            Root: {machineName}
          </p>
        </div>

        <div style={{ flex:1 }} />

        {/* Speed selector */}
        {hasData && (
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"var(--t4)",
              letterSpacing:"0.12em" }}>SPEED</span>
            {SPEEDS.map(s => (
              <button key={s.value} onClick={() => setSpeed(s.value)}
                style={{
                  padding:"5px 10px", fontFamily:"var(--f-mono)", fontSize:11,
                  background: speed === s.value ? "var(--blue-muted)" : "transparent",
                  border: `1px solid ${speed === s.value ? "rgba(59,130,246,0.4)" : "var(--bd-2)"}`,
                  color: speed === s.value ? "var(--blue-light)" : "var(--t4)",
                  borderRadius:4, cursor:"pointer", transition:"all 0.15s",
                }}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <button
          onClick={runSimulation}
          disabled={simState === "loading" || simState === "animating"}
          className="btn btn-primary"
          style={{ gap:8, fontSize:13 }}>
          {simState === "loading" ? (
            <>
              <div className="spinner" style={{ width:14, height:14, borderWidth:1.5 }}/>
              Simulating...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Run Simulation
            </>
          )}
        </button>

        {hasData && !isPlaying && (
          <button onClick={playAnimation} className="btn btn-secondary" style={{ fontSize:13, gap:7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.62"/>
            </svg>
            Replay
          </button>
        )}

        {isPlaying && (
          <button onClick={stopAnimation} className="btn btn-secondary" style={{ fontSize:13, gap:7 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
            Stop
          </button>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Idle / loading state */}
        <AnimatePresence mode="wait">
          {simState === "idle" && !error && (
            <motion.div key="idle"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", padding:"60px 24px", gap:24 }}>
              {/* Hero icon */}
              <div style={{ position:"relative" }}>
                <motion.div
                  animate={{ scale:[1,1.06,1] }}
                  transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
                  style={{ width:80, height:80, borderRadius:20,
                    background:"rgba(239,68,68,0.08)",
                    border:"1px solid rgba(239,68,68,0.18)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
                    stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="12" cy="12" r="7" strokeDasharray="2 2" strokeOpacity="0.5"/>
                    <circle cx="12" cy="12" r="11" strokeDasharray="2 4" strokeOpacity="0.3"/>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  </svg>
                </motion.div>
                {/* Orbiting dots */}
                {[0,1,2].map(i=>(
                  <motion.div key={i} style={{
                    position:"absolute", width:7, height:7, borderRadius:"50%",
                    background:["#EF4444","#F97316","#F59E0B"][i],
                    top:"50%", left:"50%", transformOrigin:"-32px -32px",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration:3+i*0.8, repeat:Infinity, ease:"linear", delay:i*0.5 }}/>
                ))}
              </div>

              <div style={{ textAlign:"center", maxWidth:420 }}>
                <h3 style={{ fontFamily:"var(--f-cond)", fontSize:24, fontWeight:800,
                  color:"var(--t1)", marginBottom:10 }}>
                  Cascade Intelligence Engine
                </h3>
                <p style={{ fontFamily:"var(--f-sans)", fontSize:15, color:"var(--t3)",
                  lineHeight:1.7, marginBottom:20 }}>
                  Simulate how a failure at <strong style={{ color:"var(--t2)" }}>{machineName}</strong> propagates
                  across the factory floor. Visualise the cascade chain, assess financial impact,
                  and receive AI-generated containment strategies.
                </p>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  {["Dependency Graph","BFS Propagation","Cost Analysis","AI Containment"].map(f=>(
                    <span key={f} className="badge b-blue">{f}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {simState === "loading" && (
            <motion.div key="loading"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:22 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration:2, repeat:Infinity, ease:"linear" }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="22" stroke="rgba(239,68,68,0.15)" strokeWidth="3"/>
                  <path d="M 26 4 A 22 22 0 0 1 48 26" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </motion.div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"var(--f-sans)", fontSize:16, fontWeight:600,
                  color:"var(--t1)", marginBottom:7 }}>Running Cascade Simulation</p>
                <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t4)" }}>
                  Building dependency graph · BFS propagation · Gemini analysis...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div style={{ flex:1, display:"flex", alignItems:"center",
            justifyContent:"center", padding:32 }}>
            <div style={{ background:"var(--r-mute)", border:"1px solid rgba(239,68,68,0.25)",
              borderRadius:8, padding:"20px 24px", maxWidth:480 }}>
              <p style={{ fontFamily:"var(--f-sans)", fontSize:15, fontWeight:600,
                color:"var(--red)", marginBottom:8 }}>Simulation Error</p>
              <p style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t3)" }}>{error}</p>
              <button onClick={runSimulation} className="btn btn-secondary"
                style={{ marginTop:14, fontSize:13 }}>Retry</button>
            </div>
          </div>
        )}

        {/* Results */}
        {hasData && data && (
          <motion.div key="results"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 340px",
              overflow:"hidden", minHeight:0 }}>

            {/* Graph area */}
            <div style={{ padding:"24px 20px 24px 26px", overflowY:"auto",
              borderRight:"1px solid var(--bd-1)" }}>

              {/* Status bar */}
              <div style={{ display:"flex", alignItems:"center", gap:12,
                marginBottom:18, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {isPlaying ? (
                    <>
                      <motion.div animate={{ scale:[1,1.3,1], opacity:[1,0.5,1] }}
                        transition={{ duration:0.9, repeat:Infinity }}
                        style={{ width:8, height:8, borderRadius:"50%",
                          background:"#EF4444", flexShrink:0 }}/>
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:11,
                        color:"#EF4444", letterSpacing:"0.12em" }}>
                        SIMULATING STEP {activeStep === -1 ? "—" : activeStep} / {data.propagation_steps?.length || 0}
                      </span>
                    </>
                  ) : (
                    <>
                      <div style={{ width:8, height:8, borderRadius:"50%",
                        background:"#22C55E", flexShrink:0 }}/>
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:11,
                        color:"#22C55E", letterSpacing:"0.12em" }}>SIMULATION COMPLETE</span>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div style={{ display:"flex", gap:12, marginLeft:"auto" }}>
                  {[
                    ["#EF4444","Critical (>70%)"],
                    ["#F97316","High (>45%)"],
                    ["#F59E0B","Medium"],
                    ["#22C55E","Unaffected"],
                  ].map(([c,l])=>(
                    <div key={l as string} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:8, height:8, background:c as string, borderRadius:2 }}/>
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:9.5, color:"#475569" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* The graph */}
              {data.graph && (
                <div style={{ background:"#0A1120",
                  border:"1px solid rgba(59,130,246,0.14)",
                  borderRadius:10, overflow:"hidden",
                  position:"relative" }}>
                  {/* Blueprint grid overlay */}
                  <div style={{ position:"absolute", inset:0, pointerEvents:"none",
                    backgroundImage:"linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)",
                    backgroundSize:"24px 24px", zIndex:0 }}/>
                  <div style={{ position:"relative", zIndex:1, padding:"18px 14px" }}>
                    <CascadeGraph
                      graphData={data.graph}
                      propagationSteps={data.propagation_steps || []}
                      activeUpToStep={activeStep}
                      animationSpeed={speed}
                      onNodeClick={node => {
                        console.log("Node clicked:", node);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Propagation steps detail table */}
              {data.propagation_steps?.length > 0 && (
                <div style={{ marginTop:20 }}>
                  <p style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"#64748B",
                    letterSpacing:"0.14em", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ display:"inline-block", width:3, height:13,
                      background:"var(--blue)", borderRadius:2 }}/>
                    STEP-BY-STEP PROPAGATION
                  </p>
                  <div style={{ background:"var(--bg-2)",
                    border:"1px solid var(--bd-1)", borderRadius:8 }}>
                    <table className="dtable">
                      <thead>
                        <tr>
                          <th>Step</th><th>Machine</th><th>Type</th>
                          <th>Impact</th><th>Probability</th><th>Downtime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.propagation_steps.map((s: any) => {
                          const col = s.impact_score>70?"#EF4444":s.impact_score>45?"#F97316":"#F59E0B";
                          const show = activeStep === -1 || s.step <= activeStep;
                          if (!show) return null;
                          return (
                            <motion.tr key={s.step}
                              initial={{ opacity:0 }} animate={{ opacity:1 }}
                              transition={{ duration:0.3 }}>
                              <td>
                                <span style={{ fontFamily:"var(--f-mono)", fontSize:13,
                                  fontWeight:700, color:col }}>#{s.step}</span>
                              </td>
                              <td style={{ fontFamily:"var(--f-sans)", fontSize:14,
                                fontWeight:500, color:"var(--t1)" }}>{s.machine}</td>
                              <td style={{ fontFamily:"var(--f-mono)", fontSize:11,
                                color:"var(--t4)" }}>{s.machine_type}</td>
                              <td>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <div style={{ width:60, height:3,
                                    background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                                    <motion.div style={{ height:"100%", background:col, borderRadius:2 }}
                                      initial={{ width:0 }} animate={{ width:`${s.impact_score}%` }}
                                      transition={{ duration:0.7 }}/>
                                  </div>
                                  <span style={{ fontFamily:"var(--f-mono)", fontSize:12, color:col }}>{s.impact_score}%</span>
                                </div>
                              </td>
                              <td style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t3)" }}>{s.propagation_prob}%</td>
                              <td style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--t3)" }}>{s.estimated_downtime_hours}h</td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* HITL Panel */}
            {data && (
              <HumanInTheLoop
                sessionId={sessionId}
                machineId={machineId}
                agentType="cascade"
                currentResponse={data}
                onRefined={handleCascadeRefined}
                iterationCount={hitlIteration}
              />
            )}
            {/* Side panel */}
            <div style={{ overflow:"hidden", display:"flex", flexDirection:"column" }}>
              <ImpactPanel
                rootFailure={data.root_failure || ""}
                rootType={data.root_machine_type || ""}
                rootHealth={data.root_health || 50}
                propagationSteps={data.propagation_steps || []}
                totalImpact={data.total_impact || {}}
                containment={data.containment || []}
                narrative={data.narrative || ""}
                activeStep={activeStep}
                isAnimating={isPlaying}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
