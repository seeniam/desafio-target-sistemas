import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ClipboardList, Package, X } from "lucide-react";
import { initialProducts } from "../../data/products.js";
import { InventoryService, type Product, type StockMovement } from "../../inventory/inventory.js";
import { Badge } from "../../components/Badge.js";
import { PageHeader } from "../../components/PageHeader.js";

type MovementKind = "ENTRADA" | "SAIDA";

interface LastResult {
  productName: string;
  movement: StockMovement;
}

export function InventoryPage() {
  const inventory = useMemo(() => new InventoryService(initialProducts), []);
  const [products, setProducts] = useState<Product[]>(() => inventory.getProducts());
  const [history, setHistory] = useState<StockMovement[]>(() => inventory.getHistory());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [type, setType] = useState<MovementKind>("ENTRADA");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [nextMovementNumber, setNextMovementNumber] = useState(1);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedProduct) quantityRef.current?.focus();
  }, [selectedProduct]);

  function refresh(): void {
    setProducts(inventory.getProducts());
    setHistory(inventory.getHistory());
  }

  function openMovement(product: Product): void {
    setSelectedProduct(product);
    setType("ENTRADA");
    setQuantity("");
    setDescription("");
    setError("");
    setLastResult(null);
  }

  function closePanel(): void {
    setSelectedProduct(null);
    setError("");
  }

  function submitMovement(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!selectedProduct) {
      setError("Produto não encontrado.");
      return;
    }
    try {
      const movement = inventory.move({
        id: `MOV-${String(nextMovementNumber).padStart(4, "0")}`,
        codigoProduto: selectedProduct.codigoProduto,
        tipo: type,
        quantidade: Number(quantity),
        descricao: description,
      });
      setNextMovementNumber((current) => current + 1);
      refresh();
      setLastResult({ productName: selectedProduct.descricaoProduto, movement });
      setSelectedProduct(inventory.getProducts().find((product) => product.codigoProduto === selectedProduct.codigoProduto) ?? null);
      setQuantity("");
      setDescription("");
      setError("");
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Não foi possível registrar a movimentação.");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operações"
        title="Controle de estoque"
        description="Registre entradas e saídas e acompanhe o saldo atualizado dos produtos."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Produtos em estoque">
        {products.map((product) => (
          <article key={product.codigoProduto} className="surface p-6 transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg" data-testid={`product-${product.codigoProduto}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">#{product.codigoProduto}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{product.descricaoProduto}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Package className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">{product.estoque}</p>
            <p className="mt-1 text-sm text-slate-500">unidades disponíveis</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Badge tone="blue">Saldo atualizado</Badge>
              <button type="button" className="secondary-button py-2.5" onClick={() => openMovement(product)}>
                Movimentar estoque
              </button>
            </div>
          </article>
        ))}
      </section>

      {selectedProduct ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="inventory-panel-title">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Nova movimentação</p>
                <h2 id="inventory-panel-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{selectedProduct.descricaoProduto}</h2>
                <p className="mt-2 text-sm text-slate-500">Código #{selectedProduct.codigoProduto} · estoque atual {selectedProduct.estoque}</p>
              </div>
              <button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600" aria-label="Fechar painel" onClick={closePanel}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={submitMovement}>
              <fieldset>
                <legend className="field-label">Tipo da movimentação</legend>
                <div className="mt-2 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                  {(["ENTRADA", "SAIDA"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${type === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
                      aria-pressed={type === item}
                      onClick={() => setType(item)}
                    >
                      {item === "ENTRADA" ? "Entrada" : "Saída"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="field-label">Quantidade</span>
                <input ref={quantityRef} className="field-input" type="number" inputMode="numeric" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-describedby={error ? "inventory-error" : undefined} />
              </label>

              <label className="block">
                <span className="field-label">Descrição</span>
                <textarea className="field-input min-h-24 resize-y" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Reposição do fornecedor, saída para pedido ou ajuste de inventário" aria-describedby={error ? "inventory-error" : undefined} />
              </label>

              {error ? <p id="inventory-error" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

              <button type="submit" className="primary-button w-full sm:w-auto">Registrar movimentação</button>
            </form>

            {lastResult ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5" role="status">
                <div className="flex items-center gap-3 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <p className="font-semibold">Movimentação registrada</p>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-emerald-700">Produto</dt><dd className="font-semibold text-emerald-950">{lastResult.productName}</dd></div>
                  <div><dt className="text-emerald-700">ID</dt><dd className="font-semibold text-emerald-950">{lastResult.movement.id}</dd></div>
                  <div><dt className="text-emerald-700">Estoque anterior</dt><dd className="font-semibold text-emerald-950">{lastResult.movement.estoqueAnterior}</dd></div>
                  <div><dt className="text-emerald-700">{lastResult.movement.tipo === "ENTRADA" ? "Entrada" : "Saída"}</dt><dd className="font-semibold text-emerald-950">{lastResult.movement.quantidade}</dd></div>
                  <div><dt className="text-emerald-700">Estoque atual</dt><dd className="font-semibold text-emerald-950">{lastResult.movement.estoqueFinal}</dd></div>
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="mt-8 surface p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">Histórico de movimentações</h2>
            <p className="mt-1 text-sm text-slate-500">Entradas e saídas registradas nesta sessão.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="mt-3 font-semibold text-slate-800">Nenhuma movimentação registrada ainda.</p>
            <p className="mt-1 text-sm text-slate-500">Escolha um produto para registrar a primeira entrada ou saída.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[780px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-3 pr-4 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Descrição</th>
                  <th className="px-4 py-3 font-semibold">Quantidade</th>
                  <th className="px-4 py-3 font-semibold">Estoque anterior</th>
                  <th className="py-3 pl-4 font-semibold">Estoque final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((movement) => {
                  const product = products.find((item) => item.codigoProduto === movement.codigoProduto) ?? initialProducts.find((item) => item.codigoProduto === movement.codigoProduto);
                  return (
                    <tr key={movement.id} className="hover:bg-slate-50">
                      <td className="py-4 pr-4 font-semibold text-slate-950">{movement.id}</td>
                      <td className="px-4 py-4 text-slate-700">{product?.descricaoProduto ?? movement.codigoProduto}</td>
                      <td className="px-4 py-4"><Badge tone={movement.tipo === "ENTRADA" ? "green" : "red"}>{movement.tipo === "ENTRADA" ? "Entrada" : "Saída"}</Badge></td>
                      <td className="px-4 py-4 text-slate-700">{movement.descricao}</td>
                      <td className="px-4 py-4 text-slate-700">{movement.quantidade}</td>
                      <td className="px-4 py-4 text-slate-700">{movement.estoqueAnterior}</td>
                      <td className="py-4 pl-4 font-semibold text-slate-950">{movement.estoqueFinal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
