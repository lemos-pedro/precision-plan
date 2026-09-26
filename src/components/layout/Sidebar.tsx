import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, RadioTower, Server, Globe2, BellRing, Settings, Users, FileBarChart, Network, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";

const principal = [
  { to: "/",             label: "Visão Global", icon: LayoutDashboard },
  { to: "/torres",       label: "Sites", icon: RadioTower },
  { to: "/equipamentos", label: "Equipamentos", icon: Server },
] as const;

const operacao = [
  { to: "/mapa", label: "Mapa Operacional", icon: Globe2 },
  { to: "/alarmes", label: "Alarmes & Tickets", icon: BellRing },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
] as const;

const admin = [
  { to: "/equipas", label: "Utilizadores", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function NavItem({
  to, label, icon: Icon, active, onNavigate,
}: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={[
        "group flex items-center gap-2.5 mx-2 my-px px-3 py-2 rounded text-[12px] transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-foreground/40 outline-none",
        active ? "bg-sidebar-active text-sidebar-foreground font-semibold" : "text-sidebar-foreground/65 font-normal hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground",
      ].join(" ")}
    >
      <Icon className={["h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70"].join(" ")} />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3 w-3 opacity-70" />}
    </Link>
  );
}

function Section({ title }: { title: string }) {
  return <div className="px-5 pt-4 pb-1.5 text-[9px] text-sidebar-foreground/35 font-bold uppercase">{title}</div>;
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-sidebar-foreground/10">
        <Link to="/" onClick={onNavigate} className="text-sidebar-foreground block">
          <Logo className="h-7 w-auto" />
        </Link>
        <div className="mt-2 flex items-center gap-2 text-[9px] text-sidebar-foreground/45 uppercase">
          <Network className="h-3 w-3 text-online" /> Network Operations Center
        </div>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        <Section title="Visão operacional" />
        {principal.map((i) => <NavItem key={i.to} {...i} active={isActive(i.to)} onNavigate={onNavigate} />)}
        <Section title="Operações" />
        {operacao.map((i) => <NavItem key={i.to} {...i} active={isActive(i.to)} onNavigate={onNavigate} />)}
        <Section title="Administração" />
        {admin.map((i) => <NavItem key={i.to} {...i} active={isActive(i.to)} onNavigate={onNavigate} />)}
      </nav>
      <div className="px-4 py-3 border-t border-sidebar-foreground/10 text-[10px] text-sidebar-foreground/45">
        <div className="mb-1.5 flex items-center gap-2 text-online"><span className="dot-live h-1.5 w-1.5 rounded-full bg-online" /> PLATAFORMA OPERACIONAL</div>
        <strong className="block text-sidebar-foreground/75 font-semibold">ANTOSC · TOWERCORE</strong>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[232px] bg-sidebar text-sidebar-foreground flex-col z-40 border-r border-sidebar-foreground/10">
      <SidebarContent />
    </aside>
  );
}
