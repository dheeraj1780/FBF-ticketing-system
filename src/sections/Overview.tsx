import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ban, Command } from "lucide-react";
import clsx from "clsx";
import { Badge, BulletList, Card, Section, Stat } from "@/components/ui";
import { Icon } from "@/components/Icon";
import {
  businessObjective, businessScope, corePrinciple, executiveSummary, finalPosition, nextArtifacts, notFirst,
} from "@/data/overview";
import { navGroups } from "@/data/nav";
import { functionalRequirements, nonFunctionalRequirements } from "@/data/requirements";
import { backendModules } from "@/data/backendModules";
import { acceptanceTests, roadmapPhases } from "@/data/roadmap";
import { adrs } from "@/data/adr";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

function LifecycleRibbon() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const steps = executiveSummary.lifecycle;

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % steps.length), 1400);
    return () => window.clearInterval(t);
  }, [reduced, steps.length]);

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Platform lifecycle">
      {steps.map((s, i) => {
        const done = i < active;
        const on = i === active;
        return (
          <li key={s}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className={clsx(
                "relative flex w-full items-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                on
                  ? "border-brand-400/60 bg-brand-500/15 text-white"
                  : done
                    ? "border-brand-500/20 bg-brand-500/[0.05] text-slate-300"
                    : "border-canvas-border bg-white/[0.02] text-slate-400",
              )}
            >
              <span
                className={clsx(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold",
                  on ? "bg-brand-400 text-canvas" : done ? "bg-brand-500/30 text-brand-100" : "bg-white/5 text-slate-500",
                )}
              >
                {i + 1}
              </span>
              <span className="leading-tight">{s}</span>
              {on && !reduced && (
                <motion.span
                  layoutId="ribbon-glow"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-brand-300 to-transparent"
                />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function ProveChain() {
  const steps = ["Sell", "Pay", "Issue", "Scan", "Redeem", "Report"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12 }}
          className="flex items-center gap-2"
        >
          <span className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-sm font-semibold text-lime-200">{s}</span>
          {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-slate-600" aria-hidden="true" />}
        </motion.div>
      ))}
    </div>
  );
}

export default function Overview() {
  return (
    <div>
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-canvas-border bg-gradient-to-br from-canvas-panel via-canvas-raised to-canvas p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge tone="brand">Blueprint v{executiveSummary.version}</Badge>
            <Badge tone="amber">{executiveSummary.status}</Badge>
            <Badge tone="violet">Modular monolith</Badge>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Sports Digital Ticketing &amp; <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">Stadium Access</span> Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            {executiveSummary.intro} An interactive guide to the Sports engineering blueprint —
            from match creation to gate redemption, reconciliation and audit.
          </motion.p>
          <p className="mt-3 text-sm text-slate-500">
            Posture: <span className="text-slate-300">{executiveSummary.posture}</span>
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-canvas shadow-glow transition hover:bg-brand-300"
            >
              Explore the architecture <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/lifecycle"
              className="inline-flex items-center gap-2 rounded-xl border border-canvas-border bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Simulate a ticket lifecycle
            </Link>
            <span className="hidden items-center gap-1.5 self-center text-xs text-slate-500 sm:inline-flex">
              <Command className="h-3.5 w-3.5" aria-hidden="true" /> + K to search anything
            </span>
          </div>
        </div>
      </section>

      <Section title="The platform lifecycle" description="The source specification defines this end-to-end lifecycle and requires it to work across different stadiums and competitions.">
        <LifecycleRibbon />
      </Section>

      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Functional requirements" value={functionalRequirements.length} tone="brand" />
        <Stat label="Non-functional reqs" value={nonFunctionalRequirements.length} tone="violet" />
        <Stat label="Backend modules" value={backendModules.length} tone="amber" />
        <Stat label="Roadmap phases" value={roadmapPhases.length} tone="lime" />
        <Stat label="Acceptance tests" value={acceptanceTests.length} tone="rose" />
        <Stat label="Architecture decisions" value={adrs.length} tone="slate" />
      </div>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="kicker mb-2">Business objective</div>
          <h3 className="text-lg font-semibold text-white">Problems the platform must solve</h3>
          <p className="mt-1 text-sm text-slate-400">{businessObjective.intro}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {businessObjective.problems.map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-lg border border-rose-400/15 bg-rose-400/[0.04] px-3 py-2 text-sm text-slate-300">
                <Icon name="alert-triangle" className="h-4 w-4 shrink-0 text-rose-300" />
                {p}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">{businessObjective.ownership}</p>
        </Card>
        <Card>
          <div className="kicker mb-2">Business scope</div>
          <h3 className="text-lg font-semibold text-white">What the platform shall support</h3>
          <ol className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {businessScope.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-sm text-slate-300">
                <span className="font-mono text-xs text-brand-400">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Section title="Recommended implementation">
        <Card>
          <div className="flex flex-wrap gap-2">
            {executiveSummary.recommendation
              .replace(/\.$/, "")
              .split(" + ")
              .map((t) => (
                <span key={t} className="rounded-lg border border-brand-500/25 bg-brand-500/[0.07] px-3 py-1.5 text-sm font-medium text-brand-100">
                  {t}
                </span>
              ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{executiveSummary.rationale}</p>
        </Card>
      </Section>

      <section className="mb-10 overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/[0.08] to-violet-500/[0.06] p-6 sm:p-8">
        <div className="kicker mb-3">Core engineering principle</div>
        <blockquote>
          <p className="text-2xl font-semibold text-white sm:text-3xl">“{corePrinciple.quote}”</p>
          <p className="mt-1 text-2xl font-semibold text-brand-300 sm:text-3xl">“{corePrinciple.quote2}”</p>
        </blockquote>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">{corePrinciple.body}</p>
      </section>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="kicker mb-2">§53 What should NOT be built first</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {notFirst.avoid.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-slate-400">
                <Ban className="h-4 w-4 shrink-0 text-rose-400/80" aria-hidden="true" />
                <span className="line-through decoration-rose-400/40">{a}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm font-semibold text-slate-200">First prove:</div>
          <div className="mt-3">
            <ProveChain />
          </div>
        </Card>
        <Card>
          <div className="kicker mb-2">§55 Final technical position</div>
          <p className="mb-4 text-sm text-slate-400">This architecture gives the Sports organization a platform that is:</p>
          <BulletList items={finalPosition.bullets} tone="lime" columns />
        </Card>
      </div>

      <Section title="Recommended next engineering artifacts" description="Before implementation begins, create these five artifacts. Only after these are reviewed should implementation begin.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {nextArtifacts.map((a, i) => (
            <Card key={a.title} className="p-4">
              <div className="font-mono text-xs text-brand-400">0{i + 1}</div>
              <div className="mt-1 font-semibold text-white">{a.title}</div>
              <p className="mt-1 text-sm text-slate-400">{a.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Explore the blueprint">
        <div className="space-y-6">
          {navGroups.map((g) => (
            <div key={g.label}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{g.label}</div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {g.items
                  .filter((i) => i.path !== "/")
                  .map((item) => (
                    <Link key={item.path} to={item.path} className="panel group flex gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-500/40">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-canvas-border bg-white/[0.03] text-brand-300 transition group-hover:border-brand-500/40">
                        <Icon name={item.icon} className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-100">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">{item.description}</span>
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
