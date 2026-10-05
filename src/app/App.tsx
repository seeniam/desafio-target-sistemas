import { useState } from "react";
import { BarChart3, Boxes, Calculator, LayoutDashboard, Menu, X } from "lucide-react";
import { CommissionsPage } from "../features/commissions/CommissionsPage.js";
import { InventoryPage } from "../features/inventory/InventoryPage.js";
import { InterestPage } from "../features/interest/InterestPage.js";
import { OverviewPage } from "../features/overview/OverviewPage.js";
import { BrandLogo } from "../components/BrandLogo.js";

export type PageId = "overview" | "commissions" | "inventory" | "interest";

interface AppProps {
  today?: string;
}

const navigation: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "commissions", label: "Comissões", icon: BarChart3 },
  { id: "inventory", label: "Estoque", icon: Boxes },
  { id: "interest", label: "Juros", icon: Calculator },
];

export function App({ today }: AppProps) {
  const [page, setPage] = useState<PageId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(nextPage: PageId): void {
    setPage(nextPage);
    setMobileOpen(false);
    window.scrollTo({ top: 0, left: 0 });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft" href="#content">
        Ir para o conteúdo
      </a>

      <button
        type="button"
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-soft transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:hidden"
        aria-label="Abrir navegação"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" aria-hidden="true" onClick={() => setMobileOpen(false)} />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-soft transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-soft">
                <BrandLogo className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold tracking-tight text-slate-950">Painel Operacional</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Desafio Técnico</p>
                <p className="text-xs font-medium text-slate-500">Neemias C. Santos</p>
              </div>
            </div>
            <span className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">3 módulos integrados</span>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:hidden"
            aria-label="Fechar navegação"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-9 space-y-2" aria-label="Navegação principal">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${active ? "bg-brand-700 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Target Sistemas</p>
          <p className="mt-0.5 text-slate-500">Desafio Técnico · Neemias C. Santos</p>
        </div>
      </aside>

      <main id="content" className="min-h-screen px-4 py-6 pt-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-9 lg:pt-9">
        {page === "overview" ? <OverviewPage onNavigate={navigate} /> : null}
        {page === "commissions" ? <CommissionsPage /> : null}
        {page === "inventory" ? <InventoryPage /> : null}
        {page === "interest" ? <InterestPage today={today} /> : null}
      </main>
    </div>
  );
}
