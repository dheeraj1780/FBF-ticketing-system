import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Badge, Callout, PageHeader, Section, Stat, Tabs } from "@/components/ui";
import { allRequirements } from "@/data/requirements";
import { roadmapPhases, acceptanceTests } from "@/data/roadmap";
import { requirementTests } from "@/data/traceability";
import { sectionRoutes } from "@/data/nav";

const phaseColumns = [
  ...roadmapPhases.map((p) => ({ key: `Phase ${p.phase} — ${p.title}`, short: `P${p.phase}`, title: p.title })),
  { key: "V1.5 scope", short: "V1.5", title: "V1.5 scope" },
];

function TraceColumn({ title, items, tone, delay, render }: {
  title: string;
  items: string[];
  tone: "brand" | "amber" | "lime" | "rose" | "violet";
  delay: number;
  render?: (i: string) => ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="panel flex-1 p-4"
    >
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">No direct mapping in the blueprint.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((i) => (
            <Badge key={i} tone={tone}>
              {render ? render(i) : i}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function Traceability() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("req") ?? "FR-007";
  const [filter, setFilter] = useState("all");

  const selected = allRequirements.find((r) => r.id === selectedId) ?? allRequirements[0];
  const tests = requirementTests[selected.id] ?? { acceptance: [], testTypes: [] };

  const rows = useMemo(() => {
    if (filter === "functional") return allRequirements.filter((r) => r.category === "functional");
    if (filter === "non-functional") return allRequirements.filter((r) => r.category === "non-functional");
    if (filter === "tested") return allRequirements.filter((r) => (requirementTests[r.id]?.acceptance.length ?? 0) > 0);
    return allRequirements;
  }, [filter]);

  const withAT = allRequirements.filter((r) => (requirementTests[r.id]?.acceptance.length ?? 0) > 0).length;
  const withPhase = allRequirements.filter((r) => r.relatedPhases.length > 0).length;
  const atCoverage = acceptanceTests.map((t) => ({
    test: t,
    reqs: allRequirements.filter((r) => requirementTests[r.id]?.acceptance.includes(t.id)).map((r) => r.id),
  }));

  const select = (id: string) => setParams({ req: id }, { replace: true });

  return (
    <div>
      <PageHeader
        kicker="Foundation"
        title="Requirements Traceability"
        icon="link"
        blueprint="§6–7 · §43 · §44–45"
        description="Follow each requirement to the components that realize it, the roadmap phase that delivers it and the tests that prove it."
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Requirements traced" value={allRequirements.length} />
        <Stat label="Mapped to a delivery phase" value={`${withPhase}/${allRequirements.length}`} tone="lime" />
        <Stat label="Covered by acceptance tests" value={`${withAT}/${allRequirements.length}`} tone="violet" />
        <Stat label="Critical acceptance tests" value={acceptanceTests.length} tone="rose" hint="All must pass before acceptance (§45)" />
      </div>

      <Section title="Trace a requirement" description="Select any requirement to see its chain from specification to proof.">
        <div className="mb-4 flex flex-wrap gap-1.5" role="listbox" aria-label="Requirements">
          {allRequirements.map((r) => (
            <button
              key={r.id}
              type="button"
              role="option"
              aria-selected={r.id === selected.id}
              onClick={() => select(r.id)}
              className={clsx(
                "rounded-md border px-2 py-1 font-mono text-[11px] font-semibold transition",
                r.id === selected.id
                  ? "border-brand-400 bg-brand-500/20 text-white"
                  : r.category === "functional"
                    ? "border-canvas-border text-slate-400 hover:border-brand-500/40 hover:text-slate-200"
                    : "border-canvas-border text-violet-300/70 hover:border-violet-400/40 hover:text-violet-200",
              )}
            >
              {r.id}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="panel mb-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={selected.category === "functional" ? "brand" : "violet"}>{selected.id}</Badge>
                <h3 className="text-lg font-semibold text-white">{selected.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">{selected.summary}</p>
            </div>
            <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
              <TraceColumn title="Realized by" items={selected.relatedComponents} tone="amber" delay={0.05} />
              <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-slate-600 lg:rotate-0" aria-hidden="true" />
              <TraceColumn title="Delivered in" items={selected.relatedPhases} tone="lime" delay={0.15} />
              <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-slate-600 lg:rotate-0" aria-hidden="true" />
              <TraceColumn title="Verified by" items={[...tests.acceptance, ...tests.testTypes]} tone="rose" delay={0.25} />
              <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-slate-600 lg:rotate-0" aria-hidden="true" />
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="panel flex-1 p-4">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Explore</div>
                <div className="flex flex-col gap-1.5">
                  {selected.relatedSections.map((s) => (
                    <Link key={s} to={sectionRoutes[s] ?? "/"} className="text-sm font-medium text-brand-300 hover:underline">
                      {s} →
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Section>

      <Section
        title="Requirement × delivery phase matrix"
        description="Where each requirement lands in the implementation roadmap."
        actions={
          <Tabs
            label="Matrix filter"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: "all", label: "All" },
              { id: "functional", label: "FR" },
              { id: "non-functional", label: "NFR" },
              { id: "tested", label: "With AT" },
            ]}
          />
        }
      >
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <caption className="sr-only">Requirements mapped to roadmap phases</caption>
            <thead>
              <tr className="border-b border-canvas-border">
                <th scope="col" className="sticky left-0 z-10 bg-canvas-panel px-4 py-3 text-left text-xs font-semibold text-slate-400">
                  Requirement
                </th>
                {phaseColumns.map((p) => (
                  <th key={p.key} scope="col" title={p.title} className="px-1 py-3 text-center font-mono text-[11px] font-semibold text-slate-400">
                    {p.short}
                  </th>
                ))}
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                  Acceptance
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isSel = r.id === selected.id;
                return (
                  <tr
                    key={r.id}
                    onClick={() => select(r.id)}
                    className={clsx("cursor-pointer border-b border-canvas-border/60 transition-colors", isSel ? "bg-brand-500/[0.08]" : "hover:bg-white/[0.02]")}
                  >
                    <th scope="row" className={clsx("sticky left-0 z-10 px-4 py-2.5 text-left font-normal", isSel ? "bg-[#0f2230]" : "bg-canvas-panel")}>
                      <button type="button" onClick={() => select(r.id)} className="flex items-center gap-2 text-left">
                        <span className={clsx("font-mono text-xs font-bold", r.category === "functional" ? "text-brand-300" : "text-violet-300")}>{r.id}</span>
                        <span className="text-slate-300">{r.title}</span>
                      </button>
                    </th>
                    {phaseColumns.map((p) => {
                      const hit = r.relatedPhases.includes(p.key);
                      return (
                        <td key={p.key} className="px-1 py-2.5 text-center">
                          {hit ? (
                            <span className="inline-block h-3.5 w-3.5 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]" aria-label={`Delivered in ${p.title}`} />
                          ) : (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-700" aria-hidden="true" />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(requirementTests[r.id]?.acceptance ?? []).map((a) => (
                          <span key={a} className="rounded border border-rose-400/30 bg-rose-400/10 px-1.5 font-mono text-[10px] text-rose-200">
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Acceptance test coverage" description="Each critical acceptance test (§45) and the requirements it proves.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {atCoverage.map(({ test, reqs }) => (
            <div key={test.id} className="panel p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-300">{test.id}</span>
                <span className="text-[11px] text-slate-500">{reqs.length} req.</span>
              </div>
              <div className="mt-1 font-semibold text-white">{test.title}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {reqs.map((id) => (
                  <button key={id} type="button" onClick={() => select(id)} className="rounded border border-canvas-border px-1.5 py-0.5 font-mono text-[10.5px] text-slate-300 hover:border-brand-500/40 hover:text-white">
                    {id}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Callout tone="amber" icon="alert-triangle" title="How this mapping was built">
        The blueprint lists requirements (§6–7), roadmap phases (§43), scope tiers (§52), test types (§44) and acceptance tests (§45) separately.
        This matrix links them by subject matter. Section 57 calls for an SRS in which every requirement has an ID and an acceptance
        criterion; this view previews that structure and does not replace it.
      </Callout>
    </div>
  );
}
