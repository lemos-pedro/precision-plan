import { lazy, Suspense, useEffect, useState } from "react";
import type { UiTower } from "@/lib/api-adapters";
import type { EquipState, SceneEquip } from "./SiteScene3D";

const SiteScene3D = lazy(() => import("./SiteScene3D"));

const DOT: Record<EquipState, string> = {
  ok: "bg-online",
  warn: "bg-degraded",
  fail: "bg-offline",
  unknown: "bg-muted-foreground/40",
};
const LABEL: Record<EquipState, string> = { ok: "Normal", warn: "Atenção", fail: "Falha", unknown: "Sem dados" };

function deriveEquip(t: UiTower): SceneEquip {
  const tower: EquipState = t.status === "online" ? "ok" : t.status === "offline" ? "fail" : t.status ? "warn" : "unknown";
  const gen: EquipState = t.generatorStatus === "erro" ? "fail" : t.generatorStatus === "ligado" ? "warn" : t.generatorStatus === "desligado" ? "ok" : "unknown";
  const soc = t.batterySoc;
  const battery: EquipState = soc === undefined ? "unknown" : soc < 20 ? "fail" : soc < 50 ? "warn" : "ok";
  const rectifier: EquipState = t.rectifierStatus === "alarme" ? "fail" : t.rectifierStatus === "ok" ? "ok" : "unknown";
  const ac: EquipState = t.acStatus === "erro" ? "fail" : t.acStatus === "desligado" ? "warn" : t.acStatus === "ligado" ? "ok" : "unknown";
  const mains: EquipState = t.mainsStatus === "ausente" ? "fail" : t.mainsStatus === "presente" ? "ok" : "unknown";
  const shelter: EquipState =
    t.smokeAlarm ? "fail" : t.doorOpenAlarm ? "warn" : t.smokeAlarm === false || t.doorOpenAlarm === false ? "ok" : "unknown";
  return { tower, shelter, generator: gen, battery, rectifier, ac, mains };
}

function Gauge({ label, value, max, unit, warn, crit, invert = false }: { label: string; value: number | undefined; max: number; unit: string; warn: number; crit: number; invert?: boolean }) {
  const has = value !== undefined && value !== null && !Number.isNaN(value);
  const pct = has ? Math.max(0, Math.min(1, value! / max)) : 0;
  const bad = has && (invert ? value! <= crit : value! >= crit);
  const mid = has && !bad && (invert ? value! <= warn : value! >= warn);
  const color = !has ? "var(--muted-foreground)" : bad ? "var(--offline)" : mid ? "var(--degraded)" : "var(--online)";
  const R = 34, C = Math.PI * R;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 84 50" className="w-full max-w-[120px]" role="img" aria-label={`${label}: ${has ? value!.toFixed(1) + unit : "sem dados"}`}>
        <path d="M8 44 A34 34 0 0 1 76 44" fill="none" stroke="var(--border)" strokeWidth="7" strokeLinecap="round" />
        <path d="M8 44 A34 34 0 0 1 76 44" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
        <text x="42" y="42" textAnchor="middle" className="fill-foreground font-mono" fontSize="12" fontWeight="600">
          {has ? `${value!.toFixed(value! >= 100 ? 0 : 1)}` : "—"}
        </text>
      </svg>
      <div className="text-[11px] text-muted-foreground -mt-1">{label}{has ? ` (${unit})` : ""}</div>
    </div>
  );
}

