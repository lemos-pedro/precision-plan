/**
 * ================================================================
 *  DADOS DE TESTE — TOWERCORE
 * ================================================================
 *  Tudo o que a app mostra em "modo de teste" vem DESTE ficheiro.
 *  Edite os valores abaixo para testar cenários (site offline,
 *  bateria fraca, gerador em erro, etc.) antes de ligar ao servidor.
 *
 *  Ligar/desligar: Configurações → "Dados de teste"
 *  (ou VITE_USE_MOCK=true no ambiente).
 *  Com o modo desligado, a app fala só com o servidor real.
 * ================================================================
 */
import type {
  ApiAuditLog, ApiEvent, ApiGeneratorReading, ApiMetric, ApiOperator,
  ApiRegion, ApiSlaGlobal, ApiTicket, ApiTower,
} from "./api";

export const MOCK_KEY = "towercore.mock";

export function isMockMode(): boolean {
  const env = (import.meta as any).env?.VITE_USE_MOCK;
  if (env === "true") return true;
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(MOCK_KEY) === "1";
}

export function setMockMode(on: boolean) {
  if (on) localStorage.setItem(MOCK_KEY, "1");
  else localStorage.removeItem(MOCK_KEY);
}

const now = Date.now();
const ago = (min: number) => new Date(now - min * 60_000).toISOString();

// ---------------- Operadoras ----------------
export const MOCK_OPERATORS: ApiOperator[] = [
  { operator_id: "op-1", name: "Unitel", code: "UNT", created_at: ago(90000), updated_at: ago(1000) },
  { operator_id: "op-2", name: "Movicel", code: "MOV", created_at: ago(90000), updated_at: ago(1000) },
  { operator_id: "op-3", name: "Africell", code: "AFR", created_at: ago(90000), updated_at: ago(1000) },
];

// ---------------- Regiões ----------------
export const MOCK_REGIONS: ApiRegion[] = [
  { region_id: "rg-lda", name: "Luanda", latitude: -8.8383, longitude: 13.2344 },
  { region_id: "rg-bgl", name: "Benguela", latitude: -12.5763, longitude: 13.4055 },
  { region_id: "rg-hbo", name: "Huambo", latitude: -12.7761, longitude: 15.7392 },
  { region_id: "rg-hla", name: "Huíla", latitude: -14.9177, longitude: 13.4925 },
];

// ---------------- Sites / Torres ----------------
// Cada site: estado geral + energia DC (NetEco). Mude à vontade.
type T = Partial<ApiTower> & Pick<ApiTower, "tower_id" | "name" | "status" | "region_id" | "operator_id">;
const base = (t: T): ApiTower => ({
  site_id: t.tower_id.toUpperCase(),
  vendor: "Huawei",
  snmp_enabled: true,
  snmp_version: "v2c",
  snmp_target: "192.168.203.10",
  availability_30d: 99.5,
  updated_at: ago(5),
  created_at: ago(200000),
  ...t,
} as ApiTower);

