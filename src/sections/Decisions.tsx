import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, BulletList, Card, PageHeader, Section } from "@/components/ui";
import { adrLinks, adrs } from "@/data/adr";
import { infraDecisions } from "@/data/systemArchitecture";
import { notFirst } from "@/data/overview";

export default function Decisions() {
  return (
    <div>
      <PageHeader
        kicker="Delivery"
        title="Architecture Decisions"
        icon="book"
        blueprint="§38–39, §51, §53"
        description="Six architecture decision records capture the choices that shape V1, each with its reason and where it shows up in the architecture."
      />

      <Section title="Architecture decision records">
        <ol className="relative space-y-4 border-l border-canvas-border pl-6">
          {adrs.map((a, i) => (
            <motion.li
              key={a.id}
              id={a.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative scroll-mt-24"
            >
              <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2 border-brand-400 bg-canvas" aria-hidden="true" />
              <article className="panel p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-brand-300">{a.id}</span>
                  <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                  <Badge tone="lime">Accepted</Badge>
                </div>
                <dl className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Decision</dt>
                    <dd className="mt-1 text-sm text-slate-100">{a.decision}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reason</dt>
                    <dd className="mt-1 text-sm text-slate-300">{a.reason}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{a.future ? "Future" : "See in explorer"}</dt>
                    <dd className="mt-1 text-sm text-slate-300">
                      {a.future && <p className="mb-2">{a.future}</p>}
                      <span className="flex flex-wrap gap-x-3 gap-y-1">
                        {adrLinks[a.id]?.map((l) => (
                          <Link key={l.to} to={l.to} className="text-brand-300 hover:underline">
                            {l.label} →
                          </Link>
                        ))}
                      </span>
                    </dd>
                  </div>
                </dl>
              </article>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section title="Related platform decisions" description="§38–39">
        <div className="grid gap-4 md:grid-cols-2">
          {infraDecisions.map((d) => (
            <Card key={d.title}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-white">{d.title}</h3>
                <Badge tone="rose">{d.verdict}</Badge>
              </div>
              <BulletList items={d.reasons} className="mt-3" tone={d.title === "Kafka" ? "lime" : "rose"} />
              <p className="mt-3 text-sm text-slate-400">{d.note}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="What should NOT be built first" description="§53">
        <Card>
          <div className="flex flex-wrap gap-2">
            {notFirst.avoid.map((a) => (
              <span key={a} className="rounded-lg border border-rose-400/25 bg-rose-400/[0.06] px-3 py-1.5 text-sm text-rose-100">
                {a}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-300">
            First prove: <span className="font-semibold text-lime-300">{notFirst.prove}</span>
          </p>
        </Card>
      </Section>
    </div>
  );
}
