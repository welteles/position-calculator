"use client";

import { useMemo, useState } from "react";
import PositionCalculator from "position-calculator";

type Side = "LONG" | "SHORT";

const calc = new PositionCalculator({
  riskPercent: 0.10,
  weights: [1, 3, 5],
  targetProfitPercents: [0.0211, 0.0209, 0.0253],
  feePerUnit: 0,
  qtyPrecision: 1,
  pricePrecision: 4,
});

export default function Page() {
  const [side, setSide] = useState<Side>("LONG");
  const [limit, setLimit] = useState(4658);
  const [tp, setTp] = useState(4757);
  const [sl, setSl] = useState(4556);
  const [leverage, setLeverage] = useState(30);
  const [accountSize, setAccountSize] = useState(321000);
  const [limit1, setLimit1] = useState(4622);
  const [limit2, setLimit2] = useState(4590);
  const [feePerUnit, setFeePerUnit] = useState(0);

  const results = useMemo(() => {
    try {
      return calc.calculate({
        side,
        limit,
        tp,
        sl,
        leverage,
        accountSize,
        limit1,
        limit2,
        feePerUnit,
      });
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }, [side, limit, tp, sl, leverage, accountSize, limit1, limit2, feePerUnit]);

  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-background to-black/80">
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="heading mb-4">Calculator</h2>
            <form className="grid grid-cols-2 gap-4">
              <Field label="Side">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSide("LONG")} className={`px-3 py-1 rounded-md border ${side === "LONG" ? "bg-primary/20 border-primary text-primary" : "border-white/10"}`}>LONG</button>
                  <button type="button" onClick={() => setSide("SHORT")} className={`px-3 py-1 rounded-md border ${side === "SHORT" ? "bg-secondary/20 border-secondary text-secondary" : "border-white/10"}`}>SHORT</button>
                </div>
              </Field>
              <Field label="Leverage">
                <InputNumber value={leverage} onChange={setLeverage} />
              </Field>
              <Field label="Account Size">
                <InputNumber value={accountSize} onChange={setAccountSize} />
              </Field>
              <Field label="Limit">
                <InputNumber value={limit} onChange={setLimit} />
              </Field>
              <Field label="TP (stage 1)">
                <InputNumber value={tp} onChange={setTp} />
              </Field>
              <Field label="SL">
                <InputNumber value={sl} onChange={setSl} />
              </Field>
              <Field label="Limit 2">
                <InputNumber value={limit1} onChange={setLimit1} />
              </Field>
              <Field label="Limit 3">
                <InputNumber value={limit2} onChange={setLimit2} />
              </Field>
              <Field label="Fee per Unit">
                <InputNumber value={feePerUnit} onChange={setFeePerUnit} />
              </Field>
            </form>
          </div>

          <div className="card">
            <h2 className="heading mb-4">Results</h2>
            {Array.isArray(results) ? (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className="rounded-xl border border-white/10 p-4">
                    <div className="mb-2 text-sm text-white/70">Stage {i + 1}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                      <KV k="Price" v={r.price} />
                      <KV k="Qty" v={r.qty} />
                      <KV k="TP" v={r.takeProfit} />
                      <KV k="TP Amount" v={r.takeProfitAmount} />
                      <KV k="TP %" v={`${r.takeProfitPercent}%`} />
                      <KV k="SL" v={r.stopLoss} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-400">{String(results)}</div>
            )}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_300px_at_50%_-20%,rgba(234,94,255,0.25),transparent)]" />
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="heading text-4xl md:text-6xl">Advanced neural-like risk budgeting for real trading</h1>
          <p className="mt-4 text-white/70">From idea to execution, compute position sizing with stage-based dynamic Take Profit and clear risk constraints.</p>
          <div className="mt-6 flex gap-3">
            <a className="cta" href="https://www.npmjs.com/package/position-calculator" target="_blank" rel="noreferrer">Explore package</a>
            <a className="cta bg-secondary text-black shadow-[0_0_40px_rgba(94,241,255,0.3)]" href="#calculator">Try calculator</a>
          </div>
        </div>
        <div className="card min-h-48 overflow-hidden !p-0">
          <img
            src="https://html.awaikenthemes.com/nextmind/neural-networks/images/hero-image.jpg"
            alt="Neural networks themed hero image"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="card flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="heading">Your next AI-like trading utility starts here</h3>
          <p className="text-white/70">Install, experiment, and integrate into your workflow.</p>
        </div>
        <a className="cta" href="https://github.com/" target="_blank" rel="noreferrer">View Source</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/60">
      <div className="border-t border-white/10 pt-6">© {new Date().getFullYear()} Position Calculator</div>
    </footer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="col-span-2 flex flex-col gap-2 md:col-span-1">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

function InputNumber({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2 outline-none focus:border-primary"
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function KV({ k, v }: { k: string; v: number | string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-black/20 px-3 py-2">
      <span className="text-white/60">{k}</span>
      <span className="font-medium text-white">{v}</span>
    </div>
  );
}


