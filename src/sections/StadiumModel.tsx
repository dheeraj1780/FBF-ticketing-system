import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Badge, Callout, Card, PageHeader, Section, Tabs } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { accessConcepts, admissionModes, mockStadium, ticketAudiences, venueHierarchy, type MockZone } from "@/data/stadium";

const zoneShapes: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {
  nord: { x: 170, y: 40, w: 260, h: 72, label: "Tribune Nord" },
  sud: { x: 170, y: 308, w: 260, h: 72, label: "Tribune Sud" },
  est: { x: 438, y: 120, w: 76, h: 180, label: "Est" },
  ouest: { x: 86, y: 120, w: 76, h: 112, label: "Ouest" },
  vip: { x: 86, y: 238, w: 76, h: 30, label: "VIP" },
  press: { x: 86, y: 272, w: 76, h: 28, label: "Press" },
};

const gatePositions: Record<string, { x: number; y: number }> = {
  "Gate A": { x: 230, y: 16 },
  "Gate B": { x: 370, y: 16 },
  "Gate C": { x: 230, y: 404 },
  "Gate D": { x: 370, y: 404 },
  "Gate E": { x: 548, y: 210 },
  "Gate F": { x: 50, y: 176 },
  "Gate V": { x: 50, y: 270 },
};

type Metric = "sold" | "entered";

