import { describe, expect, it } from "vitest";
import { calculateCommissions, commissionForSale } from "../src/commissions/commissions.js";
import { challengeSales } from "../src/data/sales.js";

describe("comissões", () => {
  it.each([[99.99, 0], [100, 1], [499.99, 1], [500, 5]] as const)("aplica %i%% para R$ %s", (value, rate) => {
    expect(commissionForSale(value).percentual).toBe(rate);
  });
  it("soma comissões calculadas venda a venda para o mesmo vendedor", () => {
    const [summary] = calculateCommissions([{ vendedor: "A", valor: 100 }, { vendedor: "A", valor: 500 }]);
    expect(summary.totalVendidoCentavos).toBe(60_000);
    expect(summary.comissaoTotalCentavos).toBe(2_600);
  });
  it("mantém vendedores distintos", () => {
    expect(calculateCommissions([{ vendedor: "A", valor: 100 }, { vendedor: "B", valor: 500 }]).map((item) => item.vendedor)).toEqual(["A", "B"]);
  });
  it("calcula o resultado completo dos dados fornecidos", () => {
    expect(calculateCommissions(challengeSales).map(({ vendedor, totalVendidoCentavos, comissaoTotalCentavos }) => ({ vendedor, totalVendidoCentavos, comissaoTotalCentavos }))).toEqual([
      { vendedor: "João Silva", totalVendidoCentavos: 1_075_470, comissaoTotalCentavos: 49_569 },
      { vendedor: "Maria Souza", totalVendidoCentavos: 987_430, comissaoTotalCentavos: 46_596 },
      { vendedor: "Carlos Oliveira", totalVendidoCentavos: 792_835, comissaoTotalCentavos: 37_938 },
      { vendedor: "Ana Lima", totalVendidoCentavos: 876_395, comissaoTotalCentavos: 40_499 },
    ]);
  });
});
