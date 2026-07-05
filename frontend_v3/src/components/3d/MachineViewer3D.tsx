"use client";
import { useRef, useState, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Grid, Line } from "@react-three/drei";
import * as THREE from "three";

// ─── Risk color mapping: enterprise steel palette ─────────────────
function rHex(v: number): string {
  if (v > 75) return "#EF4444";   // critical red
  if (v > 50) return "#F97316";   // high orange
  if (v > 25) return "#F59E0B";   // medium amber
  return "#22C55E";                // low green
}
function rLabel(v: number): string {
  if (v > 75) return "CRITICAL"; if (v > 50) return "HIGH"; if (v > 25) return "MEDIUM"; return "NOMINAL";
}

// ─── Annotation callout (blueprint style) ─────────────────────────
function Callout({ position, label, value, risk }: { position:[number,number,number]; label:string; value:string; risk:number }) {
  const [hov, setHov] = useState(false);
  const col = rHex(risk);
  return (
    <group position={position}>
      <mesh><sphereGeometry args={[0.035,8,8]}/><meshBasicMaterial color={col}/></mesh>
      <Line points={[[0,0,0],[0.35,0.35,0]]} color={col} lineWidth={0.7}/>
      <Html position={[0.37,0.37,0]} center={false}>
        <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
          style={{ background:"rgba(16,19,26,0.96)", border:`1px solid ${col}55`, padding: hov?"6px 10px":"4px 8px",
            minWidth:96, transition:"all 0.15s", pointerEvents:"auto", borderRadius:3 }}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:col,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:2}}>{label}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#F1F5F9",fontWeight:500}}>{value}</div>
          {hov && (
            <div style={{marginTop:4}}>
              <div style={{height:2,background:"rgba(255,255,255,0.08)",borderRadius:1}}>
                <div style={{height:"100%",width:`${risk}%`,background:col,borderRadius:1,transition:"width 0.3s"}}/>
              </div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:col,marginTop:2}}>{rLabel(risk)}</div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── Wire overlay ──────────────────────────────────────────────────
function Wire({ geo, col, op=0.18 }: { geo: THREE.BufferGeometry; col: string; op?: number }) {
  return <mesh><primitive object={geo}/><meshBasicMaterial color={col} wireframe transparent opacity={op}/></mesh>;
}

// ─── Animated threat highlight ring ────────────────────────────────
function ThreatRing({ risk, radius }: { risk: number; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const col = rHex(risk);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.scale.setScalar(1 + Math.sin(t * (risk > 75 ? 3 : risk > 50 ? 2 : 1.5)) * 0.04);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = risk > 25 ? 0.25 + Math.sin(t*2)*0.12 : 0;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.025, 8, 48]}/>
      <meshBasicMaterial color={col} transparent opacity={0.25}/>
    </mesh>
  );
}

