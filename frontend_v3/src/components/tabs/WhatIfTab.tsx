"use client";
import { useState } from "react";
import AgentPanel from "@/components/ui/AgentPanel";
import { getWhatIf } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
const PRESETS=[{label:"Load +20%",scenario:{description:"Increase operating load by 20% for 30 days"}},{label:"Skip Maintenance",scenario:{description:"Skip next scheduled maintenance cycle"}},{label:"Temp +15°C",scenario:{description:"Operate at 15°C above rated temperature"}},{label:"Night Shifts Only",scenario:{description:"Restrict to night shift operation only"}},{label:"RPM −30%",scenario:{description:"Reduce RPM by 30% for energy savings"}}];
export default function WhatIfTab({sessionId,machineId}:P){
  const [sel,setSel]=useState(0);
  const [custom,setCustom]=useState("");
  const [runKey,setRunKey]=useState(0);
  const scenario=custom?{description:custom}:PRESETS[sel].scenario;
  return(
    <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
      <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px"}}>
        <SL t="Select Scenario"/>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
          {PRESETS.map((p,i)=>(
            <button key={i} onClick={()=>{setSel(i);setCustom("");}} className="btn"
              style={{fontSize:13,padding:"7px 14px",background:sel===i&&!custom?"var(--blue-muted)":"transparent",border:`1px solid ${sel===i&&!custom?"rgba(59,130,246,0.42)":"var(--bd-2)"}`,color:sel===i&&!custom?"var(--blue-light)":"var(--t4)"}}>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Custom scenario..." className="field" style={{flex:1}}/>
          <button onClick={()=>setRunKey(k=>k+1)} className="btn btn-primary">Run</button>
        </div>
      </div>
      <AgentPanel key={`wi_${runKey}_${sel}`} agentName="What-If Simulator" fetchFn={()=>getWhatIf(sessionId,machineId,scenario)} cacheKey={`wi_${sessionId}_${machineId}_${sel}_${runKey}`}>
        {(d)=>(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {d.baseline_state&&(<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"4px solid var(--t4)",borderRadius:8,padding:"16px 20px"}}>
              <SL t="Baseline — Current State"/>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                {[["Health",`${d.baseline_state.health_score}%`,"var(--green)"],["Failure Prob",`${d.baseline_state.failure_probability}%`,"var(--amber)"],["Days to Failure",d.baseline_state.days_to_failure,"var(--t1)"]].map(([l,v,c])=>(
                  <div key={String(l)}><span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)"}}>{l}: </span>
                    <span style={{fontFamily:"var(--f-cond)",fontSize:18,fontWeight:700,color:String(c)}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>)}
            {d.scenario_outcomes?.map((so:any,i:number)=>{const c=so.risk_change==="increased"?"var(--red)":so.risk_change==="decreased"?"var(--green)":"var(--t3)";return(
              <div key={i} style={{background:"var(--bg-2)",border:`1px solid ${c}30`,borderLeft:`4px solid ${c}`,borderRadius:8,padding:"16px 20px"}}>
                <p style={{fontSize:15,fontWeight:600,color:"var(--t1)",marginBottom:10}}>{so.scenario_name}</p>
                <div style={{display:"flex",gap:22,flexWrap:"wrap",marginBottom:8}}>
                  {[["New Health",`${so.new_health_score}%`,rc(100-so.new_health_score)],["Failure Prob",`${so.new_failure_probability}%`,rc(so.new_failure_probability)],["Days to Failure",so.new_days_to_failure,"var(--t1)"],["Cost Impact",$$(so.cost_impact||0),"var(--amber)"]].map(([l,v,cv])=>(
                    <div key={String(l)}><span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)"}}>{l}: </span>
                      <span style={{fontFamily:"var(--f-cond)",fontSize:18,fontWeight:700,color:String(cv)}}>{v}</span>
                    </div>
                  ))}
                </div>
                <p style={{fontFamily:"var(--f-mono)",fontSize:12,color:c}}>Risk {so.risk_change} → {so.recommendation}</p>
              </div>
            );})}
            {d.whatif_narrative&&<AI text={d.whatif_narrative}/>}
          </div>
        )}
      </AgentPanel>
    </div>
  );
}
