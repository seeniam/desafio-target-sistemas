import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { App } from "./App.js";

async function openPage(name: string): Promise<void> {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name }));
}

describe("interface web", () => {
  it("renderiza os módulos principais na visão geral", () => {
    render(<App today="2026-10-05" />);

    expect(screen.getByRole("heading", { name: "Painel Operacional" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Comissões" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Estoque" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Juros" })).toBeInTheDocument();
  });

  it("exibe os valores consolidados de comissão aprovados", async () => {
    render(<App today="2026-10-05" />);

    await openPage("Comissões");

    expect(screen.getByTestId("seller-João Silva")).toHaveTextContent("R$ 10.754,70");
    expect(screen.getByTestId("seller-João Silva")).toHaveTextContent("R$ 495,69");
    expect(screen.getByTestId("seller-Maria Souza")).toHaveTextContent("R$ 9.874,30");
    expect(screen.getByTestId("seller-Maria Souza")).toHaveTextContent("R$ 465,96");
    expect(screen.getByTestId("seller-Carlos Oliveira")).toHaveTextContent("R$ 7.928,35");
    expect(screen.getByTestId("seller-Carlos Oliveira")).toHaveTextContent("R$ 379,38");
    expect(screen.getByTestId("seller-Ana Lima")).toHaveTextContent("R$ 8.763,95");
    expect(screen.getByTestId("seller-Ana Lima")).toHaveTextContent("R$ 404,99");
  });

  it("registra entrada e saída de estoque pela interface", async () => {
    const user = userEvent.setup();
    render(<App today="2026-10-05" />);

    await openPage("Estoque");
    const product = screen.getByTestId("product-101");
    await user.click(within(product).getByRole("button", { name: "Movimentar estoque" }));
    await user.type(screen.getByLabelText("Quantidade"), "20");
    await user.type(screen.getByLabelText("Descrição"), "Reposição QA");
    await user.click(screen.getByRole("button", { name: "Registrar movimentação" }));
    expect(screen.getByTestId("product-101")).toHaveTextContent("170");

    await user.click(screen.getByRole("button", { name: "Saída" }));
    await user.clear(screen.getByLabelText("Quantidade"));
    await user.type(screen.getByLabelText("Quantidade"), "30");
    await user.type(screen.getByLabelText("Descrição"), "Venda QA");
    await user.click(screen.getByRole("button", { name: "Registrar movimentação" }));

    expect(screen.getByTestId("product-101")).toHaveTextContent("140");
    expect(screen.getAllByText("MOV-0002")).toHaveLength(2);
    expect(screen.getByText("Venda QA")).toBeInTheDocument();
  });

  it("bloqueia saída maior que o estoque", async () => {
    const user = userEvent.setup();
    render(<App today="2026-10-05" />);

    await openPage("Estoque");
    await user.click(within(screen.getByTestId("product-101")).getByRole("button", { name: "Movimentar estoque" }));
    await user.click(screen.getByRole("button", { name: "Saída" }));
    await user.type(screen.getByLabelText("Quantidade"), "999");
    await user.type(screen.getByLabelText("Descrição"), "Venda inválida");
    await user.click(screen.getByRole("button", { name: "Registrar movimentação" }));

    expect(screen.getByText("A saída não pode gerar estoque negativo.")).toBeInTheDocument();
    expect(screen.getByTestId("product-101")).toHaveTextContent("150");
  });

  it("calcula juros para vencimento passado", async () => {
    const user = userEvent.setup();
    render(<App today="2026-10-05" />);

    await openPage("Juros");
    await user.type(screen.getByLabelText("Valor original"), "100,00");
    await user.type(screen.getByLabelText("Data de vencimento"), "2026-10-04");
    await user.click(screen.getByRole("button", { name: "Calcular juros" }));

    expect(screen.getByTestId("interest-result")).toHaveTextContent("R$ 102,50");
    expect(screen.getByTestId("interest-result")).toHaveTextContent("1 dias");
    expect(screen.getByTestId("interest-result")).toHaveTextContent("R$ 2,50");
  });

  it("não cobra juros para vencimento futuro", async () => {
    const user = userEvent.setup();
    render(<App today="2026-10-05" />);

    await openPage("Juros");
    await user.type(screen.getByLabelText("Valor original"), "100,00");
    await user.type(screen.getByLabelText("Data de vencimento"), "2026-10-06");
    await user.click(screen.getByRole("button", { name: "Calcular juros" }));

    expect(screen.getByTestId("interest-result")).toHaveTextContent("Esta cobrança ainda não está vencida.");
    expect(screen.getByTestId("interest-result")).toHaveTextContent("R$ 0,00");
    expect(screen.getByTestId("interest-result")).toHaveTextContent("R$ 100,00");
  });
});
