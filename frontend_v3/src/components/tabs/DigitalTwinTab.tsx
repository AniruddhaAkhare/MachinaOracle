"use client";
import { useState } from "react";
import AgentPanel from "@/components/ui/AgentPanel";
import { getDigitalTwin } from "@/lib/api";
import { LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,ReferenceLine } from "recharts";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function DigitalTwinTab({sessionId,machineId}:P){
  const [days,setDays]=useState(30);
  const [key,setKey]=useState(0);
  return(
    <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
      <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
        <div><p className="slabel" style={{marginBottom:8}}>Simulation Days: <span style={{color:"var(--blue-light)",fontFamily:"var(--f-mono)"}}>{days}</span></p>
          <input type="range" min={7} max={90} value={days} onChange={e=>setDays(+e.target.value)} style={{width:220,accentColor:"var(--blue)"}}/>
        </div>
        <button onClick={()=>setKey(k=>k+1)} className="btn btn-primary" style={{marginLeft:"auto"}}>Run Simulation</button>
      </div>
      <AgentPanel key={`dt_${key}_${days}`} agentName="Digital Twin" fetchFn={()=>getDigitalTwin(sessionId,machineId,days)} cacheKey={`dt_${sessionId}_${machineId}_${days}_${key}`}>
        {(d)=>{const sm=d.simulation_summary||{};return(
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[["Final Health",`${sm.final_health_score||"—"}%`,rc(100-(sm.final_health_score||0))],["Failure?",sm.failure_occurred?"YES":"NO",sm.failure_occurred?"var(--red)":"var(--green)"],["Failure Day",sm.failure_day??"None",sm.failure_day?"var(--orange)":"var(--t4)"],["Critical Events",sm.critical_events_count??0,"var(--amber)"]].map(([l,v,c])=>(
                <div key={String(l)} className="kpi"><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:24,fontWeight:700,color:String(c)}}>{v}</span></div>
              ))}
            </div>
            {d.daily_simulation?.length>0&&(<div><SL t="Health Over Time"/>
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 18px 10px",height:300}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={d.daily_simulation}>
                    <XAxis dataKey="day" tick={{fill:"var(--t4)",fontSize:12,fontFamily:"var(--f-mono)"}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fill:"var(--t4)",fontSize:11,fontFamily:"var(--f-mono)"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<TT/>}/>
                    {sm.failure_day&&<ReferenceLine x={sm.failure_day} stroke="var(--red)" strokeDasharray="5 3" strokeOpacity={0.5}/>}
                    <Line type="monotone" dataKey="health_score" stroke="var(--green)" strokeWidth={2} dot={false} name="Health %"/>
                    <Line type="monotone" dataKey="temperature" stroke="var(--amber)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Temp"/>
                    <Line type="monotone" dataKey="vibration" stroke="var(--orange)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Vibration"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>)}
            {d.component_wear?.length>0&&(<div><SL t="Component Wear"/>
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
                {d.component_wear.map((cw:any,i:number)=>{const wc=cw.wear_percentage>75?"var(--red)":cw.wear_percentage>50?"var(--orange)":"var(--amber)";return(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                      <span style={{fontSize:15,fontWeight:500,color:"var(--t1)"}}>{cw.component}</span>
                      <div style={{display:"flex",gap:14}}><span style={{fontFamily:"var(--f-mono)",fontSize:12,color:wc}}>{cw.wear_percentage}% worn</span><span style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t4)"}}>{cw.remaining_life_days}d left</span></div>
                    </div>
                    <PB v={cw.wear_percentage}/>
                  </div>
                );})}
              </div>
            </div>)}
            {d.twin_narrative&&<AI text={d.twin_narrative}/>}
          </div>
        )}}
      </AgentPanel>
    </div>
  );
}
