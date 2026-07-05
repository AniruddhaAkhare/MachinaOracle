"use client";
import { useEffect, useState } from "react";

/* ─ shared helpers ─ */
function rc(v: string | number): string {
  if (typeof v === "number") { if (v>75) return "var(--red)"; if (v>50) return "var(--orange)"; if (v>25) return "var(--amber)"; return "var(--green)"; }
  const s = (v || "").toLowerCase();
  if (s.includes("crit")) return "var(--red)"; if (s.includes("high")) return "var(--orange)"; if (s.includes("med")) return "var(--amber)"; return "var(--green)";
}
function bc(l: string): string { const s=(l||"").toLowerCase(); if(s.includes("crit"))return"b-red"; if(s.includes("high"))return"b-orange"; if(s.includes("med"))return"b-amber"; return"b-green"; }
function $$(n: number): string { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0); }
function SL({ t }: { t: string }) { return <p className="slabel" style={{ marginBottom:14 }}>{t}</p>; }
function PB({ v, c }: { v:number; c?:string }) { const col=c||rc(v); return <div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>; }
function AI({ text }: { text: string }) {
  return (
    <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}>
      <p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p>
      <p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p>
    </div>
  );
}
const TT = ({ active, payload, label }: any) => active && payload?.[0] ? (
  <div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}>
    <p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p>
    <p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p>
  </div>
) : null;

export default function OverviewTab({ machine }: { machine: any }) {
  const s = machine.sensor_data || {};
  const hs = s.health_score ?? machine.health_score ?? 75;
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => { const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); return () => clearInterval(t); }, []);
  const sensors = [
    ["Temperature","temperature","°C"],["Vibration","vibration","mm/s"],
    ["Pressure","pressure","PSI"],["RPM","rpm","rpm"],["Voltage","voltage","V"],["Current","current","A"],
  ];
  return (
    <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:22,alignItems:"start"}}>
        <div>
          <SL t="Machine Profile" />
          <h2 style={{fontFamily:"var(--f-cond)",fontSize:34,fontWeight:800,color:"var(--t1)",letterSpacing:"-0.01em",lineHeight:1.1,marginBottom:7}}>{machine.machine_name}</h2>
          <p style={{fontSize:15,color:"var(--t3)",marginBottom:5}}>{machine.machine_type || "Industrial Equipment"}</p>
          <span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)"}}>LIVE · {time}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
            <circle cx="48" cy="48" r="40" fill="none" stroke={rc(100-hs)} strokeWidth="6"
              strokeDasharray={`${2*Math.PI*40*hs/100} ${2*Math.PI*40}`}
              transform="rotate(-90 48 48)" style={{transition:"stroke-dasharray 1s ease"}}/>
            <text x="48" y="43" textAnchor="middle" fill={rc(100-hs)} style={{fontSize:22,fontFamily:"var(--f-cond)",fontWeight:700}}>{Math.round(hs)}</text>
            <text x="48" y="60" textAnchor="middle" fill="var(--t4)" style={{fontSize:9,fontFamily:"var(--f-mono)",letterSpacing:"0.1em"}}>HEALTH</text>
          </svg>
          <span className={`badge ${bc(hs<40?"critical":hs<65?"high":hs<80?"medium":"low")}`} style={{marginTop:6,display:"inline-flex"}}>
            {hs<40?"Critical":hs<65?"High Risk":hs<80?"Moderate":"Nominal"}
          </span>
        </div>
      </div>
      <div className="hr" />
      <div>
        <SL t="Live Sensor Readings" />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:10}}>
          {sensors.map(([label, key, unit]) => {
            const val = s[key as string];
            return (
              <div className="kpi" key={key as string}>
                <p className="kpi-label">{label}</p>
                <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                  <span className="kpi-val" style={{fontSize:28,color:val!==undefined?"var(--t1)":"var(--t5)"}}>
                    {val !== undefined ? (val as number).toFixed(1) : "—"}
                  </span>
                  <span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)"}}>{unit}</span>
                </div>
                <div className="kpi-bar" style={{background:"var(--blue)"}} />
              </div>
            );
          })}
        </div>
      </div>
      {machine.log_text && (
        <div>
          <SL t="Raw Log Extract" />
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"16px 18px"}}>
            <pre style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t3)",whiteSpace:"pre-wrap",lineHeight:1.8,maxHeight:180,overflowY:"auto"}}>
              {machine.log_text.slice(0,900)}{machine.log_text.length > 900 ? "\n…" : ""}
            </pre>
          </div>
        </div>
      )}
      <div>
        <SL t="AI Agent Status" />
        <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"16px 20px"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {["Failure","Root Cause","Maintenance","Cost","Spare Parts","Timeline","Alerts","Anomaly","Workforce","Strategy","Digital Twin","What-If","3D Blueprint","Chat"].map(a=>(
              <div key={a} style={{display:"flex",alignItems:"center",gap:7,fontSize:14,color:"var(--t3)"}}>
                <span className="pulse p-green" style={{width:6,height:6,display:"inline-block"}}/>
                {a}
              </div>
            ))}
          </div>
          <p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t5)",marginTop:12}}>Click any tab to run its agent with ChromaDB RAG context. Results cached per session.</p>
        </div>
      </div>
    </div>
  );
}
