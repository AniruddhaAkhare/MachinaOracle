"use client";
import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Grid, Line } from "@react-three/drei";
import * as THREE from "three";

// ─── Color helpers ───────────────────────────────────────────
function riskHex(risk: number): string {
  if (risk > 75) return "#e8473f";
  if (risk > 50) return "#e87a3f";
  if (risk > 25) return "#f5a623";
  return "#4caf72";
}

// ─── Blueprint annotation ────────────────────────────────────
function Annotation({ position, label, value, riskPct }: { position: [number,number,number]; label: string; value: string; riskPct?: number }) {
  const [hovered, setHovered] = useState(false);
  const color = riskPct !== undefined ? riskHex(riskPct) : "#f5a623";
  return (
    <group position={position}>
      {/* dot */}
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* leader line */}
      <Line points={[[0,0,0],[0.4,0.4,0]]} color={color} lineWidth={0.8} dashed dashScale={20} />
      <Html position={[0.42, 0.42, 0]} center={false}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: "rgba(10,10,8,0.94)",
            border: `1px solid ${color}60`,
            padding: hovered ? "6px 10px" : "4px 8px",
            minWidth: 90,
            transition: "all 0.15s",
            pointerEvents: "auto",
            cursor: "default",
          }}>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:`${color}`, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:2 }}>
            {label}
          </p>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#f0ede8", fontWeight:500 }}>{value}</p>
          {hovered && riskPct !== undefined && (
            <div style={{ marginTop:4, height:2, background:"rgba(255,255,255,0.08)" }}>
              <div style={{ height:"100%", width:`${riskPct}%`, background:color, transition:"width 0.3s" }} />
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── Blueprint wireframe overlay on a mesh ───────────────────
function BlueprintWire({ geometry, color = "#f5a623", opacity = 0.25 }: any) {
  return (
    <mesh>
      <primitive object={geometry} />
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  );
}

// ─── PUMP machine model ──────────────────────────────────────
function PumpModel({ risks }: { risks: Record<string, number> }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
  });

  // Lathe profile for pump body (half cross-section)
  const pumpPoints = useMemo(() => [
    new THREE.Vector2(0, -1.2),
    new THREE.Vector2(0.7, -1.2),
    new THREE.Vector2(0.75, -0.8),
    new THREE.Vector2(0.9, -0.4),
    new THREE.Vector2(1.0, 0),
    new THREE.Vector2(0.9, 0.4),
    new THREE.Vector2(0.75, 0.7),
    new THREE.Vector2(0.5, 0.9),
    new THREE.Vector2(0.3, 1.0),
    new THREE.Vector2(0, 1.0),
  ], []);

  const latheGeo = useMemo(() => new THREE.LatheGeometry(pumpPoints, 32), [pumpPoints]);

  return (
    <group ref={groupRef}>
      {/* Main pump casing */}
      <mesh>
        <primitive object={latheGeo} />
        <meshStandardMaterial color="#1a1a15" metalness={0.9} roughness={0.3}
          emissive={riskHex(risks.casing || 20)} emissiveIntensity={0.04} />
      </mesh>
      <BlueprintWire geometry={latheGeo} color={riskHex(risks.casing || 20)} opacity={0.2} />

      {/* Inlet pipe — horizontal */}
      <mesh position={[-1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 2.2, 24]} />
        <meshStandardMaterial color="#141410" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[-1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 2.2, 24]} />
        <meshBasicMaterial color="#f5a623" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Outlet pipe — vertical */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1.6, 24]} />
        <meshStandardMaterial color="#141410" metalness={0.95} roughness={0.2}
          emissive={riskHex(risks.outlet || 15)} emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1.6, 24]} />
        <meshBasicMaterial color={riskHex(risks.outlet || 15)} wireframe transparent opacity={0.2} />
      </mesh>

      {/* Impeller (visible inside via transparency) */}
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[0.55, 0.08, 8, 6]} />
        <meshStandardMaterial color={riskHex(risks.impeller || 60)} metalness={0.8} roughness={0.3}
          emissive={riskHex(risks.impeller || 60)} emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>

      {/* Bearing housing */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.5, 24]} />
        <meshStandardMaterial color="#0f0f0c" metalness={0.9} roughness={0.25}
          emissive={riskHex(risks.bearing || 80)} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.5, 24]} />
        <meshBasicMaterial color={riskHex(risks.bearing || 80)} wireframe transparent opacity={0.35} />
      </mesh>

      {/* Mounting bolts (4x) */}
      {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle)*0.85, -1.6, Math.sin(angle)*0.85]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
          <meshStandardMaterial color="#2a2a20" metalness={1} roughness={0.1} />
        </mesh>
      ))}

      {/* Seal ring */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.52, 0.04, 8, 32]} />
        <meshStandardMaterial color={riskHex(risks.seal || 45)} metalness={0.7} roughness={0.4}
          emissive={riskHex(risks.seal || 45)} emissiveIntensity={0.25} />
      </mesh>

      {/* Annotations */}
      <Annotation position={[1.1, 0.8, 0.5]} label="Impeller" value={`Risk: ${risks.impeller||60}%`} riskPct={risks.impeller||60} />
      <Annotation position={[1.0, -1.6, 0.5]} label="Main Bearing" value={`Risk: ${risks.bearing||80}%`} riskPct={risks.bearing||80} />
      <Annotation position={[-1.4, 0.6, 0.5]} label="Inlet Pipe" value="Nominal" riskPct={20} />
      <Annotation position={[0.6, 2.2, 0.5]} label="Outlet" value={`Risk: ${risks.outlet||15}%`} riskPct={risks.outlet||15} />
      <Annotation position={[0.7, 0.4, 0.6]} label="Seal Ring" value={`Risk: ${risks.seal||45}%`} riskPct={risks.seal||45} />
    </group>
  );
}

