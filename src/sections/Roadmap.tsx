import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Badge, BulletList, Card, PageHeader, Section } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { Icon } from "@/components/Icon";
import { acceptanceTests, documentationSet, implementationFlow, roadmapPhases, scopeTiers, testingStrategy } from "@/data/roadmap";
import type { ArchitectureGraph } from "@/types";

function useImplementationGraph(): ArchitectureGraph {
  return useMemo(() => {
    // Longest-path layering → rows; parallel branches → columns.
    const depth: Record<string, number> = {};
    implementationFlow.forEach((n) => {
      depth[n.id] = n.after.length ? Math.max(...n.after.map((a) => depth[a])) + 1 : 0;
    });
    const colFor: Record<string, number> = { G: 1, H: 2, V: 2, W: 2, X: 2, Y: 2 };
    const nodes = implementationFlow.map((n) => ({
      id: n.id,
      label: n.label,
      description: n.after.length ? `Follows: ${n.after.map((a) => implementationFlow.find((x) => x.id === a)!.label).join(", ")}.` : "Starting point.",
      col: colFor[n.id] ?? (["F"].includes(n.id) ? 0 : 1),
      row: depth[n.id],
      icon: "flag" as const,
    }));
    // Main chain sits in column 1, except the F/G/H fan-out.
    nodes.forEach((n) => {
      if (n.id === "F") n.col = 0;
    });
    // Offline branch starts after R: shift so it lines up next to S..U
    const edges = implementationFlow.flatMap((n) => n.after.map((a) => ({ from: a, to: n.id })));
    const rows = Math.max(...nodes.map((n) => n.row)) + 1;
    return { columns: 3, rows, nodes, edges };
  }, []);
}

export default function Roadmap() {
  const [phase, setPhase] = useState(0);
  const graph = useImplementationGraph();
  const p = roadmapPhases[phase];

  return (
    <div>
      <PageHeader
        kicker="Delivery"
        title="Implementation Roadmap"
        icon="git-branch"
        blueprint="§43–45, §50, §52, §54"
        description="Twelve phases, from discovery to production. V1 proves Sell → Pay → Issue → Scan → Redeem → Report first, and nothing is accepted until the critical acceptance tests pass."
      />

      <Section title="Development phases" description="Select a phase.">
        <div className="panel overflow-x-auto p-4">
          <ol className="relative flex min-w-[860px] items-start justify-between">
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-800" aria-hidden="true" />
            <motion.div
              className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-brand-400 to-lime-400"
              animate={{ width: `calc(${(phase / (roadmapPhases.length - 1)) * 100}% - ${(phase / (roadmapPhases.length - 1)) * 32}px)` }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            />
            {roadmapPhases.map((r, i) => (
              <li key={r.id} className="relative flex w-[70px] flex-col items-center">
                <button
                  type="button"
                  onClick={() => setPhase(i)}
                  aria-pressed={phase === i}
                  aria-label={`Phase ${r.phase}: ${r.title}`}
                  className={clsx(
                    "grid h-8 w-8 place-items-center rounded-full border-2 font-mono text-xs font-bold transition",
                    i === phase ? "scale-110 border-brand-300 bg-brand-400 text-canvas shadow-glow" : i < phase ? "border-brand-500 bg-brand-900 text-brand-100" : "border-slate-700 bg-canvas text-slate-400 hover:border-slate-500",
                  )}
                >
                  {r.phase}
                </button>
                <span className={clsx("mt-2 text-center text-[11px] leading-tight", i === phase ? "text-white" : "text-slate-500")}>{r.title}</span>
              </li>
            ))}
          </ol>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="panel mt-3 p-5" aria-live="polite">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="brand">Phase {p.phase}</Badge>
              <h3 className="text-lg font-semibold text-white">{p.title}</h3>
              <span className="text-sm text-slate-500">→ {p.outcome}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.items.map((it, i) => (
                <motion.span key={it} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} className="rounded-lg border border-canvas-border bg-white/[0.03] px-3 py-1.5 text-sm text-slate-200">
                  {it}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </Section>

      <Section title="Recommended scope" description="§52 — what ships when.">
        <div className="grid gap-4 lg:grid-cols-3">
          {scopeTiers.map((t, i) => (
            <Card key={t.tier} className={clsx(i === 0 && "border-lime-400/40")}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{t.tier}</h3>
                <span className="font-mono text-xs text-slate-500">{t.items.length}</span>
              </div>
              <p className="mt-1 text-xs text-brand-300">{t.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.items.map((it) => (
                  <Badge key={it} tone={i === 0 ? "lime" : i === 1 ? "brand" : "violet"}>
                    {it}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="End-to-end implementation flow" description="§54 — dependencies between work items. The offline track branches after atomic redemption, and both tracks converge on load testing.">
        <NodeGraph title="Implementation flow" graph={graph} rowHeight={62} minColWidth={220} nodeHeight={44} maxNodeWidth={230} playable showDetails={false} />
      </Section>

      <Section title="Testing strategy" description="§44">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {testingStrategy.map((t) => (
            <Card key={t.title} className="p-4">
              <h3 className="mb-3 font-semibold text-white">{t.title}</h3>
              <BulletList items={t.items} tone="violet" />
            </Card>
          ))}
        </div>
      </Section>

      <Section id="acceptance" title="Critical acceptance tests" description="§45 — the system should not be accepted until these scenarios pass.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {acceptanceTests.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="panel flex flex-col p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-300">{t.id}</span>
                <Icon name="clipboard-check" className="h-4 w-4 text-slate-500" />
              </div>
              <h3 className="mt-1 font-semibold text-white">{t.title}</h3>
              <ol className="mt-3 flex-1 space-y-1 border-l border-canvas-border pl-3 font-mono text-xs text-slate-400">
                {t.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="mt-3 rounded-md border border-lime-400/25 bg-lime-400/[0.06] px-2 py-1.5 text-xs font-medium text-lime-100">✓ {t.outcome}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Documentation set" description="§50 — the documents the project should maintain.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {documentationSet.map((d) => (
            <Card key={d.folder} className="p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-sm font-semibold text-amber-200">
                <Icon name="book" className="h-4 w-4" /> {d.folder}/
              </div>
              <ul className="space-y-0.5">
                {d.files.map((f) => (
                  <li key={f} className="truncate font-mono text-[11.5px] text-slate-400" title={f}>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
