"use client";
import { motion } from "framer-motion";

interface Props { machines: any[]; onSelect: (m: any) => void; }

function healthToColor(s: number): string {
  if (s < 40) return "var(--red)";
  if (s < 65) return "#e87a3f";
  if (s < 80) return "var(--amber)";
  return "var(--green)";
}

function healthLabel(s: number): string {
  if (s < 40) return "CRITICAL";
  if (s < 65) return "HIGH RISK";
  if (s < 80) return "MODERATE";
  return "NOMINAL";
}

export default function MachineSelector({ machines, onSelect }: Props) {
  return (
    <div style={{ minHeight: "calc(100vh - 48px)", padding: "56px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 48 }}
        >
          <p className="section-label" style={{ marginBottom: 8, color: "var(--amber)" }}>
            SCAN COMPLETE — {machines.length} MACHINE{machines.length !== 1 ? "S" : ""} DETECTED
          </p>
          <h2 className="font-display text-3xl font-700" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            Select Machine Unit
          </h2>
          <p style={{ marginTop: 8, color: "var(--text-3)", fontSize: 13 }}>
            Each unit runs independently through all 14 AI agent modules.
          </p>
          <div className="divider" style={{ marginTop: 24 }} />
        </motion.div>

        {/* Machine grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1 }}>
          {machines.map((m, i) => {
            const sensors = m.sensor_data || {};
            const hs = sensors.health_score ?? m.health_score ?? 75;
            const hColor = healthToColor(hs);
            const hLabel = healthLabel(hs);

            return (
              <motion.div
                key={m.machine_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16,1,0.3,1] }}
                onClick={() => onSelect(m)}
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="group"
                whileHover={{ borderColor: "rgba(245,166,35,0.35)", backgroundColor: "var(--bg-3)" } as any}
              >
                {/* Index */}
                <div className="font-mono text-2xs" style={{ color: "var(--text-3)", marginBottom: 16 }}>
                  UNIT_{String(i + 1).padStart(2, "0")}
                </div>

                {/* Health arc */}
                <div style={{ position: "absolute", top: 20, right: 20, opacity: 0.8 }}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--line-2)" strokeWidth="2" />
                    <circle cx="22" cy="22" r="18" fill="none"
                      stroke={hColor}
                      strokeWidth="2"
                      strokeLinecap="butt"
                      strokeDasharray={`${2 * Math.PI * 18 * hs / 100} ${2 * Math.PI * 18}`}
                      transform="rotate(-90 22 22)"
                    />
                    <text x="22" y="26" textAnchor="middle" fill={hColor}
                      style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 400 }}>
                      {Math.round(hs)}
                    </text>
                  </svg>
                </div>

                {/* Name */}
                <h3 className="font-display font-600" style={{ fontSize: 16, color: "var(--text-1)", marginBottom: 4, marginRight: 52, lineHeight: 1.3 }}>
                  {m.machine_name}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>
                  {m.machine_type || "Industrial Equipment"}
                </p>

                {/* Status tag */}
                <span className={`tag ${hs < 40 ? "tag-red" : hs < 65 ? "tag" : hs < 80 ? "tag-amber" : "tag-green"}`}
                  style={hs >= 40 && hs < 65 ? { background: "rgba(232,122,63,0.12)", color: "#e87a3f", border: "1px solid rgba(232,122,63,0.3)" } : {}}>
                  {hLabel}
                </span>

                {/* Sensor pills */}
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(sensors).filter(([k]) => k !== "health_score").slice(0, 3).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.05em" }}>
                      {k.replace("_", " ")}: <span style={{ color: "var(--text-2)" }}>{typeof v === "number" ? v.toFixed(1) : String(v)}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="section-label" style={{ color: "var(--text-3)" }}>Open Analysis</span>
                  <span style={{ color: "var(--amber)", fontSize: 12, fontFamily: "var(--font-mono)" }}>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
