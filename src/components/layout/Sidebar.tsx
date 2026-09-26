import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  RadioTower,
  Server,
  Globe2,
  BellRing,
  Settings,
  Users,
  FileBarChart,
  Network,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Logo } from "./Logo";
import { useNavState } from "@/lib/nav-state";

type NavEntry = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const groups: Array<{ id: string; title: string; items: NavEntry[] }> = [
  {
    id: "visao",
    title: "Visão operacional",
    items: [
      { to: "/", label: "Visão Global", icon: LayoutDashboard },
      { to: "/torres", label: "Sites", icon: RadioTower },
      { to: "/equipamentos", label: "Equipamentos", icon: Server },
    ],
  },
  {
    id: "operacao",
    title: "Operações",
    items: [
      { to: "/mapa", label: "Mapa Operacional", icon: Globe2 },
      { to: "/alarmes", label: "Alarmes & Tickets", icon: BellRing },
      { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
    ],
  },
  {
    id: "admin",
    title: "Administração",
    items: [
      { to: "/equipas", label: "Utilizadores", icon: Users },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  compact,
  onNavigate,
}: NavEntry & { active: boolean; compact: boolean; onNavigate?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      title={compact ? label : undefined}
      aria-label={label}
      className={[
        "group flex items-center gap-2.5 mx-2 my-px rounded text-[12px] transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-foreground/40 outline-none",
        compact ? "justify-center px-0 py-2" : "px-3 py-2",
        active
          ? "bg-sidebar-active text-sidebar-foreground font-semibold"
          : "text-sidebar-foreground/65 font-normal hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground",
      ].join(" ")}
    >
      <Icon className={["h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70"].join(" ")} />
      {!compact && <span className="flex-1">{label}</span>}
    </Link>
  );
}

export function SidebarContent({
  onNavigate,
  forceExpanded = false,
}: {
  onNavigate?: () => void;
  forceExpanded?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed, toggleCollapsed, isGroupOpen, toggleGroup } = useNavState();
  const compact = forceExpanded ? false : collapsed;
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-sidebar-foreground/10">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" onClick={onNavigate} className="text-sidebar-foreground block min-w-0">
            {compact ? <Network className="h-5 w-5" /> : <Logo className="h-7 w-auto" />}
          </Link>
          {!forceExpanded && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={compact ? "Expandir navegação" : "Recolher navegação"}
              className="hidden lg:inline-flex p-1 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10 focus-visible:ring-2 focus-visible:ring-sidebar-foreground/40 outline-none"
            >
              {compact ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          )}
        </div>
        {!compact && (
          <div className="mt-2 flex items-center gap-2 text-[9px] text-sidebar-foreground/45 uppercase">
            <Network className="h-3 w-3 text-online" /> Network Operations Center
          </div>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {groups.map((group) => {
          const open = compact ? true : isGroupOpen(group.id);
          return (
            <div key={group.id} className="pb-1">
              {compact ? (
                <div className="mx-3 my-2 h-px bg-sidebar-foreground/10" />
              ) : (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between px-5 pt-4 pb-1.5 text-[9px] text-sidebar-foreground/35 font-bold uppercase hover:text-sidebar-foreground/70 focus-visible:ring-2 focus-visible:ring-sidebar-foreground/40 outline-none"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={["h-3 w-3 transition-transform", open ? "" : "-rotate-90"].join(" ")}
                  />
                </button>
              )}
              {open &&
                group.items.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    compact={compact}
                    active={isActive(item.to)}
                    onNavigate={onNavigate}
                  />
                ))}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-foreground/10 text-[10px] text-sidebar-foreground/45">
        <div className="mb-1.5 flex items-center gap-2 text-online">
          <span className="dot-live h-1.5 w-1.5 rounded-full bg-online" />
          {!compact && "PLATAFORMA OPERACIONAL"}
        </div>
        {!compact && (
          <strong className="block text-sidebar-foreground/75 font-semibold">ANTOSC · TOWERCORE</strong>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { collapsed } = useNavState();
  return (
    <aside
      className={[
        "hidden lg:flex fixed left-0 top-0 bottom-0 bg-sidebar text-sidebar-foreground flex-col z-40 border-r border-sidebar-foreground/10 transition-[width] duration-150",
        collapsed ? "w-[60px]" : "w-[232px]",
      ].join(" ")}
    >
      <SidebarContent />
    </aside>
  );
}