export const MOCK_TOWERS: ApiTower[] = [
  base({ tower_id: "LDVIA015", name: "LDVIA015 Viana Sede", status: "online", region_id: "rg-lda", operator_id: "op-1", latitude: -8.905, longitude: 13.374, snmp_target: "192.168.203.5", dc_output_voltage: 53.6, dc_load_current: 42, battery_soc: 96, battery_soh: 91, battery_backup_time_h: 6.4, availability_30d: 99.97 }),
  base({ tower_id: "LDKIL002", name: "LDKIL002 Kilamba", status: "degraded", region_id: "rg-lda", operator_id: "op-1", latitude: -8.995, longitude: 13.27, dc_output_voltage: 49.8, dc_load_current: 55, battery_soc: 38, battery_soh: 72, battery_backup_time_h: 1.8, availability_30d: 97.4 }),
  base({ tower_id: "LDCAZ007", name: "LDCAZ007 Cazenga", status: "offline", region_id: "rg-lda", operator_id: "op-2", latitude: -8.82, longitude: 13.29, battery_soc: 8, battery_soh: 60, battery_backup_time_h: 0.2, availability_30d: 91.2 }),
  base({ tower_id: "LDTAL011", name: "LDTAL011 Talatona", status: "online", region_id: "rg-lda", operator_id: "op-3", latitude: -8.92, longitude: 13.18, dc_output_voltage: 54.1, dc_load_current: 38, battery_soc: 100, battery_soh: 95, battery_backup_time_h: 7.2, availability_30d: 99.99 }),
  base({ tower_id: "BGLOB003", name: "BGLOB003 Lobito Porto", status: "online", region_id: "rg-bgl", operator_id: "op-1", latitude: -12.36, longitude: 13.54, dc_output_voltage: 53.2, dc_load_current: 40, battery_soc: 88, battery_soh: 85, battery_backup_time_h: 5.1, availability_30d: 99.8 }),
  base({ tower_id: "BGCEN001", name: "BGCEN001 Benguela Centro", status: "degraded", region_id: "rg-bgl", operator_id: "op-2", latitude: -12.58, longitude: 13.41, dc_output_voltage: 51.0, dc_load_current: 61, battery_soc: 55, battery_soh: 80, battery_backup_time_h: 2.9, availability_30d: 98.1 }),
  base({ tower_id: "HBCID004", name: "HBCID004 Huambo Cidade", status: "online", region_id: "rg-hbo", operator_id: "op-1", latitude: -12.77, longitude: 15.73, dc_output_voltage: 53.9, dc_load_current: 36, battery_soc: 92, battery_soh: 89, battery_backup_time_h: 6.0, availability_30d: 99.9 }),
  base({ tower_id: "HBCAA009", name: "HBCAA009 Caála", status: "offline", region_id: "rg-hbo", operator_id: "op-3", latitude: -12.85, longitude: 15.56, battery_soc: 0, battery_soh: 55, availability_30d: 88.6 }),
  base({ tower_id: "HLLUB005", name: "HLLUB005 Lubango Sé", status: "online", region_id: "rg-hla", operator_id: "op-2", latitude: -14.92, longitude: 13.49, dc_output_voltage: 53.4, dc_load_current: 44, battery_soc: 81, battery_soh: 87, battery_backup_time_h: 4.7, availability_30d: 99.6 }),
  base({ tower_id: "HLCHI006", name: "HLCHI006 Chibia", status: "degraded", region_id: "rg-hla", operator_id: "op-1", latitude: -15.19, longitude: 13.69, dc_output_voltage: 50.2, dc_load_current: 58, battery_soc: 22, battery_soh: 68, battery_backup_time_h: 0.9, availability_30d: 96.3 }),
];

