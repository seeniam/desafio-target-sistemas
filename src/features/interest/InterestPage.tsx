import { useState } from "react";
import { Calculator, CalendarDays, Info } from "lucide-react";
import { PageHeader } from "../../components/PageHeader.js";
import { calculateLateInterest, formatLocalToday, type InterestResult } from "../../interest/interest.js";
import { formatCents, parseMoneyToCents } from "../../utils/money.js";

interface InterestPageProps {
  today?: string;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function statusMessage(result: InterestResult): string {
  if (result.diasEmAtraso > 0) return "Cobrança vencida com encargos calculados.";
  if (result.vencimento === result.hoje) return "Pagamento dentro do prazo.";
  return "Esta cobrança ainda não está vencida.";
}

export function InterestPage({ today }: InterestPageProps) {
  const referenceDate = today ?? formatLocalToday();
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [result, setResult] = useState<InterestResult | null>(null);
  const [error, setError] = useState("");

  function calculate(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    try {
      const cents = parseMoneyToCents(amount);
      setResult(calculateLateInterest(cents / 100, dueDate, referenceDate));
      setError("");
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Não foi possível calcular os juros.");
      setResult(null);
    }
  }

  function formatAmountOnBlur(): void {
    try {
      const cents = parseMoneyToCents(amount);
      setAmount(formatCents(cents));
    } catch {
      // Mantém o texto digitado para que a pessoa consiga corrigir.
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Cálculo de juros"
        description="Calcule o valor atualizado de uma cobrança considerando juros simples de 2,5% ao dia."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="surface p-6" onSubmit={calculate}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Calculadora</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Informe o valor original e a data de vencimento no calendário civil.</p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="field-label">Valor original</span>
              <input className="field-input" value={amount} onChange={(event) => setAmount(event.target.value)} onBlur={formatAmountOnBlur} placeholder="R$ 100,00" inputMode="decimal" aria-describedby={error ? "interest-error" : undefined} />
            </label>
            <label className="block">
              <span className="field-label">Data de vencimento</span>
              <input className="field-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-describedby={error ? "interest-error" : undefined} />
            </label>

            {error ? <p id="interest-error" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

            <button type="submit" className="primary-button w-full">Calcular juros</button>
          </div>
        </form>

        <div className="surface p-6">
          {!result ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <CalendarDays className="h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">Resultado aparecerá aqui</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Calcule uma cobrança vencida, dentro do prazo ou futura sem sair da página.</p>
            </div>
          ) : (
            <div role="status" data-testid="interest-result">
              <p className="section-eyebrow">Resultado</p>
              <h2 className="mt-3 text-sm font-semibold text-slate-500">Valor atualizado</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{formatCents(result.valorAtualizadoCentavos)}</p>
              <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">{statusMessage(result)}</p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Valor original</dt><dd className="mt-1 font-semibold text-slate-950">{formatCents(result.valorOriginalCentavos)}</dd></div>
                <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Dias em atraso</dt><dd className="mt-1 font-semibold text-slate-950">{result.diasEmAtraso} dias</dd></div>
                <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Taxa diária</dt><dd className="mt-1 font-semibold text-slate-950">2,5%</dd></div>
                <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Juros</dt><dd className="mt-1 font-semibold text-slate-950">{formatCents(result.jurosCentavos)}</dd></div>
                <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Vencimento</dt><dd className="mt-1 font-semibold text-slate-950">{formatDate(result.vencimento)}</dd></div>
                <div className="rounded-2xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">Data de referência</dt><dd className="mt-1 font-semibold text-slate-950">{formatDate(result.hoje)}</dd></div>
              </dl>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 surface p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Info className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">Como funciona</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Juros = valor × 2,5% × dias em atraso. Foi adotado juros simples porque o enunciado não define capitalização.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
