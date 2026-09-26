import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import type { UiTower } from "@/lib/api-adapters";
import type { AssetState, SiteAssetId } from "./types";

const STATE_COLOR: Record<AssetState, string> = {
  ok: "#4b6b8a",
  warning: "#d97706",
  fault: "#dc2626",
  unknown: "#94a3b8",
};

const NO_DATA = "N/A";

function num(value: number | undefined, decimals = 1, unit = "") {
  if (value === undefined || value === null || Number.isNaN(value)) return NO_DATA;
  return `${value.toFixed(decimals)}${unit}`;
}

export type AssetInfo = {
  id: SiteAssetId;
  label: string;
  state: AssetState;
  position: [number, number, number];
  lines: { k: string; v: string }[];
};

export function buildAssets(torre: UiTower): AssetInfo[] {
  const statusState: AssetState =
    torre.status === "offline" ? "fault" : torre.status === "degraded" ? "warning" : "ok";

  return [
    {
      id: "tower",
      label: "Torre / RAN",
      state: statusState,
      position: [3.2, 5.4, -1.2],
      lines: [
        { k: "Estado", v: torre.status },
        { k: "Sinal", v: num(torre.signalStrength, 0, " dBm") },
        { k: "Ligação", v: torre.linkStatus ?? NO_DATA },
        { k: "Operadores", v: torre.operadores.map((o) => o.name).join(", ") || NO_DATA },
      ],
    },
    {
      id: "shelter",
      label: "Shelter / Ambiente",
      state: torre.smokeAlarm || torre.doorOpenAlarm ? "fault" : torre.temperatura === undefined ? "unknown" : "ok",
      position: [-1.6, 2.2, 1.4],
      lines: [
        { k: "Temperatura", v: num(torre.temperatura, 1, " °C") },
        { k: "Humidade", v: num(torre.humidity, 0, " %") },
        { k: "Porta aberta", v: torre.doorOpenAlarm === undefined ? NO_DATA : torre.doorOpenAlarm ? "Sim" : "Não" },
        { k: "AC", v: torre.acStatus ?? NO_DATA },
      ],
    },
    {
      id: "rectifier",
      label: "Grupo rectificador",
      state: torre.rectifierStatus === "alarme" ? "fault" : torre.rectifierStatus ? "ok" : "unknown",
      position: [0.9, 2.6, 0.2],
      lines: [
        { k: "Estado", v: torre.rectifierStatus ?? NO_DATA },
        { k: "Tensão DC", v: num(torre.voltage, 1, " V") },
        { k: "Corrente DC", v: num(torre.current, 1, " A") },
        { k: "Fonte activa", v: torre.powerSourceActive ?? NO_DATA },
      ],
    },
    {
      id: "battery",
      label: "Grupo de baterias",
      state:
        torre.batterySoc === undefined
          ? "unknown"
          : torre.batterySoc < 30
            ? "fault"
            : torre.batterySoc < 60
              ? "warning"
              : "ok",
      position: [-3.4, 1.5, -0.6],
      lines: [
        { k: "SoC", v: num(torre.batterySoc, 0, " %") },
        { k: "SoH", v: num(torre.batterySoh, 0, " %") },
        { k: "Tensão", v: num(torre.batteryVoltage, 1, " V") },
        { k: "Autonomia", v: torre.batteryBackupEstimate ?? NO_DATA },
      ],
    },
    {
      id: "generator",
      label: "Gerador / ATS",
      state:
        torre.generatorStatus === "erro"
          ? "fault"
          : torre.generatorStatus === undefined
            ? "unknown"
            : torre.generatorStatus === "ligado"
              ? "warning"
              : "ok",
      position: [-3.0, 1.4, 3.0],
      lines: [
        { k: "Estado", v: torre.generatorStatus ?? NO_DATA },
        { k: "Combustível", v: num(torre.generatorFuelLevel, 0, " %") },
        { k: "Horas", v: num(torre.generatorRuntimeHours, 0, " h") },
        { k: "Rede pública", v: torre.mainsStatus ?? NO_DATA },
      ],
    },
    {
      id: "camera",
      label: "Câmara",
      state: "unknown",
      position: [3.2, 3.6, 1.6],
      lines: [{ k: "Vídeo", v: NO_DATA }],
    },
  ];
}

function Label({ asset, selected, onSelect }: { asset: AssetInfo; selected: boolean; onSelect: (id: SiteAssetId) => void }) {
  return (
    <Html position={asset.position} center distanceFactor={14} zIndexRange={[20, 0]}>
      <button
        onClick={() => onSelect(asset.id)}
        className={[
          "min-w-[140px] text-left border bg-card/95 backdrop-blur px-2 py-1.5 rounded-sm shadow-sm transition-colors",
          selected ? "border-azul-claro ring-1 ring-azul-claro" : "border-border hover:border-azul-2",
        ].join(" ")}
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground truncate">{asset.label}</div>
        {asset.lines.slice(0, 3).map((l) => (
          <div key={l.k} className="flex justify-between gap-2 text-[9px] font-mono text-muted-foreground">
            <span>{l.k}</span>
            <span className="text-foreground">{l.v}</span>
          </div>
        ))}
      </button>
    </Html>
  );
}

