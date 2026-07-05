"use client";
import AgentPanel from "@/components/ui/AgentPanel";
import { getCostAnalysis } from "@/lib/api";
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,Cell } from "recharts";

function rc(v:string|number):string{if(typeof v==="number"){if(v>75)return"var(--red)";if(v>50)return"var(--orange)";if(v>25)return"var(--amber)";return"var(--green)"}const s=(v||"").toLowerCase();if(s.includes("crit"))return"var(--red)";if(s.includes("high"))return"var(--orange)";if(s.includes("med"))return"var(--amber)";return"var(--green)"}
function bc(l:string):string{const s=(l||"").toLowerCase();if(s.includes("crit"))return"b-red";if(s.includes("high"))return"b-orange";if(s.includes("med"))return"b-amber";return"b-green"}
function $$(n:number):string{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0)}
function SL({t}:{t:string}){return<p className="slabel" style={{marginBottom:14}}>{t}</p>}
function PB({v,c}:{v:number;c?:string}){const col=c||rc(v);return<div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:col}}/></div>}
function AI({text}:{text:string}){return<div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderLeft:"3px solid var(--blue)",borderRadius:8,padding:"18px 22px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--blue-light)",letterSpacing:"0.14em",marginBottom:10}}>AI ANALYSIS · GEMINI 2.5 FLASH</p><p style={{fontSize:15,color:"var(--t2)",lineHeight:1.75}}>{text}</p></div>}
const TT=({active,payload,label}:any)=>active&&payload?.[0]?<div style={{background:"var(--bg-4)",border:"1px solid var(--bd-2)",borderRadius:6,padding:"8px 12px"}}><p style={{fontFamily:"var(--f-mono)",fontSize:11,color:"var(--t4)",marginBottom:3}}>{label}</p><p style={{fontFamily:"var(--f-mono)",fontSize:13,color:"var(--t1)",fontWeight:600}}>{payload[0].value}</p></div>:null;

interface P{sessionId:string;machineId:string}
export default function CostTab({sessionId,machineId}:P){
  return<AgentPanel agentName="Cost Analysis" fetchFn={()=>getCostAnalysis(sessionId,machineId)} cacheKey={`cost_${sessionId}_${machineId}`}>
    {(d)=>(
      <div style={{padding:"30px 26px",display:"flex",flexDirection:"column",gap:22}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[["Repair Now",$$(d.immediate_repair_cost),"var(--green)"],["If Fails",$$(d.failure_replacement_cost),"var(--red)"],["Downtime/Hr",$$(d.downtime_cost_per_hour),"var(--orange)"],["Preventive ROI",d.roi_of_preventive_maintenance,"var(--blue-light)"]].map(([l,v,c])=>(
            <div key={String(l)} className="kpi"><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:22,fontWeight:700,color:String(c)}}>{v}</span></div>
          ))}
        </div>
        {d.cost_comparison&&(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Fix Now",d.cost_comparison.fix_now,"var(--green)"],["Fix Later",d.cost_comparison.fix_later,"var(--red)"],["Savings",$$(d.cost_comparison.savings_by_acting_now),"var(--blue-light)"]].map(([l,v,c])=>(
            <div key={String(l)} className="kpi" style={{textAlign:"center"}}><p className="kpi-label">{l}</p><span style={{fontFamily:"var(--f-cond)",fontSize:26,fontWeight:700,color:String(c)}}>{typeof v==="number"?$$(v):v}</span></div>
          ))}
        </div>)}
        {d.cost_breakdown?.length>0&&(<div><SL t="Cost Breakdown"/>
          <div style={{background:"var(--bg-2)",border:"1px solid var(--bd-1)",borderRadius:8,padding:"18px",height:260}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.cost_breakdown} barSize={34}>
                <XAxis dataKey="category" tick={{fill:"var(--t4)",fontSize:12,fontFamily:"var(--f-mono)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"var(--t4)",fontSize:11,fontFamily:"var(--f-mono)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<TT/>} cursor={{fill:"rgba(255,255,255,0.03)"}}/>
                <Bar dataKey="amount" radius={[4,4,0,0]}>
                  {d.cost_breakdown.map((_:any,i:number)=>(
                    <Cell key={i} fill={["#3B82F6","#22C55E","#EF4444","#F59E0B","#8B5CF6"][i%5]} fillOpacity={0.85}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>)}
        {d.cost_narrative&&<AI text={d.cost_narrative}/>}
      </div>
    )}
  </AgentPanel>;
}
