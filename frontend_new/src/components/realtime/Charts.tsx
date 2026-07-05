"use client";
/**
 * Charts.tsx — All live chart components using Recharts
 * Temperature line, Vibration line, Risk bar, Heatmap grid
 */
import { memo } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

// ─── Shared tooltip style ────────────────────────────────────────────────────
const TT = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div style={{ background:"#0C0E13", border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:6, padding:"8px 12px" }}>
      <p style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#64748B", marginBottom:4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontFamily:"var(--f-mono)", fontSize:12,
          color:p.color || p.fill, fontWeight:600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  ) : null;

// ─── Temperature line chart ──────────────────────────────────────────────────
interface TrendPoint { ts: string; avg_temp?: number; avg_vib?: number; fleet_health?: number; avg_pressure?: number; }

export const TempLineChart = memo(({ data }: { data: TrendPoint[] }) => (
  <div style={{ height:170 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top:5, right:10, bottom:0, left:-10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false}/>
        <XAxis dataKey="ts" hide />
        <YAxis tick={{ fill:"#475569", fontSize:10, fontFamily:"var(--f-mono)" }}
          axisLine={false} tickLine={false} width={36}/>
        <Tooltip content={<TT/>}/>
        <ReferenceLine y={100} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 3"/>
        <Line type="monotoneX" dataKey="avg_temp" stroke="#F97316" strokeWidth={2}
          dot={false} name="Avg Temp °C" isAnimationActive={false}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
));
TempLineChart.displayName = "TempLineChart";

// ─── Vibration line chart ────────────────────────────────────────────────────
export const VibLineChart = memo(({ data }: { data: TrendPoint[] }) => (
  <div style={{ height:170 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top:5, right:10, bottom:0, left:-10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false}/>
        <XAxis dataKey="ts" hide />
        <YAxis tick={{ fill:"#475569", fontSize:10, fontFamily:"var(--f-mono)" }}
          axisLine={false} tickLine={false} width={36}/>
        <Tooltip content={<TT/>}/>
        <ReferenceLine y={7} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 3"/>
        <Line type="monotoneX" dataKey="avg_vib" stroke="#8B5CF6" strokeWidth={2}
          dot={false} name="Avg Vib mm/s" isAnimationActive={false}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
));
VibLineChart.displayName = "VibLineChart";

// ─── Fleet health trend ──────────────────────────────────────────────────────
export const HealthTrendChart = memo(({ data }: { data: TrendPoint[] }) => (
  <div style={{ height:100 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top:5, right:10, bottom:0, left:-10 }}>
        <XAxis dataKey="ts" hide />
        <YAxis domain={[0,100]} tick={{ fill:"#475569", fontSize:10 }}
          axisLine={false} tickLine={false} width={30}/>
        <Tooltip content={<TT/>}/>
        <ReferenceLine y={60} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 3"/>
        <Line type="monotoneX" dataKey="fleet_health" stroke="#3B82F6" strokeWidth={2.5}
          dot={false} name="Fleet Health %" isAnimationActive={false}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
));
HealthTrendChart.displayName = "HealthTrendChart";

// ─── Machine risk bar chart ──────────────────────────────────────────────────
interface RiskBar { machine: string; risk: number; health: number; severity: string; }

const RISK_COLOR = (sev: string) =>
  sev === "CRITICAL" ? "#EF4444" : sev === "WARNING" ? "#F59E0B" : "#22C55E";

export const RiskBarChart = memo(({ data }: { data: RiskBar[] }) => (
  <div style={{ height:200 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top:0, right:10, bottom:0, left:0 }}>
        <XAxis type="number" domain={[0,100]} tick={{ fill:"#475569", fontSize:10 }}
          axisLine={false} tickLine={false}/>
        <YAxis type="category" dataKey="machine" width={100}
          tick={{ fill:"#94A3B8", fontSize:10, fontFamily:"var(--f-mono)" }}
          axisLine={false} tickLine={false}/>
        <Tooltip content={<TT/>}/>
        <Bar dataKey="risk" name="Risk %" radius={[0,3,3,0]} barSize={12} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={RISK_COLOR(entry.severity)} fillOpacity={0.85}/>
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
));
RiskBarChart.displayName = "RiskBarChart";

// ─── Risk Heatmap (custom SVG grid) ─────────────────────────────────────────
interface HeatCell { id: string; name: string; type: string; health: number; severity: string; risk: number; }

export const RiskHeatmap = memo(({ data }: { data: HeatCell[] }) => {
  const cols = 5;
  const rows = Math.ceil(data.length / cols);
  const W = 100 / cols;
  const H = 36;

  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:2 }}>
      {data.map((cell) => {
        const col = cell.severity==="CRITICAL"?"#EF4444":cell.severity==="WARNING"?"#F59E0B":"#22C55E";
        const bg  = cell.severity==="CRITICAL"?"rgba(239,68,68,0.18)":
          cell.severity==="WARNING"?"rgba(245,158,11,0.14)":"rgba(34,197,94,0.08)";
        return (
          <motion.div key={cell.id}
            initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
            style={{ background:bg, border:`1px solid ${col}40`, borderRadius:4,
              padding:"6px 8px", position:"relative", overflow:"hidden" }}>
            {/* Health bar bottom */}
            <div style={{ position:"absolute", bottom:0, left:0, height:2,
              width:`${cell.health}%`, background:col, opacity:0.6 }}/>
            <p style={{ fontFamily:"var(--f-mono)", fontSize:9, color:col,
              fontWeight:700, letterSpacing:"0.08em",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {cell.name}
            </p>
            <p style={{ fontFamily:"var(--f-cond)", fontSize:14, fontWeight:700, color:col }}>
              {cell.health.toFixed(0)}<span style={{ fontSize:9, fontWeight:400 }}>%</span>
            </p>
          </motion.div>
        );
      })}
    </div>
  );
});
RiskHeatmap.displayName = "RiskHeatmap";

// ─── Failure index meter (horizontal progress) ───────────────────────────────
export const FailureIndexMeter = memo(({ value }: { value: number }) => {
  const col = value < 30 ? "#22C55E" : value < 60 ? "#F59E0B" : "#EF4444";
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"#64748B", letterSpacing:"0.12em" }}>
          FAILURE INDEX
        </span>
        <span style={{ fontFamily:"var(--f-cond)", fontSize:18, fontWeight:700, color:col }}>
          {value.toFixed(1)}
        </span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
        <motion.div style={{ height:"100%", background:col, borderRadius:3 }}
          animate={{ width:`${value}%` }}
          transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        {["LOW","MODERATE","HIGH","CRITICAL"].map((l,i)=>(
          <span key={l} style={{ fontFamily:"var(--f-mono)", fontSize:9, color:"#3A4A5C" }}>{l}</span>
        ))}
      </div>
    </div>
  );
});
FailureIndexMeter.displayName = "FailureIndexMeter";
