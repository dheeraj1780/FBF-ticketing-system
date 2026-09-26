import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Badge, BulletList, Callout, Card, Legend, PageHeader, Section, Tabs } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { environments, infraDecisions, outboxGraph, systemArchitecture, traceChain } from "@/data/systemArchitecture";

const scenarios = [
  {
    id: "purchase",
    label: "Customer purchase",
    description: "Customer web → edge → API; identity via Keycloak, hold and order in PostgreSQL, payment via the gateway, then outbox → workers → notification.",
    sequence: ["customer-web", "cdn", "waf", "api", "keycloak", "api", "postgres", "api", "payment-gateway", "api", "outbox", "workers", "messaging"],
  },
  {
    id: "scan",
    label: "Gate scan",
    description: "An enrolled scanner reaches the API through the reverse proxy; redemption is committed atomically in PostgreSQL and traced via OpenTelemetry.",
    sequence: ["scanner", "waf", "api", "postgres", "api", "otel", "tempo", "grafana"],
  },
  {
    id: "pos",
    label: "POS sale",
    description: "Physical points of sale use the same central inventory, payment and ticket platform (FR-014).",
    sequence: ["pos", "waf", "api", "postgres", "api", "payment-gateway"],
  },
  {
    id: "telemetry",
    label: "Observability",
    description: "Every component emits logs, metrics and traces through OpenTelemetry into Prometheus, Loki and Tempo, visualized in Grafana.",
    sequence: ["api", "otel", "prometheus", "grafana", "loki", "otel", "tempo", "grafana"],
  },
];

function ProductionTopology() {
  const box = "rounded-xl border px-4 py-2.5 text-center text-sm font-semibold";
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <motion.div initial={{ opacity: 0, y: -6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={clsx(box, "border-slate-500/40 bg-slate-500/10 text-slate-200")}>
        Load Balancer
      </motion.div>
      <div className="flex gap-10">
        <ArrowDown className="h-4 w-4 -rotate-[25deg] text-slate-600" aria-hidden="true" />
        <ArrowDown className="h-4 w-4 rotate-[25deg] text-slate-600" aria-hidden="true" />
      </div>
      <div className="flex gap-4">
        {["API 1", "API 2"].map((a, i) => (
          <motion.div key={a} initial={{ opacity: 0, y: -6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08 }} className={clsx(box, "border-violet-400/40 bg-violet-400/10 text-violet-100")}>
            {a}
          </motion.div>
        ))}
      </div>
      <div className="flex gap-10">
        <ArrowDown className="h-4 w-4 rotate-[25deg] text-slate-600" aria-hidden="true" />
        <ArrowDown className="h-4 w-4 -rotate-[25deg] text-slate-600" aria-hidden="true" />
      </div>
      {[
        { l: "PostgreSQL", c: "border-amber-400/40 bg-amber-400/10 text-amber-100" },
        { l: "Redis", c: "border-rose-400/40 bg-rose-400/10 text-rose-100" },
        { l: "Workers", c: "border-brand-500/40 bg-brand-500/10 text-brand-100" },
      ].map((n, i) => (
        <div key={n.l} className="flex flex-col items-center gap-2">
          {i > 0 && <ArrowDown className="h-4 w-4 text-slate-600" aria-hidden="true" />}
          <motion.div initial={{ opacity: 0, y: -6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 + i * 0.08 }} className={clsx(box, n.c)}>
            {n.l}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default function TechnicalArchitecture() {
  const [env, setEnv] = useState("production");
  const current = environments.find((e) => e.id === env)!;

  return (
    <div>
      <PageHeader
        kicker="Architecture"
        title="Technical Architecture"
        icon="network"
        blueprint="§16, §34–35, §37–39"
        description="Clients reach a single FastAPI modular monolith through the edge. PostgreSQL is the system of record, and side-effects leave through a transactional outbox. Everything is observable through OpenTelemetry."
      />

      <Section
        title="Proposed system architecture"
        description="Pick a trace to animate a request path through the system, or click any component to see its role."
        actions={
          <Legend
            items={[
              { label: "Client", tone: "brand" },
              { label: "Edge", tone: "slate" },
              { label: "Platform", tone: "violet" },
              { label: "Data", tone: "amber" },
              { label: "External", tone: "rose" },
              { label: "Observability", tone: "lime" },
            ]}
          />
        }
      >
        <NodeGraph title="Proposed system architecture" graph={systemArchitecture} rowHeight={92} minColWidth={200} scenarios={scenarios} defaultSelected="api" />
      </Section>

      <Section title="Transactional outbox" description="§34 — business state and the outbox event are committed in one PostgreSQL transaction, so the core transaction's correctness never depends on an external message broker.">
        <NodeGraph title="Transactional outbox" graph={outboxGraph} rowHeight={80} minColWidth={150} playable sequence={["biz-tx", "pg-tx", "state-change", "outbox-event", "commit", "worker", "email", "reporting", "notifications", "integration"]} />
      </Section>

      <Section title="End-to-end traceability" description="§35 — every request carries a correlation/request ID, and every redemption can be traced back to its origin.">
        <Card>
          <ol className="flex flex-wrap items-center gap-2" aria-label="Redemption trace chain">
            {traceChain.map((t, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="rounded-lg border border-lime-400/30 bg-lime-400/[0.08] px-3 py-1.5 text-sm font-medium text-lime-100">{t}</span>
                {i < traceChain.length - 1 && <ArrowRight className="h-4 w-4 text-slate-600" aria-hidden="true" />}
              </motion.li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Structured logs", "Metrics", "Traces", "Health checks", "Alerts"].map((x) => (
              <Badge key={x} tone="lime">
                {x}
              </Badge>
            ))}
            <span className="self-center text-xs text-slate-500">required from all production components (NFR-007)</span>
          </div>
        </Card>
      </Section>

      <Section
        title="Infrastructure strategy"
        description="§37 — start small but highly observable; scale only after load testing."
        actions={
          <Tabs
            label="Environment"
            value={env}
            onChange={setEnv}
            tabs={environments.map((e) => ({ id: e.id, label: e.label }))}
          />
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <div className="kicker">{current.label}</div>
            <p className="mt-2 text-sm text-slate-300">{current.tagline}</p>
            {env === "production" ? (
              <ProductionTopology />
            ) : (
              <ol className="mt-4 space-y-2">
                {current.stack.map((s, i) => (
                  <motion.li
                    key={`${env}-${s}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 rounded-lg border border-canvas-border bg-white/[0.02] px-3 py-2 text-sm text-slate-200"
                  >
                    <span className="font-mono text-xs text-slate-500">{env === "development" ? (i === 0 ? "├" : "├──") : `${i + 1}.`}</span>
                    {s}
                  </motion.li>
                ))}
              </ol>
            )}
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {infraDecisions.map((d) => (
              <Card key={d.title}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-white">{d.title}</h3>
                  <Badge tone="rose">{d.verdict}</Badge>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{d.title === "Kafka" ? "Use instead" : "Reasons"}</p>
                <BulletList items={d.reasons} tone={d.title === "Kafka" ? "lime" : "rose"} className="mt-2" />
                <p className="mt-4 text-sm text-slate-400">{d.note}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Callout tone="violet" icon="layers" title="Designed for later extraction, not premature distribution">
        Containers keep Kubernetes possible later, and the outbox keeps a broker optional. Module boundaries inside the monolith mark
        where services could be extracted once real scale or organizational boundaries justify it (ADR-001, ADR-006).
      </Callout>
    </div>
  );
}