// ─── MOTOR machine model ─────────────────────────────────────
function MotorModel({ risks }: { risks: Record<string, number> }) {
  const shaftRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (shaftRef.current) shaftRef.current.rotation.z = clock.getElapsedTime() * 2;
  });

  return (
    <group>
      {/* Motor body — main cylinder */}
      <mesh>
        <cylinderGeometry args={[1.1, 1.1, 2.8, 32]} />
        <meshStandardMaterial color="#121210" metalness={0.88} roughness={0.28}
          emissive={riskHex(risks.stator || 30)} emissiveIntensity={0.06} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.1, 1.1, 2.8, 32]} />
        <meshBasicMaterial color={riskHex(risks.stator || 30)} wireframe transparent opacity={0.15} />
      </mesh>

      {/* End caps */}
      {[-1, 1].map((s, i) => (
        <group key={i} position={[0, s * 1.5, 0]}>
          <mesh>
            <cylinderGeometry args={[1.1, 1.1, 0.2, 32]} />
            <meshStandardMaterial color="#0f0f0c" metalness={0.92} roughness={0.2} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
            <meshStandardMaterial color="#1a1a15" metalness={0.95} roughness={0.15}
              emissive={riskHex(risks.bearing || 70)} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Rotating shaft */}
      <mesh ref={shaftRef} position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.0, 16]} />
        <meshStandardMaterial color="#2a2a20" metalness={1} roughness={0.05} />
      </mesh>

      {/* Cooling fins */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle)*1.15, 0, Math.sin(angle)*1.15]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.08, 2.4, 0.4]} />
            <meshStandardMaterial color="#0a0a08" metalness={0.9} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Terminal box */}
      <mesh position={[0, 0, -1.3]}>
        <boxGeometry args={[0.7, 0.5, 0.25]} />
        <meshStandardMaterial color="#141410" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -1.3]}>
        <boxGeometry args={[0.7, 0.5, 0.25]} />
        <meshBasicMaterial color="var(--amber)" wireframe transparent opacity={0.2} />
      </mesh>

      <Annotation position={[1.5, 1.2, 0.6]} label="Stator Winding" value={`Risk: ${risks.stator||30}%`} riskPct={risks.stator||30} />
      <Annotation position={[1.5, -1.4, 0.6]} label="Bearing (Front)" value={`Risk: ${risks.bearing||70}%`} riskPct={risks.bearing||70} />
      <Annotation position={[0.6, 2.4, 0.5]} label="Drive Shaft" value="Nominal" riskPct={12} />
    </group>
  );
}