function Lattice({ color }: { color: string }) {
  const legs = [-0.7, 0.7];
  return (
    <group position={[3.2, 0, -1.2]}>
      {legs.map((x) =>
        legs.map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 0.75, 2.5, z * 0.75]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 5, 6]} />
            <meshStandardMaterial color={color} metalness={0.35} roughness={0.6} />
          </mesh>
        )),
      )}
      {[1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, i, 0]}>
          <boxGeometry args={[1.6, 0.06, 1.6]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`ant-${i}`} position={[Math.cos((i * Math.PI * 2) / 3) * 0.9, 4.6, Math.sin((i * Math.PI * 2) / 3) * 0.9]}>
          <boxGeometry args={[0.16, 1.1, 0.3]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  assets,
  selected,
  onSelect,
}: {
  assets: AssetInfo[];
  selected: SiteAssetId | null;
  onSelect: (id: SiteAssetId) => void;
}) {
  const color = (id: SiteAssetId) => STATE_COLOR[assets.find((a) => a.id === id)?.state ?? "unknown"];
  const fence = useMemo(() => [-6, 6], []);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 12, 6]} intensity={1.15} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight args={["#dbe6f5", "#8a9bb0", 0.5]} />

      {/* Terreno */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#cfd9e6" roughness={0.95} />
      </mesh>

      {/* Vedação */}
      {fence.map((x) => (
        <mesh key={`fx-${x}`} position={[x, 0.8, 0]}>
          <boxGeometry args={[0.06, 1.6, 11]} />
          <meshStandardMaterial color="#9aa7b8" transparent opacity={0.55} />
        </mesh>
      ))}
      {[-5.5, 5.5].map((z) => (
        <mesh key={`fz-${z}`} position={[0, 0.8, z]}>
          <boxGeometry args={[12, 1.6, 0.06]} />
          <meshStandardMaterial color="#9aa7b8" transparent opacity={0.55} />
        </mesh>
      ))}

      <Lattice color={color("tower")} />

      {/* Shelter */}
      <mesh position={[-1.6, 1.1, 1.4]} onClick={() => onSelect("shelter")} castShadow>
        <boxGeometry args={[3.4, 2.2, 2.6]} />
        <meshStandardMaterial color={color("shelter")} roughness={0.75} />
      </mesh>

      {/* Rectificador */}
      <mesh position={[0.9, 1.1, -0.2]} onClick={() => onSelect("rectifier")} castShadow>
        <boxGeometry args={[0.9, 2.2, 0.8]} />
        <meshStandardMaterial color={color("rectifier")} metalness={0.25} roughness={0.5} />
      </mesh>

      {/* Baterias */}
      <group position={[-3.4, 0, -0.9]} onClick={() => onSelect("battery")}>
        {[0, 1].map((i) => (
          <mesh key={i} position={[0, 0.45 + i * 0.95, 0]} castShadow>
            <boxGeometry args={[1.6, 0.85, 1.1]} />
            <meshStandardMaterial color={color("battery")} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Gerador */}
      <group position={[-3.0, 0, 3.0]} onClick={() => onSelect("generator")}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.4, 1.2, 1.2]} />
          <meshStandardMaterial color={color("generator")} roughness={0.65} />
        </mesh>
        <mesh position={[0.9, 1.45, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
      </group>

      {/* Câmara */}
      <group position={[3.2, 0, 1.6]} onClick={() => onSelect("camera")}>
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 3.2, 8]} />
          <meshStandardMaterial color="#8a97a8" />
        </mesh>
        <mesh position={[0, 3.2, 0.25]}>
          <boxGeometry args={[0.3, 0.3, 0.7]} />
          <meshStandardMaterial color={color("camera")} />
        </mesh>
      </group>

      {assets.map((a) => (
        <Label key={a.id} asset={a} selected={selected === a.id} onSelect={onSelect} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={9}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.25}
        minPolarAngle={0.35}
        target={[0, 1.5, 0]}
      />
    </>
  );
}

export default function SiteScene({
  torre,
  selected,
  onSelect,
}: {
  torre: UiTower;
  selected: SiteAssetId | null;
  onSelect: (id: SiteAssetId) => void;
}) {
  const assets = useMemo(() => buildAssets(torre), [torre]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [11, 8, 13], fov: 42 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#eef2f8"]} />
      <fog attach="fog" args={["#eef2f8", 26, 52]} />
      <Scene assets={assets} selected={selected} onSelect={onSelect} />
    </Canvas>
  );
}
