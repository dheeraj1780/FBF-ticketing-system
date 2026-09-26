import { useMemo } from "react";
import { motion } from "framer-motion";
import { Callout, Card, Legend, PageHeader, Section } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { coreTables, entities, relations, reportingNote } from "@/data/dataModel";
import type { ArchitectureGraph, GraphNode, IconName } from "@/types";
import type { Tone } from "@/lib/tones";

const domainTone: Record<string, Tone> = {
  Identity: "brand",
  Governance: "rose",
  Commerce: "amber",
  Event: "violet",
  Inventory: "violet",
  Tickets: "lime",
  Access: "lime",
  Venue: "slate",
};

const domainIcon: Record<string, IconName> = {
  Identity: "users",
  Governance: "file-text",
  Commerce: "credit-card",
  Event: "calendar",
  Inventory: "boxes",
  Tickets: "ticket",
  Access: "scan",
  Venue: "stadium",
};

export default function DataModel() {
  const graph: ArchitectureGraph = useMemo(
    () => ({
      columns: 5,
      rows: 4,
      nodes: entities.map((e) => ({
        id: e.id,
        label: e.label,
        sublabel: e.domain,
        icon: domainIcon[e.domain],
        col: e.col,
        row: e.row,
        group: e.domain,
        description: `${e.domain} entity. Attributes below are the ones the blueprint documents explicitly. The full schema is a deliverable of "Database/ERD v1.0" (§57).`,
        detail: e.fields.map((f) => `${f.name} : ${f.type}${f.note ? ` — ${f.note}` : ""}`),
      })),
      edges: relations.map((r) => ({ from: r.from, to: r.to, label: r.label })),
    }),
    [],
  );

  return (
    <div>
      <PageHeader
        kicker="Architecture"
        title="Data Model"
        icon="database"
        blueprint="§20–21"
        description="PostgreSQL is the source of truth for transactional state. The high-level ERD links events, venues, commerce, tickets, access and governance."
      />

      <Section
        title="Entity relationship model"
        description="Click an entity to see its documented attributes and relationships."
        actions={
          <Legend
            items={[
              { label: "Identity", tone: "brand" },
              { label: "Event / Inventory", tone: "violet" },
              { label: "Venue", tone: "slate" },
              { label: "Commerce", tone: "amber" },
              { label: "Tickets / Access", tone: "lime" },
              { label: "Governance", tone: "rose" },
            ]}
          />
        }
      >
        <NodeGraph
          title="Entity relationship diagram"
          graph={graph}
          rowHeight={104}
          minColWidth={200}
          nodeHeight={54}
          defaultSelected="TICKET"
          nodeTone={(n: GraphNode) => domainTone[n.group ?? ""] ?? "slate"}
        />
      </Section>

      <Section title="Relationships" description="Cardinalities from the blueprint ERD.">
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Entity relationships and cardinalities</caption>
            <thead>
              <tr className="border-b border-canvas-border text-left text-xs text-slate-400">
                <th scope="col" className="px-4 py-2.5 font-semibold">From</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Relationship</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">To</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Cardinality</th>
              </tr>
            </thead>
            <tbody>
              {relations.map((r) => (
                <tr key={`${r.from}-${r.to}`} className="border-b border-canvas-border/50 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-slate-200">{r.from}</td>
                  <td className="px-4 py-2 text-slate-400">{r.label}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-200">{r.to}</td>
                  <td className="px-4 py-2 font-mono text-xs text-brand-300">{r.cardinality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Core database entities" description="§21 — minimum initial tables grouped by domain.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {coreTables.map((g, i) => (
            <motion.div key={g.domain} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-white">{g.domain}</span>
                  <span className="font-mono text-[11px] text-slate-500">{g.tables.length} tables</span>
                </div>
                <ul className="space-y-1">
                  {g.tables.map((t) => (
                    <li key={t} className="flex items-center gap-2 font-mono text-[12.5px] text-slate-300">
                      <span className="h-1 w-1 rounded-full bg-amber-400" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Callout tone="amber" icon="bar-chart" title="Reporting">
        {reportingNote}
      </Callout>
    </div>
  );
}
