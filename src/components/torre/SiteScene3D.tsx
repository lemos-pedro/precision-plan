import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { useMemo } from "react";

export type EquipState = "ok" | "warn" | "fail" | "unknown";

const STATE_COLOR: Record<EquipState, string> = {
  ok: "#16A34A",
  warn: "#D97706",
  fail: "#DC2626",
  unknown: "#94A3B8",
};

function Tag({ label, state, position }: { label: string; state: EquipState; position: [number, number, number] }) {
  return (
    <Html position={position} center distanceFactor={14} zIndexRange={[10, 0]}>
      <div className="whitespace-nowrap rounded-md border border-border bg-card/95 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm flex items-center gap-1">
        <span className="h-2 w-2 rounded-full" style={{ background: STATE_COLOR[state] }} />
        {label}
      </div>
    </Html>
  );
}

function Lattice({ height = 14 }: { height?: number }) {
  const bars = useMemo(() => {
    const out: { p: [number, number, number]; r: [number, number, number]; l: number }[] = [];
    const seg = 7;
    const base = 1.4, top = 0.4;
    const w = (y: number) => base + (top - base) * (y / height);
    for (let i = 0; i < seg; i++) {
      const y0 = (i / seg) * height, y1 = ((i + 1) / seg) * height;
      const a = w(y0), b = w(y1);
      // cross braces on 4 faces
      for (let f = 0; f < 4; f++) {
        const rot = (f * Math.PI) / 2;
        const len = Math.hypot(a + b, y1 - y0);
        const ang = Math.atan2(a + b, y1 - y0);
        out.push({ p: [0, (y0 + y1) / 2, 0], r: [0, rot, ang], l: len });
        out.push({ p: [0, (y0 + y1) / 2, 0], r: [0, rot, -ang], l: len });
      }
    }
    return { out, w };
  }, [height]);
  const legs = [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const;
  const tilt = Math.atan((1.4 - 0.4) / height);
  return (
    <group>
      {legs.map(([sx, sz], i) => (
        <mesh key={i} position={[sx * 0.9, height / 2, sz * 0.9]} rotation={[sz * -tilt, 0, sx * tilt]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, height, 6]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {bars.out.map((b, i) => (
        <group key={i} position={b.p} rotation={[0, b.r[1], 0]}>
          <mesh position={[0, 0, bars.w(b.p[1])]} rotation={[0, 0, b.r[2]]}>
            <cylinderGeometry args={[0.025, 0.025, b.l, 4]} />
            <meshStandardMaterial color="#B6BCC6" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[Math.cos((k * 2 * Math.PI) / 3) * 0.6, height - 1, Math.sin((k * 2 * Math.PI) / 3) * 0.6]} rotation={[0, -(k * 2 * Math.PI) / 3, 0]} castShadow>
          <boxGeometry args={[0.15, 1.4, 0.4]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export type SceneEquip = {
  tower: EquipState;
  shelter: EquipState;
  generator: EquipState;
  battery: EquipState;
  rectifier: EquipState;
  ac: EquipState;
  mains: EquipState;
};

export default function SiteScene3D({ equip }: { equip: SceneEquip }) {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [14, 10, 16], fov: 40 }}>
      <color attach="background" args={["#EEF2F7"]} />
      <fog attach="fog" args={["#EEF2F7", 30, 70]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 18, 8]} intensity={1.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
      <Environment>
        <Lightformer intensity={2} position={[0, 6, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#bcd" position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>

      {/* terreno + recinto */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color="#C9D3C0" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[14, 11]} />
        <meshStandardMaterial color="#B8B2A7" roughness={0.95} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => {
        const side = Math.floor(i / 6), t = (i % 6) / 6;
        const pos: [number, number, number] =
          side === 0 ? [-7 + t * 14, 0.8, -5.5] : side === 1 ? [7, 0.8, -5.5 + t * 11] : side === 2 ? [7 - t * 14, 0.8, 5.5] : [-7, 0.8, 5.5 - t * 11];
        return (
          <mesh key={i} position={pos}>
            <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
            <meshStandardMaterial color="#6B7280" metalness={0.5} />
          </mesh>
        );
      })}

      {/* torre */}
      <group position={[-3, 0, -1]}>
        <Lattice />
        <mesh position={[0, 14.3, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color={STATE_COLOR[equip.tower]} emissive={STATE_COLOR[equip.tower]} emissiveIntensity={0.8} />
        </mesh>
        <Tag label="Torre / RF" state={equip.tower} position={[0, 15.2, 0]} />
      </group>

      {/* shelter */}
      <group position={[3, 0, -1.5]}>
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2.6, 3]} />
          <meshStandardMaterial color="#E5E7EB" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.65, 0]}>
          <boxGeometry args={[4.2, 0.12, 3.2]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[-1, 1.1, 1.51]}>
          <boxGeometry args={[0.9, 2, 0.02]} />
          <meshStandardMaterial color={STATE_COLOR[equip.shelter]} />
        </mesh>
        {/* AC */}
        <mesh position={[2.05, 1.6, 0]} castShadow>
          <boxGeometry args={[0.3, 0.9, 1.2]} />
          <meshStandardMaterial color={STATE_COLOR[equip.ac]} roughness={0.5} />
        </mesh>
        <Tag label="Shelter" state={equip.shelter} position={[0, 3.3, 0]} />
        <Tag label="AC" state={equip.ac} position={[2.4, 2.4, 0]} />
      </group>

      {/* gerador */}
      <group position={[3.5, 0, 3]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[2.6, 1.6, 1.3]} />
          <meshStandardMaterial color={STATE_COLOR[equip.generator]} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0.9, 1.9, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <Tag label="Gerador" state={equip.generator} position={[0, 2.4, 0]} />
      </group>

      {/* baterias + rectificador */}
      <group position={[-0.5, 0, 3.2]}>
        <mesh position={[-0.7, 0.9, 0]} castShadow>
          <boxGeometry args={[1, 1.8, 0.8]} />
          <meshStandardMaterial color={STATE_COLOR[equip.battery]} roughness={0.6} />
        </mesh>
        <mesh position={[0.6, 0.9, 0]} castShadow>
          <boxGeometry args={[1, 1.8, 0.8]} />
          <meshStandardMaterial color={STATE_COLOR[equip.rectifier]} roughness={0.6} />
        </mesh>
        <Tag label="Baterias" state={equip.battery} position={[-0.7, 2.3, 0]} />
        <Tag label="Rectificador" state={equip.rectifier} position={[0.8, 2.3, 0.3]} />
      </group>

      {/* rede eléctrica */}
      <group position={[-6, 0, 4]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 5, 8]} />
          <meshStandardMaterial color="#78716C" />
        </mesh>
        <mesh position={[0, 3.2, 0.2]}>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshStandardMaterial color={STATE_COLOR[equip.mains]} />
        </mesh>
        <Tag label="Rede eléctrica" state={equip.mains} position={[0, 5.6, 0]} />
      </group>

      <OrbitControls enablePan={false} minDistance={10} maxDistance={40} maxPolarAngle={Math.PI / 2.15} target={[0, 3, 0]} autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  );
}