// ---------------- Medições SNMP por site ----------------
// Chaves lidas pela app (ver api-adapters.ts). 1 = OK/presente, 0 = falha/ausente.
type Reading = Record<string, number | string | boolean>;
export const MOCK_READINGS: Record<string, Reading> = {
  LDVIA015: { mains_voltage_l1_v: 221, load_current_a: 42, battery_voltage_v: 53.6, controller_temperature_c: 27, mains_status: 1, rectifier_1_status: 1, rectifier_2_status: 1, rectifier_3_status: 1, generator_status: "desligado", generator_fuel_percent: 84, generator_run_hours: 1240, humidity_percent: 48, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "rede", link_status: "up" },
  LDKIL002: { mains_voltage_l1_v: 0, load_current_a: 55, battery_voltage_v: 49.8, controller_temperature_c: 38, mains_status: 0, rectifier_1_status: 1, rectifier_2_status: 0, rectifier_3_status: 1, generator_status: "ligado", generator_fuel_percent: 27, generator_run_hours: 3410, humidity_percent: 66, door_open: true, smoke_alarm: false, ac_status: "desligado", power_source: "gerador", link_status: "degraded" },
  LDCAZ007: { mains_voltage_l1_v: 0, load_current_a: 0, battery_voltage_v: 44.1, controller_temperature_c: 47, mains_status: 0, rectifier_1_status: 0, rectifier_2_status: 0, rectifier_3_status: 0, generator_status: "erro", generator_fuel_percent: 4, generator_run_hours: 5120, humidity_percent: 88, door_open: false, smoke_alarm: true, ac_status: "erro", power_source: "bateria", link_status: "down" },
  LDTAL011: { mains_voltage_l1_v: 228, load_current_a: 38, battery_voltage_v: 54.1, controller_temperature_c: 24, mains_status: 1, rectifier_1_status: 1, rectifier_2_status: 1, rectifier_3_status: 1, generator_status: "desligado", generator_fuel_percent: 95, generator_run_hours: 310, humidity_percent: 41, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "rede", link_status: "up" },
  BGLOB003: { mains_voltage_l1_v: 219, load_current_a: 40, battery_voltage_v: 53.2, controller_temperature_c: 29, mains_status: 1, rectifier_1_status: 1, rectifier_2_status: 1, generator_status: "desligado", generator_fuel_percent: 70, generator_run_hours: 980, humidity_percent: 62, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "rede", link_status: "up" },
  BGCEN001: { mains_voltage_l1_v: 248, load_current_a: 61, battery_voltage_v: 51.0, controller_temperature_c: 36, mains_status: 1, rectifier_1_status: 1, rectifier_2_status: 1, generator_status: "desligado", generator_fuel_percent: 45, generator_run_hours: 2200, humidity_percent: 74, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "rede", link_status: "degraded" },
  HBCID004: { mains_voltage_l1_v: 223, load_current_a: 36, battery_voltage_v: 53.9, controller_temperature_c: 22, mains_status: 1, rectifier_1_status: 1, rectifier_2_status: 1, generator_status: "desligado", generator_fuel_percent: 90, generator_run_hours: 560, humidity_percent: 39, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "rede", link_status: "up" },
  HBCAA009: { mains_voltage_l1_v: 0, load_current_a: 0, battery_voltage_v: 41.0, controller_temperature_c: 31, mains_status: 0, rectifier_1_status: 0, generator_status: "erro", generator_fuel_percent: 0, generator_run_hours: 6100, humidity_percent: 58, door_open: true, smoke_alarm: false, ac_status: "desligado", power_source: "bateria", link_status: "down" },
  HLLUB005: { mains_voltage_l1_v: 225, load_current_a: 44, battery_voltage_v: 53.4, controller_temperature_c: 26, mains_status: 1, rectifier_1_status: 1, rectifier_2_status: 1, generator_status: "desligado", generator_fuel_percent: 66, generator_run_hours: 1500, humidity_percent: 35, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "rede", link_status: "up" },
  HLCHI006: { mains_voltage_l1_v: 0, load_current_a: 58, battery_voltage_v: 50.2, controller_temperature_c: 41, mains_status: 0, rectifier_1_status: 1, rectifier_2_status: 1, generator_status: "ligado", generator_fuel_percent: 18, generator_run_hours: 4020, humidity_percent: 52, door_open: false, smoke_alarm: false, ac_status: "ligado", power_source: "gerador", link_status: "degraded" },
};

/** Gera 30 leituras (uma a cada 30 min) com pequenas variações. */
function metricsFor(towerId: string): ApiMetric[] {
  const r = MOCK_READINGS[towerId];
  if (!r) return [];
  return Array.from({ length: 30 }, (_, i) => {
    const m: Reading = {};
    for (const [k, v] of Object.entries(r)) {
      m[k] = typeof v === "number" && i > 0 && v > 5 && !k.endsWith("_status") ? +(v * (1 + Math.sin(i + k.length) * 0.03)).toFixed(1) : v;
    }
    return { metric_id: `${towerId}-m${i}`, tower_id: towerId, collected_at: ago(i * 30), created_at: ago(i * 30), metrics: m };
  });
}