// ─── TURBINE machine model ───────────────────────────────────
function TurbineModel({ risks }: { risks: Record<string, number> }) {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bladeRef.current) bladeRef.current.rotation.y = clock.getElapsedTime() * 1.5;
  });

  return (
    <group>
      {/* Turbine casing outer shell */}
      <mesh>
        <cylinderGeometry args={[1.4, 1.6, 3.2, 32]} />
        <meshStandardMaterial color="#0f0f0c" metalness={0.92} roughness={0.22}
          emissive={riskHex(risks.casing || 40)} emissiveIntensity={0.05} transparent opacity={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.4, 1.6, 3.2, 32]} />
        <meshBasicMaterial color={riskHex(risks.casing || 40)} wireframe transparent opacity={0.12} />
      </mesh>

      {/* Rotating blade assembly */}
      <group ref={bladeRef}>
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const bc = riskHex(risks.blade || 55);
          return (
            <mesh key={i} position={[Math.cos(angle)*0.7, 0, Math.sin(angle)*0.7]} rotation={[0, angle, Math.PI/6]}>
              <boxGeometry args={[0.15, 2.4, 0.5]} />
              <meshStandardMaterial color="#141410" metalness={0.88} roughness={0.25}
                emissive={bc} emissiveIntensity={0.2} />
            </mesh>
          );
        })}
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 2.6, 16]} />
          <meshStandardMaterial color="#0a0a08" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {/* Inlet/outlet nozzles */}
      {[[-1.8, 0.8], [1.8, 0.8], [-1.8, -0.8], [1.8, -0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x as number, 0, z as number]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.18, 0.22, 0.8, 16]} />
          <meshStandardMaterial color="#121210" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}

      {/* Bearing pedestals */}
      {[-1.3, 1.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.4, 20]} />
          <meshStandardMaterial color="#0f0f0c" metalness={0.92} roughness={0.2}
            emissive={riskHex(risks.bearing || 85)} emissiveIntensity={0.35} />
        </mesh>
      ))}

      <Annotation position={[1.8, 1.5, 0.6]} label="Blade Stage 2" value={`Risk: ${risks.blade||55}%`} riskPct={risks.blade||55} />
      <Annotation position={[1.8, -1.2, 0.6]} label="Rotor Bearing" value={`Risk: ${risks.bearing||85}%`} riskPct={risks.bearing||85} />
      <Annotation position={[-2.0, 0.5, 0.6]} label="Inlet Nozzle" value="Nominal" riskPct={18} />
    </group>
  );
}

// ─── GENERIC machine model ───────────────────────────────────
function GenericModel({ risks }: { risks: Record<string, number> }) {
  const points = useMemo(() => [
    new THREE.Vector2(0, -1.0),
    new THREE.Vector2(0.8, -1.0),
    new THREE.Vector2(0.9, -0.5),
    new THREE.Vector2(1.0, 0),
    new THREE.Vector2(0.9, 0.5),
    new THREE.Vector2(0.8, 0.9),
    new THREE.Vector2(0.4, 1.1),
    new THREE.Vector2(0, 1.1),
  ], []);
  const geo = useMemo(() => new THREE.LatheGeometry(points, 24), [points]);
  return (
    <group>
      <mesh><primitive object={geo} /><meshStandardMaterial color="#141410" metalness={0.88} roughness={0.3} /></mesh>
      <BlueprintWire geometry={geo} color={riskHex(risks.body || 40)} opacity={0.22} />
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 20]} />
        <meshStandardMaterial color="#0f0f0c" metalness={0.9} roughness={0.25}
          emissive={riskHex(risks.bearing || 55)} emissiveIntensity={0.25} />
      </mesh>
      <Annotation position={[1.1, 0.5, 0.4]} label="Body" value={`Risk: ${risks.body||40}%`} riskPct={risks.body||40} />
      <Annotation position={[0.8, -1.4, 0.4]} label="Bearing" value={`Risk: ${risks.bearing||55}%`} riskPct={risks.bearing||55} />
    </group>
  );
}

// ─── Dimension lines (blueprint aesthetic) ───────────────────
function DimLines() {
  return (
    <group>
      <Line points={[[-2.2,-2,0],[2.2,-2,0]]} color="#f5a62330" lineWidth={0.5} dashed dashScale={30} />
      <Line points={[[-2.2,-2.1,0],[-2.2,2.2,0]]} color="#f5a62330" lineWidth={0.5} dashed dashScale={30} />
      <Line points={[[2.2,-2.1,0],[2.2,2.2,0]]}  color="#f5a62330" lineWidth={0.5} dashed dashScale={30} />
    </group>
  );
}

