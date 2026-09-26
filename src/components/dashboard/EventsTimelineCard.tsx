import { useQueries, useQuery } from "@tanstack/react-query";
import { AlertOctagon, BellRing, Wrench, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api-adapters";
import type { EventType } from "@/lib/api";
import { Panel } from "@/components/common/Panel";

const eventIcons: Record<EventType, React.ComponentType<{ className?: string }>> = {
  failure: AlertOctagon,
  alarm: BellRing,
  maintenance: Wrench,
  recovery: CheckCircle2,
};

const eventColors: Record<EventType, { text: string; bg: string }> = {
  failure: { text: "text-offline", bg: "bg-offline-bg" },
  alarm: { text: "text-degraded", bg: "bg-degraded-bg" },
  maintenance: { text: "text-azul-2", bg: "bg-muted" },
  recovery: { text: "text-online", bg: "bg-online-bg" },
};

export function EventsTimelineCard() {
  const towersQuery = useQuery({
    queryKey: queryKeys.towers,
    queryFn: () => api.listTowers({ limit: 500 }),
  });

  const towerIds = (towersQuery.data?.data ?? []).map((t) => t.tower_id).slice(0, 5); // primeiras 5 torres

  // useQueries é UM único hook, chamado sempre — não muda de contagem entre
  // renders mesmo que towerIds mude de tamanho. Nunca usar useQuery dentro
  // de .map()/loop: viola as Rules of Hooks (nº de hooks tem de ser fixo).
  const eventsQueries = useQueries({
    queries: towerIds.map((id) => ({
      queryKey: queryKeys.events(id),
      queryFn: () => api.listTowerEvents(id, { limit: 10 }),
      enabled: !!id,
    })),
  });

  const allEvents = eventsQueries
    .flatMap((q) => q.data?.data ?? [])
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 5); // 5 eventos mais recentes

  return (
    <Panel title="Eventos recentes">
      {allEvents.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">Sem eventos recentes</div>
      ) : (
        <div className="divide-y divide-border">
          {allEvents.map((event) => {
            const Icon = eventIcons[event.type];
            const colors = eventColors[event.type];
            const date = new Date(event.occurred_at);
            const timeStr = date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
            const dateStr = date.toLocaleDateString("pt-PT");

            return (
              <div key={event.event_id} className="flex gap-2 py-2 first:pt-0 last:pb-0">
                <div className={`flex-shrink-0 h-6 w-6 rounded-sm flex items-center justify-center ${colors.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{event.message}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {dateStr} {timeStr} · <span className="uppercase font-semibold">{event.type}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}