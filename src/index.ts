import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { calculateCommissions } from "./commissions/commissions.js";
import { challengeSales } from "./data/sales.js";
import { initialProducts } from "./data/products.js";
import { InventoryService } from "./inventory/inventory.js";
import { calculateLateInterest } from "./interest/interest.js";
import { formatCents, parseMoneyToCents } from "./utils/money.js";

const rl = createInterface({ input, output, terminal: input.isTTY });
const inventory = new InventoryService(initialProducts);
let nextMovementNumber = 1;
const queuedAnswers: string[] = [];
let waitingForAnswer: ((answer: string) => void) | undefined;

rl.on("line", (line) => {
  const answer = line.trim();
  const resolve = waitingForAnswer;
  if (resolve) {
    waitingForAnswer = undefined;
    resolve(answer);
  } else {
    queuedAnswers.push(answer);
  }
});

function ask(question: string): Promise<string> {
  output.write(question);
  const answer = queuedAnswers.shift();
  if (answer !== undefined) return Promise.resolve(answer);
  return new Promise((resolve) => { waitingForAnswer = resolve; });
}

function showCommissions(): void {
  console.log("\nCOMISSÕES POR VENDEDOR");
  for (const summary of calculateCommissions(challengeSales)) {
    console.log(`\n${summary.vendedor}`);
    console.log(`Total vendido: ${formatCents(summary.totalVendidoCentavos)}`);
    console.log(`Comissão total: ${formatCents(summary.comissaoTotalCentavos)}`);
    for (const sale of summary.vendas) console.log(`  Venda ${formatCents(sale.valorCentavos)} | ${sale.percentual}% | ${formatCents(sale.comissaoCentavos)}`);
  }
}

async function moveInventory(): Promise<void> {
  console.log("\nESTOQUE ATUAL");
  for (const product of inventory.getProducts()) console.log(`${product.codigoProduto} - ${product.descricaoProduto}: ${product.estoque}`);
  try {
    const codigoProduto = Number(await ask("Código do produto: "));
    const tipo = (await ask("Tipo (ENTRADA/SAIDA): ")).toUpperCase();
    const quantidade = Number(await ask("Quantidade: "));
    const descricao = await ask("Descrição: ");
    const movement = inventory.move({ id: `MOV-${nextMovementNumber++}`, codigoProduto, tipo, quantidade, descricao });
    console.log(`Movimentação ${movement.id} registrada. Estoque final: ${movement.estoqueFinal}.`);
  } catch (error) {
    console.log(`Erro: ${error instanceof Error ? error.message : "falha inesperada"}`);
  }
}

async function calculateInterest(): Promise<void> {
  try {
    const cents = parseMoneyToCents(await ask("Valor (ex.: 150,50): "));
    const vencimento = await ask("Vencimento (AAAA-MM-DD): ");
    const result = calculateLateInterest(cents / 100, vencimento);
    console.log(`\nValor original: ${formatCents(result.valorOriginalCentavos)}`);
    console.log(`Vencimento: ${result.vencimento}`);
    console.log(`Hoje: ${result.hoje}`);
    console.log(`Dias em atraso: ${result.diasEmAtraso}`);
    console.log(`Juros: ${formatCents(result.jurosCentavos)}`);
    console.log(`Valor atualizado: ${formatCents(result.valorAtualizadoCentavos)}`);
  } catch (error) {
    console.log(`Erro: ${error instanceof Error ? error.message : "falha inesperada"}`);
  }
}

async function main(): Promise<void> {
  while (true) {
    console.log("\n================================\nDESAFIO TÉCNICO\n================================\n1 - Calcular comissões\n2 - Movimentar estoque\n3 - Calcular juros\n0 - Sair");
    const option = await ask("Escolha uma opção: ");
    if (option === "0") break;
    if (option === "1") showCommissions();
    else if (option === "2") await moveInventory();
    else if (option === "3") await calculateInterest();
    else console.log("Opção inválida. Tente novamente.");
  }
  rl.close();
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
