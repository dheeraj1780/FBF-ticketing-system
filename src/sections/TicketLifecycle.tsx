import { useState } from "react";
import { Callout, PageHeader, Section, Tabs } from "@/components/ui";
import { StateMachine } from "@/components/StateMachine";
import { paymentStateMachine, redemptionStateMachine, ticketStateMachine } from "@/data/stateMachines";
import { functionalRequirements } from "@/data/requirements";

const machines = {
  ticket: {
    data: ticketStateMachine,
    blurb: "A ticket moves from inventory to redemption. REDEEMED, CANCELLED and REFUNDED are terminal. A transfer returns the ticket to VALID with a new credential.",
  },
  payment: {
    data: paymentStateMachine,
    blurb: "Payment webhooks must be idempotent. Repeated webhook delivery must not issue multiple tickets (AT-003).",
  },
  redemption: {
    data: redemptionStateMachine,
    blurb: "When online, redemption is a single atomic transition: the ticket row is locked, its status checked, and the redemption and audit events are committed together.",
  },
};

export default function TicketLifecycle() {
  const [tab, setTab] = useState<keyof typeof machines>("ticket");
  const m = machines[tab];
  const fr007 = functionalRequirements.find((r) => r.id === "FR-007")!;

  return (
    <div>
      <PageHeader
        kicker="Ticketing core"
        title="Ticket Lifecycle"
        icon="workflow"
        blueprint="§8–10"
        description="Three state machines govern the platform: ticket, payment and redemption. Pick a scenario to animate a record through its lifecycle."
      />

      <Tabs
        label="State machine"
        value={tab}
        onChange={(id) => setTab(id as keyof typeof machines)}
        className="mb-4"
        tabs={[
          { id: "ticket", label: "Ticket", icon: "ticket" },
          { id: "payment", label: "Payment", icon: "credit-card" },
          { id: "redemption", label: "Redemption", icon: "scan" },
        ]}
      />
      <p className="mb-4 max-w-3xl text-sm text-slate-400">{m.blurb}</p>

      <Section title={m.data.title}>
        <StateMachine key={tab} data={m.data} />
      </Section>

      {tab === "redemption" && (
        <Section title="Redemption outcomes the system must support" description="FR-007: every scan resolves to exactly one of these outcomes.">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {fr007.details.map((d, i) => (
              <div
                key={d}
                className={`panel flex items-center gap-2 p-3 text-sm ${i === 0 ? "border-lime-400/40 text-lime-200" : "text-rose-200"}`}
              >
                <span className={`h-2 w-2 rounded-full ${i === 0 ? "bg-lime-400" : "bg-rose-400"}`} />
                {d}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Callout tone="rose" icon="alert-octagon" title="Critical rule">
        No payment confirmation = no paid ticket. PAID is reached only from a confirmed, idempotently-processed payment, and issuance
        happens in the same database transaction as payment capture.
      </Callout>
    </div>
  );
}
