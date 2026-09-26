import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Server, SlidersHorizontal, Info } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import { Panel } from "@/components/common/Panel";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — TOWERCORE" },
      {
        name: "description",
        content:
          "Preferências da consola TOWERCORE: densidade de visualização, intervalo de atualização e endereço do servidor de monitorização.",
      },
      { property: "og:title", content: "Configurações — TOWERCORE" },
      {
        property: "og:description",
        content:
          "Preferências da consola TOWERCORE: densidade de visualização, intervalo de atualização e endereço do servidor de monitorização.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

const PREFS_KEY = "towercore.prefs";
type Prefs = { densidade: "compacta" | "confortavel"; refresh: number; alarmesSom: boolean };
const DEFAULTS: Prefs = { densidade: "compacta", refresh: 60, alarmesSom: false };

function ConfiguracoesPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      /* ignore */
    }
  }, []);

  const save = () => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      toast.success("Preferências guardadas neste dispositivo");
    } catch {
      toast.error("Não foi possível guardar as preferências");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[9px] uppercase text-muted-foreground">TowerCore / Administração</div>
          <h1 className="font-display text-base">Configurações</h1>
        </div>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded bg-azul px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-azul-2 focus-visible:ring-2 focus-visible:ring-azul-claro outline-none"
        >
          <Save className="h-3.5 w-3.5" /> Guardar preferências
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel
          title={
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Visualização
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Densidade das tabelas</span>
              <select
                value={prefs.densidade}
                onChange={(e) => setPrefs({ ...prefs, densidade: e.target.value as Prefs["densidade"] })}
                className="h-7 rounded border border-border bg-background px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-azul-claro"
              >
                <option value="compacta">Compacta</option>
                <option value="confortavel">Confortável</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Intervalo de atualização (s)</span>
              <input
                type="number"
                min={15}
                max={600}
                step={15}
                value={prefs.refresh}
                onChange={(e) => setPrefs({ ...prefs, refresh: Number(e.target.value) })}
                className="h-7 w-24 rounded border border-border bg-background px-2 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-azul-claro"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Som em alarmes críticos</span>
              <input
                type="checkbox"
                checked={prefs.alarmesSom}
                onChange={(e) => setPrefs({ ...prefs, alarmesSom: e.target.checked })}
                className="h-4 w-4 accent-[var(--azul-claro)]"
              />
            </label>
            <p className="text-[10px] text-muted-foreground">
              Estas preferências ficam guardadas apenas neste dispositivo.
            </p>
          </div>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5" /> Servidor de monitorização
            </span>
          }
        >
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <dt className="text-muted-foreground">Endereço da API</dt>
              <dd className="font-mono text-[11px] break-all text-right">{API_BASE_URL}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <dt className="text-muted-foreground">Sessão</dt>
              <dd className="font-mono text-[11px]">{user?.email ?? user?.name ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Versão da consola</dt>
              <dd className="font-mono text-[11px]">TOWERCORE v0.1.45</dd>
            </div>
          </dl>
          <p className="mt-3 flex items-start gap-2 rounded bg-muted/60 px-2 py-2 text-[10px] text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            O endereço do servidor é definido no arranque da aplicação (variável
            <span className="font-mono"> VITE_API_BASE_URL</span>). Se estiver numa rede sem acesso ao
            servidor interno, as páginas mostram estados vazios em vez de dados.
          </p>
        </Panel>
      </div>
    </div>
  );
}