// ─── PUMP MODEL ────────────────────────────────────────────────────
function PumpModel({ risks }: { risks: Record<string,number> }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(clock.getElapsedTime()*0.18)*0.05;
  });
  const pts = useMemo(() => [
    new THREE.Vector2(0,-1.15), new THREE.Vector2(0.65,-1.15),
    new THREE.Vector2(0.72,-0.75), new THREE.Vector2(0.88,-0.38),
    new THREE.Vector2(0.97,0),    new THREE.Vector2(0.88,0.38),
    new THREE.Vector2(0.72,0.68), new THREE.Vector2(0.48,0.88),
    new THREE.Vector2(0.28,0.97), new THREE.Vector2(0,0.97),
  ], []);
  const lathe = useMemo(() => new THREE.LatheGeometry(pts,32), [pts]);
  return (
    <group ref={groupRef}>
      <mesh><primitive object={lathe}/><meshStandardMaterial color="#1a1e2c" metalness={0.88} roughness={0.28} emissive={rHex(risks.casing||15)} emissiveIntensity={0.05}/></mesh>
      <Wire geo={lathe} col={rHex(risks.casing||15)} op={0.16}/>
      <ThreatRing risk={risks.casing||15} radius={1.05}/>
      {/* Inlet pipe */}
      <mesh position={[-1.75,0,0]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[0.2,0.2,2.1,24]}/><meshStandardMaterial color="#141822" metalness={0.9} roughness={0.22}/>
      </mesh>
      <mesh position={[-1.75,0,0]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[0.2,0.2,2.1,24]}/><meshBasicMaterial color={rHex(risks.inlet||15)} wireframe transparent opacity={0.14}/>
      </mesh>
      {/* Outlet pipe */}
      <mesh position={[0,1.75,0]}>
        <cylinderGeometry args={[0.18,0.18,1.5,24]}/><meshStandardMaterial color="#141822" metalness={0.9} roughness={0.22} emissive={rHex(risks.outlet||20)} emissiveIntensity={0.07}/>
      </mesh>
      <ThreatRing risk={risks.outlet||20} radius={0.19}/>
      {/* Impeller */}
      <mesh rotation={[0,Math.PI/4,0]}>
        <torusGeometry args={[0.52,0.07,8,6]}/><meshStandardMaterial color={rHex(risks.impeller||55)} metalness={0.8} roughness={0.3} emissive={rHex(risks.impeller||55)} emissiveIntensity={0.28} transparent opacity={0.85}/>
      </mesh>
      <ThreatRing risk={risks.impeller||55} radius={0.65}/>
      {/* Bearing */}
      <mesh position={[0,-1.45,0]}>
        <cylinderGeometry args={[0.35,0.35,0.48,24]}/><meshStandardMaterial color="#0f1119" metalness={0.9} roughness={0.22} emissive={rHex(risks.bearing||72)} emissiveIntensity={0.22}/>
      </mesh>
      <Wire geo={new THREE.CylinderGeometry(0.35,0.35,0.48,24)} col={rHex(risks.bearing||72)} op={0.32}/>
      <ThreatRing risk={risks.bearing||72} radius={0.42}/>
      {/* Bolts */}
      {[0,Math.PI/2,Math.PI,3*Math.PI/2].map((a,i)=>(
        <mesh key={i} position={[Math.cos(a)*0.82,-1.58,Math.sin(a)*0.82]}>
          <cylinderGeometry args={[0.038,0.038,0.22,8]}/><meshStandardMaterial color="#2a3042" metalness={1} roughness={0.12}/>
        </mesh>
      ))}
      {/* Seal ring */}
      <mesh position={[0,0.78,0]}>
        <torusGeometry args={[0.5,0.038,8,32]}/><meshStandardMaterial color={rHex(risks.seal||40)} metalness={0.7} roughness={0.38} emissive={rHex(risks.seal||40)} emissiveIntensity={0.22}/>
      </mesh>
      <ThreatRing risk={risks.seal||40} radius={0.52}/>
      <Callout position={[1.05,0.75,0.45]} label="Impeller" value={`Risk: ${risks.impeller||55}%`} risk={risks.impeller||55}/>
      <Callout position={[0.95,-1.55,0.45]} label="Main Bearing" value={`Risk: ${risks.bearing||72}%`} risk={risks.bearing||72}/>
      <Callout position={[-1.35,0.6,0.45]} label="Inlet Pipe" value="Nominal" risk={15}/>
      <Callout position={[0.55,2.1,0.45]} label="Outlet" value={`Risk: ${risks.outlet||20}%`} risk={risks.outlet||20}/>
    </group>
  );
}

