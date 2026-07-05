"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getMaintenance } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function MaintenanceTab({sessionId,machineId}:P){
  return<AgentPanel agentType="maintenance" sessionId={sessionId} machineId={machineId} agentName="Maintenance Planner" fetchFn={()=>getMaintenance(sessionId,machineId)} cacheKey={`maint_${sessionId}_${machineId}`}>
    {(d)=>{const uc=d.maintenance_urgency==="IMMEDIATE"?"var(--red)":d.maintenance_urgency==="SCHEDULED"?"var(--amber)":"var(--green)";return(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[["Urgency",d.maintenance_urgency,uc],["Type",d.maintenance_type,"var(--t1)"],["Downtime",`${d.estimated_downtime_hours||0}h`,"var(--t1)"],["Window",d.maintenance_window||"—","var(--t3)"]].map(([l,v,c])=>(
            <div key={String(l)} className="kpi"><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:20,fontWeight:700,color:String(c)}}>{v}</span></div>
          ))}
        </div>
        {d.tasks?.length>0&&(<div><SL t="Maintenance Tasks"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8}}>
            <table className="dtable"><thead><tr><th>ID</th><th>Task</th><th>Priority</th><th>Duration</th><th>Skill</th></tr></thead>
              <tbody>{d.tasks.map((t:any)=>{const pc=t.priority==="HIGH"?"var(--red)":t.priority==="MED"||t.priority==="MEDIUM"?"var(--amber)":"var(--green)";return(
                <tr key={t.task_id}><td style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)"}}>{t.task_id}</td><td style={{color:"var(--t1)",fontSize:15}}>{t.description}</td>
                  <td><span style={{fontFamily:"var(--f-mono)",fontSize:12,fontWeight:600,color:pc}}>{t.priority}</span></td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t3)"}}>{t.duration_hours}h</td>
                  <td style={{fontSize:13,color:"var(--t4)"}}>{t.skill_required}</td></tr>
              );})}
            </tbody></table>
          </div>
        </div>)}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {d.inspection_checklist?.length>0&&(<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px"}}>
            <SL t="Inspection Checklist"/>
            {d.inspection_checklist.map((item:string,i:number)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{width:15,height:15,border:"1.5px solid var(--blue)",borderRadius:3,flexShrink:0,marginTop:2}}/>
                <span style={{fontSize:14,color:"var(--t2)"}}>{item}</span>
              </div>
            ))}
          </div>)}
          {d.safety_precautions?.length>0&&(<div style={{background:"var(--bg-2)",border:"1px solid rgba(245,158,11,0.2)",borderLeft:"3px solid var(--amber)",borderRadius:8,padding:"18px 22px"}}>
            <SL t="Safety Precautions"/>
            {d.safety_precautions.map((p:string,i:number)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                <span style={{fontSize:14,color:"var(--t2)"}}>{p}</span>
              </div>
            ))}
          </div>)}
        </div>
        {d.maintenance_narrative&&<AI text={d.maintenance_narrative}/>}
      </div>
    )}}
  </AgentPanel>;
}
