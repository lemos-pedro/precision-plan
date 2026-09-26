import type { ReactNode } from "react";

export function MetricCard({
  icon, iconBg, label, value, valueClass, sub,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: ReactNode;
  valueClass?: string;
  sub?: ReactNode;
}) {
  return (
    <div className="noc-panel min-h-[112px] p-3.5 flex flex-col gap-2 border-t-2 border-t-azul-2/35 hover:border-t-azul-2 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase text-muted-foreground font-semibold">
          {label}
        </span>
        <span
          className="h-7 w-7 rounded flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
      </div>
      <div className={`text-2xl font-semibold leading-none tabular-nums font-mono ${value === "—" ? "text-muted-foreground" : (valueClass ?? "text-foreground")}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground leading-relaxed">{sub}</div>}
    </div>
  );
}
