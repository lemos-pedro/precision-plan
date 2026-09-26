import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Bell, Menu, LogOut, Check, Search, Radio, Clock3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAlarms } from "@/lib/alarms-store";
import { useAuth } from "@/lib/auth";
import { SidebarContent } from "./Sidebar";
import type { Alarm } from "@/lib/api-adapters";
import type { AlarmSeverity } from "@/lib/api";
import { AlarmDetailDialog } from "@/components/alarms/AlarmDetailDialog";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/torres": "Sites",
  "/equipamentos": "Equipamentos",
  "/relatorios": "Relatórios",
  "/mapa": "Mapa",
  "/equipas": "Gestão de Equipas",
  "/alarmes": "Alarmes & Tickets",
  "/configuracoes": "Configurações",
};

const sevDot: Record<AlarmSeverity, string> = {
  critical: "bg-offline",
  warning: "bg-degraded",
  info: "bg-azul-claro",
};

export function Topbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { active } = useAlarms();
  const { user, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Alarm | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Estado real da ligação ao servidor + relógio (só após hidratação).
  const health = useQuery({ queryKey: ["health"], queryFn: () => api.health(), refetchInterval: 60_000 });
  const [clock, setClock] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("pt-PT", { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);


  let title = titles[pathname] ?? "Antosc";
  if (pathname.startsWith("/torres/") && pathname !== "/torres") title = "Detalhe da Torre";

  const initials = (user?.name || "AL").slice(0, 2).toUpperCase();
  const top5 = active.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 h-[52px] bg-card border-b border-border px-3 lg:px-5 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-md focus-visible:ring-2 focus-visible:ring-azul-2 outline-none">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] bg-azul border-0 [&>button]:text-white">
            <SidebarContent forceExpanded onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <div className="hidden text-[9px] uppercase text-muted-foreground sm:block">TowerCore / Operações</div>
          <h1 className="font-display text-sm text-foreground truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden xl:flex w-64 items-center gap-2 rounded border border-border bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span>Pesquisar site, IP ou alarme</span>
        </div>
        <div className="hidden md:flex items-center gap-3 border-x border-border px-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Radio
              className={`h-3 w-3 ${health.isError ? "text-offline" : health.isLoading ? "text-muted-foreground" : "text-online"}`}
            />
            {health.isError
              ? "Servidor sem ligação"
              : health.isLoading
                ? "A ligar ao servidor…"
                : "Monitorização activa"}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <Clock3 className="h-3 w-3" /> {clock ?? "--:--:--"}
          </span>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button aria-label="Abrir alarmes activos" className="relative p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-azul-2 outline-none">
              <Bell className="h-5 w-5" />
              {active.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-offline text-white text-[10px] font-bold flex items-center justify-center">
                  {active.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[360px] p-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold">Alarmes activos</span>
              <span className="text-[11px] text-muted-foreground">{active.length}</span>
            </div>
            {top5.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                <Check className="h-6 w-6 text-online mx-auto mb-2" />
                Sem alarmes activos
              </div>
            ) : (
              <ul className="max-h-[360px] overflow-y-auto divide-y divide-border">
                {top5.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => { setSelected(a); setPopoverOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevDot[a.severity]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{a.title}</p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{a.towerName} · {a.time}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="px-4 py-2 border-t border-border">
              <Link to="/torres" className="text-xs text-azul-2 hover:underline">Ver todos os sites</Link>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-azul text-white text-xs font-semibold flex items-center justify-center focus-visible:ring-2 focus-visible:ring-azul-2 outline-none">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground font-normal truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }} className="text-offline focus:text-offline">
              <LogOut className="h-4 w-4 mr-2" /> Terminar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AlarmDetailDialog alarm={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </header>
  );
}
