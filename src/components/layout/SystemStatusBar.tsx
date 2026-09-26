import { Activity, Database, Radio, ShieldCheck } from "lucide-react";

const services = [
  { label: "API", Icon: Database },
  { label: "SNMP", Icon: Radio },
  { label: "Monitorização", Icon: Activity },
];

export function SystemStatusBar() {
  return (
    <footer className="sticky bottom-0 z-20 hidden h-7 items-center justify-between border-t border-border bg-card px-5 text-[10px] text-muted-foreground lg:flex">
      <div className="flex items-center gap-5">
        {services.map(({ label, Icon }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon className="h-3 w-3 text-online" />
            {label} <strong className="font-mono font-medium text-online">OPERACIONAL</strong>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Sessão segura</span>
        <span className="font-mono">TOWERCORE v0.1.45</span>
      </div>
    </footer>
  );
}