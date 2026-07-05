"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getAlerts } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
const SC:Record<string,string>={CRITICAL:"var(--red)",HIGH:"var(--orange)",MEDIUM:"var(--amber)",LOW:"var(--green)",INFO:"var(--blue-light)"};
const SB:Record<string,string>={CRITICAL:"b-red",HIGH:"b-orange",MEDIUM:"b-amber",LOW:"b-green",INFO:"b-blue"};
export default function AlertsTab({sessionId,machineId}:P){
  return<AgentPanel agentName="Smart Alert Agent" fetchFn={()=>getAlerts(sessionId,machineId)} cacheKey={`alerts_${sessionId}_${machineId}`}>
    {(d)=>(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:14}}>
          <div className="kpi" style={{minWidth:170}}>
            <p className="kpi-label">System Status</p>
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
              <span className={`pulse ${d.overall_status==="EMERGENCY"||d.overall_status==="WARNING"?"p-red":"p-green"}`} style={{width:9,height:9,display:"inline-block"}}/>
              <span style={{fontFamily:"var(--f-cond)",fontSize:20,fontWeight:700,color:SC[d.overall_status]||"var(--t1)"}}>{d.overall_status}</span>
            </div>
          </div>
          {d.alert_summary&&(<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {Object.entries(d.alert_summary).map(([k,v])=>(
              <div key={k} className="kpi"><p className="kpi-label">{k}</p><span style={{fontFamily:"var(--f-cond)",fontSize:28,fontWeight:700,color:SC[k.toUpperCase()]||"var(--t3)"}}>{String(v)}</span></div>
            ))}
          </div>)}
        </div>
        {d.active_alerts?.length>0&&(<div><SL t={`Active Alerts — ${d.active_alerts.length}`}/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,overflow:"hidden"}}>
            {d.active_alerts.map((a:any)=>{
              const ac=SC[a.severity]||"var(--t2)";
              return(
                <div key={a.alert_id} className="log-entry" style={{borderLeft:`3px solid ${ac}`}}>
                  <div style={{flexShrink:0,minWidth:80}}>
                    <span className={`badge ${SB[a.severity]||"b-gray"}`}>{a.severity}</span>
                    <p style={{fontFamily:"var(--f-mono)",fontSize:10,color:"var(--t5)",marginTop:5}}>{a.timestamp}</p>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
                      <span style={{fontFamily:"var(--f-sans)",fontSize:15,fontWeight:600,color:"var(--t1)"}}>{a.title}</span>
                      {a.auto_escalate&&<span className="badge b-red" style={{fontSize:9}}>AUTO-ESCALATE</span>}
                    </div>
                    <p style={{fontSize:13,color:"var(--t3)",lineHeight:1.5,marginBottom:5}}>{a.message}</p>
                    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                      {a.component&&<span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t5)"}}>Component: {a.component}</span>}
                      {a.triggered_by&&<span style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t5)"}}>Trigger: {a.triggered_by}</span>}
                    </div>
                    {a.action_required&&<p style={{fontSize:13,color:ac,marginTop:6}}>→ {a.action_required}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>)}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {d.sms_alert&&(<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"16px 20px"}}><SL t="SMS Alert"/><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t2)",lineHeight:1.7}}>{d.sms_alert}</p></div>)}
          {d.email_subject&&(<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"16px 20px"}}><SL t="Email Subject"/><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t2)"}}>{d.email_subject}</p></div>)}
        </div>
      </div>
    )}
  </AgentPanel>;
}
