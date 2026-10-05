import { numberToCents } from "../utils/money.js";

export interface Sale {
  vendedor: string;
  valor: number;
}

export interface SaleCommission {
  valorCentavos: number;
  comissaoCentavos: number;
  percentual: 0 | 1 | 5;
}

export interface SellerCommissionSummary {
  vendedor: string;
  totalVendidoCentavos: number;
  comissaoTotalCentavos: number;
  vendas: SaleCommission[];
}

export function commissionRateForCents(valueCentavos: number): 0 | 1 | 5 {
  if (!Number.isSafeInteger(valueCentavos) || valueCentavos <= 0) {
    throw new Error("O valor da venda deve ser positivo e expresso em centavos inteiros.");
  }
  if (valueCentavos < 10_000) return 0;
  if (valueCentavos < 50_000) return 1;
  return 5;
}

export function commissionForSale(value: number): SaleCommission {
  const valorCentavos = numberToCents(value, "Valor da venda");
  const percentual = commissionRateForCents(valorCentavos);
  return {
    valorCentavos,
    percentual,
    comissaoCentavos: Math.round((valorCentavos * percentual) / 100),
  };
}

export function calculateCommissions(sales: Sale[]): SellerCommissionSummary[] {
  const summaries = new Map<string, SellerCommissionSummary>();

  for (const sale of sales) {
    const vendedor = sale.vendedor.trim();
    if (!vendedor) throw new Error("O vendedor não pode ser vazio.");
    const calculation = commissionForSale(sale.valor);
    const current = summaries.get(vendedor) ?? {
      vendedor,
      totalVendidoCentavos: 0,
      comissaoTotalCentavos: 0,
      vendas: [],
    };
    current.totalVendidoCentavos += calculation.valorCentavos;
    current.comissaoTotalCentavos += calculation.comissaoCentavos;
    current.vendas.push(calculation);
    summaries.set(vendedor, current);
  }
  return [...summaries.values()];
}