// ─── MOTOR MODEL ───────────────────────────────────────────────────
function MotorModel({ risks }: { risks: Record<string,number> }) {
  const shaftRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (shaftRef.current) shaftRef.current.rotation.z = clock.getElapsedTime()*2.2;
  });
  return (
    <group>
      <mesh><cylinderGeometry args={[1.08,1.08,2.75,32]}/><meshStandardMaterial color="#141822" metalness={0.86} roughness={0.3} emissive={rHex(risks.stator||28)} emissiveIntensity={0.06}/></mesh>
      <mesh><cylinderGeometry args={[1.08,1.08,2.75,32]}/><meshBasicMaterial color={rHex(risks.stator||28)} wireframe transparent opacity={0.14}/></mesh>
      <ThreatRing risk={risks.stator||28} radius={1.15}/>
      {[-1,1].map((s,i)=>(
        <group key={i} position={[0,s*1.45,0]}>
          <mesh><cylinderGeometry args={[1.08,1.08,0.18,32]}/><meshStandardMaterial color="#0f1119" metalness={0.92} roughness={0.18}/></mesh>
          <mesh><cylinderGeometry args={[0.26,0.26,0.16,16]}/><meshStandardMaterial color="#1a1e2c" metalness={0.94} roughness={0.14} emissive={rHex(risks.bearing||68)} emissiveIntensity={0.3}/></mesh>
          <ThreatRing risk={risks.bearing||68} radius={0.3}/>
        </group>
      ))}
      <mesh ref={shaftRef} position={[0,2.0,0]}><cylinderGeometry args={[0.11,0.11,0.9,16]}/><meshStandardMaterial color="#2a3042" metalness={1} roughness={0.05}/></mesh>
      {[...Array(8)].map((_,i)=>{
        const a=(i/8)*Math.PI*2;
        return<mesh key={i} position={[Math.cos(a)*1.12,0,Math.sin(a)*1.12]} rotation={[0,a,0]}>
          <boxGeometry args={[0.07,2.35,0.38]}/><meshStandardMaterial color="#0a0c12" metalness={0.88} roughness={0.32}/>
        </mesh>;
      })}
      <mesh position={[0,0,-1.28]}>
        <boxGeometry args={[0.65,0.48,0.22]}/><meshStandardMaterial color="#141822" metalness={0.8} roughness={0.4}/>
      </mesh>
      <Callout position={[1.45,1.1,0.55]} label="Stator Winding" value={`Risk: ${risks.stator||28}%`} risk={risks.stator||28}/>
      <Callout position={[1.45,-1.38,0.55]} label="Front Bearing" value={`Risk: ${risks.bearing||68}%`} risk={risks.bearing||68}/>
      <Callout position={[0.55,2.3,0.45]} label="Drive Shaft" value="Nominal" risk={12}/>
    </group>
  );
}

// ─── TURBINE MODEL ─────────────────────────────────────────────────
function TurbineModel({ risks }: { risks: Record<string,number> }) {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bladeRef.current) bladeRef.current.rotation.y = clock.getElapsedTime()*1.6;
  });
  return (
    <group>
      <mesh><cylinderGeometry args={[1.38,1.58,3.15,32]}/><meshStandardMaterial color="#0f1119" metalness={0.92} roughness={0.22} emissive={rHex(risks.casing||38)} emissiveIntensity={0.06} transparent opacity={0.9}/></mesh>
      <mesh><cylinderGeometry args={[1.38,1.58,3.15,32]}/><meshBasicMaterial color={rHex(risks.casing||38)} wireframe transparent opacity={0.12}/></mesh>
      <ThreatRing risk={risks.casing||38} radius={1.5}/>
      <group ref={bladeRef}>
        {[...Array(6)].map((_,i)=>{
          const a=(i/6)*Math.PI*2;
          return<mesh key={i} position={[Math.cos(a)*0.68,0,Math.sin(a)*0.68]} rotation={[0,a,Math.PI/6]}>
            <boxGeometry args={[0.14,2.38,0.48]}/><meshStandardMaterial color="#141822" metalness={0.86} roughness={0.26} emissive={rHex(risks.blade||52)} emissiveIntensity={0.2}/>
          </mesh>;
        })}
        <mesh><cylinderGeometry args={[0.28,0.28,2.55,16]}/><meshStandardMaterial color="#0a0c12" metalness={0.95} roughness={0.14}/></mesh>
        <ThreatRing risk={risks.blade||52} radius={0.8}/>
      </group>
      {[[-1.78,0.78],[-1.78,-0.78],[1.78,0.78],[1.78,-0.78]].map(([x,z],i)=>(
        <mesh key={i} position={[x as number,0,z as number]} rotation={[0,0,Math.PI/2]}>
          <cylinderGeometry args={[0.17,0.21,0.75,16]}/><meshStandardMaterial color="#141822" metalness={0.88} roughness={0.25}/>
        </mesh>
      ))}
      {[-1.28,1.28].map((y,i)=>(
        <mesh key={i} position={[0,y,0]}>
          <cylinderGeometry args={[0.34,0.34,0.38,20]}/><meshStandardMaterial color="#0f1119" metalness={0.92} roughness={0.2} emissive={rHex(risks.bearing||82)} emissiveIntensity={0.32}/>
        </mesh>
      ))}
      <ThreatRing risk={risks.bearing||82} radius={0.42}/>
      <Callout position={[1.75,1.45,0.55]} label="Blade Stage 2" value={`Risk: ${risks.blade||52}%`} risk={risks.blade||52}/>
      <Callout position={[1.75,-1.18,0.55]} label="Rotor Bearing" value={`Risk: ${risks.bearing||82}%`} risk={risks.bearing||82}/>
      <Callout position={[-1.95,0.5,0.55]} label="Inlet Nozzle" value="Nominal" risk={18}/>
    </group>
  );
}

