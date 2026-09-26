import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, RefreshCw, RotateCcw, ScanLine, Upload, Wifi, WifiOff } from "lucide-react";
import clsx from "clsx";
import { simMatch, simTickets, type SimTicket } from "@/data/scanner";
import { Icon } from "./Icon";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

interface JournalEntry {
  nonce: string;
  ticketId: string;
  accepted: boolean;
  reason: string;
}

interface Device {
  id: string;
  label: string;
  gate: string;
  online: boolean;
  revoked: boolean;
  journal: JournalEntry[];
  lastBatch: JournalEntry[];
  knownRedeemed: string[];
  localAccepted: string[];
  seq: number;
}

interface LogLine {
  id: number;
  text: string;
  tone: "ok" | "bad" | "warn" | "info";
}

interface Check {
  label: string;
  ok: boolean;
  reason?: string;
}

const initialServerRedeemed = { "TKT-8F21-C33": "B1" } as Record<string, string>;

const initialDevices = (): Device[] => [
  { id: "A1", label: "Scanner A1", gate: "Gate A", online: true, revoked: false, journal: [], lastBatch: [], knownRedeemed: Object.keys(initialServerRedeemed), localAccepted: [], seq: 0 },
  { id: "A2", label: "Scanner A2", gate: "Gate A", online: true, revoked: false, journal: [], lastBatch: [], knownRedeemed: Object.keys(initialServerRedeemed), localAccepted: [], seq: 0 },
  { id: "B1", label: "Scanner B1", gate: "Gate B", online: true, revoked: false, journal: [], lastBatch: [], knownRedeemed: Object.keys(initialServerRedeemed), localAccepted: [], seq: 0 },
  { id: "V1", label: "Scanner V1", gate: "Gate V", online: true, revoked: false, journal: [], lastBatch: [], knownRedeemed: Object.keys(initialServerRedeemed), localAccepted: [], seq: 0 },
];

function evaluate(ticket: SimTicket, device: Device, serverRedeemed: Record<string, string>): Check[] {
  const checks: Check[] = [];
  checks.push(ticket.signatureValid ? { label: "Verify Ed25519 signature", ok: true } : { label: "Verify Ed25519 signature", ok: false, reason: "Invalid signature" });
  if (!checks[0].ok) return checks;

  const eventOk = ticket.match === simMatch;
  checks.push({ label: "Event / time window", ok: eventOk, reason: eventOk ? undefined : "Wrong event" });
  if (!eventOk) return checks;

  const statusReason =
    ticket.status === "REVOKED" ? "Revoked credential" : ticket.status === "CANCELLED" ? "Cancelled ticket" : ticket.status === "REFUNDED" ? "Refunded ticket" : undefined;
  checks.push({ label: "Credential status", ok: !statusReason, reason: statusReason });
  if (statusReason) return checks;

  const gateOk = ticket.gate === device.gate;
  checks.push({ label: `Zone / gate (${device.gate})`, ok: gateOk, reason: gateOk ? undefined : `Wrong zone/gate: ticket is for ${ticket.gate}` });
  if (!gateOk) return checks;

  const used = device.online
    ? serverRedeemed[ticket.id] !== undefined
    : device.knownRedeemed.includes(ticket.id) || device.localAccepted.includes(ticket.id);
  checks.push({
    label: device.online ? "Redemption state (server, row-locked)" : "Redemption state (local journal only)",
    ok: !used,
    reason: used ? "Already redeemed" : undefined,
  });
  return checks;
}