export function SiteNetEcoView({ torre }: { torre: UiTower }) {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  const equip = deriveEquip(torre);
  const rows: { k: keyof SceneEquip; name: string; detail: string }[] = [
    { k: "mains", name: "Rede eléctrica", detail: torre.mainsStatus ?? "—" },
    { k: "generator", name: "Gerador", detail: torre.generatorStatus ? `${torre.generatorStatus}${torre.generatorFuelLevel !== undefined ? ` · ${Math.round(torre.generatorFuelLevel)}% comb.` : ""}` : "—" },
    { k: "battery", name: "Baterias", detail: torre.batterySoc !== undefined ? `SoC ${Math.round(torre.batterySoc)}%${torre.batterySoh !== undefined ? ` · SoH ${Math.round(torre.batterySoh)}%` : ""}` : "—" },
    { k: "rectifier", name: "Rectificador", detail: torre.rectifierStatus ?? "—" },
    { k: "ac", name: "Ar condicionado", detail: torre.acStatus ?? "—" },
    { k: "shelter", name: "Shelter", detail: torre.smokeAlarm ? "fumo detectado" : torre.doorOpenAlarm ? "porta aberta" : torre.doorOpenAlarm === false ? "fechado" : "—" },
    { k: "tower", name: "Torre / RF", detail: torre.linkStatus ?? torre.status ?? "—" },
  ];
  const counts = rows.reduce((acc, r) => ({ ...acc, [equip[r.k]]: (acc[equip[r.k]] ?? 0) + 1 }), {} as Record<EquipState, number>);
  const source = torre.powerSourceActive;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="text-sm font-semibold text-foreground">Vista do site</div>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            {(["ok", "warn", "fail", "unknown"] as EquipState[]).map((s) => (
              <span key={s} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${DOT[s]}`} />{LABEL[s]}</span>
            ))}
          </div>
        </div>
        <div className="h-[380px] relative">
          {client ? (
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">A carregar vista 3D…</div>}>
              <SiteScene3D equip={equip} />
            </Suspense>
          ) : null}
          <div className="absolute left-3 bottom-3 rounded-md bg-card/90 border border-border px-2.5 py-1.5 text-[11px] text-foreground">
            Fonte activa: <span className="font-semibold">{source ? { rede: "Rede eléctrica", gerador: "Gerador", bateria: "Baterias" }[source] : "—"}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-4 py-3 border-t border-border">
          <Gauge label="Tensão AC" value={torre.voltage} max={260} unit="V" warn={245} crit={255} />
          <Gauge label="Corrente" value={torre.current} max={100} unit="A" warn={70} crit={90} />
          <Gauge label="Bateria SoC" value={torre.batterySoc} max={100} unit="%" warn={50} crit={20} invert />
          <Gauge label="Combustível" value={torre.generatorFuelLevel} max={100} unit="%" warn={30} crit={15} invert />
          <Gauge label="Temperatura" value={torre.temperatura} max={60} unit="°C" warn={35} crit={45} />
          <Gauge label="Humidade" value={torre.humidity} max={100} unit="%" warn={70} crit={85} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="text-sm font-semibold text-foreground">Equipamentos</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-online-bg py-2"><div className="text-lg font-semibold text-online">{counts.ok ?? 0}</div><div className="text-[10px] text-online">Normal</div></div>
          <div className="rounded-lg bg-degraded-bg py-2"><div className="text-lg font-semibold text-degraded">{counts.warn ?? 0}</div><div className="text-[10px] text-degraded">Atenção</div></div>
          <div className="rounded-lg bg-offline-bg py-2"><div className="text-lg font-semibold text-offline">{counts.fail ?? 0}</div><div className="text-[10px] text-offline">Falha</div></div>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.k} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${DOT[equip[r.k]]}`} />
                <span className="text-sm text-foreground">{r.name}</span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{r.detail}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="rounded-lg border border-border p-2"><div className="text-muted-foreground">Autonomia bat.</div><div className="font-mono font-semibold text-foreground">{torre.batteryBackupEstimate ?? "—"}</div></div>
          <div className="rounded-lg border border-border p-2"><div className="text-muted-foreground">Horas gerador</div><div className="font-mono font-semibold text-foreground">{torre.generatorRuntimeHours !== undefined ? `${Math.round(torre.generatorRuntimeHours)} h` : "—"}</div></div>
        </div>
      </div>
    </div>
  );
}
