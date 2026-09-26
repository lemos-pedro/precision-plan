import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Search, RadioTower } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys, toUiTower, type UiTower } from "@/lib/api-adapters";

const dotColor = { online: "bg-online", degraded: "bg-degraded", offline: "bg-offline" } as const;

export function SiteTree({ currentId }: { currentId?: string }) {
  const [q, setQ] = useState("");
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: 500 }),
  });
  const regionsQuery = useQuery({
    queryKey: queryKeys.regions,
    queryFn: () => api.listRegions({ limit: 500 }),
  });

  const grouped = useMemo(() => {
    const towers = (towersQuery.data?.data ?? []).map((t) => toUiTower(t, { regions: regionsQuery.data?.data }));
    const term = q.trim().toLowerCase();
    const filtered = term
      ? towers.filter((t) => `${t.name} ${t.local} ${t.regiao}`.toLowerCase().includes(term))
      : towers;
    const map = new Map<string, UiTower[]>();
    for (const t of filtered) {
      const key = t.regiao || "Sem região";
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [towersQuery.data, regionsQuery.data, q]);

  return (
    <div className="noc-panel flex flex-col h-full overflow-hidden">
      <div className="border-b border-border bg-panel-header px-2 py-2">
        <div className="flex items-center gap-1.5 border border-border bg-card px-2 py-1 rounded-sm">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar site…"
            aria-label="Pesquisar site"
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {towersQuery.isLoading && <p className="px-3 py-3 text-[11px] text-muted-foreground">A carregar sites…</p>}
        {grouped.length === 0 && !towersQuery.isLoading && (
          <p className="px-3 py-3 text-[11px] text-muted-foreground">Sem resultados.</p>
        )}
        {grouped.map(([regiao, sites]) => {
          const isClosed = closed[regiao];
          return (
            <div key={regiao}>
              <button
                onClick={() => setClosed((c) => ({ ...c, [regiao]: !c[regiao] }))}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {isClosed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {regiao}
                <span className="ml-auto font-mono">{sites.length}</span>
              </button>
              {!isClosed &&
                sites.map((s) => (
                  <Link
                    key={s.id}
                    to="/torres/$torreId"
                    params={{ torreId: s.id }}
                    className={[
                      "flex items-center gap-2 pl-6 pr-2 py-1.5 text-[11px] transition-colors",
                      s.id === currentId ? "bg-azul-2/10 text-foreground font-semibold" : "text-muted-foreground hover:bg-data-grid hover:text-foreground",
                    ].join(" ")}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor[s.status]}`} />
                    <RadioTower className="h-3 w-3 shrink-0 opacity-60" />
                    <span className="truncate font-mono">{s.name}</span>
                  </Link>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
