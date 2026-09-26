import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Badge, Callout, PageHeader, Section, Tabs } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { decisionNotes, industryReferences, patternComparison } from "@/data/industry";
import { externalReferences } from "@/data/overview";
import type { Tone } from "@/lib/tones";

const decisionTone: Record<string, Tone> = {
  Adopt: "lime",
  Mandatory: "brand",
  "Adopt in Phase 2": "violet",
  Conditional: "amber",
  "Reject initially": "rose",
};

export default function IndustryPatterns() {
  const [ref, setRef] = useState(industryReferences[0].id);
  const [filter, setFilter] = useState("all");
  const current = industryReferences.find((r) => r.id === ref)!;
  const rows = filter === "all" ? patternComparison : patternComparison.filter((p) => (filter === "reject" ? p.decision === "Reject initially" : p.decision !== "Reject initially"));

  return (
    <div>
      <PageHeader
        kicker="Delivery"
        title="Industry Patterns"
        icon="trending-up"
        blueprint="§12–15, §56"
        description="Proven patterns from Ticketmaster, AXS, UEFA, pretix and Eventyay, used as references rather than requirements. The Sports-specific requirements remain authoritative."
      />

      <Section title="Benchmarks">
        <Tabs label="Benchmark" value={ref} onChange={setRef} className="mb-4" tabs={industryReferences.map((r) => ({ id: r.id, label: r.name }))} />
        <AnimatePresence mode="wait">
          <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <div className="kicker">{current.id === "pretix" || current.id === "eventyay" ? "Open-source benchmark" : "Industry benchmark"}</div>
              <h3 className="mt-1 text-xl font-semibold text-white">{current.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{current.summary}</p>
            </div>
            <div className="panel p-5">
              <div className="kicker mb-3">Design lessons for the Sports organization</div>
              <ul className="space-y-2">
                {current.lessons.map((l, i) => {
                  const negative = l.startsWith("Do not");
                  return (
                    <motion.li key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-2 text-sm text-slate-200">
                      <Icon name={negative ? "x-circle" : "check-circle"} className={clsx("mt-0.5 h-4 w-4 shrink-0", negative ? "text-rose-300" : "text-lime-300")} />
                      {l}
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </Section>

      <Section
        title="Industry pattern comparison"
        description="§15 — what the Sports organization adopts, and what it deliberately rejects initially."
        actions={
          <Tabs
            label="Decision filter"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: "all", label: "All" },
              { id: "adopt", label: "Adopted" },
              { id: "reject", label: "Rejected" },
            ]}
          />
        }
      >
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <caption className="sr-only">Industry pattern comparison</caption>
            <thead>
              <tr className="border-b border-canvas-border text-left text-xs text-slate-400">
                <th scope="col" className="px-4 py-2.5 font-semibold">Pattern</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Industry examples</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <motion.tr key={r.pattern} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-canvas-border/50 last:border-0">
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-100">{r.pattern}</th>
                    <td className="px-4 py-2.5 text-slate-400">{r.examples}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={decisionTone[r.decision]}>{decisionNotes[r.pattern] ?? r.decision}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="External research references" description="§56 — industry and architecture references. None of them are requirements to copy.">
        <ol className="space-y-2">
          {externalReferences.map((r, i) => (
            <li key={r} className="panel flex gap-3 p-3 text-sm text-slate-300">
              <span className="font-mono text-xs text-brand-400">{i + 1}.</span>
              {r}
            </li>
          ))}
        </ol>
      </Section>

      <Callout tone="amber" icon="alert-triangle" title="Reference, not replica">
        Do not copy proprietary implementation details. The Sports-specific requirements remain authoritative, and external systems are used only to
        identify proven architectural patterns.
      </Callout>
    </div>
  );
}
