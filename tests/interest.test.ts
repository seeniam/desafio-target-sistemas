import { describe, expect, it } from "vitest";
import { calculateLateInterest, formatLocalToday } from "../src/interest/interest.js";

describe("juros por atraso", () => {
  it.each([
    ["2026-05-10", "2026-05-10", 0, 0],
    ["2026-05-11", "2026-05-10", 0, 0],
    ["2026-05-09", "2026-05-10", 1, 250],
    ["2026-05-06", "2026-05-10", 4, 1_000],
    ["2026-01-31", "2026-02-02", 2, 500],
    ["2025-12-31", "2026-01-02", 2, 500],
  ] as const)("calcula %i dias entre %s e %s", (due, today, days, interest) => {
    const result = calculateLateInterest(100, due, today);
    expect(result).toMatchObject({ diasEmAtraso: days, jurosCentavos: interest, valorAtualizadoCentavos: 10_000 + interest });
  });
  it("arredonda juros simples de 2,5% ao centavo", () => {
    expect(calculateLateInterest(99.99, "2026-05-09", "2026-05-10").jurosCentavos).toBe(250);
  });
  it("trata datas como dias civis, sem horário embutido", () => {
    expect(calculateLateInterest(100, "2026-03-28", "2026-03-30").diasEmAtraso).toBe(2);
    expect(() => calculateLateInterest(100, "2026-03-28T23:00:00", "2026-03-30")).toThrow("AAAA-MM-DD");
  });
  it("formata hoje conforme o calendário local da data fornecida", () => {
    expect(formatLocalToday(new Date(2026, 4, 10, 23, 59))).toBe("2026-05-10");
  });
});