// ─── GENERIC MODEL ─────────────────────────────────────────────────
function GenericModel({ risks }: { risks: Record<string,number> }) {
  const pts = useMemo(()=>[
    new THREE.Vector2(0,-0.98),new THREE.Vector2(0.78,-0.98),
    new THREE.Vector2(0.88,-0.48),new THREE.Vector2(0.98,0),
    new THREE.Vector2(0.88,0.48),new THREE.Vector2(0.78,0.88),
    new THREE.Vector2(0.38,1.08),new THREE.Vector2(0,1.08),
  ],[]);
  const geo = useMemo(()=>new THREE.LatheGeometry(pts,24),[pts]);
  return(
    <group>
      <mesh><primitive object={geo}/><meshStandardMaterial color="#141822" metalness={0.86} roughness={0.3}/></mesh>
      <Wire geo={geo} col={rHex(risks.body||38)} op={0.2}/>
      <ThreatRing risk={risks.body||38} radius={1.05}/>
      <mesh position={[0,-1.28,0]}><cylinderGeometry args={[0.48,0.48,0.38,20]}/><meshStandardMaterial color="#0f1119" metalness={0.9} roughness={0.24} emissive={rHex(risks.bearing||52)} emissiveIntensity={0.25}/></mesh>
      <ThreatRing risk={risks.bearing||52} radius={0.56}/>
      <Callout position={[1.08,0.48,0.38]} label="Body" value={`Risk: ${risks.body||38}%`} risk={risks.body||38}/>
      <Callout position={[0.78,-1.38,0.38]} label="Bearing" value={`Risk: ${risks.bearing||52}%`} risk={risks.bearing||52}/>
    </group>
  );
}

// ─── Dynamic risk computation from failure data ─────────────────────
function computeRisks(fd: any): Record<string,number> {
  const r: Record<string,number> = { bearing:65, impeller:42, seal:35, casing:20, stator:28, blade:52, outlet:18, body:33, inlet:15 };
  if (fd?.component_risks) {
    fd.component_risks.forEach((cr: any) => {
      const k = (cr.component||"").toLowerCase();
      if (k.includes("bear")) r.bearing = cr.risk_score;
      else if (k.includes("imp")) r.impeller = cr.risk_score;
      else if (k.includes("seal")) r.seal = cr.risk_score;
      else if (k.includes("cas")||k.includes("body")) { r.casing = cr.risk_score; r.body = cr.risk_score; }
      else if (k.includes("stat")||k.includes("wind")) r.stator = cr.risk_score;
      else if (k.includes("blade")||k.includes("rotor")) r.blade = cr.risk_score;
      else if (k.includes("outlet")) r.outlet = cr.risk_score;
    });
  }
  return r;
}

