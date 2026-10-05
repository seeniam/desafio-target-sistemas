export function assertPositiveFinite(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} deve ser um número finito maior que zero.`);
  }
}

export function numberToCents(value: number, field = "Valor"): number {
  assertPositiveFinite(value, field);
  const cents = Math.round(value * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error(`${field} está fora do limite suportado.`);
  }
  return cents;
}

export function parseMoneyToCents(value: string, field = "Valor"): number {
  const raw = value.trim().replace(/^R\$\s*/i, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`${field} deve ser um valor monetário positivo com até duas casas decimais.`);
  }
  return numberToCents(Number(normalized), field);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
