import { describe, it, expect } from "vitest";
import { PositionCalculator } from "./PositionCalculator";

describe("PositionCalculator", () => {
  it("calculates LONG example with expected rounded outputs", () => {
    const defaults = {
      riskPercent: 0.10,
      weights: [1, 3, 5],
      targetProfitPercents: [0.0211, 0.0209, 0.0253],
      feePerUnit: 0,
      qtyPrecision: 1,
      pricePrecision: 4,
    } as const;
    const calc = new PositionCalculator(defaults);

    const input = {
      side: "LONG" as const,
      limit: 4658,
      tp: 4757,
      sl: 4556,
      leverage: 30,
      accountSize: 321000,
      limit1: 4622,
      limit2: 4590,
    };

    const res = calc.calculate(input);

    // Quantidades e primeiro TP
    expect(res).toHaveLength(3);
    expect(res[0]).toMatchObject({ price: 4658, qty: 68.3, takeProfit: 4757, stopLoss: 4556, leverage: 30 });
    expect(res[1].price).toBe(4622);
    expect(res[1].qty).toBe(204.9);
    expect(res[2].price).toBe(4590);
    expect(res[2].qty).toBe(341.5);

    // Alvos de lucro por estágio
    const expectedTPAmounts = defaults.targetProfitPercents.map(p => round(input.accountSize * p, 2));
    const expectedTPPercents = defaults.targetProfitPercents.map(p => round(p * 100, 2));
    expect(res[0].takeProfitAmount).toBeCloseTo(expectedTPAmounts[0], 1);
    expect(res[0].takeProfitPercent).toBeCloseTo(expectedTPPercents[0], 2);
    expect(res[1].takeProfitAmount).toBeCloseTo(expectedTPAmounts[1], 1);
    expect(res[1].takeProfitPercent).toBeCloseTo(expectedTPPercents[1], 2);
    expect(res[2].takeProfitAmount).toBeCloseTo(expectedTPAmounts[2], 1);
    expect(res[2].takeProfitPercent).toBeCloseTo(expectedTPPercents[2], 2);

    // Verifica takeProfit calculado para estágios 2..n (1-indexado), com arredondamento
    const levels = [input.limit, input.limit1!, input.limit2!];
    const deltasToSL = levels.map(px => px - input.sl);
    const W = defaults.weights.slice(0, levels.length);
    const denom = W.reduce((acc, w, i) => acc + w * deltasToSL[i], 0);
    const baseQty = (input.accountSize * defaults.riskPercent) / denom;
    const qtys = W.map(w => round(baseQty * w, defaults.qtyPrecision));

    function expectedTPForStage(k: number): number {
      if (k === 0) return input.tp;
      const activeLevels = levels.slice(0, k + 1);
      const activeQtys = qtys.slice(0, k + 1);
      const targetProfitAmount = input.accountSize * defaults.targetProfitPercents[k];
      const sumEq = activeLevels.reduce((acc, e, i) => acc + e * activeQtys[i], 0);
      const sumQ = activeQtys.reduce((a, b) => a + b, 0);
      const tpPx = (targetProfitAmount + sumEq + defaults.feePerUnit * sumQ) / sumQ;
      return round(tpPx, defaults.pricePrecision);
    }

    expect(res[1].takeProfit).toBeCloseTo(expectedTPForStage(1), 3);
    expect(res[2].takeProfit).toBeCloseTo(expectedTPForStage(2), 3);

    function round(n: number, decimals: number) {
      const p = 10 ** decimals;
      return Math.round(n * p) / p;
    }
  });

  it("throws when no levels are provided", () => {
    const calc = new PositionCalculator();
    expect(() =>
      calc.calculate({
        side: "LONG",
        limit: Number.NaN as unknown as number,
        tp: 10,
        sl: 9,
        leverage: 1,
        accountSize: 100,
      })
    ).toThrow();
  });

  it("throws when levels are on the wrong side of SL", () => {
    const calc = new PositionCalculator();
    expect(() =>
      calc.calculate({
        side: "LONG",
        limit: 10,
        tp: 11,
        sl: 12, // SL acima do nível para LONG -> inválido
        leverage: 1,
        accountSize: 100,
      })
    ).toThrow();
  });
});


