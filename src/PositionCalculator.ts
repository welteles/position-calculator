// src/PositionCalculator.ts
export type Side = "LONG" | "SHORT";

export interface CalcInput {
  side: Side;
  limit: number;
  tp: number;
  sl: number;
  leverage: number;
  accountSize: number;
  limit1?: number;
  limit2?: number;
  riskPercent?: number;
  weights?: number[];
  targetProfitPercents?: number[];
  feePerUnit?: number;
  qtyPrecision?: number;
  pricePrecision?: number;
}

export interface LegResult {
  price: number;
  qty: number;
  takeProfit: number;
  takeProfitAmount: number;
  takeProfitPercent: number;
  stopLoss: number;
  leverage: number;
}

export class PositionCalculator {
  constructor(
    private readonly defaults = {
      riskPercent: 0.10,
      weights: [1, 3, 5],
      targetProfitPercents: [0.02, 0.02, 0.02],
      feePerUnit: 0,
      qtyPrecision: 1,
      pricePrecision: 4
    }
  ) {}

  calculate(input: CalcInput): LegResult[] {
    const {
      side, limit, tp, sl, leverage, accountSize, limit1, limit2,
      riskPercent = this.defaults.riskPercent,
      weights = this.defaults.weights,
      targetProfitPercents = this.defaults.targetProfitPercents,
      feePerUnit = this.defaults.feePerUnit,
      qtyPrecision = this.defaults.qtyPrecision,
      pricePrecision = this.defaults.pricePrecision,
    } = input;

    const levels = [limit, limit1, limit2].filter(
      (v): v is number => typeof v === "number" && Number.isFinite(v)
    );
    if (levels.length === 0) throw new Error("Pelo menos um nível (limit) é obrigatório.");
    if (!Number.isFinite(sl)) throw new Error("Stop Loss inválido.");
    if (!Number.isFinite(accountSize) || accountSize <= 0) throw new Error("accountSize > 0.");
    if (!Number.isFinite(leverage) || leverage <= 0) throw new Error("leverage > 0.");
    if (riskPercent <= 0 || riskPercent >= 1) throw new Error("riskPercent ∈ (0,1).");

    const W = weights.slice(0, levels.length);
    if (W.length !== levels.length || W.some(w => !Number.isFinite(w) || w <= 0))
      throw new Error("weights inválidos para a quantidade de níveis.");

    const TPp = targetProfitPercents.slice(0, levels.length);
    if (TPp.length !== levels.length || TPp.some(p => !Number.isFinite(p) || p <= 0))
      throw new Error("targetProfitPercents inválidos.");

    const isLong = input.side === "LONG";
    const deltasToSL = levels.map(px => isLong ? (px - sl) : (sl - px));
    if (deltasToSL.some(d => d <= 0))
      throw new Error("Cada nível precisa estar do lado correto do SL (distância > 0).");

    const totalRiskBudget = accountSize * riskPercent;
    const denom = W.reduce((acc, w, i) => acc + w * deltasToSL[i], 0);
    const baseQty = totalRiskBudget / denom;

    const qtys = W.map(w => round(baseQty * w, qtyPrecision));
    const results: LegResult[] = [];

    for (let k = 0; k < levels.length; k++) {
      const activeLevels = levels.slice(0, k + 1);
      const activeQtys = qtys.slice(0, k + 1);

      const targetProfitAmount = accountSize * TPp[k];
      const sumEq = activeLevels.reduce((acc, e, i) => acc + e * activeQtys[i], 0);
      const sumQ = activeQtys.reduce((a, b) => a + b, 0);
      if (sumQ <= 0) throw new Error("Quantidade agregada inválida.");

      let takeProfitPrice: number;
      if (isLong) {
        takeProfitPrice = (targetProfitAmount + sumEq + feePerUnit * sumQ) / sumQ;
      } else {
        takeProfitPrice = (sumEq - (targetProfitAmount + feePerUnit * sumQ)) / sumQ;
      }
      if (k === 0) takeProfitPrice = tp;

      results.push({
        price: levels[k],
        qty: qtys[k],
        takeProfit: round(takeProfitPrice, pricePrecision),
        takeProfitAmount: round(targetProfitAmount, 2),
        takeProfitPercent: round((targetProfitAmount / accountSize) * 100, 2),
        stopLoss: sl,
        leverage
      });
    }
    return results;

    function round(n: number, decimals: number) {
      const p = 10 ** decimals;
      return Math.round(n * p) / p;
    }
  }
}

export default PositionCalculator;
