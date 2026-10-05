export type MovementType = "ENTRADA" | "SAIDA";

export interface Product {
  codigoProduto: number;
  descricaoProduto: string;
  estoque: number;
}

export interface StockMovement {
  id: string;
  codigoProduto: number;
  descricao: string;
  tipo: MovementType;
  quantidade: number;
  estoqueAnterior: number;
  estoqueFinal: number;
}

export interface StockMovementInput {
  id: string;
  codigoProduto: number;
  descricao: string;
  tipo: string;
  quantidade: number;
}

export class InventoryService {
  private readonly products = new Map<number, Product>();
  private readonly movements: StockMovement[] = [];
  private readonly movementIds = new Set<string>();

  constructor(products: Product[]) {
    for (const product of products) {
      if (!Number.isInteger(product.codigoProduto) || product.codigoProduto <= 0 || !product.descricaoProduto.trim() || !Number.isInteger(product.estoque) || product.estoque < 0) {
        throw new Error("Produto inicial inválido.");
      }
      if (this.products.has(product.codigoProduto)) throw new Error("Código de produto inicial duplicado.");
      this.products.set(product.codigoProduto, { ...product });
    }
  }

  move(input: StockMovementInput): StockMovement {
    const id = input.id.trim();
    const descricao = input.descricao.trim();
    if (!id) throw new Error("O identificador da movimentação não pode ser vazio.");
    if (this.movementIds.has(id)) throw new Error("O identificador da movimentação deve ser único.");
    if (!descricao) throw new Error("A descrição da movimentação não pode ser vazia.");
    if (input.tipo !== "ENTRADA" && input.tipo !== "SAIDA") throw new Error("O tipo deve ser ENTRADA ou SAIDA.");
    if (!Number.isInteger(input.quantidade) || input.quantidade <= 0) throw new Error("A quantidade deve ser um inteiro maior que zero.");
    const product = this.products.get(input.codigoProduto);
    if (!product) throw new Error("Produto não encontrado.");
    if (input.tipo === "SAIDA" && input.quantidade > product.estoque) throw new Error("A saída não pode gerar estoque negativo.");

    const estoqueAnterior = product.estoque;
    const tipo = input.tipo;
    product.estoque += tipo === "ENTRADA" ? input.quantidade : -input.quantidade;
    const movement: StockMovement = { ...input, id, descricao, tipo, estoqueAnterior, estoqueFinal: product.estoque };
    this.movementIds.add(id);
    this.movements.push(movement);
    return { ...movement };
  }

  getProducts(): Product[] { return [...this.products.values()].map((product) => ({ ...product })); }
  getHistory(): StockMovement[] { return this.movements.map((movement) => ({ ...movement })); }
}
