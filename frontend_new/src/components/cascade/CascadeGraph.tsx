"use client";
/**
 * CascadeGraph.tsx — Pure-SVG animated dependency graph
 * MachinaOracle · Cascade Intelligence Engine
 */
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GraphNode {
  id: string; label: string; type: string; health: number;
  is_root: boolean; is_affected: boolean; depth: number; impact_score: number;
}
interface GraphEdge { source: string; target: string; is_active: boolean; }
interface GraphData  { nodes: GraphNode[]; edges: GraphEdge[]; }
interface CascadeStep {
  step: number; machine_id: string; machine: string; machine_type: string;
  depth: number; impact_score: number; propagation_prob: number;
  estimated_downtime_hours: number;
}
interface Props {
  graphData: GraphData; propagationSteps: CascadeStep[];
  activeUpToStep: number; animationSpeed: number;
  onNodeClick?: (node: GraphNode) => void;
}

const NODE_W = 136, NODE_H = 54, COL_GAP = 176, ROW_GAP = 80;
const PAD_X = 50, PAD_Y = 44;

function computeLayout(nodes: GraphNode[]) {
  const byDepth = new Map<number, GraphNode[]>();
  nodes.forEach(n => {
    const d = n.depth >= 99 ? 5 : n.depth;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  });
  const pos = new Map<string, {x:number; y:number}>();
  const depths = Array.from(byDepth.keys()).sort((a,b)=>a-b);
  depths.forEach((depth, ci) => {
    const col = byDepth.get(depth)!;
    col.forEach((node, ri) => {
      pos.set(node.id, { x: PAD_X + ci*(NODE_W+COL_GAP), y: PAD_Y + ri*(NODE_H+ROW_GAP) });
    });
  });
  return pos;
}

function bezier(sx:number,sy:number,tx:number,ty:number){
  const cx=(sx+tx)/2;
  return `M ${sx} ${sy} C ${cx} ${sy} ${cx} ${ty} ${tx} ${ty}`;
}

function nodeColors(node: GraphNode, activeUpToStep: number, steps: CascadeStep[]) {
  if (node.is_root)
    return { fill:"#1a0505", stroke:"#EF4444", text:"#FCA5A5", glow:"red", active:true };
  const si = steps.findIndex(s => s.machine_id === node.id);
  const on = activeUpToStep === -1 ? node.is_affected : (si !== -1 && si < activeUpToStep);
  if (!on)
    return { fill:"#1C2333", stroke:"rgba(255,255,255,0.10)", text:"#64748B", glow:"", active:false };
  const sc = node.impact_score;
  if (sc > 70) return { fill:"#1a0505", stroke:"#EF4444", text:"#FCA5A5", glow:"red",   active:true };
  if (sc > 45) return { fill:"#1a0e03", stroke:"#F97316", text:"#FDBA74", glow:"orange", active:true };
  return       { fill:"#12160a", stroke:"#F59E0B", text:"#FCD34D", glow:"amber",  active:true };
}

function edgeActive(edge: GraphEdge, activeUpToStep: number, steps: CascadeStep[]) {
  if (!edge.is_active) return false;
  if (activeUpToStep === -1) return true;
  const si = steps.findIndex(s => s.machine_id === edge.source);
  const ti = steps.findIndex(s => s.machine_id === edge.target);
  const srcOk = edge.source.includes("root") || si === -1 || si < activeUpToStep;
  const tgtOk = ti !== -1 && ti < activeUpToStep;
  return srcOk && tgtOk;
}

function stepDelay(si: number, speed: number) {
  return si * (speed <= 1 ? 900 : speed >= 3 ? 200 : 480);
}

