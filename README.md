## position-calculator

DCA-based position calculator with stage-based dynamic Take Profit for LONG and SHORT. Focused on explicit risk budgeting per level and configurable rounding precision.

### Install
```bash
npm i position-calculator
```

### Quick start (ESM)
```ts
import PositionCalculator, { PositionCalculator as PositionCalculatorNamed } from "position-calculator";

// Both default and named imports are available
const calc = new PositionCalculator({
  riskPercent: 0.10,
  weights: [1, 3, 5],
  targetProfitPercents: [0.0211, 0.0209, 0.0253],
  feePerUnit: 0,
  qtyPrecision: 1,
  pricePrecision: 4
});

const result = calc.calculate({
  side: "LONG",
  limit: 4658,
  tp: 4757,    // Initial TP for the 1st stage
  sl: 4556,
  leverage: 30,
  accountSize: 321000,
  limit1: 4622,
  limit2: 4590
});

console.log(result);
```

### Usage (CommonJS)
```js
const { PositionCalculator } = require("position-calculator");

const calc = new PositionCalculator();
const res = calc.calculate({
  side: "SHORT",
  limit: 4750,
  tp: 4680,
  sl: 4820,
  leverage: 20,
  accountSize: 100000
});

console.log(res);
```

---

### API

- **Types**:
  - `Side`: `"LONG" | "SHORT"`
  - `CalcInput`:
    - **side**: position side.
    - **limit**: price for the 1st level (required).
    - **tp**: Take Profit price for the 1st level (required; subsequent TPs are computed).
    - **sl**: Stop Loss price (required).
    - **leverage**: leverage (> 0).
    - **accountSize**: account size (> 0).
    - **limit1**, **limit2**: additional entry levels (optional).
    - **riskPercent**: total account risk (0–1), default `0.10`.
    - **weights**: per-level weights, default `[1, 3, 5]`.
    - **targetProfitPercents**: per-stage profit targets (0–1), default `[0.02, 0.02, 0.02]`.
    - **feePerUnit**: linear fee per unit, default `0`.
    - **qtyPrecision**: decimal places for quantities, default `1`.
    - **pricePrecision**: decimal places for prices, default `4`.
  - `LegResult` (per level):
    - **price**: level price.
    - **qty**: quantity at the level.
    - **takeProfit**: target exit price for that stage.
    - **takeProfitAmount**: profit target in currency.
    - **takeProfitPercent**: profit target as % of account.
    - **stopLoss**: SL price.
    - **leverage**: used leverage.

- **Class**: `new PositionCalculator(defaults?)`
  - `defaults` may override: `riskPercent`, `weights`, `targetProfitPercents`, `feePerUnit`, `qtyPrecision`, `pricePrecision`.

- **Method**: `calculate(input: CalcInput): LegResult[]`

---

### Sample output (partial)
```json
[
  {
    "price": 4658,
    "qty": 100.0,
    "takeProfit": 4757.0,
    "takeProfitAmount": 6762.0,
    "takeProfitPercent": 2.11,
    "stopLoss": 4556,
    "leverage": 30
  },
  { "price": 4622, "qty": 300.0, "takeProfit": 4761.3, "takeProfitAmount": 6722.3, ... },
  { "price": 4590, "qty": 500.0, "takeProfit": 4778.4, "takeProfitAmount": 8135.55, ... }
]
```

Notes:
- The first `takeProfit` is fixed to the provided `tp`; subsequent TPs are computed to meet each stage's profit target.
- Per-level quantities follow the overall risk budget (`riskPercent * accountSize`) weighted by `weights` and distance to `sl`.

### Precision and fees
- `qtyPrecision` and `pricePrecision` control final rounding.
- `feePerUnit` adds linear per-unit cost into the TP math.

### Common errors
- Missing valid levels: at least `limit` is required.
- `sl` on the wrong side of the price (distance to SL must be > 0 for all levels).
- `accountSize` and `leverage` must be > 0.
- `riskPercent` must be in (0, 1).
- `weights` and `targetProfitPercents` must match the active level count and contain values > 0.

### TypeScript
Types are shipped under `dist/types`. Works out of the box.

### License
MIT
