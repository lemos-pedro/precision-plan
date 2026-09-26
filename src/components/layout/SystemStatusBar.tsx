import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Radio, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Estado real do servidor de monitorização: sem indicadores fixos.
 * Enquanto a verificação corre mostra "A VERIFICAR"; se falhar, "SEM LIGAÇÃO".
 */
export function SystemStatusBar() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api.health(),
    refetchInterval: 60_000,
  });

  const state = health.isLoading
    ? { text: "A VERIFICAR", tone: "text-muted-foreground" }
    : health.isError
      ? { text: "SEM LIGAÇÃO", tone: "text-offline" }
      : { text: "OPERACIONAL", tone: "text-online" };

  const services = [
    { label: "API", Icon: Database },
    { label: "SNMP", Icon: Radio },
    { label: "Monitorização", Icon: Activity },
  ];

  return (
    <footer className="sticky bottom-0 z-20 hidden h-7 items-center justify-between border-t border-border bg-card px-5 text-[10px] text-muted-foreground lg:flex">
      <div className="flex items-center gap-5">
        {services.map(({ label, Icon }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon className={`h-3 w-3 ${state.tone}`} />
            {label} <strong className={`font-mono font-medium ${state.tone}`}>{state.text}</strong>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Sessão segura
        </span>
      </div>
    </footer>
  );
}
