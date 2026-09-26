import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Send, Zap } from "lucide-react";
import clsx from "clsx";
import { Badge, Callout, Card, PageHeader, Section } from "@/components/ui";
import { SequenceDiagram } from "@/components/SequenceDiagram";
import { Icon } from "@/components/Icon";
import { inventoryConcurrencySteps, inventoryRules, paymentProviderInterface, paymentProviders, paymentSequence } from "@/data/paymentFlow";

function WebhookSimulator() {
  const [idempotent, setIdempotent] = useState(true);
  const [deliveries, setDeliveries] = useState<{ n: number; result: "processed" | "replayed" | "duplicate" }[]>([]);

  const payments = idempotent ? Math.min(1, deliveries.length) : deliveries.length;
  const tickets = payments;

  const deliver = () => {
    setDeliveries((d) => {
      const n = d.length + 1;
      const result = n === 1 ? "processed" : idempotent ? "replayed" : "duplicate";
      return [...d, { n, result }];
    });
  };

  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="kicker">AT-003 · Payment retry</div>
          <h3 className="mt-1 font-semibold text-white">Webhook idempotency</h3>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <span>Idempotency key check</span>
          <button
            type="button"
            role="switch"
            aria-checked={idempotent}
            onClick={() => {
              setIdempotent((v) => !v);
              setDeliveries([]);
            }}
            className={clsx("relative h-5 w-9 rounded-full transition", idempotent ? "bg-lime-500/70" : "bg-rose-500/60")}
          >
            <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", idempotent ? "left-[18px]" : "left-0.5")} />
          </button>
        </label>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        The provider may deliver <span className="font-mono text-slate-200">payment.success</span> several times. Send it as often as you like.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={deliver}
          disabled={deliveries.length >= 8}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400/15 px-3 py-2 text-sm font-semibold text-amber-200 ring-1 ring-inset ring-amber-400/30 hover:bg-amber-400/25 disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden="true" /> Deliver webhook
        </button>
        <button
          type="button"
          onClick={() => setDeliveries([])}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 ring-1 ring-inset ring-canvas-border hover:text-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-canvas-border p-3">
          <div className="text-[11px] text-slate-500">Webhooks received</div>
          <div className="text-2xl font-semibold tabular-nums text-amber-200">{deliveries.length}</div>
        </div>
        <div className={clsx("rounded-lg border p-3", payments > 1 ? "border-rose-400/50 bg-rose-400/10" : "border-canvas-border")}>
          <div className="text-[11px] text-slate-500">Payments captured</div>
          <div className={clsx("text-2xl font-semibold tabular-nums", payments > 1 ? "text-rose-300" : "text-lime-300")}>{payments}</div>
        </div>
        <div className={clsx("rounded-lg border p-3", tickets > 1 ? "border-rose-400/50 bg-rose-400/10" : "border-canvas-border")}>
          <div className="text-[11px] text-slate-500">Tickets issued</div>
          <div className={clsx("text-2xl font-semibold tabular-nums", tickets > 1 ? "text-rose-300" : "text-lime-300")}>{tickets}</div>
        </div>
      </div>

      <ul className="mt-3 space-y-1 font-mono text-xs" aria-live="polite">
        <AnimatePresence initial={false}>
          {deliveries.map((d) => (
            <motion.li key={d.n} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className="text-slate-500">#{d.n}</span>
              {d.result === "processed" && <span className="text-lime-300">processed → payment CAPTURED, ticket ISSUED, outbox event written</span>}
              {d.result === "replayed" && <span className="text-slate-400">key seen → stored result returned, 200 OK, no side-effects</span>}
              {d.result === "duplicate" && <span className="text-rose-300">no key check → DUPLICATE ticket issued ✗</span>}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

type RaceState = "idle" | "running" | "done";

function SeatRace() {
  const [locking, setLocking] = useState(true);
  const [state, setState] = useState<RaceState>("idle");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (state !== "running") return;
    if (tick >= 4) {
      setState("done");
      return;
    }
    const t = window.setTimeout(() => setTick((v) => v + 1), 650);
    return () => window.clearTimeout(t);
  }, [state, tick]);

  const run = () => {
    setTick(0);
    setState("running");
  };

  const lanes = [
    { who: "Customer A", color: "text-brand-300" },
    { who: "Customer B", color: "text-violet-300" },
  ];

  const laneStatus = (lane: number) => {
    if (state === "idle") return "waiting";
    if (locking) {
      if (lane === 0) return tick >= 4 ? "won" : ["SELECT … FOR UPDATE", "check availability", "create hold", "commit"][Math.min(tick, 3)];
      if (tick < 4) return "blocked on row lock…";
      return "sees HELD → rejected";
    }
    return tick >= 4 ? "won (double booking!)" : ["SELECT seat", "check availability", "create hold", "commit"][Math.min(tick, 3)];
  };

  const outcome = state === "done" ? (locking ? "ok" : "bad") : null;

  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="kicker">§23 · Inventory concurrency</div>
          <h3 className="mt-1 font-semibold text-white">Two customers, one seat: A12</h3>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <span>PostgreSQL row lock</span>
          <button
            type="button"
            role="switch"
            aria-checked={locking}
            onClick={() => {
              setLocking((v) => !v);
              setState("idle");
              setTick(0);
            }}
            className={clsx("relative h-5 w-9 rounded-full transition", locking ? "bg-lime-500/70" : "bg-rose-500/60")}
          >
            <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", locking ? "left-[18px]" : "left-0.5")} />
          </button>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="space-y-2">
          {lanes.map((l, i) => (
            <div key={l.who} className="rounded-lg border border-canvas-border bg-white/[0.02] p-2.5">
              <div className={clsx("text-xs font-semibold", l.color)}>{l.who}</div>
              <div className={clsx("mt-0.5 font-mono text-[11px]", laneStatus(i).includes("rejected") || laneStatus(i).includes("double") ? "text-rose-300" : laneStatus(i) === "won" ? "text-lime-300" : "text-slate-400")}>
                {laneStatus(i)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-600">
          <motion.span animate={state === "running" ? { x: [0, 6, 0] } : {}} transition={{ repeat: Infinity, duration: 0.8 }}>
            →
          </motion.span>
          <motion.span animate={state === "running" ? { x: [0, 6, 0] } : {}} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}>
            →
          </motion.span>
        </div>
        <motion.div
          animate={outcome === "bad" ? { x: [0, -4, 4, -4, 0] } : {}}
          className={clsx(
            "grid h-full place-items-center rounded-xl border p-4 text-center",
            outcome === "ok" ? "border-lime-400/50 bg-lime-400/10" : outcome === "bad" ? "border-rose-400/60 bg-rose-400/10" : "border-canvas-border",
          )}
        >
          <div>
            <Icon name="ticket" className="mx-auto h-6 w-6 text-slate-300" />
            <div className="mt-1 font-mono text-lg font-bold text-white">A12</div>
            <div className="text-[11px] text-slate-400">
              {outcome === "ok" ? "HELD by Customer A" : outcome === "bad" ? "held twice ✗" : state === "running" ? "contended…" : "AVAILABLE"}
            </div>
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={state === "running"}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500/15 px-3 py-2 text-sm font-semibold text-brand-200 ring-1 ring-inset ring-brand-500/30 hover:bg-brand-500/25 disabled:opacity-50"
      >
        <Zap className="h-4 w-4" aria-hidden="true" /> Start race
      </button>

      <ol className="mt-4 space-y-1.5">
        {inventoryConcurrencySteps.map((s, i) => (
          <li key={s.code} className="flex gap-2 text-xs">
            <span className="font-mono text-slate-500">{i + 1}.</span>
            <span>
              <code className="text-brand-200">{s.code}</code> <span className="text-slate-500">— {s.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function PaymentFlow() {
  return (
    <div>
      <PageHeader
        kicker="Ticketing core"
        title="Payment Flow"
        icon="credit-card"
        blueprint="§22–23, §33, §41"
        description="Payment confirmation arrives by webhook. Locking, the idempotency check, capture, issuance and the outbox write all happen in one transaction before the platform acknowledges the provider."
      />

      <Section title="Payment → ticket issuance sequence" description="Click any message to see why it matters.">
        <SequenceDiagram data={paymentSequence} />
      </Section>

      <Section title="Correctness under pressure" description="Two interactive illustrations of the guarantees the blueprint requires. Simulated locally with no backend.">
        <div className="grid gap-4 lg:grid-cols-2">
          <WebhookSimulator />
          <SeatRace />
        </div>
      </Section>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="kicker mb-3">§41 Payment provider abstraction</div>
          <pre className="overflow-x-auto rounded-lg border border-canvas-border bg-canvas p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
            <code>{paymentProviderInterface}</code>
          </pre>
          <div className="mt-5 flex flex-col items-center">
            <div className="rounded-xl border border-violet-400/40 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-100">PaymentService</div>
            <svg viewBox="0 0 300 40" className="h-10 w-full max-w-xs" aria-hidden="true">
              {[50, 150, 250].map((x, i) => (
                <motion.path
                  key={x}
                  d={`M150 0 C150 20, ${x} 20, ${x} 40`}
                  fill="none"
                  stroke="#46607a"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                />
              ))}
            </svg>
            <div className="grid w-full max-w-sm grid-cols-3 gap-2">
              {paymentProviders.map((p) => (
                <div key={p} className="rounded-lg border border-rose-400/30 bg-rose-400/[0.07] px-2 py-2 text-center text-xs font-medium text-rose-100">
                  {p}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-slate-400">This avoids locking the Sports organization into one provider. Card, mobile-money and banking integrations all plug in here (FR-005).</p>
          </div>
        </Card>
        <Card>
          <div className="kicker mb-3">Inventory rules</div>
          <ul className="space-y-3">
            {inventoryRules.map((r) => (
              <li key={r} className="flex gap-3 text-sm text-slate-200">
                <Icon name="database" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="rose">No payment confirmation = no paid ticket</Badge>
            <Badge tone="amber">Webhooks must be idempotent</Badge>
            <Badge tone="brand">Hosted / tokenized payments</Badge>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            See the full <Link to="/lifecycle" className="text-brand-300 hover:underline">payment state machine</Link> and{" "}
            <Link to="/finance" className="text-brand-300 hover:underline">financial reconciliation</Link>.
          </p>
        </Card>
      </div>

      <Callout tone="brand" icon="shield" title="Data protection">
        Do not store payment-card data if the selected payment architecture allows tokenized/hosted payment processing (§48).
      </Callout>
    </div>
  );
}
