import { numberToCents } from "../utils/money.js";

export interface InterestResult {
  valorOriginalCentavos: number;
  vencimento: string;
  hoje: string;
  diasEmAtraso: number;
  jurosCentavos: number;
  valorAtualizadoCentavos: number;
}

function parseCivilDate(value: string, field: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${field} deve estar no formato AAAA-MM-DD.`);
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`${field} não é uma data válida.`);
  }
  return timestamp;
}

export function formatLocalToday(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateLateInterest(valor: number, vencimento: string, hoje = formatLocalToday()): InterestResult {
  const valorOriginalCentavos = numberToCents(valor, "Valor");
  const dueAt = parseCivilDate(vencimento, "Vencimento");
  const todayAt = parseCivilDate(hoje, "Data de referência");
  const diasEmAtraso = Math.max(0, Math.round((todayAt - dueAt) / 86_400_000));
  // Juros simples: 2,5% ao dia, arredondados ao centavo no total calculado.
  const jurosCentavos = Math.round((valorOriginalCentavos * diasEmAtraso) / 40);
  return { valorOriginalCentavos, vencimento, hoje, diasEmAtraso, jurosCentavos, valorAtualizadoCentavos: valorOriginalCentavos + jurosCentavos };
}
