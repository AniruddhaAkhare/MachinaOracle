"use client";
import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface ComponentData {
  name: string;
  risk: number;
  position: [number, number, number];
  size: [number, number, number];
  shape: "box" | "cylinder" | "sphere";
  issue?: string;
}

function RiskColor(risk: number): string {
  if (risk > 75) return "#ff2d55";
  if (risk > 50) return "#ff6b00";
  if (risk > 25) return "#ffd600";
  return "#00ff88";
}

function MachineComponent({ comp, selected, onClick }: { comp: ComponentData; selected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = RiskColor(comp.risk);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      if (comp.risk > 75) {
        meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 4) * 0.02);
      }
      if (selected) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  const geometry = comp.shape === "cylinder"
    ? <cylinderGeometry args={[comp.size[0], comp.size[0], comp.size[1], 32]} />
    : comp.shape === "sphere"
    ? <sphereGeometry args={[comp.size[0], 32, 32]} />
    : <boxGeometry args={comp.size} />;

  return (
    <group position={comp.position}>
      <mesh ref={meshRef} onClick={onClick} castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.6 : comp.risk > 60 ? 0.3 : 0.1}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Glow ring for high risk */}
      {comp.risk > 60 && (
        <mesh>
          <torusGeometry args={[Math.max(...comp.size) * 0.8, 0.03, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      )}
      {/* Label */}
      <Text
        position={[0, Math.max(...comp.size) * 0.8, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {comp.name}
      </Text>
      {/* Tooltip on select */}
      {selected && (
        <Html position={[0, Math.max(...comp.size) + 0.5, 0]} center>
          <div className="bg-forge-800 border border-cyan-500/30 rounded-lg p-3 text-xs font-mono w-48 pointer-events-none shadow-2xl">
            <p className="text-white font-bold mb-1">{comp.name}</p>
            <p style={{ color: RiskColor(comp.risk) }}>Risk: {comp.risk}%</p>
            {comp.issue && <p className="text-metal-300 mt-1">{comp.issue}</p>}
          </div>
        </Html>
      )}
    </group>
  );
}

function MachineBase() {
  return (
    <mesh position={[0, -1.8, 0]} receiveShadow>
      <boxGeometry args={[8, 0.2, 5]} />
      <meshStandardMaterial color="#1a2035" metalness={0.9} roughness={0.3} />
    </mesh>
  );
}

function GridFloor() {
  return (
    <gridHelper args={[20, 20, "#00f5ff22", "#00f5ff08"]} position={[0, -2, 0]} />
  );
}

function ParticleField() {
  const particles = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (particles.current) {
      particles.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  const positions = new Float32Array(300);
  for (let i = 0; i < 300; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f5ff" transparent opacity={0.3} />
    </points>
  );
}

function Scene({ components, selectedIdx, onSelect }: { components: ComponentData[]; selectedIdx: number | null; onSelect: (i: number) => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00f5ff" />
      <pointLight position={[5, 3, 5]} intensity={0.4} color="#ff6b00" />
      <GridFloor />
      <ParticleField />
      <MachineBase />
      {components.map((comp, i) => (
        <MachineComponent key={i} comp={comp} selected={selectedIdx === i} onClick={() => onSelect(i)} />
      ))}
      <OrbitControls enablePan autoRotate autoRotateSpeed={0.5} minDistance={4} maxDistance={20} />
    </>
  );
}

interface Props {
  failureData?: any;
  machineName?: string;
}

function buildComponents(failureData: any): ComponentData[] {
  const base: ComponentData[] = [
    { name: "Main Bearing", risk: 0, position: [0, 0, 0], size: [0.5, 0.5, 0.5], shape: "sphere" },
    { name: "Drive Motor", risk: 0, position: [-2, 0, 0], size: [0.8, 0.8, 1.2], shape: "cylinder" },
    { name: "Gearbox", risk: 0, position: [2, 0, 0], size: [0.8, 0.8, 0.8], shape: "box" },
    { name: "Cooling Fan", risk: 0, position: [0, 0, 2], size: [0.4, 0.4, 0.4], shape: "sphere" },
    { name: "Control Panel", risk: 0, position: [0, 1, -1.5], size: [1.2, 0.8, 0.3], shape: "box" },
    { name: "Pump Body", risk: 0, position: [-1.5, 0, 1.5], size: [0.6, 0.6, 0.9], shape: "cylinder" },
  ];

  if (failureData?.component_risks) {
    failureData.component_risks.forEach((cr: any) => {
      const match = base.find(c => c.name.toLowerCase().includes(cr.component?.toLowerCase?.()?.split(" ")[0]));
      if (match) {
        match.risk = cr.risk_score;
        match.issue = cr.reason;
      }
    });
  }

  base.forEach(comp => {
    if (comp.risk === 0) comp.risk = Math.floor(Math.random() * 40) + 5;
  });

  return base;
}

export default function MachineViewer3D({ failureData, machineName }: Props) {
  const components = buildComponents(failureData);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (i: number) => setSelectedIdx(prev => prev === i ? null : i);
  const selected = selectedIdx !== null ? components[selectedIdx] : null;

  return (
    <div className="p-6">
      <div className="glass-panel rounded-xl overflow-hidden" style={{ height: "520px" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/10">
          <div>
            <p className="text-xs font-mono text-cyan-400/60 tracking-wider">3D MACHINE VISUALIZATION</p>
            <p className="text-sm text-white font-medium mt-0.5">{machineName || "Industrial Machine"}</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            {[["#ff2d55","Critical"],["#ff6b00","High"],["#ffd600","Medium"],["#00ff88","Low"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: c as string, boxShadow: `0 0 4px ${c}` }} />
                <span className="text-metal-300">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Canvas */}
        <Canvas
          style={{ height: "420px", background: "transparent" }}
          camera={{ position: [6, 4, 6], fov: 50 }}
          shadows
        >
          <Suspense fallback={null}>
            <Scene components={components} selectedIdx={selectedIdx} onSelect={handleSelect} />
          </Suspense>
        </Canvas>
      </div>

      {/* Component List */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {components.map((comp, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`p-3 rounded-lg text-left transition-all ${selectedIdx === i ? "border border-cyan-500/50 bg-cyan-500/10" : "glass-panel hover:border-cyan-500/20"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: RiskColor(comp.risk), boxShadow: `0 0 4px ${RiskColor(comp.risk)}` }} />
              <p className="text-xs text-white font-medium">{comp.name}</p>
            </div>
            <p className="text-xs font-mono" style={{ color: RiskColor(comp.risk) }}>Risk: {comp.risk}%</p>
            {comp.issue && <p className="text-xs text-metal-300/70 mt-0.5 truncate">{comp.issue}</p>}
          </button>
        ))}
      </div>
      <p className="text-xs font-mono text-metal-300/50 mt-3 text-center">Click a component to inspect · Drag to rotate · Scroll to zoom</p>
    </div>
  );
}