// ---------------- Eventos / Alarmes ----------------
export const MOCK_EVENTS: ApiEvent[] = [
  { event_id: "ev-1", tower_id: "LDCAZ007", type: "failure", severity: "critical", message: "Site offline — perda de ligação SNMP", occurred_at: ago(35), created_at: ago(35) },
  { event_id: "ev-2", tower_id: "LDCAZ007", type: "alarm", severity: "critical", message: "Detector de fumo activo no shelter", occurred_at: ago(50), created_at: ago(50) },
  { event_id: "ev-3", tower_id: "LDKIL002", type: "alarm", severity: "warning", message: "Falha de rede eléctrica — gerador em funcionamento", occurred_at: ago(80), created_at: ago(80) },
  { event_id: "ev-4", tower_id: "LDKIL002", type: "alarm", severity: "warning", message: "Porta do shelter aberta", occurred_at: ago(95), created_at: ago(95) },
  { event_id: "ev-5", tower_id: "HBCAA009", type: "failure", severity: "critical", message: "Baterias descarregadas — site em baixo", occurred_at: ago(140), created_at: ago(140) },
  { event_id: "ev-6", tower_id: "HLCHI006", type: "alarm", severity: "warning", message: "Combustível do gerador abaixo de 20%", occurred_at: ago(200), created_at: ago(200) },
  { event_id: "ev-7", tower_id: "BGCEN001", type: "alarm", severity: "warning", message: "Tensão AC elevada (248 V)", occurred_at: ago(260), created_at: ago(260) },
  { event_id: "ev-8", tower_id: "LDVIA015", type: "maintenance", severity: "info", message: "Manutenção preventiva concluída", occurred_at: ago(1500), created_at: ago(1500) },
  { event_id: "ev-9", tower_id: "BGLOB003", type: "recovery", severity: "info", message: "Rede eléctrica restabelecida", occurred_at: ago(2900), created_at: ago(2900) },
];

export const MOCK_TICKETS: ApiTicket[] = [
  { ticket_id: "tk-1", tower_id: "LDCAZ007", tower_name: "LDCAZ007 Cazenga", event_id: "ev-1", status: "open", created_at: ago(35), updated_at: ago(35) },
  { ticket_id: "tk-2", tower_id: "LDCAZ007", tower_name: "LDCAZ007 Cazenga", event_id: "ev-2", status: "open", created_at: ago(50), updated_at: ago(50) },
  { ticket_id: "tk-3", tower_id: "LDKIL002", tower_name: "LDKIL002 Kilamba", event_id: "ev-3", status: "acknowledged", acknowledged_at: ago(70), created_at: ago(80), updated_at: ago(70) },
  { ticket_id: "tk-4", tower_id: "LDKIL002", tower_name: "LDKIL002 Kilamba", event_id: "ev-4", status: "open", created_at: ago(95), updated_at: ago(95) },
  { ticket_id: "tk-5", tower_id: "HBCAA009", tower_name: "HBCAA009 Caála", event_id: "ev-5", status: "open", created_at: ago(140), updated_at: ago(140) },
  { ticket_id: "tk-6", tower_id: "HLCHI006", tower_name: "HLCHI006 Chibia", event_id: "ev-6", status: "acknowledged", acknowledged_at: ago(180), created_at: ago(200), updated_at: ago(180) },
  { ticket_id: "tk-7", tower_id: "BGCEN001", tower_name: "BGCEN001 Benguela Centro", event_id: "ev-7", status: "open", created_at: ago(260), updated_at: ago(260) },
  { ticket_id: "tk-8", tower_id: "BGLOB003", tower_name: "BGLOB003 Lobito Porto", event_id: "ev-9", status: "closed", acknowledged_at: ago(2950), closed_at: ago(2900), created_at: ago(3000), updated_at: ago(2900) },
];

export const MOCK_SLA: ApiSlaGlobal = { window_days: 30, availability_percent: 97.02, affected_towers: 5 };

export const MOCK_AUDIT: ApiAuditLog[] = [
  { id: "au-1", tower_id: "LDKIL002", user_id: "admin", action: "ticket.ack", detail: "Alarme reconhecido", created_at: ago(70) },
  { id: "au-2", tower_id: "BGLOB003", user_id: "admin", action: "ticket.close", detail: "Alarme fechado", created_at: ago(2900) },
  { id: "au-3", user_id: "admin", action: "auth.login", detail: "Sessão iniciada", created_at: ago(10) },
];

// ================================================================
//  Encaminhamento dos pedidos (não precisa de editar abaixo)
// ================================================================
function page<T>(rows: T[], q: URLSearchParams) {
  const limit = Number(q.get("limit") ?? rows.length) || rows.length;
  const offset = Number(q.get("offset") ?? 0);
  return { data: rows.slice(offset, offset + limit), meta: { limit, offset, total: rows.length } };
}