export function GateSimulator() {
  const reduced = usePrefersReducedMotion();
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [serverRedeemed, setServerRedeemed] = useState<Record<string, string>>(initialServerRedeemed);
  const [serverNonces, setServerNonces] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [log, setLog] = useState<LogLine[]>([{ id: 0, text: "Event data provisioned to 4 enrolled scanners. Ticket C33 already redeemed at Gate B.", tone: "info" }]);
  const [deviceId, setDeviceId] = useState("A1");
  const [ticketId, setTicketId] = useState(simTickets[0].id);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [revealed, setRevealed] = useState(0);
  const logId = useRef(1);

  const device = devices.find((d) => d.id === deviceId)!;
  const ticket = simTickets.find((t) => t.id === ticketId)!;

  const push = (text: string, tone: LogLine["tone"]) => setLog((l) => [{ id: logId.current++, text, tone }, ...l].slice(0, 40));
  const patchDevice = (id: string, patch: (d: Device) => Partial<Device>) =>
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch(d) } : d)));

  useEffect(() => {
    if (!checks) return;
    if (revealed >= checks.length) return;
    const t = window.setTimeout(() => setRevealed((r) => r + 1), reduced ? 0 : 260);
    return () => window.clearTimeout(t);
  }, [checks, revealed, reduced]);

  const scan = () => {
    if (device.revoked) {
      setChecks([{ label: "Device authorization", ok: false, reason: "Device revoked: protected operations blocked (AT-007)" }]);
      setRevealed(0);
      push(`${device.label}: scan refused, device is REVOKED.`, "bad");
      return;
    }
    const result = evaluate(ticket, device, serverRedeemed);
    const accepted = result.every((c) => c.ok);
    const reason = result.find((c) => !c.ok)?.reason ?? "Access granted";
    const nonce = `${device.id}-${String(device.seq + 1).padStart(3, "0")}`;
    setChecks(result);
    setRevealed(0);

    if (device.online) {
      if (accepted) setServerRedeemed((s) => ({ ...s, [ticket.id]: device.id }));
      setServerNonces((n) => [...n, nonce]);
      patchDevice(device.id, (d) => ({ seq: d.seq + 1, knownRedeemed: accepted ? [...d.knownRedeemed, ticket.id] : d.knownRedeemed }));
      push(`${device.label} [online] ${ticket.id} → ${accepted ? "GRANTED · redemption + audit committed" : `DENIED · ${reason}`} (nonce ${nonce})`, accepted ? "ok" : "bad");
    } else {
      const entry: JournalEntry = { nonce, ticketId: ticket.id, accepted, reason };
      patchDevice(device.id, (d) => ({
        seq: d.seq + 1,
        journal: [...d.journal, entry],
        localAccepted: accepted ? [...d.localAccepted, ticket.id] : d.localAccepted,
      }));
      push(`${device.label} [offline] ${ticket.id} → ${accepted ? "GRANTED locally" : `DENIED · ${reason}`}, appended to scan journal (nonce ${nonce})`, accepted ? "warn" : "bad");
    }
  };

  const syncBatch = (d: Device, batch: JournalEntry[], label: string) => {
    if (d.revoked) {
      push(`${d.label}: ${label} rejected, device is REVOKED and cannot synchronize.`, "bad");
      return;
    }
    let fresh = 0;
    let dupes = 0;
    const newConflicts: string[] = [];
    const nonces = new Set(serverNonces);
    const redeemed = { ...serverRedeemed };
    batch.forEach((e) => {
      if (nonces.has(e.nonce)) {
        dupes++;
        return;
      }
      nonces.add(e.nonce);
      fresh++;
      if (e.accepted) {
        if (redeemed[e.ticketId] && redeemed[e.ticketId] !== d.id) {
          newConflicts.push(`${e.ticketId}: accepted offline by ${d.id} but already redeemed by ${redeemed[e.ticketId]}`);
        } else redeemed[e.ticketId] = d.id;
      }
    });
    setServerNonces([...nonces]);
    setServerRedeemed(redeemed);
    if (newConflicts.length) setConflicts((c) => [...newConflicts, ...c]);
    patchDevice(d.id, () => ({ journal: [], lastBatch: batch, knownRedeemed: Object.keys(redeemed), localAccepted: [] }));
    push(`${d.label}: ${label}: ${fresh} new, ${dupes} duplicate nonce(s) ignored, ${newConflicts.length} conflict(s).`, newConflicts.length ? "warn" : "info");
    newConflicts.forEach((c) => push(`CONFLICT → ${c}. Routed to the operational conflict procedure.`, "bad"));
  };

  const toggleOnline = (d: Device) => {
    if (d.online) {
      patchDevice(d.id, () => ({ online: false, knownRedeemed: Object.keys(serverRedeemed) }));
      push(`${d.label} lost connectivity: validating locally against provisioned data.`, "warn");
    } else {
      const next = { ...d, online: true };
      patchDevice(d.id, () => ({ online: true }));
      push(`${d.label} connectivity restored: uploading signed scan batch…`, "info");
      syncBatch(next, d.journal, "sync batch");
    }
  };

  const toggleRevoked = (d: Device) => {
    patchDevice(d.id, (x) => ({ revoked: !x.revoked }));
    push(`${d.label} ${d.revoked ? "reactivated" : "REVOKED remotely by administrator"}.`, d.revoked ? "info" : "bad");
  };

  const resetAll = () => {
    setDevices(initialDevices());
    setServerRedeemed(initialServerRedeemed);
    setServerNonces([]);
    setConflicts([]);
    setChecks(null);
    setLog([{ id: logId.current++, text: "Simulation reset.", tone: "info" }]);
  };

  const done = checks && revealed >= checks.length;
  const granted = done && checks!.every((c) => c.ok);
  const denyReason = checks?.find((c) => !c.ok)?.reason;

  const redeemedCount = Object.keys(serverRedeemed).length;
  const pendingTotal = useMemo(() => devices.reduce((n, d) => n + d.journal.length, 0), [devices]);

  return (
    <div className="space-y-4">
      {/* Devices */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Scanner device">
        {devices.map((d) => {
          const on = d.id === deviceId;
          return (
            <div
              key={d.id}
              className={clsx(
                "panel p-3 transition",
                on && "border-brand-400/70 shadow-glow",
                d.revoked && "opacity-70",
              )}
            >
              <button type="button" role="radio" aria-checked={on} onClick={() => setDeviceId(d.id)} className="flex w-full items-center gap-3 text-left">
                <span className={clsx("grid h-9 w-9 place-items-center rounded-lg", d.revoked ? "bg-rose-500/15 text-rose-300" : d.online ? "bg-lime-400/15 text-lime-300" : "bg-amber-400/15 text-amber-300")}>
                  <Icon name={d.revoked ? "x-circle" : d.online ? "smartphone" : "wifi-off"} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">{d.label}</span>
                  <span className="block text-xs text-slate-400">
                    {d.gate} · {d.revoked ? "REVOKED" : d.online ? "ACTIVE" : "OFFLINE"}
                  </span>
                </span>
                {d.journal.length > 0 && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-200" title="Unsynced journal entries">
                    {d.journal.length}
                  </span>
                )}
              </button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleOnline(d)}
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
                    d.online ? "border-amber-400/30 text-amber-200 hover:bg-amber-400/10" : "border-lime-400/30 text-lime-200 hover:bg-lime-400/10",
                  )}
                >
                  {d.online ? <WifiOff className="h-3 w-3" aria-hidden="true" /> : <Wifi className="h-3 w-3" aria-hidden="true" />}
                  {d.online ? "Go offline" : "Reconnect & sync"}
                </button>
                {d.online && d.lastBatch.length > 0 && (
                  <button
                    type="button"
                    onClick={() => syncBatch(d, d.lastBatch, "retransmitted batch")}
                    className="inline-flex items-center gap-1 rounded-md border border-canvas-border px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                  >
                    <Upload className="h-3 w-3" aria-hidden="true" /> Retransmit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleRevoked(d)}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-400/30 px-2 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-400/10"
                >
                  <Ban className="h-3 w-3" aria-hidden="true" /> {d.revoked ? "Reactivate" : "Revoke"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Ticket picker */}
        <div className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Present a ticket</div>
            <div className="text-[11px] text-slate-500">at {device.label}</div>
          </div>
          <ul className="space-y-1.5" role="radiogroup" aria-label="Ticket">
            {simTickets.map((t) => {
              const on = t.id === ticketId;
              const used = serverRedeemed[t.id];
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setTicketId(t.id)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                      on ? "border-brand-400/60 bg-brand-500/10" : "border-canvas-border hover:border-slate-600",
                    )}
                  >
                    <Icon name="ticket" className={clsx("h-4 w-4 shrink-0", on ? "text-brand-300" : "text-slate-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs text-slate-100">{t.id}</span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {t.match === simMatch ? t.zone : t.match} · {t.gate}
                      </span>
                    </span>
                    <span
                      className={clsx(
                        "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold",
                        !t.signatureValid
                          ? "bg-rose-500/20 text-rose-200"
                          : used
                            ? "bg-violet-500/20 text-violet-200"
                            : t.status === "VALID"
                              ? "bg-lime-500/15 text-lime-200"
                              : "bg-rose-500/15 text-rose-200",
                      )}
                    >
                      {!t.signatureValid ? "FORGED" : used ? "REDEEMED" : t.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={scan}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-canvas shadow-glow transition hover:bg-brand-300"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" /> Scan with {device.label} ({device.online ? "online" : "offline"})
          </button>
        </div>

        {/* Pipeline + verdict */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="mb-3 text-sm font-semibold text-white">Validation pipeline</div>
            {checks ? (
              <ol className="space-y-2">
                {checks.map((c, i) => (
                  <motion.li
                    key={`${c.label}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: i < revealed ? 1 : 0.25, x: 0 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={clsx(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                        i >= revealed ? "bg-slate-800 text-slate-500" : c.ok ? "bg-lime-400/20 text-lime-300" : "bg-rose-500/20 text-rose-300",
                      )}
                    >
                      <Icon name={i >= revealed ? "clock" : c.ok ? "check-circle" : "x-circle"} className="h-3.5 w-3.5" />
                    </span>
                    <span className={clsx(i < revealed ? "text-slate-200" : "text-slate-500")}>{c.label}</span>
                    {i < revealed && !c.ok && <span className="ml-auto text-xs text-rose-300">{c.reason}</span>}
                  </motion.li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">Choose a device and a ticket, then scan.</p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {done && (
              <motion.div
                key={`${granted}-${log[0]?.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                role="status"
                className={clsx(
                  "flex items-center gap-4 rounded-2xl border p-5",
                  granted ? "border-lime-400/50 bg-lime-400/10" : "border-rose-400/50 bg-rose-500/10",
                )}
              >
                <Icon name={granted ? "shield-check" : "shield-alert"} className={clsx("h-10 w-10", granted ? "text-lime-300" : "text-rose-300")} />
                <div>
                  <div className={clsx("text-xl font-bold tracking-wide", granted ? "text-lime-200" : "text-rose-200")}>
                    {granted ? "ACCESS GRANTED" : "ACCESS DENIED"}
                  </div>
                  <div className="text-sm text-slate-300">
                    {granted ? (device.online ? "Redeemed atomically on the server." : "Accepted locally, pending synchronization.") : denyReason}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="panel p-3">
              <div className="text-[11px] text-slate-500">Server redemptions</div>
              <div className="text-xl font-semibold text-violet-200">{redeemedCount}</div>
            </div>
            <div className="panel p-3">
              <div className="text-[11px] text-slate-500">Unsynced scans</div>
              <div className="text-xl font-semibold text-amber-200">{pendingTotal}</div>
            </div>
            <div className={clsx("panel p-3", conflicts.length > 0 && "border-rose-400/50")}>
              <div className="text-[11px] text-slate-500">Conflicts</div>
              <div className={clsx("text-xl font-semibold", conflicts.length ? "text-rose-300" : "text-slate-300")}>{conflicts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="panel">
        <div className="flex items-center justify-between border-b border-canvas-border px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" /> Audit &amp; synchronization log
          </div>
          <button type="button" onClick={resetAll} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset simulation
          </button>
        </div>
        <ul className="max-h-56 space-y-1 overflow-y-auto px-4 py-3 font-mono text-[11.5px]" aria-live="polite">
          <AnimatePresence initial={false}>
            {log.map((l) => (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={clsx(
                  l.tone === "ok" && "text-lime-300",
                  l.tone === "bad" && "text-rose-300",
                  l.tone === "warn" && "text-amber-200",
                  l.tone === "info" && "text-slate-400",
                )}
              >
                {l.text}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <details className="panel group px-4 py-3 text-sm text-slate-400">
        <summary className="cursor-pointer select-none font-semibold text-slate-200">Try these acceptance scenarios</summary>
        <ul className="mt-3 space-y-2">
          <li><strong className="text-slate-200">AT-001 Duplicate online scan:</strong> scan TKT-…A12 on A1, then again on A2. The second scan is rejected.</li>
          <li><strong className="text-slate-200">AT-004 Refund:</strong> scan TKT-…D90. The gate rejects the refunded ticket.</li>
          <li><strong className="text-slate-200">AT-006 Offline:</strong> take A1 offline, scan A12, then reconnect. The journal synchronizes.</li>
          <li><strong className="text-slate-200">Offline conflict:</strong> take A1 and A2 offline, scan A12 on both, then reconnect both. The server detects the conflict.</li>
          <li><strong className="text-slate-200">Scan idempotency:</strong> after a sync, press Retransmit. Every nonce is deduplicated.</li>
          <li><strong className="text-slate-200">AT-007 Revoked device:</strong> revoke a device. It can neither scan nor synchronize.</li>
        </ul>
      </details>
    </div>
  );
}
