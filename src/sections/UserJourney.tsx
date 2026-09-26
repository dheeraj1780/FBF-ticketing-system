import { useState } from "react";
import { PageHeader, Section, Tabs, Callout, Card } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { Icon } from "@/components/Icon";
import { customerExperienceRequirements, customerPurchaseFlow, matchDayUserFlow } from "@/data/userJourney";
import type { GraphNode } from "@/types";
import type { Tone } from "@/lib/tones";

const outcomeTone = (n: GraphNode): Tone => {
  if (n.icon === "x-circle") return "rose";
  if (["payment-confirmed", "access-granted", "redeem", "attendance-recorded", "notification", "ticket-in-account"].includes(n.id)) return "lime";
  if (n.label.endsWith("?")) return "amber";
  return "brand";
};

export default function UserJourney() {
  const [tab, setTab] = useState("purchase");

  return (
    <div>
      <PageHeader
        kicker="Business"
        title="User Journey"
        icon="route"
        blueprint="§3–4"
        description="Two customer journeys: buying a ticket, and walking through the gate on match day. Press Play flow to follow the happy path; decision nodes branch to explicit failure outcomes."
      />

      <Tabs
        label="Journey"
        value={tab}
        onChange={setTab}
        className="mb-6"
        tabs={[
          { id: "purchase", label: "Purchase flow", icon: "credit-card" },
          { id: "matchday", label: "Match-day entry", icon: "gate" },
        ]}
      />

      {tab === "purchase" ? (
        <>
          <Section title="Customer purchase flow" description="From opening the Sports ticket shop to receiving a secure ticket. Tickets are never issued before payment is confirmed.">
            <NodeGraph
              key="purchase"
              title="Customer purchase flow"
              graph={customerPurchaseFlow}
              rowHeight={74}
              minColWidth={240}
              maxNodeWidth={260}
              nodeHeight={52}
              playable
              sequence={customerPurchaseFlow.nodes.filter((n) => n.id !== "payment-failed").map((n) => n.id)}
              nodeTone={outcomeTone}
            />
          </Section>
          <Section title="Customer experience requirements" description="§3.1 — non-negotiables for the customer-facing experience.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customerExperienceRequirements.map((r) => (
                <Card key={r} className="flex items-center gap-3 p-4">
                  <Icon name="check-circle" className="h-4 w-4 shrink-0 text-lime-300" />
                  <span className="text-sm text-slate-200">{r}</span>
                </Card>
              ))}
            </div>
          </Section>
        </>
      ) : (
        <>
          <Section title="Match-day entry flow" description="Three checks in order: credential validity, correct event/zone/gate, and redemption state. Any failure produces a denial with a reason.">
            <NodeGraph
              key="matchday"
              title="Match-day entry flow"
              graph={matchDayUserFlow}
              rowHeight={74}
              minColWidth={240}
              maxNodeWidth={260}
              nodeHeight={52}
              playable
              sequence={matchDayUserFlow.nodes.filter((n) => !n.id.startsWith("access-denied")).map((n) => n.id)}
              nodeTone={outcomeTone}
            />
          </Section>
          <Callout tone="brand" icon="shield-check" title="Why the order matters">
            Signature and event/zone checks are cheap and can run offline. The redemption check is the only one that needs the
            authoritative server-side state, and online it runs inside a database transaction with a row lock, so two scanners
            presenting the same ticket result in exactly one entry (AT-002).
          </Callout>
        </>
      )}
    </div>
  );
}
