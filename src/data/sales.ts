import type { Sale } from "../commissions/commissions.js";

const salesData: Array<[string, number]> = [
  ["João Silva", 1200.5], ["João Silva", 950.75], ["João Silva", 1800], ["João Silva", 1400.3], ["João Silva", 1100.9], ["João Silva", 1550], ["João Silva", 1700.8], ["João Silva", 250.3], ["João Silva", 480.75], ["João Silva", 320.4],
  ["Maria Souza", 2100.4], ["Maria Souza", 1350.6], ["Maria Souza", 950.2], ["Maria Souza", 1600.75], ["Maria Souza", 1750], ["Maria Souza", 1450.9], ["Maria Souza", 400.5], ["Maria Souza", 180.2], ["Maria Souza", 90.75],
  ["Carlos Oliveira", 800.5], ["Carlos Oliveira", 1200], ["Carlos Oliveira", 1950.3], ["Carlos Oliveira", 1750.8], ["Carlos Oliveira", 1300.6], ["Carlos Oliveira", 300.4], ["Carlos Oliveira", 500], ["Carlos Oliveira", 125.75],
  ["Ana Lima", 1000], ["Ana Lima", 1100.5], ["Ana Lima", 1250.75], ["Ana Lima", 1400.2], ["Ana Lima", 1550.9], ["Ana Lima", 1650], ["Ana Lima", 75.3], ["Ana Lima", 420.9], ["Ana Lima", 315.4],
];

export const challengeSales: Sale[] = salesData.map(([vendedor, valor]) => ({ vendedor, valor }));
