import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";
import { Badge, Card, PageHeader, Section, Tabs } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { functionalRequirements, nonFunctionalRequirements } from "@/data/requirements";
import { stakeholders } from "@/data/stakeholders";
import { sectionRoutes } from "@/data/nav";
import type { Requirement } from "@/types";

function RequirementCard({ req, open, onToggle }: { req: Requirement; open: boolean; onToggle: () => void }) {
  const functional = req.category === "functional";
  return (
    <li className="panel overflow-hidden" id={req.id}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-4 text-left transition hover:bg-white/[0.02] sm:p-5"
      >
        <span
          className={clsx(
            "mt-0.5 shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-bold",
            functional ? "border-brand-500/30 bg-brand-500/10 text-brand-200" : "border-violet-400/30 bg-violet-400/10 text-violet-200",
          )}
        >
          {req.id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-white">{req.title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-slate-400">{req.summary}</span>
        </span>
        <ChevronDown className={clsx("mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="grid gap-5 border-t border-canvas-border px-4 py-4 sm:px-5 md:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Specification</div>
                <div className="flex flex-wrap gap-1.5">
                  {req.details.map((d) => (
                    <span key={d} className="rounded-md border border-canvas-border bg-white/[0.03] px-2 py-1 text-xs text-slate-300">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Realized by</div>
                  <div className="flex flex-wrap gap-1.5">
                    {req.relatedComponents.map((c) => (
                      <Badge key={c} tone="amber">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Explore</div>
                  <div className="flex flex-wrap gap-2">
                    {req.relatedSections.map((s) => (
                      <Link key={s} to={sectionRoutes[s] ?? "/"} className="text-xs font-medium text-brand-300 underline-offset-2 hover:underline">
                        {s} →
                      </Link>
                    ))}
                    <Link to={`/traceability?req=${req.id}`} className="text-xs font-medium text-violet-300 underline-offset-2 hover:underline">
                      Traceability →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function Requirements() {
  const [tab, setTab] = useState("functional");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set(["FR-006"]));

  const list = tab === "functional" ? functionalRequirements : nonFunctionalRequirements;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => `${r.id} ${r.title} ${r.summary} ${r.details.join(" ")}`.toLowerCase().includes(q));
  }, [list, query]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <PageHeader
        kicker="Foundation"
        title="Requirements"
        icon="clipboard"
        blueprint="§2, §6–7"
        description="Fifteen functional and nine non-functional requirements define the baseline. Performance figures are engineering targets, not contractual guarantees until validated."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          label="Requirement type"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "functional", label: `Functional (${functionalRequirements.length})`, icon: "clipboard" },
            { id: "non-functional", label: `Non-functional (${nonFunctionalRequirements.length})`, icon: "gauge" },
            { id: "stakeholders", label: `Stakeholders (${stakeholders.length})`, icon: "users" },
          ]}
        />
        {tab !== "stakeholders" && (
          <div className="flex items-center gap-2">
            <label className="relative block w-full sm:w-72">
              <span className="sr-only">Filter requirements</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter requirements…"
                className="h-9 w-full rounded-lg border border-canvas-border bg-canvas-raised pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setOpen(open.size ? new Set() : new Set(filtered.map((r) => r.id)))}
              className="h-9 shrink-0 rounded-lg border border-canvas-border px-3 text-xs font-semibold text-slate-300 hover:text-white"
            >
              {open.size ? "Collapse all" : "Expand all"}
            </button>
          </div>
        )}
      </div>

      {tab === "stakeholders" ? (
        <Section title="Stakeholders" description="Who the platform serves and what each group primarily needs.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stakeholders.map((s, i) => (
              <motion.div key={s.role} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="flex h-full gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-white">{s.role}</div>
                    <div className="mt-0.5 text-sm text-slate-400">{s.needs}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <RequirementCard key={r.id} req={r} open={open.has(r.id)} onToggle={() => toggle(r.id)} />
          ))}
          {filtered.length === 0 && <li className="panel p-8 text-center text-sm text-slate-500">No requirements match “{query}”.</li>}
        </ul>
      )}
    </div>
  );
}
