import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const screenshotsDir = "artifacts/screenshots";
const expectedSellers = [
  ["João Silva", "R$ 10.754,70", "R$ 495,69"],
  ["Maria Souza", "R$ 9.874,30", "R$ 465,96"],
  ["Carlos Oliveira", "R$ 7.928,35", "R$ 379,38"],
  ["Ana Lima", "R$ 8.763,95", "R$ 404,99"],
] as const;

test.beforeAll(async () => {
  await mkdir(screenshotsDir, { recursive: true });
});

async function screenshot(page: Page, name: string): Promise<void> {
  const filePath = `${screenshotsDir}/${name}`;
  try {
    await page.screenshot({ path: filePath, fullPage: true });
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await page.screenshot({ path: filePath, fullPage: true });
  }
}

async function assertNoPageOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);
}

async function navigate(page: Page, label: string, isCompact: boolean): Promise<void> {
  if (isCompact) {
    await page.getByRole("button", { name: "Abrir navegação" }).click();
  }
  await page.getByRole("button", { name: label, exact: true }).click();
  if (isCompact) {
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

function wireDiagnostics(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure();
    failedRequests.push(`${request.method()} ${request.url()} ${failure?.errorText ?? ""}`.trim());
  });

  return { consoleErrors, pageErrors, failedRequests };
}

test.describe("visual QA", () => {
  test("inspeciona telas, fluxos e screenshots", async ({ page }, testInfo) => {
    const isDesktop = testInfo.project.name === "desktop-1440";
    const isTablet = testInfo.project.name === "tablet-768";
    const isMobile = testInfo.project.name === "mobile-375";
    const isCompact = isTablet || isMobile;
    const diagnostics = wireDiagnostics(page);

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Painel Operacional" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comissões" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Estoque" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Juros" })).toBeVisible();
    await assertNoPageOverflow(page);

    if (isDesktop) await screenshot(page, "01-home-desktop.png");
    if (isMobile) await screenshot(page, "05-home-mobile.png");
    if (isTablet) await screenshot(page, "12-home-tablet.png");

    await navigate(page, "Comissões", isCompact);
    await expect(page.getByRole("heading", { name: "Comissões de vendas" })).toBeVisible();
    for (const [seller, total, commission] of expectedSellers) {
      const card = page.getByTestId(`seller-${seller}`);
      await expect(card).toContainText(total);
      await expect(card).toContainText(commission);
    }
    await assertNoPageOverflow(page);
    if (isDesktop) await screenshot(page, "02-commissions-desktop.png");
    if (isMobile) await screenshot(page, "06-commissions-mobile.png");
    if (isTablet) await screenshot(page, "13-commissions-tablet.png");

    await page.getByLabel("Buscar vendedor").fill("Maria");
    if (isMobile) {
      expect(await page.getByTestId("sale-card-Maria Souza-0").count()).toBeGreaterThan(0);
    } else {
      expect(await page.getByRole("cell", { name: "Maria Souza" }).count()).toBeGreaterThan(0);
    }
    await assertNoPageOverflow(page);
    if (isDesktop) await screenshot(page, "11-commissions-filtered-desktop.png");

    await navigate(page, "Estoque", isCompact);
    await expect(page.getByRole("heading", { name: "Controle de estoque" })).toBeVisible();
    await expect(page.getByTestId("product-101")).toContainText("150");
    await expect(page.getByTestId("product-105")).toContainText("90");
    await assertNoPageOverflow(page);
    if (isDesktop) await screenshot(page, "03-inventory-desktop.png");
    if (isMobile) await screenshot(page, "07-inventory-mobile.png");
    if (isTablet) await screenshot(page, "14-inventory-tablet.png");

    await page.getByTestId("product-101").getByRole("button", { name: "Movimentar estoque" }).click();
    await expect(page.getByRole("dialog", { name: "Caneta Azul" })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    if (isDesktop) await screenshot(page, "09-inventory-modal-desktop.png");

    await page.getByLabel("Quantidade").fill("20");
    await page.getByLabel("Descrição").fill("Reposição de teste");
    await page.getByRole("button", { name: "Registrar movimentação" }).click();
    await expect(page.getByText("Movimentação registrada")).toBeVisible();
    await expect(page.getByTestId("product-101")).toContainText("170");

    await page.getByRole("button", { name: "Saída" }).click();
    await page.getByLabel("Quantidade").fill("30");
    await page.getByLabel("Descrição").fill("Saída de teste");
    await page.getByRole("button", { name: "Registrar movimentação" }).click();
    await expect(page.getByTestId("product-101")).toContainText("140");
    await expect(page.getByText("MOV-0002")).toHaveCount(2);
    await expect(page.getByText("Saída de teste")).toBeVisible();
    await expect(page.getByTestId("product-101")).toContainText("140");
    if (isDesktop) await screenshot(page, "15-inventory-after-movement-desktop.png");

    await page.getByRole("button", { name: "Saída" }).click();
    await page.getByLabel("Quantidade").fill("999");
    await page.getByLabel("Descrição").fill("Saída inválida");
    await page.getByRole("button", { name: "Registrar movimentação" }).click();
    await expect(page.getByText("A saída não pode gerar estoque negativo.")).toBeVisible();
    await page.getByRole("button", { name: "Fechar painel" }).click();
    await expect(page.getByRole("dialog", { name: "Caneta Azul" })).toBeHidden();

    await navigate(page, "Juros", isCompact);
    await expect(page.getByRole("heading", { name: "Cálculo de juros" })).toBeVisible();
    await page.getByLabel("Valor original").fill("100,00");
    await page.getByLabel("Data de vencimento").fill("2026-10-04");
    await page.getByRole("button", { name: "Calcular juros" }).click();
    await expect(page.getByTestId("interest-result")).toContainText("R$ 102,50");
    await expect(page.getByTestId("interest-result")).toContainText("1 dias");
    await expect(page.getByTestId("interest-result")).toContainText("R$ 2,50");
    await assertNoPageOverflow(page);
    if (isDesktop) {
      await screenshot(page, "04-interest-desktop.png");
      await screenshot(page, "10-interest-result-desktop.png");
    }
    if (isMobile) await screenshot(page, "08-interest-mobile.png");
    if (isTablet) await screenshot(page, "16-interest-tablet.png");

    await page.getByLabel("Data de vencimento").fill("2026-10-06");
    await page.getByRole("button", { name: "Calcular juros" }).click();
    await expect(page.getByTestId("interest-result")).toContainText("Esta cobrança ainda não está vencida.");
    await expect(page.getByTestId("interest-result")).toContainText("0 dias");
    await expect(page.getByTestId("interest-result")).toContainText("R$ 0,00");

    expect(diagnostics.consoleErrors).toEqual([]);
    expect(diagnostics.pageErrors).toEqual([]);
    expect(diagnostics.failedRequests).toEqual([]);
  });
});
