import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Play, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Badge, BulletList, Callout, Card, PageHeader, Section } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { Icon } from "@/components/Icon";
import { auditFields, auditedOperations, dataProtection, ownership, securityGraph, securityLayers, securityStandards } from "@/data/security";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

function DefenseInDepth() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!playing) return;
    if (active >= securityLayers.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setActive((a) => a + 1), reduced ? 0 : 280);
    return () => window.clearTimeout(t);
  }, [playing, active, reduced]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">Thirteen layers, applied in order. None of them is sufficient alone.</span>
          <button
            type="button"
            onClick={() => {
              setActive(-1);
              setPlaying(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-brand-500/30 hover:bg-brand-500/25"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" /> Send a request
          </button>
        </div>
        <ol className="space-y-1.5">
          {securityLayers.map((l, i) => {
            const passed = i <= active;
            const current = i === active && playing;
            return (
              <li key={l.name}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={selected === i}
                  className={clsx(
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition",
                    selected === i ? "border-brand-400/60" : "border-canvas-border hover:border-slate-600",
                  )}
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-brand-500/10"
                    initial={false}
                    animate={{ width: passed ? "100%" : "0%" }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                  />
                  <span className="relative w-6 font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                  <Icon name={l.icon} className={clsx("relative h-4 w-4", passed ? "text-brand-300" : "text-slate-500")} />
                  <span className={clsx("relative font-medium", passed ? "text-white" : "text-slate-300")}>{l.name}</span>
                  {current && <span className="relative ml-auto h-2 w-2 animate-ping rounded-full bg-brand-300" />}
                  {passed && !current && <Icon name="check-circle" className="relative ml-auto h-4 w-4 text-lime-300" />}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="panel p-5 lg:self-start">
          <div className="kicker">Layer {selected + 1}</div>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <Icon name={securityLayers[selected].icon} className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-white">{securityLayers[selected].name}</h3>
          </div>
          <p className="mt-3 text-sm text-slate-300">{securityLayers[selected].note}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AuditLedger() {
  const [events, setEvents] = useState([
    { id: "evt_0191", action: "ticket.refund", actor: "user:finance-02", result: "success" },
    { id: "evt_0192", action: "redemption.accept", actor: "device:A1", result: "success" },
    { id: "evt_0193", action: "price.change", actor: "user:ticketing-01", result: "success" },
  ]);
  const [notice, setNotice] = useState<string | null>(null);

  const append = () => {
    const n = events.length + 191;
    setEvents((e) => [...e, { id: `evt_0${n}`, action: "admin.login", actor: "user:superadmin", result: "success" }]);
    setNotice("Appended: the application can append audit events.");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="kicker">§30 Audit architecture</div>
          <h3 className="mt-1 font-semibold text-white">Append-only audit log</h3>
        </div>
        <button type="button" onClick={append} className="inline-flex items-center gap-1.5 rounded-lg border border-lime-400/30 px-2.5 py-1.5 text-xs font-semibold text-lime-200 hover:bg-lime-400/10">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Append event
        </button>
      </div>
      <ul className="mt-4 space-y-1.5">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.li key={e.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 rounded-lg border border-canvas-border px-3 py-2 font-mono text-xs">
              <span className="text-slate-500">{e.id}</span>
              <span className="text-brand-200">{e.action}</span>
              <span className="hidden text-slate-400 sm:inline">{e.actor}</span>
              <span className="ml-auto flex gap-1">
                <button type="button" aria-label={`Edit ${e.id}`} onClick={() => setNotice(`Denied: ordinary application users cannot edit audit events (${e.id}).`)} className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" aria-label={`Delete ${e.id}`} onClick={() => setNotice(`Denied and flagged: deletion attempt on ${e.id} recorded as an administrative fraud signal (§31).`)} className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <AnimatePresence>
        {notice && (
          <motion.p
            key={notice}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="status"
            className={clsx("mt-3 rounded-lg border p-2.5 text-xs", notice.startsWith("Appended") ? "border-lime-400/30 bg-lime-400/10 text-lime-100" : "border-rose-400/30 bg-rose-400/10 text-rose-100")}
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Every sensitive event records</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {auditFields.map((f) => (
          <span key={f} className="rounded border border-canvas-border bg-white/[0.02] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
            {f}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">For stronger environments, forward security/audit logs to a separately controlled storage system.</p>
    </Card>
  );
}

export default function SecurityArchitecture() {
  return (
    <div>
      <PageHeader
        kicker="Trust & operations"
        title="Security Architecture"
        icon="shield"
        blueprint="§30, §36, §48–49 · NFR-005"
        description="Customers, admins and scanner devices all authenticate through Keycloak. Every request passes through the WAF, and every sensitive action lands in an append-only audit pipeline."
      />

      <Section title="Security topology" description="Click a component to see its security role.">
        <NodeGraph title="Security architecture" graph={securityGraph} rowHeight={90} minColWidth={200} defaultSelected="api" />
      </Section>

      <Section title="Defense in depth" description="The thirteen security layers from §36.">
        <DefenseInDepth />
      </Section>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <AuditLedger />
        <div className="space-y-4">
          <Card>
            <div className="kicker mb-3">Standards (NFR-005)</div>
            <div className="flex flex-wrap gap-1.5">
              {securityStandards.map((s) => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
            </div>
          </Card>
          <Card>
            <div className="kicker mb-3">Audited operations (FR-010)</div>
            <div className="flex flex-wrap gap-1.5">
              {auditedOperations.map((s) => (
                <Badge key={s} tone="slate">
                  {s}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="kicker mb-3">§48 Data protection</div>
          <BulletList items={dataProtection.principles} columns tone="violet" />
          <p className="mt-4 text-sm text-slate-300">{dataProtection.note}</p>
          <p className="mt-2 text-xs text-slate-500">{dataProtection.legal}</p>
        </Card>
        <Card>
          <div className="kicker mb-3">§49 Ownership / vendor independence</div>
          <p className="mb-3 text-sm text-slate-400">FGF should control:</p>
          <BulletList items={ownership.controls} columns tone="amber" />
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] p-3 text-sm text-amber-100">
            <Icon name="key" className="mt-0.5 h-4 w-4 shrink-0" />
            {ownership.rule}
          </div>
        </Card>
      </div>

      <Callout tone="brand" icon="lock" title="Keys never leave the platform side">
        The Ed25519 signing key sits behind KMS/HSM in production. Scanners hold only the public verification key, so a stolen scanner
        cannot mint tickets, and it can be revoked remotely.
      </Callout>
    </div>
  );
}
