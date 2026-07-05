"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { predictFailure } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function FailureTab({sessionId,machineId}:P){
  return(
    <AgentPanel agentName="Failure Prediction" fetchFn={()=>predictFailure(sessionId,machineId)} cacheKey={`fail_${sessionId}_${machineId}`}>
      {(d)=>{const c=rc(d.failure_risk_level||"");return(
        <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
          {/* Risk banner */}
          <div style={{background:"var(--bg-2)",border:`1px solid ${c}40`,borderLeft:`4px solid ${c}`,borderRadius:8,padding:"26px 30px",display:"flex",flexWrap:"wrap",gap:28,alignItems:"center"}}>
            <div>
              <p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",letterSpacing:"0.13em",marginBottom:8}}>FAILURE PROBABILITY</p>
              <div style={{fontFamily:"var(--f-cond)",fontSize:68,fontWeight:800,color:c,lineHeight:1,letterSpacing:"-0.02em"}}>{d.failure_probability}<span style={{fontSize:30}}>%</span></div>
              <span className={`badge ${bc(d.failure_risk_level||"")} `} style={{marginTop:10,display:"inline-flex"}}>{d.failure_risk_level}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,flex:1,minWidth:320}}>
              {[["DAYS TO FAILURE",d.estimated_days_to_failure??"N/A","var(--t1)"],["CONFIDENCE",`${d.confidence_score}%`,"var(--blue-light)"],["HEALTH SCORE",`${d.health_score}/100`,rc(100-(d.health_score||50))],["PRIMARY MODE",(d.primary_failure_mode||"").slice(0,28),"var(--t2)"]].map(([l,v,col])=>(
                <div key={String(l)} className="kpi" style={{background:"var(--bg-3)"}}>
                  <p className="kpi-label">{l}</p>
                  <span style={{fontFamily:"var(--f-cond)",fontSize:24,fontWeight:700,color:String(col)}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Component risks */}
          {d.component_risks?.length>0&&(
            <div>
              <SL t="Component Risk Matrix"/>
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
                {d.component_risks.map((cr:any,i:number)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontFamily:"var(--f-sans)",fontSize:15,fontWeight:500,color:"var(--t1)"}}>{cr.component}</span>
                      <span className={`badge ${bc(cr.risk_score>75?"critical":cr.risk_score>50?"high":"medium")}`}>{cr.risk_score}%</span>
                    </div>
                    <PB v={cr.risk_score}/>
                    {cr.reason&&<p style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t4)",marginTop:5}}>{cr.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {d.failure_indicators?.length>0&&(
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px"}}>
                <SL t="Failure Indicators"/>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {d.failure_indicators.map((ind:string,i:number)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                      <span style={{fontSize:14,color:"var(--t2)",lineHeight:1.5}}>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d.sensor_anomalies?.length>0&&(
              <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 22px"}}>
                <SL t="Sensor Status"/>
                {d.sensor_anomalies.map((sa:any,i:number)=>{
                  const sc=sa.status==="critical"?"var(--red)":sa.status==="warning"?"var(--amber)":"var(--green)";
                  const sb=sa.status==="critical"?"b-red":sa.status==="warning"?"b-amber":"b-green";
                  return(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <span style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)"}}>{sa.sensor}</span>
                      <div style={{display:"flex",gap:9,alignItems:"center"}}>
                        <span style={{fontFamily:"var(--f-cond)",fontSize:18,fontWeight:700,color:sc}}>{sa.current_value}</span>
                        <span className={`badge ${sb}`}>{sa.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {d.ai_explanation&&<AI text={d.ai_explanation}/>}
        </div>
      )}}
    </AgentPanel>
  );
}
