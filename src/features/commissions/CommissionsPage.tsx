import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { calculateCommissions } from "../../commissions/commissions.js";
import { challengeSales } from "../../data/sales.js";
import { Badge } from "../../components/Badge.js";
import { MetricCard } from "../../components/MetricCard.js";
import { PageHeader } from "../../components/PageHeader.js";
import { formatCents } from "../../utils/money.js";

type RangeFilter = "all" | "0" | "1" | "5";
type SortField = "value" | "commission";

interface SaleRow {
  id: string;
  vendedor: string;
  valorCentavos: number;
  comissaoCentavos: number;
  percentual: 0 | 1 | 5;
}

function rangeLabel(percentual: 0 | 1 | 5): string {
  if (percentual === 0) return "Sem comissão";
  if (percentual === 1) return "Faixa intermediária";
  return "Faixa principal";
}

function rangeTone(percentual: 0 | 1 | 5): "neutral" | "blue" | "green" {
  if (percentual === 0) return "neutral";
  if (percentual === 1) return "blue";
  return "green";
}

export function CommissionsPage() {
  const summaries = useMemo(() => calculateCommissions(challengeSales), []);
  const [sellerFilter, setSellerFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");

  const rows = useMemo<SaleRow[]>(() => summaries.flatMap((summary) =>
    summary.vendas.map((sale, index) => ({
      id: `${summary.vendedor}-${index}`,
      vendedor: summary.vendedor,
      ...sale,
    })),
  ), [summaries]);

  const totalSold = summaries.reduce((sum, summary) => sum + summary.totalVendidoCentavos, 0);
  const totalCommission = summaries.reduce((sum, summary) => sum + summary.comissaoTotalCentavos, 0);
  const bestSeller = [...summaries].sort((a, b) => b.totalVendidoCentavos - a.totalVendidoCentavos)[0];
  const maxSold = bestSeller.totalVendidoCentavos;

  const filteredRows = rows
    .filter((row) => sellerFilter === "all" || row.vendedor === sellerFilter)
    .filter((row) => rangeFilter === "all" || row.percentual === Number(rangeFilter))
    .filter((row) => row.vendedor.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sortField === "value" ? b.valorCentavos - a.valorCentavos : b.comissaoCentavos - a.comissaoCentavos);

  const ranked = [...summaries].sort((a, b) => b.totalVendidoCentavos - a.totalVendidoCentavos);

  return (
    <div>
      <PageHeader
        eyebrow="Comercial"
        title="Comissões de vendas"
        description="Visualize o desempenho do time e a comissão calculada individualmente para cada venda."
        action={<button type="button" className="secondary-button" onClick={() => setSortField(sortField === "value" ? "commission" : "value")}><ArrowDownUp className="h-4 w-4" aria-hidden="true" />Ordenar por {sortField === "value" ? "comissão" : "valor"}</button>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de comissões">
        <MetricCard label="Total vendido" value={formatCents(totalSold)} helper="Soma dos dados fornecidos" />
        <MetricCard label="Comissão total" value={formatCents(totalCommission)} helper="Venda a venda, depois consolidado" />
        <MetricCard label="Total de vendas" value={String(rows.length)} helper="Registros analisados" />
        <MetricCard label="Melhor desempenho" value={bestSeller.vendedor} helper={formatCents(bestSeller.totalVendidoCentavos)} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Desempenho por vendedor</h2>
          <p className="mt-2 text-sm text-slate-500">Ranking ordenado por total vendido.</p>
          <div className="mt-6 space-y-4">
            {ranked.map((summary, index) => {
              const effectiveRate = (summary.comissaoTotalCentavos / summary.totalVendidoCentavos) * 100;
              return (
                <article key={summary.vendedor} className="rounded-2xl border border-slate-200 p-4" data-testid={`seller-${summary.vendedor}`}>
                  <div className="grid gap-4 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center">
                    <div className="flex items-center gap-3 sm:contents">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{index + 1}</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                        {summary.vendedor.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950">{summary.vendedor}</h3>
                      <p className="text-sm text-slate-500">{summary.vendas.length} vendas · taxa efetiva {effectiveRate.toFixed(2).replace(".", ",")}%</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-slate-950">{formatCents(summary.totalVendidoCentavos)}</p>
                      <p className="text-sm text-slate-500">{formatCents(summary.comissaoTotalCentavos)} comissão</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="surface p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Total vendido por vendedor</h2>
          <div className="mt-6 space-y-5">
            {ranked.map((summary) => (
              <div key={summary.vendedor}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">{summary.vendedor}</span>
                  <span className="text-slate-500">{formatCents(summary.totalVendidoCentavos)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${(summary.totalVendidoCentavos / maxSold) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 surface p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">Registro de vendas</h2>
            <p className="mt-2 text-sm text-slate-500">Filtre por vendedor, faixa e nome. Ordenação client-side por valor ou comissão.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:w-[720px]">
            <label className="block">
              <span className="field-label">Buscar vendedor</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-[18px] h-4 w-4 text-slate-400" aria-hidden="true" />
                <input className="field-input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome" />
              </span>
            </label>
            <label className="block">
              <span className="field-label">Vendedor</span>
              <select className="field-input" value={sellerFilter} onChange={(event) => setSellerFilter(event.target.value)}>
                <option value="all">Todos</option>
                {summaries.map((summary) => <option key={summary.vendedor} value={summary.vendedor}>{summary.vendedor}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2 md:col-span-1">
              <span className="field-label">Faixa</span>
              <select className="field-input" value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value as RangeFilter)}>
                <option value="all">Todas</option>
                <option value="0">0%</option>
                <option value="1">1%</option>
                <option value="5">5%</option>
              </select>
            </label>
          </div>
        </div>

        {/* Cards responsivos para mobile (< 640px) */}
        <div className="mt-6 space-y-3 sm:hidden" role="region" aria-label="Lista de vendas">
          {filteredRows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
              data-testid={`sale-card-${row.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Vendedor</p>
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{row.vendedor}</h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Valor da venda</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCents(row.valorCentavos)}</p>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Badge tone={rangeTone(row.percentual)}>{rangeLabel(row.percentual)}</Badge>
                  <span className="text-xs font-semibold text-slate-600">{row.percentual}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 mr-1.5">Comissão:</span>
                  <span className="text-sm font-semibold text-brand-700">{formatCents(row.comissaoCentavos)}</span>
                </div>
              </div>
            </article>
          ))}
          {filteredRows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Nenhuma venda encontrada com os filtros selecionados.
            </div>
          ) : null}
        </div>

        {/* Tabela para tablet e desktop (>= 640px) */}
        <div className="mt-6 hidden sm:block overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-3 pr-4 font-semibold">Vendedor</th>
                <th className="px-4 py-3 font-semibold">Valor da venda</th>
                <th className="px-4 py-3 font-semibold">Faixa</th>
                <th className="px-4 py-3 font-semibold">Percentual</th>
                <th className="py-3 pl-4 font-semibold">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-4 pr-4 font-medium text-slate-900">{row.vendedor}</td>
                  <td className="px-4 py-4 text-slate-700">{formatCents(row.valorCentavos)}</td>
                  <td className="px-4 py-4"><Badge tone={rangeTone(row.percentual)}>{rangeLabel(row.percentual)}</Badge></td>
                  <td className="px-4 py-4 text-slate-700">{row.percentual}%</td>
                  <td className="py-4 pl-4 font-semibold text-slate-900">{formatCents(row.comissaoCentavos)}</td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    Nenhuma venda encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 surface p-6">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">Como a comissão é calculada</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Até R$ 99,99</p><p className="mt-2 text-2xl font-semibold text-slate-950">0%</p></div>
          <div className="rounded-2xl bg-brand-50 p-4"><p className="text-sm font-semibold text-brand-900">R$ 100,00 - R$ 499,99</p><p className="mt-2 text-2xl font-semibold text-brand-700">1%</p></div>
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-semibold text-emerald-900">A partir de R$ 500,00</p><p className="mt-2 text-2xl font-semibold text-emerald-700">5%</p></div>
        </div>
        <p className="mt-4 text-sm text-slate-600">A comissão é calculada individualmente para cada venda antes da consolidação por vendedor.</p>
      </section>
    </div>
  );
}
