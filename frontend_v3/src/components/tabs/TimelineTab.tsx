"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getTimeline } from "@/lib/api";
import { LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,ReferenceLine } from "recharts";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function TimelineTab({sessionId,machineId}:P){
  return<AgentPanel agentName="Failure Timeline" fetchFn={()=>getTimeline(sessionId,machineId)} cacheKey={`tl_${sessionId}_${machineId}`}>
    {(d)=>(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        {d.failure_window&&(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Earliest",d.failure_window.earliest,"var(--red)"],["Most Likely",d.failure_window.most_likely,"var(--orange)"],["Latest",d.failure_window.latest,"var(--amber)"]].map(([l,v,c])=>(
            <div key={String(l)} className="kpi" style={{textAlign:"center"}}><p className="kpi-label">{l}</p>
              <span style={{fontFamily:"var(--f-cond)",fontSize:48,fontWeight:800,color:String(c)}}>{v}</span>
              <p className="kpi-sub">DAYS</p>
            </div>
          ))}
        </div>)}
        {d.degradation_curve?.length>0&&(<div><SL t="Health Degradation Curve"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px 18px 10px",height:300}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.degradation_curve}>
                <XAxis dataKey="day" tick={{fill:"var(--t4)",fontSize:12,fontFamily:"var(--f-mono)"}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{fill:"var(--t4)",fontSize:11,fontFamily:"var(--f-mono)"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<TT/>}/>
                {d.critical_threshold_day&&<ReferenceLine x={d.critical_threshold_day} stroke="var(--red)" strokeDasharray="6 3" strokeOpacity={0.5} label={{value:"Critical",fill:"var(--red)",fontSize:11,fontFamily:"var(--f-mono)"}}/>}
                <Line type="monotone" dataKey="health_score" stroke="var(--green)" strokeWidth={2} dot={false} name="Health %"/>
                <Line type="monotone" dataKey="failure_probability" stroke="var(--red)" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Failure %"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>)}
        {d.timeline_events?.length>0&&(<div><SL t="Predicted Events"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8}}>
            <table className="dtable">
              <thead><tr><th>Day</th><th>Event</th><th>Component</th><th>Severity</th><th>Probability</th></tr></thead>
              <tbody>{d.timeline_events.map((e:any,i:number)=>{
                const sb=e.severity==="CRITICAL"?"b-red":e.severity==="WARNING"?"b-amber":"b-gray";
                return<tr key={i}>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--amber)",fontWeight:600}}>Day {e.day}</td>
                  <td style={{color:"var(--t1)",fontSize:15}}>{e.event}</td>
                  <td style={{fontSize:13,color:"var(--t4)"}}>{e.component}</td>
                  <td><span className={`badge ${sb}`}>{e.severity}</span></td>
                  <td style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t3)"}}>{e.probability}%</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>)}
        {d.timeline_narrative&&<AI text={d.timeline_narrative}/>}
      </div>
    )}
  </AgentPanel>;
}
