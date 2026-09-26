import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RadioTower, CheckCircle2, AlertTriangle, AlertCircle, Clock, Activity } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TorresTable } from "@/components/dashboard/TorresTable";
import { SlaCard } from "@/components/dashboard/SlaCard";
import { AlarmsCard } from "@/components/dashboard/AlarmsCard";
import { AvailabilityChart } from "@/components/dashboard/AvailabilityChart";
import { StatusSummaryCard } from "@/components/dashboard/StatusSummaryCard";
import { EventsTimelineCard } from "@/components/dashboard/EventsTimelineCard";
import { OperatorStatsChart } from "@/components/dashboard/OperatorStatsChart";
import { SectionLabel } from "@/components/common/Panel";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api-adapters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Global NOC — TOWERCORE" },
      {
        name: "description",
        content:
          "Consola NOC do TOWERCORE: disponibilidade do parque de sites, energia, rede e alarmes activos em tempo real.",
      },
      { property: "og:title", content: "Visão Global NOC — TOWERCORE" },
      {
        property: "og:description",
        content: "Estado operacional consolidado dos sites, energia, rede e alarmes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: 500 }),
  });
  const towers = towersQuery.data?.data ?? [];
  const total = towersQuery.data?.meta.total ?? towers.length;
  const online = towers.filter((tower) => tower.status === "online").length;
  const degradadas = towers.filter((tower) => tower.status === "degraded").length;
  const offline = towers.filter((tower) => tower.status === "offline").length;
  const onlinePct = total ? (online / total) * 100 : 0;

  return (
    <div className="flex flex-col">
      <SectionLabel>Resumo de saúde</SectionLabel>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        <MetricCard
          icon={<RadioTower className="h-[18px] w-[18px] text-azul-2" strokeWidth={2} />}
          iconBg="var(--muted)" label="Sites totais" value={total}
          sub={towersQuery.isLoading ? "A carregar..." : "Inventário da API"}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-[18px] w-[18px] text-online" strokeWidth={2} />}
          iconBg="var(--online-bg)" label="Online" value={online} valueClass="text-online"
          sub={<><span className="text-online">{onlinePct.toFixed(1)}%</span> do parque</>}
        />
        <MetricCard
          icon={<AlertTriangle className="h-[18px] w-[18px] text-degraded" strokeWidth={2} />}
          iconBg="var(--degraded-bg)" label="Degradados" value={degradadas} valueClass="text-degraded"
          sub="Estado reportado pela API"
        />
        <MetricCard
          icon={<AlertCircle className="h-[18px] w-[18px] text-offline" strokeWidth={2} />}
          iconBg="var(--offline-bg)" label="Offline" value={offline} valueClass="text-offline"
          sub="Sem conectividade"
        />
        <MetricCard
          icon={<Clock className="h-[18px] w-[18px] text-azul-2" strokeWidth={2} />}
          iconBg="var(--muted)" label="Tickets abertos" value={degradadas + offline}
          sub="Sites com atenção operacional"
        />
        <MetricCard
          icon={<Activity className="h-[18px] w-[18px] text-azul-2" strokeWidth={2} />}
          iconBg="var(--muted)" label="Cobertura" value={`${onlinePct.toFixed(1)}%`}
          sub="Sites online"
        />
      </div>

      <SectionLabel>Estado dos sites</SectionLabel>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-2">
        <StatusSummaryCard />
        <SlaCard />
      </div>

      <SectionLabel>Rede e desempenho</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <AvailabilityChart />
        <OperatorStatsChart />
      </div>

      <SectionLabel>Alarmes e incidentes</SectionLabel>
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-2">
        <TorresTable />
        <AlarmsCard />
      </div>

      <div className="mt-2">
        <EventsTimelineCard />
      </div>
    </div>
  );
}
