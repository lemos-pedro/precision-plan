import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { buildRegionStats, errorMessage, queryKeys, toUiTower } from "@/lib/api-adapters";
import { fmtPct } from "@/lib/format";
import { Panel } from "@/components/common/Panel";

export function SlaCard() {
  const navigate = useNavigate();
  const slaQuery = useQuery({
    queryKey: queryKeys.sla,
    queryFn: api.getSlaGlobal,
  });
  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: 500 }),
  });
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions,
    queryFn: () => api.listRegions({ limit: 500 }),
  });
  const uiTowers = (towersQuery.data?.data ?? []).map((tower) => toUiTower(tower, { regions: regionsQuery.data?.data }));
  const slaRegioes = buildRegionStats(uiTowers, regionsQuery.data?.data);
  const slaGlobal = slaQuery.data?.availability_percent ?? 0;
  const slaTorresAfetadas =
    (slaQuery.data?.affected_towers ?? 0) ||
    uiTowers.filter((tower) => tower.status !== "online").length;
  const slaStatus = slaGlobal >= 99.5 ? "critical" : slaGlobal >= 98 ? "ok" : "degraded";
  const slaColor = slaStatus === "critical" ? "text-online" : slaStatus === "ok" ? "text-azul-2" : "text-degraded";
  

  return (
    <Panel
      title="SLA por região"
      actions={
        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${slaStatus === "critical" ? "bg-online-bg text-online" : slaStatus === "ok" ? "bg-muted text-azul-2" : "bg-degraded-bg text-degraded"}`}>
          {slaStatus === "critical" ? "Excelente" : slaStatus === "ok" ? "Bom" : "Risco"}
        </span>
      }
    >
      {slaQuery.isError && <p className="mb-2 text-xs text-offline">{errorMessage(slaQuery.error)}</p>}
      <div className="mb-3 flex items-baseline gap-2">
        <div className={`text-2xl font-mono font-semibold tabular-nums ${slaColor} leading-none`}>{slaGlobal.toFixed(2)}%</div>
        <div className="text-[11px] text-muted-foreground">{slaTorresAfetadas} sites afectados</div>
      </div>
      <div className="flex flex-col gap-2">
        {slaRegioes.map((r) => {
          const ok = r.valor != null && r.valor >= 98;
          const unknown = r.valor == null;
          return (
            <button
              key={r.regiao}
              onClick={() => navigate({ to: "/mapa", search: { regiao: r.regiaoId } as never })}
              className="text-left hover:opacity-80 transition-opacity"
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground">{r.regiao}</span>
                <span className={`font-mono ${unknown ? "text-muted-foreground" : ok ? "text-online" : "text-degraded"}`}>{fmtPct(r.valor)}</span>
              </div>
              <div className="h-1.5 bg-data-grid overflow-hidden rounded-sm">
                <div className={`h-full ${unknown ? "bg-muted-foreground/30" : ok ? "bg-online" : "bg-degraded"}`} style={{ width: `${r.valor ?? 0}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