export async function mockFetch(input: string, init: RequestInit): Promise<Response> {
  await new Promise((r) => setTimeout(r, 250)); // simula latência de rede
  const url = new URL(input);
  const p = url.pathname;
  const q = url.searchParams;
  const method = (init.method ?? "GET").toUpperCase();
  const json = (body: unknown, status = 200) =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const notFound = () => json({ error: { code: "not_found", message: "Não encontrado (dados de teste)" } }, 404);
  let m: RegExpMatchArray | null;

  if (p === "/health" || p === "/api/v1/health") return json({ status: "ok", service: "towercore (dados de teste)", time: new Date().toISOString() });
  if (p === "/api/v1/auth" && method === "POST")
    return json({ token_type: "Bearer", access_token: "mock-token", expires_at: new Date(now + 864e5).toISOString(), user_id: "admin", username: "Admin (teste)", role: "admin" });

  if (p === "/api/v1/towers" && method === "GET") {
    let rows = MOCK_TOWERS;
    for (const k of ["status", "operator_id", "region_id"] as const) {
      const v = q.get(k);
      if (v) rows = rows.filter((t) => t[k] === v);
    }
    return json(page(rows, q));
  }
  if ((m = p.match(/^\/api\/v1\/towers\/([^/]+)$/))) return json(MOCK_TOWERS.find((t) => t.tower_id === m![1])) ?? notFound();
  if ((m = p.match(/^\/api\/v1\/towers\/([^/]+)\/events$/))) {
    const id = m[1];
    let rows = MOCK_EVENTS.filter((e) => e.tower_id === id);
    const sev = q.get("severity");
    if (sev) rows = rows.filter((e) => e.severity === sev);
    return json(page(rows, q));
  }
  if ((m = p.match(/^\/api\/v1\/towers\/([^/]+)\/energy\/generator$/))) {
    const r = MOCK_READINGS[m[1]];
    if (!r) return notFound();
    const g: ApiGeneratorReading = { TowerID: m[1], FuelLiters: Math.round(Number(r.generator_fuel_percent ?? 0) * 2), FuelPercent: Number(r.generator_fuel_percent ?? 0), BatteryVoltageV: 12.6, RunHoursTotal: Number(r.generator_run_hours ?? 0), CollectedAt: ago(5) };
    return json(g);
  }
  if (p === "/api/v1/sla/global") return json(MOCK_SLA);
  if (p === "/api/v1/operators") return json(page(MOCK_OPERATORS, q));
  if ((m = p.match(/^\/api\/v1\/operators\/([^/]+)$/))) return json(MOCK_OPERATORS.find((o) => o.operator_id === m![1])) ?? notFound();
  if (p === "/api/v1/regions") return json(page(MOCK_REGIONS, q));
  if ((m = p.match(/^\/api\/v1\/regions\/([^/]+)$/))) return json(MOCK_REGIONS.find((r) => r.region_id === m![1])) ?? notFound();
  if (p === "/api/v1/tickets") {
    let rows = MOCK_TICKETS;
    const st = q.get("status"), tw = q.get("tower_id");
    if (st) rows = rows.filter((t) => t.status === st);
    if (tw) rows = rows.filter((t) => t.tower_id === tw);
    return json(page(rows, q));
  }
  if ((m = p.match(/^\/api\/v1\/tickets\/([^/]+)\/(ack|close)$/))) {
    const t = MOCK_TICKETS.find((x) => x.ticket_id === m![1]);
    if (!t) return notFound();
    if (m[2] === "ack") { t.status = "acknowledged"; t.acknowledged_at = new Date().toISOString(); }
    else { t.status = "closed"; t.closed_at = new Date().toISOString(); }
    t.updated_at = new Date().toISOString();
    return json(t);
  }
  if (p === "/api/v1/metrics" && method === "GET") {
    const tw = q.get("tower_id");
    const rows = tw ? metricsFor(tw) : MOCK_TOWERS.flatMap((t) => metricsFor(t.tower_id).slice(0, 10));
    return json(page(rows, q));
  }
  if (p === "/api/v1/audit-logs") return json(page(MOCK_AUDIT, q));
  if (p === "/api/v1/audit-logs/export.csv")
    return new Response("id,action,detail,created_at\n" + MOCK_AUDIT.map((a) => `${a.id},${a.action},${a.detail},${a.created_at}`).join("\n"), { headers: { "Content-Type": "text/csv" } });
  if (p === "/api/v1/collect/snmp") return json({ message: "Recolha simulada (dados de teste)" });
  if (method !== "GET") return json({ message: "ok (dados de teste — alteração não guardada)" });
  return notFound();
}
