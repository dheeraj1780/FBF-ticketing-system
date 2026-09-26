import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import clsx from "clsx";
import { Callout, Card, PageHeader, Section, Stat, Tabs } from "@/components/ui";
import { Icon } from "@/components/Icon";
import {
  mockLedger, reconciliationChain, reconciliationChecks, reportingMetrics, salesByCategory, salesByChannel, salesByPaymentMethod, type MockLedger,
} from "@/data/finance";

const fmt = (n: number) => n.toLocaleString("en-US");
const gnf = (n: number) => `${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M GNF`;

const faults: { id: string; label: string; description: string; apply: (l: MockLedger) => MockLedger }[] = [
  { id: "none", label: "Clean ledger", description: "All records agree.", apply: (l) => l },
  {
    id: "dup-webhook",
    label: "Non-idempotent webhook",
    description: "A retried webhook issued a second ticket without a new payment, so the sold and generated counts drift from captured payments.",
    apply: (l) => ({ ...l, sold: l.sold + 1, generated: l.generated + 1, grossRevenue: l.grossRevenue + 75_000 }),
  },
  {
    id: "manual-total",
    label: "Manually edited total",
    description: "Someone edited a revenue figure by hand instead of deriving it from transactional records.",
    apply: (l) => ({ ...l, grossRevenue: l.grossRevenue + 1_500_000 }),
  },
  {
    id: "offline-conflict",
    label: "Unresolved offline conflicts",
    description: "Duplicate offline acceptances were counted as separate redemptions instead of being flagged as conflicts.",
    apply: (l) => ({ ...l, redeemed: l.generated - l.cancelled - l.refunded + 12 }),
  },
];

function Bars({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {data.map((d, i) => (
          <li key={d.label} title={`${d.label}: ${fmt(d.value)} tickets (${((d.value / total) * 100).toFixed(1)}%)`} className="group">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-300">{d.label}</span>
              <span className="tabular-nums text-slate-400">
                {fmt(d.value)} <span className="text-slate-600">· {((d.value / total) * 100).toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800/60">
              <motion.div
                className="h-full rounded-full bg-brand-400 transition-colors group-hover:bg-brand-300"
                initial={{ width: 0 }}
                whileInView={{ width: `${(d.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function FinancialReconciliation() {
  const [faultId, setFaultId] = useState("none");
  const fault = faults.find((f) => f.id === faultId)!;
  const ledger = useMemo(() => fault.apply(mockLedger), [fault]);

  const results = reconciliationChecks.map((c) => {
    const { left, right } = c.compute(ledger);
    const ok = c.id === "redeemed-bound" ? left <= right : left === right;
    return { ...c, left, right, ok };
  });
  const allOk = results.every((r) => r.ok);

  const chainValues: Record<string, string> = {
    generated: fmt(ledger.generated),
    sold: fmt(ledger.sold),
    payments: fmt(ledger.paymentsCaptured),
    cancellations: fmt(ledger.cancelled),
    refunds: fmt(ledger.refunded),
    redeemed: fmt(ledger.redeemed),
    revenue: gnf(ledger.grossRevenue - ledger.refundedAmount),
  };

  return (
    <div>
      <PageHeader
        kicker="Trust & operations"
        title="Financial Reconciliation"
        icon="landmark"
        blueprint="FR-011 · FR-012 · §46"
        description="Every ticket, payment, cancellation, refund and redemption must reconcile to revenue. Reports come from transactional records or dedicated read models, never from manually edited totals."
      />

      <Section title="The reconciliation chain" description="FR-012: generated tickets ↔ sold tickets ↔ payments ↔ cancellations ↔ refunds ↔ redeemed tickets ↔ revenue.">
        <div className="flex flex-wrap items-stretch gap-2">
          {reconciliationChain.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="panel min-w-[120px] px-3 py-2.5"
              >
                <div className="text-[11px] text-slate-500">{c.label}</div>
                <div className="font-semibold tabular-nums text-white">{chainValues[c.id]}</div>
              </motion.div>
              {i < reconciliationChain.length - 1 && <ArrowLeftRight className="h-4 w-4 text-slate-600" aria-hidden="true" />}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Illustrative ledger for one match. All figures are mock data.</p>
      </Section>

      <Section
        title="Reconciliation checks"
        description="Inject a fault to see which invariant catches it."
        actions={<Tabs label="Fault injection" value={faultId} onChange={setFaultId} tabs={faults.map((f) => ({ id: f.id, label: f.label }))} />}
      >
        <p className="mb-3 text-sm text-slate-400">{fault.description}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((r) => (
            <motion.div
              key={r.id}
              layout
              animate={!r.ok ? { x: [0, -3, 3, 0] } : {}}
              className={clsx("panel flex gap-3 p-4", r.ok ? "border-lime-400/30" : "border-rose-400/60 bg-rose-500/[0.06]")}
            >
              <Icon name={r.ok ? "check-circle" : "alert-octagon"} className={clsx("mt-0.5 h-5 w-5 shrink-0", r.ok ? "text-lime-300" : "text-rose-300")} />
              <div className="min-w-0">
                <div className="font-semibold text-white">{r.label}</div>
                <div className="font-mono text-xs text-slate-400">{r.formula}</div>
                <div className={clsx("mt-2 font-mono text-sm tabular-nums", r.ok ? "text-slate-200" : "text-rose-200")}>
                  {r.money ? gnf(r.left) : fmt(r.left)} {r.id === "redeemed-bound" ? "≤" : r.ok ? "=" : "≠"} {r.money ? gnf(r.right) : fmt(r.right)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className={clsx("mt-3 rounded-xl border p-3 text-sm", allOk ? "border-lime-400/30 bg-lime-400/[0.06] text-lime-100" : "border-rose-400/40 bg-rose-400/10 text-rose-100")} role="status">
          {allOk ? "Reconciled: every record agrees." : "Discrepancy detected: the event report is blocked until it is investigated and resolved."}
        </div>
      </Section>

      <Section title="Match dashboard" description="FR-011 reporting dimensions, with illustrative values.">
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Tickets sold" value={fmt(ledger.sold)} hint={`of ${fmt(ledger.capacity)} capacity`} />
          <Stat label="Free / complimentary" value={fmt(ledger.complimentary)} tone="violet" />
          <Stat label="Net revenue" value={gnf(ledger.grossRevenue - ledger.refundedAmount)} tone="lime" />
          <Stat label="Spectators entered" value={fmt(ledger.redeemed)} hint={`${((ledger.redeemed / ledger.capacity) * 100).toFixed(0)}% occupancy`} tone="amber" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Bars title="Sales by channel" data={salesByChannel} />
          <Bars title="Sales by payment method" data={salesByPaymentMethod} />
          <Bars title="Sales by category" data={salesByCategory} />
        </div>
      </Section>

      <Section title="All required report dimensions (FR-011)">
        <div className="flex flex-wrap gap-2">
          {reportingMetrics.map((m) => (
            <span key={m} className="chip">
              <Icon name="bar-chart" className="h-3.5 w-3.5 text-brand-300" /> {m}
            </span>
          ))}
        </div>
      </Section>

      <Callout tone="amber" icon="landmark" title="Post-match sequence">
        After gates close: sync all devices → reconcile attendance → reconcile revenue → generate the event report (§46). Offline journals must
        be synchronized first, or attendance cannot reconcile.
      </Callout>
    </div>
  );
}
