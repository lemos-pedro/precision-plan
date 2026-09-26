import { RefreshCw } from "lucide-react";

/**
 * Mostra o momento da última leitura bem-sucedida vinda do servidor e permite
 * pedir uma nova. Sem dados simulados: quando ainda não houve leitura, diz isso.
 */
export function ScanPill({
  lastUpdatedAt,
  isFetching,
  onRefresh,
}: {
  lastUpdatedAt?: number | undefined;
  isFetching?: boolean | undefined;
  onRefresh?: (() => void) | undefined;
}) {
  let txt = "sem leitura";
  if (lastUpdatedAt) {
    const mins = Math.max(0, Math.round((Date.now() - lastUpdatedAt) / 60_000));
    txt = mins < 1 ? "agora" : `há ${mins} min`;
  }

  return (
    <button
      type="button"
      onClick={onRefresh}
      className="inline-flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-azul hover:text-white transition-colors"
    >
      <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
      Última leitura: {txt}
    </button>
  );
}
