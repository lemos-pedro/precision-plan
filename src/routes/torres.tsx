import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Search, RadioTower } from "lucide-react";
import { api, type TowerStatus } from "@/lib/api";
import { errorMessage, queryKeys, toUiTower } from "@/lib/api-adapters";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ScanPill } from "@/components/common/ScanPill";
import { Panel } from "@/components/common/Panel";
import { EmptyState } from "@/components/common/EmptyState";
import { fmtPct } from "@/lib/format";

export const Route = createFileRoute("/torres")({
  head: () => ({
    meta: [
      { title: "Sites — TOWERCORE" },
      {
        name: "description",
        content: "Inventário técnico e estado operacional dos sites monitorizados pelo TOWERCORE.",
      },
      { property: "og:title", content: "Sites — TOWERCORE" },
      {
        property: "og:description",
        content: "Inventário técnico e estado operacional dos sites monitorizados pelo TOWERCORE.",
      },
    ],
  }),
  component: TorresPage,
});

const FILTER_KEY = "towercore.sites.filters";
type StatusFilter = "all" | TowerStatus;

function TorresPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [regiao, setRegiao] = useState("all");
  const [restored, setRestored] = useState(false);

  // Filtros persistentes entre visitas (lidos após hidratação).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FILTER_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ q: string; status: StatusFilter; regiao: string }>;
        if (typeof saved.q === "string") setQ(saved.q);
        if (saved.status) setStatus(saved.status);
        if (typeof saved.regiao === "string") setRegiao(saved.regiao);
      }
    } catch {
      /* ignore */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(FILTER_KEY, JSON.stringify({ q, status, regiao }));
    } catch {
      /* ignore */
    }
  }, [q, status, regiao, restored]);

  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: 500 }),
  });
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions,
    queryFn: () => api.listRegions({ limit: 500 }),
  });
  const operatorsQuery = useQuery({
    queryKey: queryKeys.operators,
    queryFn: () => api.listOperators({ limit: 500 }),
  });

  const torres = useMemo(
    () =>
      (towersQuery.data?.data ?? []).map((tower) =>
        toUiTower(tower, { regions: regionsQuery.data?.data, operators: operatorsQuery.data?.data }),
      ),
    [towersQuery.data, regionsQuery.data, operatorsQuery.data],
  );

  const counts = useMemo(
    () => ({
      all: torres.length,
      online: torres.filter((t) => t.status === "online").length,
      degraded: torres.filter((t) => t.status === "degraded").length,
      offline: torres.filter((t) => t.status === "offline").length,
    }),
    [torres],
  );

  const regioes = useMemo(
    () => Array.from(new Set(torres.map((t) => t.regiao).filter(Boolean))).sort(),
    [torres],
  );

  const rows = useMemo(
    () =>
      torres.filter((t) => {
        const s = q.trim().toLowerCase();
        const matchQ =
          !s ||
          t.id.toLowerCase().includes(s) ||
          t.name.toLowerCase().includes(s) ||
          t.local.toLowerCase().includes(s) ||
          (t.ip ?? "").toLowerCase().includes(s);
        const matchStatus = status === "all" || t.status === status;
        const matchRegiao = regiao === "all" || t.regiao === regiao;
        return matchQ && matchStatus && matchRegiao;
      }),
    [q, status, regiao, torres],
  );

  const chips: Array<{ id: StatusFilter; label: string; value: number; tone: string }> = [
    { id: "all", label: "Todos", value: counts.all, tone: "text-foreground" },
    { id: "online", label: "Online", value: counts.online, tone: "text-online" },
    { id: "degraded", label: "Degradados", value: counts.degraded, tone: "text-degraded" },
    { id: "offline", label: "Offline", value: counts.offline, tone: "text-offline" },
  ];

  const openSite = (id: string) => navigate({ to: "/torres/$torreId", params: { torreId: id } });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <ScanPill
          lastUpdatedAt={towersQuery.dataUpdatedAt || undefined}
          isFetching={towersQuery.isFetching}
          onRefresh={() => void towersQuery.refetch()}
        />
        <p className="text-xs text-muted-foreground font-mono">
          {rows.length} / {torres.length} sites
        </p>
      </div>

      {towersQuery.isError && (
        <div className="bg-offline-bg text-offline border border-offline/20 rounded px-3 py-2 text-xs">
          {errorMessage(towersQuery.error)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setStatus(chip.id)}
            aria-pressed={status === chip.id}
            className={[
              "noc-panel px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-azul-claro outline-none",
              status === chip.id ? "border-azul-claro bg-muted/60" : "hover:bg-muted/40",
            ].join(" ")}
          >
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              {chip.label}
            </span>
            <span className={`block font-display text-xl leading-tight ${chip.tone}`}>{chip.value}</span>
          </button>
        ))}
      </div>

      <Panel
        title="Inventário de sites"
        dense
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              aria-label="Filtrar por região"
              className="h-7 rounded border border-border bg-background px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-azul-claro"
            >
              <option value="all">Todas as regiões</option>
              {regioes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="relative min-w-0 flex-1">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar id, nome, local, ip…"
                aria-label="Pesquisar sites"
                className="h-7 w-full min-w-0 rounded border border-border bg-background pl-7 pr-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-azul-claro sm:w-52"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-data-grid">
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="font-medium px-3 py-1.5">ID</th>
                <th className="font-medium px-3 py-1.5">Site</th>
                <th className="font-medium px-3 py-1.5">Região</th>
                <th className="font-medium px-3 py-1.5">Estado</th>
                <th className="font-medium px-3 py-1.5">IP</th>
                <th className="font-medium px-3 py-1.5 text-right">Disp. 30d</th>
              </tr>
            </thead>
            <tbody>
              {towersQuery.isLoading && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-xs text-muted-foreground">
                    A carregar sites…
                  </td>
                </tr>
              )}
              {rows.map((t) => (
                <tr
                  key={t.id}
                  tabIndex={0}
                  role="link"
                  onClick={() => openSite(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openSite(t.id);
                    }
                  }}
                  className="border-t border-border cursor-pointer hover:bg-muted/40 focus:bg-muted/60 focus:outline-none transition-colors"
                >
                  <td className="px-3 py-1.5 font-mono text-[11px]">{t.id}</td>
                  <td className="px-3 py-1.5 text-xs">
                    <span className="font-medium">{t.name || t.local}</span>
                    <span className="block text-[10px] text-muted-foreground">{t.local}</span>
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">{t.regiao || "—"}</td>
                  <td className="px-3 py-1.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td
                    className={`px-3 py-1.5 font-mono text-[11px] ${t.status === "offline" ? "text-offline/70" : "text-muted-foreground"}`}
                  >
                    {t.ip ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-[11px]">{fmtPct(t.disp30d, 2)}</td>
                </tr>
              ))}
              {!towersQuery.isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6">
                    <EmptyState
                      icon={<RadioTower className="h-6 w-6" />}
                      title="Nenhum site encontrado"
                      hint="Ajuste a pesquisa ou os filtros de estado e região."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Outlet />
    </div>
  );
}
