import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { BulletList, Callout, Card, PageHeader, Section, Tabs } from "@/components/ui";
import { SequenceDiagram } from "@/components/SequenceDiagram";
import { NodeGraph } from "@/components/NodeGraph";
import { StateMachine } from "@/components/StateMachine";
import { GateSimulator } from "@/components/GateSimulator";
import { Icon } from "@/components/Icon";
import { deviceFields, devicePermissions, offlineScannerGraph, offlineSecurityModel, onlineRedemptionSequence } from "@/data/scanner";
import { deviceStateMachine } from "@/data/stateMachines";

export default function Scanner() {
  const [tab, setTab] = useState("simulator");

  return (
    <div>
      <PageHeader
        kicker="Ticketing core"
        title="Scanner & Access Control"
        icon="scan"
        blueprint="§13, §24–27, §42"
        description="Enrolled Flutter scanners validate tickets online with strong consistency. When disconnected, they validate locally against signed, provisioned data and reconcile afterwards."
      />

      <Tabs
        label="Scanner view"
        value={tab}
        onChange={setTab}
        className="mb-6"
        tabs={[
          { id: "simulator", label: "Gate simulator", icon: "gate" },
          { id: "online", label: "Online redemption", icon: "wifi" },
          { id: "offline", label: "Offline architecture", icon: "wifi-off" },
          { id: "device", label: "Device security", icon: "smartphone" },
        ]}
      />

      {tab === "simulator" && (
        <Section
          title="Interactive gate simulator"
          description="Four enrolled scanners on the same event. Scan tickets online and offline, reconnect to synchronize, and watch the nonce deduplication and conflict detection. This is a local simulation with mock data."
        >
          <GateSimulator />
        </Section>
      )}

      {tab === "online" && (
        <>
          <Section title="Online redemption sequence" description="§24 — the credential is verified and validated, then the ticket row is locked inside a transaction. Only a valid, unused ticket is marked redeemed, and the redemption and audit events commit together.">
            <SequenceDiagram data={onlineRedemptionSequence} />
          </Section>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <Icon name="hash" className="h-5 w-5 text-brand-300" />
              <h3 className="mt-2 font-semibold text-white">Scan idempotency</h3>
              <p className="mt-1 text-sm text-slate-400">Every scan carries a unique identifier/nonce so a retransmission never creates a duplicate redemption record.</p>
            </Card>
            <Card>
              <Icon name="lock" className="h-5 w-5 text-violet-300" />
              <h3 className="mt-2 font-semibold text-white">Strong consistency</h3>
              <p className="mt-1 text-sm text-slate-400">NFR-001: online redemption is strongly consistent. Two scanners on one ticket give exactly one success (AT-002).</p>
            </Card>
            <Card>
              <Icon name="gauge" className="h-5 w-5 text-lime-300" />
              <h3 className="mt-2 font-semibold text-white">&lt; 1 s decision</h3>
              <p className="mt-1 text-sm text-slate-400">NFR-003 engineering target for an online scanner decision. It is validated through capacity testing, not guaranteed.</p>
            </Card>
          </div>
        </>
      )}

      {tab === "offline" && (
        <>
          <Section title="Offline scanner architecture" description="§25 — press Play to follow a device from enrollment through disconnected scanning to server reconciliation.">
            <NodeGraph title="Offline scanner architecture" graph={offlineScannerGraph} rowHeight={78} minColWidth={230} nodeHeight={52} maxNodeWidth={250} playable toneByGroup />
          </Section>

          <Section title="Offline security model" description="§26 — the guarantees offline operation can and cannot provide.">
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              {offlineSecurityModel.questions.map((q) => (
                <Card key={q.q} className={clsx(q.tone === "lime" ? "border-lime-400/30" : "border-amber-400/30")}>
                  <p className="text-sm text-slate-400">{q.q}</p>
                  <p className={clsx("mt-2 text-2xl font-semibold", q.tone === "lime" ? "text-lime-300" : "text-amber-300")}>{q.a}</p>
                  <p className="mt-1 text-sm text-slate-300">{q.body}</p>
                </Card>
              ))}
            </div>
            <Card>
              <div className="kicker mb-3">Possible approaches (operational policy)</div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {offlineSecurityModel.approaches.map((a, i) => (
                  <motion.li
                    key={a}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 text-sm text-slate-200"
                  >
                    <span className="font-mono text-xs text-brand-400">{i + 1}.</span>
                    {a}
                  </motion.li>
                ))}
              </ol>
            </Card>
          </Section>
          <Callout tone="amber" icon="alert-triangle" title="Disclosure requirement">
            {offlineSecurityModel.disclosure} Offline scanning is a separately specified subsystem (ADR-005), because global single-use
            guarantees cannot match an always-online atomic database transaction (FR-008).
          </Callout>
        </>
      )}

      {tab === "device" && (
        <>
          <Section title="Device lifecycle" description="§27 — a lost or stolen scanner must be remotely revocable.">
            <StateMachine data={deviceStateMachine} />
          </Section>
          <div className="mb-10 grid gap-4 lg:grid-cols-3">
            <Card>
              <div className="kicker mb-3">Device identity</div>
              <ul className="space-y-1.5">
                {deviceFields.map((f) => (
                  <li key={f} className="font-mono text-sm text-slate-200">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">A device is explicitly enrolled rather than behaving like a generic API client.</p>
            </Card>
            <Card>
              <div className="kicker mb-3">Device-scoped permissions</div>
              <p className="mb-3 text-sm text-slate-400">A scanner should only be able to:</p>
              <BulletList items={devicePermissions} tone="lime" />
              <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-400/[0.06] p-3 text-sm text-rose-100">It should never have administrator privileges.</p>
            </Card>
            <Card>
              <div className="kicker mb-3">§42 Scanner provider abstraction</div>
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-full rounded-lg border border-brand-500/40 bg-brand-500/10 py-2 text-center text-sm font-semibold text-brand-100">Scanner UI</div>
                <span className="h-4 w-px bg-slate-600" />
                <div className="w-full rounded-lg border border-violet-400/40 bg-violet-400/10 py-2 text-center text-sm font-semibold text-violet-100">Scan Engine</div>
                <span className="h-4 w-px bg-slate-600" />
                <div className="grid w-full grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-canvas-border py-2 text-sm text-slate-200">
                    <Icon name="camera" className="h-4 w-4 text-slate-400" /> Camera
                  </div>
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-canvas-border py-2 text-sm text-slate-200">
                    <Icon name="scan" className="h-4 w-4 text-slate-400" /> Hardware
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">A smartphone camera can be the initial scanner. Professional hardware can be added later.</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
