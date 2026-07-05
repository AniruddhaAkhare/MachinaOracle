"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getWorkforce } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function WorkforceTab({sessionId,machineId}:P){
  return<AgentPanel agentName="Workforce Planner" fetchFn={()=>getWorkforce(sessionId,machineId)} cacheKey={`wf_${sessionId}_${machineId}`}>
    {(d)=>(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Man-Hours",d.total_man_hours,"var(--t1)"],["Labor Cost",$$(d.labor_cost_estimate),"var(--green)"],["Safety Officer",d.safety_officer_required?"Required":"Not Needed",d.safety_officer_required?"var(--orange)":"var(--t4)"]].map(([l,v,c])=>(
            <div key={String(l)} className="kpi"><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:22,fontWeight:700,color:String(c)}}>{v}</span></div>
          ))}
        </div>
        {d.team_required?.length>0&&(<div><SL t="Team Requirements"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8}}>
            <table className="dtable">
              <thead><tr><th>Role</th><th>Count</th><th>Skills</th><th>Shift</th><th>Hours</th></tr></thead>
              <tbody>{d.team_required.map((t:any,i:number)=>(
                <tr key={i}><td style={{color:"var(--t1)",fontSize:15,fontWeight:500}}>{t.role}</td>
                  <td style={{fontFamily:"var(--f-cond)",fontSize:22,fontWeight:700,color:"var(--blue-light)"}}>{t.count}</td>
                  <td style={{fontSize:13,color:"var(--t4)"}}>{t.skills?.join(", ")}</td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t3)"}}>{t.shift}</td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t3)"}}>{t.hours}h</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>)}
        {d.workforce_narrative&&<AI text={d.workforce_narrative}/>}
      </div>
    )}
  </AgentPanel>;
}