function SeatBlock() {
  // Illustrative seat states within one block
  const rows = 6;
  const cols = 14;
  const initial = useMemo(() => {
    const s: string[] = [];
    let h = 7;
    for (let i = 0; i < rows * cols; i++) {
      h = (h * 9301 + 49297) % 233280;
      const r = h / 233280;
      s.push(r < 0.5 ? "sold" : r < 0.62 ? "redeemed" : r < 0.7 ? "held" : "available");
    }
    return s;
  }, []);
  const [seats, setSeats] = useState(initial);
  const [msg, setMsg] = useState("Click an available seat to place a temporary hold.");

  const color: Record<string, string> = {
    available: "fill-slate-700 hover:fill-brand-400",
    held: "fill-amber-400",
    sold: "fill-brand-600",
    redeemed: "fill-violet-400",
  };

  const click = (i: number) => {
    const row = String.fromCharCode(65 + Math.floor(i / cols));
    const n = (i % cols) + 1;
    if (seats[i] === "available") {
      setSeats((s) => s.map((v, j) => (j === i ? "held" : v)));
      setMsg(`Seat ${row}${n}: SELECT … FOR UPDATE → available → hold created → commit. Seat is now HELD.`);
    } else if (seats[i] === "held") {
      setSeats((s) => s.map((v, j) => (j === i ? "available" : v)));
      setMsg(`Seat ${row}${n}: hold expired → back to AVAILABLE.`);
    } else {
      setMsg(`Seat ${row}${n} is ${seats[i].toUpperCase()}. Only one reservation may win.`);
    }
  };

  const counts = seats.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});

  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${cols * 22 + 30} ${rows * 22 + 30}`} className="w-full min-w-[340px]" role="group" aria-label="Seat block N-04 (illustrative)">
          <rect x={30} y={rows * 22 + 12} width={cols * 22 - 4} height={6} rx={3} fill="#1c2a3d" />
          <text x={30 + (cols * 22) / 2} y={rows * 22 + 28} textAnchor="middle" fontSize={8} fill="#64748b">
            PITCH SIDE
          </text>
          {seats.map((s, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            return (
              <g key={i}>
                {c === 0 && (
                  <text x={12} y={r * 22 + 15} fontSize={9} fill="#64748b" textAnchor="middle">
                    {String.fromCharCode(65 + r)}
                  </text>
                )}
                <rect
                  x={30 + c * 22}
                  y={r * 22 + 4}
                  width={18}
                  height={16}
                  rx={4}
                  className={clsx("cursor-pointer transition-colors", color[s])}
                  role="button"
                  tabIndex={0}
                  aria-label={`Seat ${String.fromCharCode(65 + r)}${c + 1}, ${s}`}
                  onClick={() => click(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      click(i);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
        {[
          ["available", "bg-slate-700", "Available"],
          ["held", "bg-amber-400", "Held"],
          ["sold", "bg-brand-600", "Sold / issued"],
          ["redeemed", "bg-violet-400", "Redeemed"],
        ].map(([k, c, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={clsx("h-2.5 w-2.5 rounded-sm", c)} />
            {l} <span className="tabular-nums text-slate-500">({counts[k] ?? 0})</span>
          </span>
        ))}
      </div>
      <p className="mt-3 rounded-lg border border-canvas-border bg-white/[0.02] p-3 font-mono text-xs text-slate-300" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}

export default function StadiumModel() {
  const [zoneId, setZoneId] = useState<string>("nord");
  const [gate, setGate] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("sold");
  const [level, setLevel] = useState(0);

  const zone = mockStadium.zones.find((z) => z.id === zoneId)!;
  const totals = mockStadium.zones.reduce(
    (a, z) => ({ capacity: a.capacity + z.capacity, sold: a.sold + z.sold, entered: a.entered + z.entered }),
    { capacity: 0, sold: 0, entered: 0 },
  );

  const ratio = (z: MockZone) => (metric === "sold" ? z.sold / z.capacity : z.entered / z.capacity);
  const gateZones = gate ? mockStadium.zones.filter((z) => z.gates.includes(gate)).map((z) => z.id) : null;

  return (
    <div>
      <PageHeader
        kicker="Ticketing core"
        title="Stadium Model"
        icon="stadium"
        blueprint="§5.2 B · FR-003 · §21"
        description="The venue model supports multiple stadiums, general admission and assigned seating, and restricted areas. Gates map to zones, and the mapping decides which tickets each scanner accepts."
      />

      <Section title="Venue hierarchy" description="Click a level to see its role.">
        <div className="flex flex-wrap items-center gap-2">
          {venueHierarchy.map((h, i) => (
            <div key={h.level} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLevel(i)}
                aria-pressed={level === i}
                className={clsx(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                  level === i ? "border-brand-400 bg-brand-500/15 text-white" : "border-canvas-border text-slate-300 hover:border-slate-500",
                )}
              >
                <Icon name={h.icon} className="h-4 w-4 text-brand-300" />
                {h.level}
              </button>
              {i < venueHierarchy.length - 1 && <ChevronRight className="h-4 w-4 text-slate-600" aria-hidden="true" />}
            </div>
          ))}
        </div>
        <motion.p key={level} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-slate-400">
          {venueHierarchy[level].description}
        </motion.p>
      </Section>

      <Section
        title="Interactive stadium map"
        description={`${mockStadium.name}: illustrative configuration with mock numbers. Click a zone for details, or a gate to see the zones it serves (gate_zones).`}
        actions={
          <Tabs
            label="Map metric"
            value={metric}
            onChange={(m) => setMetric(m as Metric)}
            tabs={[
              { id: "sold", label: "Sold %" },
              { id: "entered", label: "Occupancy %" },
            ]}
          />
        }
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="panel p-4">
            <svg viewBox="0 0 600 420" className="w-full" role="group" aria-label="Stadium map">
              <defs>
                <linearGradient id="pitch" x1="0" x2="1">
                  <stop offset="0" stopColor="#14532d" />
                  <stop offset="1" stopColor="#166534" />
                </linearGradient>
              </defs>
              <rect x={30} y={30} width={540} height={360} rx={120} fill="#0b111c" stroke="#1c2a3d" strokeWidth={2} />
              {/* Pitch */}
              <rect x={190} y={130} width={220} height={160} rx={6} fill="url(#pitch)" stroke="#22c55e" strokeOpacity={0.4} />
              <line x1={300} x2={300} y1={130} y2={290} stroke="#bbf7d0" strokeOpacity={0.35} />
              <circle cx={300} cy={210} r={24} fill="none" stroke="#bbf7d0" strokeOpacity={0.35} />
              <rect x={190} y={175} width={30} height={70} fill="none" stroke="#bbf7d0" strokeOpacity={0.35} />
              <rect x={380} y={175} width={30} height={70} fill="none" stroke="#bbf7d0" strokeOpacity={0.35} />

              {mockStadium.zones.map((z) => {
                const s = zoneShapes[z.id];
                const r = ratio(z);
                const selected = z.id === zoneId;
                const lit = gateZones ? gateZones.includes(z.id) : true;
                return (
                  <g
                    key={z.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label={`${z.name}, ${Math.round(r * 100)}% ${metric === "sold" ? "sold" : "occupied"}`}
                    onClick={() => setZoneId(z.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setZoneId(z.id);
                      }
                    }}
                    className="cursor-pointer outline-none"
                    style={{ opacity: lit ? 1 : 0.25, transition: "opacity 250ms" }}
                  >
                    <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={10} fill="#0f1b2b" stroke={selected ? "#2ad6dc" : "#2a3d55"} strokeWidth={selected ? 2.5 : 1.2} />
                    <motion.rect
                      x={s.x}
                      y={s.y}
                      height={s.h}
                      rx={10}
                      fill={z.type === "VVIP" || z.type === "Press" ? "#a78bfa" : "#2ad6dc"}
                      initial={{ width: 0, opacity: 0.35 }}
                      animate={{ width: s.w * r, opacity: 0.35 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <text x={s.x + s.w / 2} y={s.y + s.h / 2 - (s.h > 40 ? 6 : 0)} textAnchor="middle" dominantBaseline="central" fontSize={s.h > 40 ? 12 : 9.5} fontWeight={700} fill="#e2e8f0">
                      {s.label}
                    </text>
                    {s.h > 40 && (
                      <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 10} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fill="#98f8f6">
                        {Math.round(r * 100)}%
                      </text>
                    )}
                  </g>
                );
              })}

              {Object.entries(gatePositions).map(([g, p]) => {
                const on = gate === g;
                return (
                  <g
                    key={g}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={`${g}: show served zones`}
                    onClick={() => setGate(on ? null : g)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setGate(on ? null : g);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <circle cx={p.x} cy={p.y} r={14} fill={on ? "#f5b942" : "#101a29"} stroke="#f5b942" strokeWidth={1.5} />
                    <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800} fill={on ? "#0b1220" : "#fde68a"}>
                      {g.replace("Gate ", "")}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>{gate ? `${gate} serves ${gateZones!.length} zone(s)` : "Tip: click a gate marker (A–F, V)."}</span>
              <span className="tabular-nums">
                Total: {totals.sold.toLocaleString()} sold · {totals.entered.toLocaleString()} entered · {totals.capacity.toLocaleString()} capacity
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={zone.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="panel p-5" aria-live="polite">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                <Badge tone={zone.type === "VVIP" || zone.type === "Press" ? "violet" : zone.type === "General admission" ? "amber" : "brand"}>{zone.type}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Capacity", zone.capacity],
                  ["Sold", zone.sold],
                  ["Entered", zone.entered],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg border border-canvas-border p-2.5">
                    <div className="text-[11px] text-slate-500">{l}</div>
                    <div className="text-lg font-semibold tabular-nums text-white">{(v as number).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {(["sold", "entered"] as const).map((k) => (
                <div key={k} className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>{k === "sold" ? "Sold vs capacity" : "Occupancy (entered vs capacity)"}</span>
                    <span className="tabular-nums">{Math.round((zone[k] / zone.capacity) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      className={clsx("h-full rounded-full", k === "sold" ? "bg-brand-400" : "bg-lime-400")}
                      initial={{ width: 0 }}
                      animate={{ width: `${(zone[k] / zone.capacity) * 100}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Admission</dt>
                  <dd className="text-slate-200">{zone.type === "General admission" ? "General admission" : "Assigned seating"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Blocks</dt>
                  <dd className="text-slate-200">{zone.blocks || "n/a (GA)"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Price category</dt>
                  <dd className="text-slate-200">{zone.price}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Gates (gate_zones)</dt>
                  <dd className="flex flex-wrap justify-end gap-1">
                    {zone.gates.map((g) => (
                      <button key={g} type="button" onClick={() => setGate(g)} className="rounded border border-amber-400/30 px-1.5 text-xs text-amber-200 hover:bg-amber-400/10">
                        {g}
                      </button>
                    ))}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-500">Scanners assigned to these gates accept only tickets for this zone. Any other ticket is rejected as “wrong zone/gate” (FR-007).</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Section>

      <Section title="Assigned seating: one block" description="Illustrative block N-04. Seat inventory is a high-risk concurrency area, so holds are created under a PostgreSQL row lock.">
        <Card>
          <SeatBlock />
        </Card>
      </Section>

      <div className="mb-10 grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="kicker mb-3">Admission modes</div>
          <div className="space-y-3">
            {admissionModes.map((m) => (
              <div key={m.mode}>
                <div className="font-semibold text-white">{m.mode}</div>
                <p className="text-sm text-slate-400">{m.description}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="kicker mb-3">Access concepts</div>
          <div className="space-y-3">
            {accessConcepts.map((c) => (
              <div key={c.label} className="flex gap-3">
                <Icon name={c.icon} className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div>
                  <div className="text-sm font-semibold text-white">{c.label}</div>
                  <p className="text-sm text-slate-400">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="kicker mb-3">Special ticket audiences</div>
          <div className="flex flex-wrap gap-1.5">
            {ticketAudiences.map((a) => (
              <Badge key={a} tone="violet">
                {a}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">VIP, VVIP, protocol, partner, press and staff tickets are first-class categories, each tied to restricted zones.</p>
        </Card>
      </div>

      <Callout tone="brand" icon="map" title="Multi-stadium by design">
        The platform must be usable across different stadiums and competitions. Venue configuration is data (stadiums → zones → blocks →
        rows → seats, plus gates and gate_zones), not code.
      </Callout>
    </div>
  );
}
