import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api, type TowerStatus } from "@/lib/api";
import { errorMessage, queryKeys, toUiTower, type UiTower } from "@/lib/api-adapters";
import { StatusBadge } from "./StatusBadge";
import { Panel } from "@/components/common/Panel";

type Filter = "todas" | "degraded" | "offline";

const tabs: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "degraded", label: "Degradadas" },
  { id: "offline", label: "Offline" },
];

// Prioridade para a página inicial: offline > degraded > online.
const statusPriority: Record<TowerStatus, number> = {
  offline: 0,
  degraded: 1,
  online: 2,
};

const HOME_LIMIT = 20;
const FETCH_POOL_SIZE = 200;

export function TorresTable() {
  const [filter, setFilter] = useState<Filter>("todas");
  const navigate = useNavigate();
  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: FETCH_POOL_SIZE }),
  });
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions,
    queryFn: () => api.listRegions({ limit: 500 }),
  });
  const operatorsQuery = useQuery({
    queryKey: queryKeys.operators,
    queryFn: () => api.listOperators({ limit: 500 }),
  });

  const allTorres = (towersQuery.data?.data ?? []).map((tower) =>
    toUiTower(tower, { regions: regionsQuery.data?.data, operators: operatorsQuery.data?.data }),
  );

  const priorityTorres: UiTower[] = [...allTorres]
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
    .slice(0, HOME_LIMIT);

  const rows =
    filter === "todas"
      ? priorityTorres
      : priorityTorres.filter((t) => t.status === (filter as TowerStatus));

  return (
    <Panel
      title="Sites prioritários"
      dense
      actions={
        <div className="flex items-center border border-border rounded-sm overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={[
                "px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors outline-none focus-visible:ring-2 focus-visible:ring-azul-2",
                filter === t.id
                  ? "bg-azul-2 text-white font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-data-grid">
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="font-semibold px-3 py-1.5">Site</th>
              <th className="font-semibold px-3 py-1.5">Local</th>
              <th className="font-semibold px-3 py-1.5">Estado</th>
              <th className="font-semibold px-3 py-1.5">IP</th>
              <th className="font-semibold px-3 py-1.5 text-right">Disp. 30d</th>
            </tr>
          </thead>
          <tbody>
            {towersQuery.isLoading && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">A carregar sites...</td></tr>
            )}
            {towersQuery.isError && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-offline">{errorMessage(towersQuery.error)}</td></tr>
            )}
            {rows.map((t) => (
              <tr
                key={t.id}
                onClick={() => navigate({ to: "/torres/$torreId", params: { torreId: t.id } })}
                className="border-t border-border cursor-pointer hover:bg-data-grid transition-colors"
              >
                <td className="px-3 py-1.5 font-mono text-xs text-foreground">{t.name}</td>
                <td className="px-3 py-1.5 text-xs text-foreground">{t.regiao}</td>
                <td className="px-3 py-1.5"><StatusBadge status={t.status} /></td>
                <td className={`px-3 py-1.5 font-mono text-xs ${t.status === "offline" ? "text-offline/70" : "text-muted-foreground"}`}>
                  {t.ip}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground">{t.disp30d}%</td>
              </tr>
            ))}
            {!towersQuery.isLoading && !towersQuery.isError && rows.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">Sem sites neste estado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
