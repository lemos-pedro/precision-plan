import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { queryKeys, toUiTower } from "@/lib/api-adapters";
import { Panel } from "@/components/common/Panel";

export function AvailabilityChart() {
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

  const towers = (towersQuery.data?.data ?? []).map((tower) =>
    toUiTower(tower, {
      regions: regionsQuery.data?.data,
      operators: operatorsQuery.data?.data,
    }),
  );

  // Agrupar por região
  const regionStats = towers.reduce(
    (acc, tower) => {
      const region = acc.find((r) => r.name === tower.regiao);
      if (region) {
        region.total += 1;
        region.online += tower.status === "online" ? 1 : 0;
        region.degraded += tower.status === "degraded" ? 1 : 0;
        region.offline += tower.status === "offline" ? 1 : 0;
      } else {
        acc.push({
          name: tower.regiao,
          total: 1,
          online: tower.status === "online" ? 1 : 0,
          degraded: tower.status === "degraded" ? 1 : 0,
          offline: tower.status === "offline" ? 1 : 0,
        });
      }
      return acc;
    },
    [] as Array<{ name: string; total: number; online: number; degraded: number; offline: number }>,
  );

  if (towersQuery.isLoading) {
    return (
      <Panel title="Estado dos sites por região">
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">A carregar...</div>
      </Panel>
    );
  }

  return (
    <Panel title="Estado dos sites por região">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={regionStats} barCategoryGap="22%">
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid var(--border)" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="online" name="Online" fill="var(--online)" />
          <Bar dataKey="degraded" name="Degradado" fill="var(--degraded)" />
          <Bar dataKey="offline" name="Offline" fill="var(--offline)" />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}
