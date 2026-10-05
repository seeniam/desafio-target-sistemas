import { ArrowRight, BarChart3, Boxes, Calculator } from "lucide-react";
import type { PageId } from "../../app/App.js";
import { BrandLogo } from "../../components/BrandLogo.js";

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

const cards: Array<{
  title: string;
  description: string;
  facts: string[];
  cta: string;
  page: PageId;
  icon: typeof BarChart3;
}> = [
  {
    title: "Comissões",
    description: "Cálculo automático de comissão por venda e consolidação por vendedor.",
    facts: ["4 vendedores", "36 vendas", "regras progressivas"],
    cta: "Ver comissões",
    page: "commissions",
    icon: BarChart3,
  },
  {
    title: "Estoque",
    description: "Movimentações de entrada e saída com saldo atualizado e histórico.",
    facts: ["5 produtos", "IDs únicos", "proteção contra saldo negativo"],
    cta: "Gerenciar estoque",
    page: "inventory",
    icon: Boxes,
  },
  {
    title: "Juros",
    description: "Cálculo de juros simples por atraso considerando dias civis.",
    facts: ["2,5% ao dia", "datas normalizadas", "cálculo instantâneo"],
    cta: "Calcular juros",
    page: "interest",
    icon: Calculator,
  },
];

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  return (
    <div>
      <section className="surface overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-white shadow-soft">
                <BrandLogo className="h-4 w-4" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-eyebrow">Desafio Técnico</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Neemias C. Santos</span>
              </div>
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Painel Operacional</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Uma interface para visualizar comissões, controlar movimentações de estoque e calcular encargos por atraso.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="primary-button" onClick={() => onNavigate("commissions")}>
                Explorar módulos
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-3">
              {["Comissão por venda", "Saldo protegido", "Juros por dia civil"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">0{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3" aria-label="Módulos principais">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="group surface flex flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {card.facts.map((fact) => (
                  <span key={fact} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{fact}</span>
                ))}
              </div>
              <button type="button" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition group-hover:gap-3" onClick={() => onNavigate(card.page)}>
                {card.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
