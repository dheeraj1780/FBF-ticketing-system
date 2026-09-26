import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import clsx from "clsx";
import { Callout, PageHeader, Section } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { fraudPolicy, fraudRules, threatControls } from "@/data/security";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

const allRules = fraudRules.flatMap((c) => c.rules.map((r) => ({ category: c.category, rule: r })));

interface Signal {
  id: number;
  category: string;
  rule: string;
  subject: string;
}

const subjects: Record<string, string[]> = {
  "Customer-side": ["account #4410", "device fp-9c1e", "account #7781", "IP range 41.x"],
  "Ticket-side": ["TKT-8F21-C33 @ Gate B", "FAKE-0000-000 @ Gate A", "TKT-8F21-F66 @ Gate A", "device A2"],
  Administrative: ["user:finance-02", "user:ticketing-01", "user:superadmin", "user:pos-07"],
};

function SignalFeed() {
  const reduced = usePrefersReducedMotion();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [running, setRunning] = useState(!reduced);
  const n = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const r = allRules[(n.current * 7) % allRules.length];
      const subj = subjects[r.category][n.current % 4];
      n.current += 1;
      setSignals((s) => [{ id: n.current, category: r.category, rule: r.rule, subject: subj }, ...s].slice(0, 6));
    }, 1800);
    return () => window.clearInterval(t);
  }, [running]);

  return (
    <div className="panel">
      <div className="flex items-center justify-between border-b border-canvas-border px-4 py-2.5">
        <div className="text-sm font-semibold text-white">Illustrative signal feed</div>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-canvas-border hover:text-white"
        >
          {running ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
          {running ? "Pause" : "Stream"}
        </button>
      </div>
      <ul className="min-h-[300px] divide-y divide-canvas-border/60" aria-live="polite">
        <AnimatePresence initial={false}>
          {signals.map((s) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center"
            >
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{s.category}</div>
                <div className="font-medium text-amber-200">{s.rule}</div>
                <div className="font-mono text-[11px] text-slate-500">{s.subject}</div>
              </div>
              <ArrowRight className="hidden h-4 w-4 text-slate-600 sm:block" aria-hidden="true" />
              <div className="text-xs text-slate-300">
                <Icon name="file-text" className="mr-1 inline h-3.5 w-3.5 text-slate-500" />
                Reason recorded
              </div>
              <ArrowRight className="hidden h-4 w-4 text-slate-600 sm:block" aria-hidden="true" />
              <div className="text-xs text-slate-300">
                <Icon name="route" className="mr-1 inline h-3.5 w-3.5 text-brand-300" />
                Routed per policy · <span className="text-lime-300">not auto-blocked</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {signals.length === 0 && <li className="px-4 py-10 text-center text-sm text-slate-500">Press Stream to simulate rule signals.</li>}
      </ul>
    </div>
  );
}

export default function FraudAbuse() {
  const [threat, setThreat] = useState(threatControls[0].threat);
  const current = threatControls.find((t) => t.threat === threat)!;

  return (
    <div>
      <PageHeader
        kicker="Trust & operations"
        title="Fraud & Abuse"
        icon="shield-alert"
        blueprint="§1.1, §31"
        description="The platform exists to stop counterfeit, duplicated and diverted tickets. Fraud rules produce recorded, routable signals. They inform human decisions rather than blocking users automatically."
      />

      <Section title="Threats → controls" description="The nine problems the Sports organization must address (§1.1), mapped to the architectural controls that counter them.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ul className="grid gap-2 sm:grid-cols-2" role="listbox" aria-label="Threats">
            {threatControls.map((t) => (
              <li key={t.threat}>
                <button
                  type="button"
                  role="option"
                  aria-selected={t.threat === threat}
                  onClick={() => setThreat(t.threat)}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                    t.threat === threat ? "border-rose-400/60 bg-rose-500/10 text-white" : "border-canvas-border text-slate-300 hover:border-slate-600",
                  )}
                >
                  <Icon name="alert-triangle" className={clsx("h-4 w-4 shrink-0", t.threat === threat ? "text-rose-300" : "text-slate-500")} />
                  {t.threat}
                </button>
              </li>
            ))}
          </ul>
          <AnimatePresence mode="wait">
            <motion.div key={threat} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="panel p-5" aria-live="polite">
              <div className="kicker text-rose-300">Threat</div>
              <h3 className="mt-1 text-xl font-semibold text-white">{current.threat}</h3>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Countered by</div>
              <ul className="mt-2 space-y-2">
                {current.controls.map((c, i) => (
                  <motion.li
                    key={c}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    className="flex items-center gap-3 rounded-lg border border-lime-400/25 bg-lime-400/[0.06] px-3 py-2.5 text-sm text-lime-100"
                  >
                    <Icon name="shield-check" className="h-4 w-4 shrink-0" />
                    {c}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>

      <Section title="Initial fraud rule set" description="§31 — rules grouped by where the abuse originates.">
        <div className="grid gap-4 md:grid-cols-3">
          {fraudRules.map((c, ci) => (
            <motion.div key={c.category} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.08 }} className="panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400/15 text-amber-300">
                  <Icon name={c.icon} className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-white">{c.category}</h3>
                <span className="ml-auto font-mono text-xs text-slate-500">{c.rules.length}</span>
              </div>
              <ul className="space-y-1.5">
                {c.rules.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="From signal to decision" description="Signals are recorded with a reason and routed according to an explicit policy.">
        <SignalFeed />
      </Section>

      <Callout tone="amber" icon="alert-triangle" title="Policy">
        {fraudPolicy} AI fraud detection and advanced fraud analytics are deliberately deferred (§53, V2 scope).
      </Callout>
    </div>
  );
}
