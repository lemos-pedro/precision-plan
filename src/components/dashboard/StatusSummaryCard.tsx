import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api-adapters";
import { useAlarms } from "@/lib/alarms-store";
import { Panel } from "@/components/common/Panel";

export function StatusSummaryCard() {
  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: 500 }),
  });

  const { active: activeAlarms } = useAlarms();

  const towers = towersQuery.data?.data ?? [];
  const online = towers.filter((t) => t.status === "online").length;
  const degraded = towers.filter((t) => t.status === "degraded").length;
  const offline = towers.filter((t) => t.status === "offline").length;

  const systemHealth = towers.length > 0 ? (online / towers.length) * 100 : 0;
  const healthStatus =
    systemHealth >= 95 ? "excellent" : systemHealth >= 90 ? "good" : systemHealth >= 80 ? "fair" : "poor";
  const healthLabel =
    healthStatus === "excellent" ? "Excelente" : healthStatus === "good" ? "Bom" : healthStatus === "fair" ? "Aceitável" : "Crítico";
  const healthColor =
    healthStatus === "excellent"
      ? "text-online bg-online-bg"
      : healthStatus === "good"
        ? "text-azul-2 bg-muted"
        : healthStatus === "fair"
          ? "text-degraded bg-degraded-bg"
          : "text-offline bg-offline-bg";
  const barColor =
    healthStatus === "excellent" ? "bg-online" : healthStatus === "good" ? "bg-azul-2" : healthStatus === "fair" ? "bg-degraded" : "bg-offline";

  return (
    <Panel
      title="Saúde do parque"
      actions={
        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${healthColor}`}>
          {healthLabel}
        </span>
      }
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Disponibilidade</span>
        <span className="text-2xl font-mono font-semibold tabular-nums leading-none">
          {towers.length ? `${systemHealth.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div className="mt-2 h-1.5 bg-data-grid overflow-hidden rounded-sm">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${systemHealth}%` }} />
      </div>

      <div className="grid grid-cols-3 mt-3 border-t border-border pt-3 divide-x divide-border">
        {[
          { label: "Online", value: online, cls: "text-online" },
          { label: "Degradados", value: degraded, cls: "text-degraded" },
          { label: "Offline", value: offline, cls: "text-offline" },
        ].map((s) => (
          <div key={s.label} className="text-center px-1">
            <div className={`text-lg font-mono font-semibold tabular-nums ${s.cls}`}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {activeAlarms.length > 0 && (
        <div className="mt-3 flex items-center gap-2 border border-offline/25 bg-offline-bg/40 px-2 py-1.5 text-[11px] text-offline rounded-sm">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-medium">{activeAlarms.length} alarme(s) activo(s)</span>
        </div>
      )}
    </Panel>
  );
}