// ─── Main scene ───────────────────────────────────────────────
function Scene({ machineType, risks }: { machineType: string; risks: Record<string, number> }) {
  const t = machineType.toLowerCase();
  const Model = t.includes("pump") ? PumpModel
    : t.includes("motor") || t.includes("electric") ? MotorModel
    : t.includes("turbine") ? TurbineModel
    : GenericModel;

  return (
    <>
      <color attach="background" args={["#0a0a08"]} />
      <fog attach="fog" args={["#0a0a08", 12, 30]} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 8, 4]} intensity={0.8} color="#f0ede8" />
      <directionalLight position={[-4, 2, -4]} intensity={0.3} color="#4a90d9" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#f5a623" distance={12} />

      {/* Blueprint grid floor */}
      <Grid
        position={[0, -2.4, 0]}
        args={[20, 20]}
        cellColor="#f5a62308"
        sectionColor="#f5a62318"
        cellSize={0.5}
        sectionSize={2}
        fadeDistance={12}
        infiniteGrid
      />

      <DimLines />
      <Model risks={risks} />
      <OrbitControls enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.4}
        minDistance={3} maxDistance={14} enablePan={false} />
    </>
  );
}

// ─── Component risk from failure data ────────────────────────
function extractRisks(failureData: any): Record<string, number> {
  const risks: Record<string, number> = { bearing: 70, impeller: 45, seal: 38, casing: 22, stator: 30, blade: 55, outlet: 18, body: 35 };
  if (failureData?.component_risks) {
    failureData.component_risks.forEach((cr: any) => {
      const k = (cr.component || "").toLowerCase();
      if (k.includes("bear")) risks.bearing = cr.risk_score;
      else if (k.includes("imp")) risks.impeller = cr.risk_score;
      else if (k.includes("seal")) risks.seal = cr.risk_score;
      else if (k.includes("cas") || k.includes("body")) risks.casing = risks.body = cr.risk_score;
      else if (k.includes("stat") || k.includes("wind")) risks.stator = cr.risk_score;
      else if (k.includes("blade") || k.includes("rotor")) risks.blade = cr.risk_score;
    });
  }
  return risks;
}

// ─── Public component ─────────────────────────────────────────
interface Props { failureData?: any; machineName?: string; machineType?: string; }

export default function MachineViewer3D({ failureData, machineName, machineType }: Props) {
  const risks = extractRisks(failureData);
  const [annotationsVisible, setAnnotationsVisible] = useState(true);

  return (
    <div style={{ padding:"24px 24px 0" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div>
          <p className="section-label" style={{ color:"var(--text-3)" }}>3D BLUEPRINT — {(machineType||"INDUSTRIAL MACHINE").toUpperCase()}</p>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text-3)", marginTop:2 }}>
            {machineName} · Drag to rotate · Scroll to zoom
          </p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {[["#e8473f","Critical (>75%)"],["#e87a3f","High (>50%)"],["#f5a623","Moderate (>25%)"],["#4caf72","Nominal"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, background:c, borderRadius:1, boxShadow:`0 0 4px ${c}80` }} />
              <span style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--text-3)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="panel" style={{ height:540, overflow:"hidden" }}>
        <Canvas camera={{ position: [5, 3, 5], fov: 42 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <Scene machineType={machineType || ""} risks={risks} />
          </Suspense>
        </Canvas>
      </div>

      {/* Risk table below */}
      <div style={{ marginTop:1 }}>
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr><th>Component</th><th>Risk %</th><th>Status</th><th style={{ width:"40%" }}>Risk Bar</th></tr>
            </thead>
            <tbody>
              {Object.entries(risks).map(([comp, pct]) => {
                const c = riskHex(pct as number);
                const status = (pct as number) > 75 ? "CRITICAL" : (pct as number) > 50 ? "HIGH" : (pct as number) > 25 ? "MODERATE" : "NOMINAL";
                return (
                  <tr key={comp}>
                    <td style={{ fontFamily:"var(--font-mono)", textTransform:"capitalize", color:"var(--text-1)" }}>{comp}</td>
                    <td style={{ fontFamily:"var(--font-mono)", color:c, fontWeight:600 }}>{pct as number}%</td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:10, color:c }}>{status}</td>
                    <td>
                      <div style={{ height:2, background:"var(--line-2)" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:c, boxShadow:`0 0 4px ${c}50` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
