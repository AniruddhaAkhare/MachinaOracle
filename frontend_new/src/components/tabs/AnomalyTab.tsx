"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getAnomaly } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function AnomalyTab({sessionId,machineId}:P){
  return<AgentPanel agentType="anomaly" sessionId={sessionId} machineId={machineId} agentName="Anomaly Detection" fetchFn={()=>getAnomaly(sessionId,machineId)} cacheKey={`anom_${sessionId}_${machineId}`}>
    {(d)=>(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[["Anomaly Score",`${d.anomaly_score}/100`,rc(d.anomaly_score||0)],["Baseline Dev.",d.baseline_deviation||"—","var(--amber)"],["ML Confidence",`${d.ml_confidence}%`,"var(--t1)"],["FP Risk",`${d.false_positive_probability}%`,"var(--t3)"]].map(([l,v,c])=>(
            <div key={String(l)} className="kpi"><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:24,fontWeight:700,color:String(c)}}>{v}</span></div>
          ))}
        </div>
        {d.anomalies_detected?.length>0&&(<div><SL t="Detected Anomalies"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,overflow:"hidden"}}>
            {d.anomalies_detected.map((a:any)=>{const sc=rc(a.severity||"");return(
              <div key={a.anomaly_id} className="log-entry" style={{borderLeft:`3px solid ${sc}`}}>
                <div style={{flexShrink:0}}><span className={`badge ${bc(a.severity||"")}`}>{a.severity}</span>
                  <p style={{fontFamily:"var(--f-mono)",fontSize:10,color:"var(--t5)",marginTop:5}}>{a.anomaly_id}</p>
                </div>
                <div style={{flex:1}}>
                  <span style={{fontSize:15,fontWeight:600,color:"var(--t1)"}}>{a.description}</span>
                  <div style={{display:"flex",gap:14,marginTop:5,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t5)"}}>Sensor: {a.sensor}</span>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:11,color:sc}}>Value: {a.value_detected}</span>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t5)"}}>Expected: {a.expected_range}</span>
                    <span style={{fontFamily:"var(--f-mono)",fontSize:11,color:sc}}>Deviation: {a.deviation_percentage}%</span>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>)}
        {d.pattern_analysis&&(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Trend",d.pattern_analysis.trend],["Seasonality",d.pattern_analysis.seasonality],["Cycles",d.pattern_analysis.cycles]].map(([l,v])=>(
            <div key={String(l)} className="kpi"><p className="kpi-label">{l}</p><p style={{fontSize:16,color:"var(--t1)",textTransform:"capitalize",marginTop:8}}>{v}</p></div>
          ))}
        </div>)}
        {d.anomaly_narrative&&<AI text={d.anomaly_narrative}/>}
      </div>
    )}
  </AgentPanel>;
}
