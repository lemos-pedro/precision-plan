import { useState } from "react";
import { useAlarms } from "@/lib/alarms-store";
import type { Alarm } from "@/lib/api-adapters";
import type { AlarmSeverity } from "@/lib/api";
import { EmptyState } from "@/components/common/EmptyState";
import { Check, AlertTriangle, AlertCircle } from "lucide-react";
import { AlarmDetailDialog } from "@/components/alarms/AlarmDetailDialog";
import { Panel } from "@/components/common/Panel";

const sevColor: Record<AlarmSeverity, string> = {
  critical: "bg-offline-bg/60 text-offline border-l-offline",
  warning: "bg-degraded-bg/60 text-degraded border-l-degraded",
  info: "bg-muted text-azul-2 border-l-azul-2",
};

const sevIcon: Record<AlarmSeverity, React.ComponentType<{ className?: string }>> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Check,
};

export function AlarmsCard() {
  const { active } = useAlarms();
  const [selected, setSelected] = useState<Alarm | null>(null);

  const critical = active.filter((a) => a.severity === "critical").length;
  const warning = active.filter((a) => a.severity === "warning").length;

  return (
    <Panel
      title="Alarmes activos"
      dense
      actions={
        <div className="flex gap-1">
          {critical > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-offline-bg text-offline font-semibold font-mono rounded-sm">
              {critical} CRIT
            </span>
          )}
          {warning > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-degraded-bg text-degraded font-semibold font-mono rounded-sm">
              {warning} AVISO
            </span>
          )}
          {active.length === 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-online-bg text-online font-semibold rounded-sm">LIMPO</span>
          )}
        </div>
      }
    >
      {active.length === 0 ? (
        <div className="p-3">
          <EmptyState icon={<Check className="h-8 w-8 text-online" />} title="Nenhum alarme activo" />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {active.slice(0, 12).map((a) => {
            const Icon = sevIcon[a.severity];
            return (
              <li key={a.id}>
                <button
                  onClick={() => setSelected(a)}
                  className={`w-full text-left flex gap-2 px-3 py-2 border-l-2 transition-colors hover:brightness-[0.98] ${sevColor[a.severity]}`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{a.title}</div>
                    <div className="text-[10px] opacity-80 font-mono truncate">
                      {a.towerName} · {a.vendor} · {a.time}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <AlarmDetailDialog alarm={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </Panel>
  );
}