// ─── Scene setup ────────────────────────────────────────────────────
function Scene({ machineType, risks }: { machineType:string; risks:Record<string,number> }) {
  const t = machineType.toLowerCase();
  const Model = t.includes("pump") ? PumpModel : t.includes("motor")||t.includes("electric") ? MotorModel : t.includes("turbine") ? TurbineModel : GenericModel;
  return (
    <>
      <color attach="background" args={["#0A1120"]}/>
      <fog attach="fog" args={["#0A1120",12,28]}/>
      <ambientLight intensity={0.2}/>
      <directionalLight position={[4,8,4]} intensity={0.9} color="#F1F5F9"/>
      <directionalLight position={[-4,2,-4]} intensity={0.28} color="#3B82F6"/>
      <pointLight position={[0,4,0]} intensity={0.5} color="#3B82F6" distance={10}/>
      <Grid position={[0,-2.35,0]} args={[20,20]} cellColor="rgba(59,130,246,0.06)" sectionColor="rgba(59,130,246,0.14)" cellSize={0.5} sectionSize={2.5} fadeDistance={11} infiniteGrid/>
      <Model risks={risks}/>
      <OrbitControls enableDamping dampingFactor={0.07} autoRotate autoRotateSpeed={0.4} minDistance={3} maxDistance={13} enablePan={false}/>
    </>
  );
}

// ─── PUBLIC EXPORT ──────────────────────────────────────────────────
interface Props { failureData?: any; machineName?: string; machineType?: string; }

export default function MachineViewer3D({ failureData, machineName, machineType }: Props) {
  const risks = computeRisks(failureData);
  const mt = machineType || machineName || "";

  // Sort components by risk descending for the table
  const components = Object.entries(risks).sort(([,a],[,b])=>b-a);

  return (
    <div style={{ padding:"24px 26px 0" }}>
      {/* Blueprint header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#64748B", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:4 }}>
            3D Blueprint — {(mt||"Industrial Machine").toUpperCase()}
          </p>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569" }}>
            {machineName} · Drag to orbit · Scroll to zoom · Threats update in real time
          </p>
        </div>
        {/* Risk legend */}
        <div style={{ display:"flex", gap:12 }}>
          {[["#EF4444","Critical (>75%)"],["#F97316","High (>50%)"],["#F59E0B","Medium (>25%)"],["#22C55E","Nominal"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, background:c as string, borderRadius:2 }}/>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="blueprint-wrap" style={{ height:520 }}>
        <Canvas camera={{ position:[5.5,3.5,5.5], fov:44 }} dpr={[1,1.5]} style={{ height:"100%", position:"relative", zIndex:1 }}>
          <Suspense fallback={null}>
            <Scene machineType={mt} risks={risks}/>
          </Suspense>
        </Canvas>
      </div>

      {/* Component risk table */}
      <div style={{ marginTop:2, background:"#0A1120", border:"1px solid rgba(59,130,246,0.18)", borderRadius:8, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(59,130,246,0.15)" }}>
              {["Component","Risk %","Status","Risk Trend"].map(h=>(
                <th key={h} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#475569", textAlign:"left", padding:"9px 14px", fontWeight:500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {components.map(([comp, pct]) => {
              const c = rHex(pct);
              const s = rLabel(pct);
              const trend = pct > 65 ? "↑ Increasing" : pct > 35 ? "→ Stable" : "↓ Decreasing";
              const tCol = pct > 65 ? "#EF4444" : pct > 35 ? "#64748B" : "#22C55E";
              return (
                <tr key={comp} style={{ borderBottom:"1px solid rgba(59,130,246,0.08)" }}>
                  <td style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#CBD5E1", padding:"10px 14px", textTransform:"capitalize" }}>{comp}</td>
                  <td style={{ fontFamily:"'IBM Plex Sans Condensed',sans-serif", fontSize:20, fontWeight:700, color:c, padding:"10px 14px" }}>{pct}%</td>
                  <td style={{ padding:"10px 14px" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:600, letterSpacing:"0.1em", color:c,
                      background:`${c}18`, border:`1px solid ${c}40`, padding:"2px 7px", borderRadius:2 }}>
                      {s}
                    </span>
                  </td>
                  <td style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:tCol, padding:"10px 14px" }}>{trend}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
