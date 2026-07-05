"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getRootCause } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function RootCauseTab({sessionId,machineId}:P){
  return(
    <AgentPanel agentName="Root Cause Analysis" fetchFn={()=>getRootCause(sessionId,machineId)} cacheKey={`rca_${sessionId}_${machineId}`}>
      {(d)=>(
        <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
          <div style={{background:"var(--bg-2)",border:"1px solid rgba(239,68,68,0.22)",borderLeft:"4px solid var(--red)",borderRadius:8,padding:"22px 26px"}}>
            <SL t="Root Cause Identified"/>
            <h3 style={{fontFamily:"var(--f-sans)",fontSize:19,fontWeight:600,color:"var(--t1)",marginBottom:10,lineHeight:1.35}}>{d.primary_root_cause}</h3>
            <span className={`badge ${bc(d.cause_category||"")}`}>{(d.cause_category||"Unknown").toUpperCase()}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {d.contributing_factors?.length>0&&(
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px"}}>
                <SL t="Contributing Factors"/>
                {d.contributing_factors.map((f:any,i:number)=>{
                  const ic=f.impact==="HIGH"?"var(--red)":f.impact==="MEDIUM"?"var(--amber)":"var(--green)";
                  return(
                    <div key={i} style={{paddingBottom:13,borderBottom:"1px solid rgba(255,255,255,0.04)",marginBottom:13}}>
                      <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:4}}>
                        <span style={{fontFamily:"var(--f-mono)",fontSize:11,fontWeight:600,color:ic,letterSpacing:"0.1em"}}>{f.impact}</span>
                        <span style={{fontSize:15,fontWeight:500,color:"var(--t1)"}}>{f.factor}</span>
                      </div>
                      <p style={{fontSize:13,color:"var(--t4)"}}>{f.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {d.causal_chain?.length>0&&(
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px"}}>
                <SL t="Causal Chain"/>
                {d.causal_chain.map((c:any,i:number)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <div style={{width:26,height:26,background:"var(--blue-muted)",border:"1px solid rgba(59,130,246,0.35)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--f-mono)",fontSize:12,fontWeight:600,color:"var(--blue-light)"}}>{c.step}</div>
                      {i<d.causal_chain.length-1&&<div style={{width:1,height:16,background:"rgba(59,130,246,0.18)",margin:"2px 0"}}/>}
                    </div>
                    <div style={{paddingBottom:12}}>
                      <p style={{fontSize:14,color:"var(--t1)"}}>{c.event}</p>
                      {c.consequence&&<p style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t4)",marginTop:3}}>→ {c.consequence}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {d.corrective_actions?.length>0&&(
            <div>
              <SL t="Corrective Actions"/>
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8}}>
                <table className="dtable">
                  <thead><tr><th>Action</th><th>Priority</th><th>Timeline</th></tr></thead>
                  <tbody>{d.corrective_actions.map((a:any,i:number)=>{
                    const pc=a.priority==="HIGH"?"var(--red)":a.priority==="MEDIUM"?"var(--amber)":"var(--green)";
                    return<tr key={i}><td style={{color:"var(--t1)",fontSize:15}}>{a.action}</td><td><span style={{fontFamily:"var(--f-mono)",fontSize:12,fontWeight:600,color:pc}}>{a.priority}</span></td><td style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t3)"}}>{a.timeline}</td></tr>;
                  })}</tbody>
                </table>
              </div>
            </div>
          )}
          {d.rca_narrative&&<AI text={d.rca_narrative}/>}
        </div>
      )}
    </AgentPanel>
  );
}
