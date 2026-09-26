import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  actions,
  children,
  className,
  bodyClassName,
  dense,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  dense?: boolean;
}) {
  return (
    <section className={cn("noc-panel flex flex-col overflow-hidden", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border bg-panel-header px-3 py-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{title}</h2>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn(dense ? "" : "p-3", "flex-1 min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-4 mb-2 first:mt-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
      {right}
    </div>
  );
}
