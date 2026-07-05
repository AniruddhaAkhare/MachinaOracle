"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getStrategy } from "@/lib/api";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function StrategyTab({sessionId,machineId}:P){
  return<AgentPanel agentName="Strategy Optimizer" fetchFn={()=>getStrategy(sessionId,machineId)} cacheKey={`strat_${sessionId}_${machineId}`}>
    {(d)=>(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{background:"var(--bg-2)",border:"1px solid rgba(59,130,246,0.22)",borderLeft:"4px solid var(--blue)",borderRadius:8,padding:"22px 26px"}}>
          <SL t="Recommended Strategy"/>
          <h3 style={{fontFamily:"var(--f-cond)",fontSize:26,fontWeight:700,color:"var(--t1)",marginBottom:8}}>{d.recommended_strategy}</h3>
          <p style={{fontSize:15,color:"var(--t3)"}}>{d.strategy_rationale}</p>
        </div>
        {d.expected_outcomes&&(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Downtime Reduction",d.expected_outcomes.downtime_reduction],["Annual Savings",d.expected_outcomes.cost_savings],["Lifespan Extension",d.expected_outcomes.lifespan_extension]].map(([l,v])=>(
            <div key={String(l)} className="kpi" style={{textAlign:"center"}}><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:22,fontWeight:700,color:"var(--blue-light)"}}>{v}</span></div>
          ))}
        </div>)}
        {d.kpis?.length>0&&(<div><SL t="KPI Targets"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8}}>
            <table className="dtable">
              <thead><tr><th>KPI</th><th>Current</th><th>Target</th><th>Improvement</th></tr></thead>
              <tbody>{d.kpis.map((k:any,i:number)=>(
                <tr key={i}><td style={{color:"var(--t1)",fontSize:15}}>{k.kpi}</td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--t3)"}}>{k.current}</td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--blue-light)",fontWeight:600}}>{k.target}</td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--green)",fontWeight:600}}>{k.improvement}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>)}
        {d.implementation_roadmap?.length>0&&(<div><SL t="Roadmap"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {d.implementation_roadmap.map((p:any,i:number)=>(
              <div key={i} style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"15px 18px",display:"grid",gridTemplateColumns:"auto 1fr auto",gap:14,alignItems:"start"}}>
                <div style={{width:30,height:30,background:"var(--blue-muted)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--f-mono)",fontSize:13,fontWeight:600,color:"var(--blue-light)"}}>{i+1}</div>
                <div><p style={{fontSize:15,fontWeight:600,color:"var(--t1)",marginBottom:5}}>{p.phase}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{p.actions?.map((a:string,j:number)=>(
                    <span key={j} style={{fontSize:12,color:"var(--t4)",background:"rgba(255,255,255,0.04)",border:"1px solid var(--bd-1)",borderRadius:3,padding:"2px 6px"}}>{a}</span>
                  ))}</div>
                </div>
                <div style={{textAlign:"right"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)"}}>{p.duration}</p>
                  {p.investment&&<p style={{fontFamily:"var(--f-mono)",fontSize:12,color:"var(--green)",marginTop:2}}>{$$(p.investment)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>)}
        {d.strategy_narrative&&<AI text={d.strategy_narrative}/>}
      </div>
    )}
  </AgentPanel>;
}
