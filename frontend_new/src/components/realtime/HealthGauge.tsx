"use client";
/**
 * HealthGauge.tsx — SVG circular gauge for health / failure index
 */
import { motion } from "framer-motion";

interface Props {
  value:    number;   // 0-100
  label:    string;
  sub?:     string;
  colorMode?: "health" | "risk";  // health: green=good, risk: red=bad
  size?:    number;
}

export default function HealthGauge({ value, label, sub, colorMode="health", size=140 }: Props) {
  const R    = size / 2 - 12;
  const cx   = size / 2;
  const cy   = size / 2;
  // Arc spans 270° (-135° to 135°)
  const START_DEG = -225;
  const SWEEP_DEG = 270;
  const angle = START_DEG + (SWEEP_DEG * value / 100);

  function polarXY(deg: number, r: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(fromDeg: number, toDeg: number, r: number) {
    const s = polarXY(fromDeg, r);
    const e = polarXY(toDeg, r);
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const color = colorMode === "health"
    ? value > 70 ? "#22C55E" : value > 40 ? "#F59E0B" : "#EF4444"
    : value < 30 ? "#22C55E" : value < 60 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path d={arcPath(START_DEG, START_DEG + SWEEP_DEG, R)}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8}
          strokeLinecap="round"/>
        {/* Filled arc */}
        <motion.path
          d={arcPath(START_DEG, angle, R)}
          fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 6px ${color}60)` }}
          initial={{ strokeDashoffset: 1000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Tick marks */}
        {[0,25,50,75,100].map(pct => {
          const deg = START_DEG + (SWEEP_DEG * pct / 100);
          const inner = polarXY(deg, R - 10);
          const outer = polarXY(deg, R - 4);
          return (
            <line key={pct} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}/>
          );
        })}
        {/* Center value */}
        <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily:"var(--f-cond)", fontSize: size < 120 ? 20 : 26,
            fontWeight:700, fill:color }}>
          {Math.round(value)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle"
          style={{ fontFamily:"var(--f-mono)", fontSize:9, fill:"#475569", letterSpacing:"0.1em" }}>
          {sub || "%"}
        </text>
      </svg>
      <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#64748B",
        letterSpacing:"0.14em", textTransform:"uppercase", marginTop:-6, textAlign:"center" }}>
        {label}
      </p>
    </div>
  );
}
