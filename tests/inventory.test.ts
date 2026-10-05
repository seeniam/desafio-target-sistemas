import { describe, expect, it } from "vitest";
import { InventoryService } from "../src/inventory/inventory.js";

const createInventory = () => new InventoryService([{ codigoProduto: 101, descricaoProduto: "Caneta", estoque: 10 }]);

describe("movimentação de estoque", () => {
  it("registra uma entrada válida", () => {
    const movement = createInventory().move({ id: "1", codigoProduto: 101, descricao: "Reposição", tipo: "ENTRADA", quantidade: 5 });
    expect(movement).toMatchObject({ estoqueAnterior: 10, estoqueFinal: 15 });
  });
  it("registra uma saída válida", () => {
    expect(createInventory().move({ id: "1", codigoProduto: 101, descricao: "Venda", tipo: "SAIDA", quantidade: 4 }).estoqueFinal).toBe(6);
  });
  it("aplica várias movimentações ao saldo atual", () => {
    const inventory = createInventory();
    inventory.move({ id: "1", codigoProduto: 101, descricao: "Reposição", tipo: "ENTRADA", quantidade: 5 });
    inventory.move({ id: "2", codigoProduto: 101, descricao: "Venda", tipo: "SAIDA", quantidade: 8 });
    expect(inventory.getProducts()[0].estoque).toBe(7);
  });
  it.each([
    [{ id: "1", codigoProduto: 999, descricao: "x", tipo: "ENTRADA", quantidade: 1 }, "Produto não encontrado"],
    [{ id: "1", codigoProduto: 101, descricao: "x", tipo: "ENTRADA", quantidade: 0 }, "inteiro maior"],
    [{ id: "1", codigoProduto: 101, descricao: "x", tipo: "ENTRADA", quantidade: -1 }, "inteiro maior"],
    [{ id: "1", codigoProduto: 101, descricao: "x", tipo: "AJUSTE", quantidade: 1 }, "ENTRADA ou SAIDA"],
    [{ id: "1", codigoProduto: 101, descricao: "x", tipo: "SAIDA", quantidade: 11 }, "estoque negativo"],
    [{ id: "1", codigoProduto: 101, descricao: "", tipo: "ENTRADA", quantidade: 1 }, "descrição"],
  ] as const)("rejeita movimentação inválida", (movement, message) => {
    expect(() => createInventory().move(movement)).toThrow(message);
  });
  it("não aceita identificadores repetidos e preserva o histórico", () => {
    const inventory = createInventory();
    inventory.move({ id: "id-1", codigoProduto: 101, descricao: "Entrada", tipo: "ENTRADA", quantidade: 3 });
    expect(() => inventory.move({ id: "id-1", codigoProduto: 101, descricao: "Outra", tipo: "ENTRADA", quantidade: 1 })).toThrow("único");
    expect(inventory.getHistory()).toEqual([expect.objectContaining({ id: "id-1", estoqueAnterior: 10, estoqueFinal: 13 })]);
  });
});