export default function CascadeGraph({ graphData, propagationSteps, activeUpToStep, animationSpeed, onNodeClick }: Props) {
  const [hov, setHov] = useState<{node:GraphNode; x:number; y:number}|null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, edges } = graphData;
  const layout = computeLayout(nodes);
  const allPos = Array.from(layout.values());
  const maxX = (allPos.length ? Math.max(...allPos.map(p=>p.x)) : 0) + NODE_W + PAD_X;
  const maxY = (allPos.length ? Math.max(...allPos.map(p=>p.y)) : 0) + NODE_H + PAD_Y;

  return (
    <div style={{ position:"relative", width:"100%", overflowX:"auto" }}>
      <svg ref={svgRef} width={maxX} height={maxY} style={{ display:"block", minWidth:"100%" }}>
        <defs>
          <filter id="gr" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="go" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ga" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="eg" x="-20%" y="-300%" width="140%" height="700%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#EF4444"/>
          </marker>
          <marker id="ai" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(255,255,255,0.08)"/>
          </marker>
          <radialGradient id="pg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#EF4444" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Grid */}
        {Array.from({length:Math.ceil(maxY/40)},(_,i)=>(
          <line key={`h${i}`} x1={0} y1={i*40} x2={maxX} y2={i*40} stroke="rgba(255,255,255,0.022)" strokeWidth={1}/>
        ))}
        {Array.from({length:Math.ceil(maxX/40)},(_,i)=>(
          <line key={`v${i}`} x1={i*40} y1={0} x2={i*40} y2={maxY} stroke="rgba(255,255,255,0.022)" strokeWidth={1}/>
        ))}

        {/* Column labels */}
        {Array.from(new Set(nodes.map(n=>n.depth>=99?5:n.depth))).sort().map(d=>{
          const col = nodes.filter(n=>(n.depth>=99?5:n.depth)===d);
          if(!col.length) return null;
          const fp = layout.get(col[0].id);
          if(!fp) return null;
          return(
            <text key={`cl${d}`} x={fp.x+NODE_W/2} y={18} textAnchor="middle"
              style={{fontFamily:"var(--f-mono)",fontSize:9.5,fill:"#3A4A5C",letterSpacing:"0.16em"}}>
              {d===0?"ROOT ORIGIN":`CASCADE HOP ${d}`}
            </text>
          );
        })}

        {/* Edges */}
        {edges.map((edge,i)=>{
          const sp=layout.get(edge.source), tp=layout.get(edge.target);
          if(!sp||!tp) return null;
          const sx=sp.x+NODE_W, sy=sp.y+NODE_H/2, tx=tp.x, ty=tp.y+NODE_H/2;
          const active = edgeActive(edge, activeUpToStep, propagationSteps);
          const si = propagationSteps.findIndex(s=>s.machine_id===edge.source);
          const delay = (si>=0?stepDelay(si,animationSpeed):0)/1000;
          return (
            <g key={`e${i}`}>
              {active&&(
                <motion.path d={bezier(sx,sy,tx,ty)} fill="none"
                  stroke="rgba(239,68,68,0.22)" strokeWidth={9} filter="url(#eg)"
                  initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}}
                  transition={{duration:0.55,delay:delay+0.05,ease:"easeOut"}}/>
              )}
              <motion.path d={bezier(sx,sy,tx,ty)} fill="none"
                stroke={active?"#EF4444":"rgba(255,255,255,0.06)"}
                strokeWidth={active?2:1.2}
                strokeDasharray={active?"none":"4 5"}
                markerEnd={`url(#a${active?"r":"i"})`}
                initial={active?{pathLength:0}:{}}
                animate={active?{pathLength:1}:{}}
                transition={{duration:0.5,delay,ease:"easeOut"}}/>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node=>{
          const pos=layout.get(node.id);
          if(!pos) return null;
          const {fill,stroke,text,glow,active}=nodeColors(node,activeUpToStep,propagationSteps);
          const si=propagationSteps.findIndex(s=>s.machine_id===node.id);
          const delay=(si>=0?stepDelay(si,animationSpeed):0)/1000;
          const filterMap:Record<string,string>={red:"url(#gr)",orange:"url(#go)",amber:"url(#ga)"};
          const filt = filterMap[glow]||undefined;

          return (
            <g key={node.id} style={{cursor:"pointer"}}
              onClick={()=>onNodeClick?.(node)}
              onMouseEnter={e=>{
                const svgRect=svgRef.current?.getBoundingClientRect();
                setHov({node,x:pos.x+NODE_W+12,y:pos.y});
              }}
              onMouseLeave={()=>setHov(null)}>

              {/* Pulse aura */}
              {active&&(
                <motion.ellipse cx={pos.x+NODE_W/2} cy={pos.y+NODE_H/2}
                  rx={NODE_W/2+10} ry={NODE_H/2+10}
                  fill={node.is_root?"url(#pg)":"rgba(239,68,68,0.1)"}
                  animate={{rx:[NODE_W/2+8,NODE_W/2+22,NODE_W/2+8],opacity:[0.9,0,0.9]}}
                  transition={{duration:node.is_root?1.4:2.1,repeat:Infinity,ease:"easeInOut",delay:delay+0.2}}/>
              )}

              {/* Body */}
              <motion.rect x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={6}
                fill={fill} stroke={stroke} strokeWidth={active?2:1}
                filter={filt}
                initial={{scale:0.82,opacity:0}}
                animate={{scale:1,opacity:1}}
                transition={{duration:0.38,delay,ease:[0.16,1,0.3,1]}}
                style={{transformOrigin:`${pos.x+NODE_W/2}px ${pos.y+NODE_H/2}px`}}/>

              {/* Left accent stripe */}
              <motion.rect x={pos.x} y={pos.y} width={4} height={NODE_H} rx={3}
                fill={node.is_root?"#EF4444":active
                  ?(node.impact_score>70?"#EF4444":node.impact_score>45?"#F97316":"#F59E0B")
                  :"rgba(255,255,255,0.06)"}
                initial={{opacity:0}} animate={{opacity:1}}
                transition={{delay:delay+0.1}}/>

              {/* Type initial */}
              <motion.text x={pos.x+18} y={pos.y+NODE_H/2+1}
                textAnchor="middle" dominantBaseline="middle"
                style={{fontFamily:"var(--f-cond)",fontSize:17,fontWeight:700,
                  fill:node.is_root?"#EF4444":active?"#F97316":"#3A4A5C"}}
                initial={{opacity:0}} animate={{opacity:1}}
                transition={{delay:delay+0.15}}>
                {(node.type||"M")[0].toUpperCase()}
              </motion.text>

              {/* Machine name */}
              <motion.text x={pos.x+32} y={pos.y+19}
                style={{fontFamily:"var(--f-sans)",fontSize:11.5,fontWeight:600,fill:text}}
                initial={{opacity:0}} animate={{opacity:1}}
                transition={{delay:delay+0.18}}>
                {node.label.length>15?node.label.slice(0,14)+"…":node.label}
              </motion.text>

              {/* Sub-label */}
              <motion.text x={pos.x+32} y={pos.y+34}
                style={{fontFamily:"var(--f-mono)",fontSize:9,fill:"#475569"}}
                initial={{opacity:0}} animate={{opacity:1}}
                transition={{delay:delay+0.22}}>
                {node.is_root?"ROOT FAILURE":active?`IMPACT ${node.impact_score}%`:node.type?.slice(0,14)||"UNIT"}
              </motion.text>

              {/* Health bar track */}
              <motion.rect x={pos.x+32} y={pos.y+NODE_H-7} width={NODE_W-44} height={2.5} rx={1.2}
                fill="rgba(255,255,255,0.06)"
                initial={{opacity:0}} animate={{opacity:1}} transition={{delay:delay+0.28}}/>
              {/* Health bar fill */}
              <motion.rect x={pos.x+32} y={pos.y+NODE_H-7} height={2.5} rx={1.2}
                fill={node.health>70?"#22C55E":node.health>40?"#F59E0B":"#EF4444"}
                initial={{width:0}}
                animate={{width:(NODE_W-44)*node.health/100}}
                transition={{duration:0.9,delay:delay+0.38,ease:[0.16,1,0.3,1]}}/>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hov&&(
          <motion.div initial={{opacity:0,y:4,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0}}
            style={{position:"absolute",left:hov.x,top:hov.y,zIndex:999,pointerEvents:"none",
              background:"#0C0E13",border:"1px solid rgba(255,255,255,0.14)",borderRadius:8,
              padding:"12px 14px",minWidth:210}}>
            <p style={{fontFamily:"var(--f-cond)",fontSize:15,fontWeight:700,color:"#F1F5F9",marginBottom:8}}>
              {hov.node.label}
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
              {([
                ["Type",    hov.node.type||"—"],
                ["Health",  `${hov.node.health.toFixed(0)}/100`],
                ["Impact",  hov.node.is_root?"ROOT ORIGIN":`${hov.node.impact_score}%`],
                ["Depth",   hov.node.is_root?"Origin":`Hop ${hov.node.depth}`],
                ...(() => {
                  const s=propagationSteps.find(x=>x.machine_id===hov.node.id);
                  return s?[["Downtime",`${s.estimated_downtime_hours}h`],["Probability",`${s.propagation_prob}%`]]:[];
                })()
              ] as [string,string][]).map(([k,v])=>(
                <div key={k}>
                  <div style={{fontFamily:"var(--f-mono)",fontSize:9.5,color:"#475569",letterSpacing:"0.1em"}}>{k}</div>
                  <div style={{fontFamily:"var(--f-mono)",fontSize:12,color:"#CBD5E1",fontWeight:500}}>{v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
