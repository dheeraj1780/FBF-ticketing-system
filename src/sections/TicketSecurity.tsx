import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ScanLine } from "lucide-react";
import clsx from "clsx";
import { BulletList, Callout, Card, PageHeader, Section, Tabs } from "@/components/ui";
import { NodeGraph } from "@/components/NodeGraph";
import { SequenceDiagram } from "@/components/SequenceDiagram";
import { Icon } from "@/components/Icon";
import { PseudoQr } from "@/components/PseudoQr";
import { fakeToken } from "@/lib/prng";
import { credentialGraph, credentialModes, securitySources, transferRules, transferSequence } from "@/data/ticketSecurity";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

const ROTATE_S = 10;
const TICKET_ID = "TKT-8F21-A12";

function CredentialDemo() {
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<"static" | "dynamic">("dynamic");
  const [epoch, setEpoch] = useState(0);
  const [remaining, setRemaining] = useState(ROTATE_S);
  const [screenshot, setScreenshot] = useState<{ token: string; epoch: number } | null>(null);
  const [scanResult, setScanResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    if (mode !== "dynamic") return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setEpoch((e) => e + 1);
          return ROTATE_S;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [mode]);

  const token = mode === "static" ? fakeToken(`${TICKET_ID}-static`) : fakeToken(`${TICKET_ID}-${epoch}`);

  const reset = (m: "static" | "dynamic") => {
    setMode(m);
    setEpoch(0);
    setRemaining(ROTATE_S);
    setScreenshot(null);
    setScanResult(null);
    setRedeemed(false);
  };

  const scan = (presented: { token: string; epoch: number }, source: "app" | "screenshot") => {
    if (mode === "dynamic" && presented.epoch !== epoch) {
      setScanResult({ ok: false, msg: `Rejected: display token expired (issued ${epoch - presented.epoch} rotation(s) ago). Copied screenshots stop working.` });
      return;
    }
    if (redeemed) {
      setScanResult({ ok: false, msg: "Rejected: already redeemed. The signature is valid, but server-side state says this ticket was used." });
      return;
    }
    setRedeemed(true);
    setScanResult({
      ok: true,
      msg:
        source === "screenshot" && mode === "static"
          ? "Accepted. A static credential can't tell a screenshot from the original, so only the single-use redemption state protects it."
          : "Accepted: signature verified, event/zone valid, not yet redeemed → REDEEMED.",
    });
  };

  const pct = mode === "dynamic" ? remaining / ROTATE_S : 1;

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      {/* Phone */}
      <div className="mx-auto w-[260px] rounded-[2.2rem] border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-2.5 shadow-2xl">
        <div className="rounded-[1.8rem] bg-canvas px-4 pb-5 pt-3">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-slate-800" />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">FGF Tickets</span>
            <span>{mode === "dynamic" ? "Mode B · dynamic" : "Mode A · static"}</span>
          </div>
          <div className="mt-3 rounded-2xl border border-canvas-border bg-canvas-panel p-3">
            <div className="text-[11px] text-slate-400">Guinea vs Team B · Qualifier</div>
            <div className="text-sm font-semibold text-white">Tribune Nord · Gate A</div>
            <div className="relative mt-3 grid place-items-center">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={token}
                  initial={reduced ? false : { opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.35 }}
                >
                  <PseudoQr value={token} size={170} dim={redeemed} />
                </motion.div>
              </AnimatePresence>
              {redeemed && <div className="absolute rounded-lg bg-violet-500/90 px-3 py-1 text-xs font-bold text-white">REDEEMED</div>}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
              <motion.div className="h-full bg-brand-400" animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.3 }} />
            </div>
            <div className="mt-1.5 text-center text-[10.5px] text-slate-500">
              {mode === "dynamic" ? `Refreshes in ${remaining}s` : "Static signed credential"}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => scan({ token, epoch }, "app")}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-400 px-2 py-2 text-xs font-semibold text-canvas hover:bg-brand-300"
            >
              <ScanLine className="h-3.5 w-3.5" aria-hidden="true" /> Scan at gate
            </button>
            <button
              type="button"
              onClick={() => {
                setScreenshot({ token, epoch });
                setScanResult(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-canvas-border px-2 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" /> Screenshot
            </button>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="min-w-0 space-y-4">
        <Tabs
          label="Credential mode"
          value={mode}
          onChange={(m) => reset(m as "static" | "dynamic")}
          tabs={[
            { id: "dynamic", label: "Mode B · Dynamic", icon: "refresh" },
            { id: "static", label: "Mode A · Static", icon: "qr" },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="panel p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ticket ID · stable</div>
            <div className="mt-1 break-all font-mono text-sm text-white">{TICKET_ID}</div>
            <p className="mt-2 text-xs text-slate-400">The stable ticket identity should not be treated as the rotating secret.</p>
          </div>
          <div className="panel p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {mode === "dynamic" ? "Display token · short-lived" : "Signed credential"}
            </div>
            <motion.div key={token} initial={{ color: "#2ad6dc" }} animate={{ color: "#ffffff" }} transition={{ duration: 1 }} className="mt-1 font-mono text-sm">
              {token}
            </motion.div>
            <p className="mt-2 text-xs text-slate-400">
              {mode === "dynamic" ? "Short-lived signed display token changes → QR changes periodically." : "Signed once. Suited to printable tickets and operational fallback."}
            </p>
          </div>
        </div>

        {screenshot && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="panel flex flex-wrap items-center gap-4 p-4">
            <PseudoQr value={screenshot.token} size={64} />
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-semibold text-white">Screenshot captured</div>
              <div className="font-mono text-xs text-slate-400">{screenshot.token}</div>
              {mode === "dynamic" && <div className="text-xs text-amber-300">Wait for a rotation, then try scanning the screenshot.</div>}
            </div>
            <button
              type="button"
              onClick={() => scan(screenshot, "screenshot")}
              className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-400/20"
            >
              Scan screenshot
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              role="status"
              className={clsx(
                "flex items-start gap-3 rounded-xl border p-4 text-sm",
                scanResult.ok ? "border-lime-400/40 bg-lime-400/10 text-lime-100" : "border-rose-400/40 bg-rose-400/10 text-rose-100",
              )}
            >
              <Icon name={scanResult.ok ? "check-circle" : "x-circle"} className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{scanResult.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => reset(mode)} className="text-xs font-semibold text-slate-400 hover:text-white">
            Reset demo
          </button>
          <span className="text-[11px] text-slate-600">Illustrative simulation. The pattern shown is not a real, scannable credential.</span>
        </div>

        <div className="panel overflow-x-auto p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Canonical claims (illustrative)</div>
          <pre className="font-mono text-[12px] leading-relaxed text-slate-300">{`{
  "ticket_id": "${TICKET_ID}",
  "event": "match:guinea-vs-team-b",
  "category": "Tribune",
  "zone": "Tribune Nord",
  "gate": "Gate A",${mode === "dynamic" ? `\n  "display_token": "${token}",\n  "valid_for_s": ${ROTATE_S},` : ""}
  "sig": "ed25519:…"      // verified with the public key only
}
// no name, phone or other personal data in the QR (FR-006)`}</pre>
        </div>
      </div>
    </div>
  );
}

export default function TicketSecurity() {
  return (
    <div>
      <PageHeader
        kicker="Ticketing core"
        title="Ticket Security"
        icon="qr"
        blueprint="§11, §28–29"
        description="The QR code is not the security system. It is a credential carrier. Security comes from signatures, server-side state, bindings, device identity, transfer controls and audit."
      />

      <Section title="Where security actually comes from">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-9">
          {securitySources.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="panel flex flex-col gap-2 p-3"
            >
              <span className="font-mono text-[11px] font-bold text-brand-400">{i + 1}</span>
              <span className="text-xs font-medium leading-snug text-slate-200">{s}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Recommended credential architecture" description="Signing happens server-side with an Ed25519 private key. Verification needs only the public key, so the scanner never requires access to the signing key.">
        <NodeGraph title="Credential architecture" graph={credentialGraph} rowHeight={100} minColWidth={175} playable />
      </Section>

      <Section title="Dynamic ticket strategy" description="Try both modes. Take a screenshot of the ticket, wait for the dynamic token to rotate, then scan the screenshot.">
        <CredentialDemo />
      </Section>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {credentialModes.map((m) => (
          <Card key={m.id}>
            <div className="kicker">{m.tagline}</div>
            <h3 className="mt-1 font-semibold text-white">{m.title}</h3>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{m.id === "static" ? "Useful for" : "Preferred for"}</div>
            <BulletList items={m.usefulFor} className="mt-2" tone={m.id === "static" ? "slate" : "brand"} />
          </Card>
        ))}
      </div>

      <Section title="Ticket transfer" description="§29 / FR-013 — transfer must occur through the platform. The ticket row is locked, the old credential revoked and a new one issued.">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <SequenceDiagram data={transferSequence} />
          <Card className="xl:self-start">
            <div className="kicker mb-3">Transfer rules</div>
            <BulletList items={transferRules} tone="violet" />
          </Card>
        </div>
      </Section>

      <Callout tone="violet" icon="shuffle" title="AT-005 — Transfer">
        After a transfer the old credential is invalid and the new credential is valid. A copy of the old QR made outside the platform
        does not transfer ownership.
      </Callout>
    </div>
  );
}
