import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Badge, Callout, PageHeader, Section, Stat } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { Icon } from "@/components/Icon";
import { incidentCategories, incidentRequirements, matchDayOpsGraph, mockGates } from "@/data/matchday";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

function LiveGates() {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setTick((x) => x + 1), 2000);
    return () => window.clearInterval(t);
  }, [reduced]);

  const gates = mockGates.map((g, i) => {
    const wobble = Math.round(Math.sin(tick * 0.9 + i) * g.scansPerMin * 0.12);
    return { ...g, rate: Math.max(0, g.scansPerMin + wobble) };
  });
  const max = Math.max(...gates.map((g) => g.rate), 1);
  const totalRate = gates.reduce((a, g) => a + g.rate, 0);
  const devices = gates.reduce((a, g) => a + g.devices, 0);
  const online = gates.reduce((a, g) => a + g.online, 0);
  const rejected = gates.reduce((a, g) => a + g.rejected, 0);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Scan rate" value={`${totalRate}/min`} tone="brand" />
        <Stat label="Devices online" value={`${online}/${devices}`} tone={online < devices ? "amber" : "lime"} hint={online < devices ? `${devices - online} offline, journaling locally` : undefined} />
        <Stat label="Rejected (last 5 min)" value={rejected} tone="rose" />
        <Stat label="Open incidents" value="1 · P2" tone="amber" hint="Individual scanner failure, Gate B" />
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <caption className="sr-only">Live gate status (illustrative)</caption>
          <thead>
            <tr className="border-b border-canvas-border text-left text-xs text-slate-400">
              <th scope="col" className="px-4 py-2.5 font-semibold">Gate</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Zone</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Scan rate</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Devices</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Rejected</th>
            </tr>
          </thead>
          <tbody>
            {gates.map((g) => (
              <tr key={g.gate} className="border-b border-canvas-border/50 last:border-0">
                <td className="px-4 py-2.5 font-semibold text-white">{g.gate}</td>
                <td className="px-4 py-2.5 text-slate-400">{g.zone}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2" title={`${g.rate} scans/min`}>
                    <div className="h-2 w-32 rounded-full bg-slate-800">
                      <motion.div className="h-full rounded-full bg-brand-400" animate={{ width: `${(g.rate / max) * 100}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <span className="tabular-nums text-slate-300">{g.rate}/min</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={clsx("inline-flex items-center gap-1.5", g.online < g.devices ? "text-amber-200" : "text-slate-300")}>
                    <Icon name={g.online < g.devices ? "wifi-off" : "wifi"} className="h-3.5 w-3.5" />
                    {g.online}/{g.devices}
                  </span>
                </td>
                <td className={clsx("px-4 py-2.5 tabular-nums", g.rejected > 3 ? "text-rose-300" : "text-slate-400")}>{g.rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">Illustrative operations view with mock, gently animated data.</p>
    </div>
  );
}

export default function MatchDay() {
  return (
    <div>
      <PageHeader
        kicker="Trust & operations"
        title="Match-Day Operations"
        icon="calendar"
        blueprint="§46–47"
        description="Match-day readiness starts 24–48 hours before kickoff. During the match, operators watch scan rates, rejections, device health and occupancy. Afterwards, every device syncs before attendance and revenue are reconciled."
      />

      <Section title="Operational match-day flow" description="Press Play flow to walk through the runbook.">
        <NodeGraph title="Operational match-day flow" graph={matchDayOpsGraph} rowHeight={74} minColWidth={230} nodeHeight={50} maxNodeWidth={250} playable toneByGroup />
      </Section>

      <Section title="Live operations">
        <LiveGates />
      </Section>

      <Section title="Incident categories" description="§47 — every incident needs an owner and a post-event review.">
        <div className="grid gap-4 md:grid-cols-3">
          {incidentCategories.map((c, i) => (
            <motion.div
              key={c.severity}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={clsx(
                "panel p-5",
                c.tone === "rose" && "border-rose-400/40",
                c.tone === "amber" && "border-amber-400/40",
                c.tone === "brand" && "border-brand-500/40",
              )}
            >
              <div className="flex items-center gap-2">
                <Badge tone={c.tone}>{c.severity}</Badge>
                <h3 className="font-semibold text-white">{c.label}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {c.examples.map((e) => (
                  <li key={e} className="flex gap-2 text-sm text-slate-300">
                    <Icon name={c.tone === "rose" ? "alert-octagon" : "alert-triangle"} className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    {e}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">Every incident needs:</span>
          {incidentRequirements.map((r) => (
            <span key={r} className="chip">
              {r}
            </span>
          ))}
        </div>
      </Section>

      <Callout tone="brand" icon="wifi-off" title="Test offline mode before match day">
        The pre-match checklist explicitly includes testing offline mode. Disconnected scanning is an operational capability that must be rehearsed,
        not discovered on match day.
      </Callout>
    </div>
  );
}
