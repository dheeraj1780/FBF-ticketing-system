import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Badge, PageHeader, Section } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { Icon } from "@/components/Icon";
import { businessDomains, businessLifecycleGraph } from "@/data/businessDomains";
import { backendModules } from "@/data/backendModules";
import { coreTables } from "@/data/dataModel";

const domainModules: Record<string, string[]> = {
  event: ["competitions", "matches"],
  venue: ["stadiums"],
  inventory: ["inventory"],
  commerce: ["orders", "payments"],
  "identity-ticket": ["tickets", "transfers"],
  access: ["redemption"],
  finance: ["payments", "reporting"],
  governance: ["identity", "audit", "reporting", "notifications"],
};

const domainTables: Record<string, string[]> = {
  event: ["Event"],
  venue: ["Venue"],
  inventory: ["Commerce"],
  commerce: ["Commerce"],
  "identity-ticket": ["Tickets"],
  access: ["Access"],
  finance: ["Commerce"],
  governance: ["Identity", "Governance"],
};

const letters = "ABCDEFGH";

export default function BusinessArchitecture() {
  const [selected, setSelected] = useState(businessDomains[0].id);
  const domain = businessDomains.find((d) => d.id === selected)!;
  const modules = backendModules.filter((m) => domainModules[domain.id]?.includes(m.id));
  const tables = coreTables.filter((t) => domainTables[domain.id]?.includes(t.domain));

  return (
    <div>
      <PageHeader
        kicker="Business"
        title="Business Architecture"
        icon="boxes"
        blueprint="§5"
        description="The complete business lifecycle, from competition to report, and the eight business domains that divide up the platform's responsibilities."
      />

      <Section
        title="Complete business lifecycle"
        description="Solid arrows are the primary value chain. Dashed arrows show the feeds into financial reconciliation and audit."
      >
        <NodeGraph title="Business lifecycle" graph={businessLifecycleGraph} rowHeight={100} minColWidth={180} playable sequence={["competition", "match", "stadium-config", "inventory", "sales", "payment", "issuance", "entry-validation", "redemption", "attendance", "reconciliation", "reports", "audit"]} />
      </Section>

      <Section title="Business domains" description="Select a domain to see what it owns and where it lands in the modular monolith.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="listbox" aria-label="Business domains">
            {businessDomains.map((d, i) => {
              const on = d.id === selected;
              return (
                <motion.button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => setSelected(d.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={clsx(
                    "panel relative flex flex-col items-start gap-3 p-4 text-left transition",
                    on ? "border-brand-400/60 bg-brand-500/[0.08] shadow-glow" : "hover:border-slate-600",
                  )}
                >
                  <span className="font-mono text-[11px] font-bold text-slate-500">DOMAIN {letters[i]}</span>
                  <span className={clsx("grid h-10 w-10 place-items-center rounded-xl", on ? "bg-brand-400 text-canvas" : "bg-white/[0.04] text-brand-300")}>
                    <Icon name={d.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-white">{d.label.split("— ")[1]}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="panel p-5"
              aria-live="polite"
            >
              <div className="kicker">{domain.label.split(" — ")[0]}</div>
              <h3 className="mt-1 text-xl font-semibold text-white">{domain.label.split(" — ")[1]}</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {domain.items.map((it) => (
                  <span key={it} className="rounded-lg border border-brand-500/25 bg-brand-500/[0.07] px-2.5 py-1 text-sm text-brand-100">
                    {it}
                  </span>
                ))}
              </div>
              <div className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Backend modules</div>
              <div className="mt-2 space-y-2">
                {modules.map((m) => (
                  <Link key={m.id} to={`/backend#${m.id}`} className="flex items-start gap-3 rounded-lg border border-canvas-border p-3 transition hover:border-brand-500/40">
                    <Icon name={m.icon} className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                    <span>
                      <span className="block font-mono text-xs text-slate-200">{m.path}</span>
                      <span className="block text-xs text-slate-400">{m.responsibility}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Core tables</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tables.flatMap((t) => t.tables).map((t) => (
                  <Badge key={t} tone="amber">
                    <span className="font-mono">{t}</span>
                  </Badge>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>
    </div>
  );
}
