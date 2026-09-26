import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, Pause, Play, RotateCcw } from "lucide-react";
import type { ArchitectureGraph, GraphNode } from "@/types";
import { Icon } from "./Icon";
import { kindTone, toneHex, type Tone } from "@/lib/tones";
import { routeEdge } from "@/lib/geometry";
import { useElementWidth, usePrefersReducedMotion } from "@/lib/useElementWidth";

interface NodeGraphProps {
  graph: ArchitectureGraph;
  title: string;
  rowHeight?: number;
  minColWidth?: number;
  nodeHeight?: number;
  maxNodeWidth?: number;
  /** Enables step-by-step playback. Defaults to node order when true. */
  playable?: boolean;
  sequence?: string[];
  showDetails?: boolean;
  defaultSelected?: string;
  /** Tones nodes by group instead of by kind */
  toneByGroup?: boolean;
  /** Custom tone per node id */
  nodeTone?: (node: GraphNode) => Tone;
  footer?: ReactNode;
  /** Named paths through the graph that can be animated */
  scenarios?: { id: string; label: string; description?: string; sequence: string[] }[];
}

const groupStroke: Record<string, string> = {
  brand: "rgba(42,214,220,0.28)",
  violet: "rgba(167,139,250,0.28)",
  amber: "rgba(245,185,66,0.28)",
  rose: "rgba(240,87,122,0.28)",
  slate: "rgba(148,163,184,0.22)",
};

const groupFill: Record<string, string> = {
  brand: "rgba(42,214,220,0.035)",
  violet: "rgba(167,139,250,0.04)",
  amber: "rgba(245,185,66,0.035)",
  rose: "rgba(240,87,122,0.035)",
  slate: "rgba(148,163,184,0.03)",
};

export function NodeGraph({
  graph,
  title,
  rowHeight = 92,
  minColWidth = 190,
  nodeHeight = 58,
  maxNodeWidth = 220,
  playable = false,
  sequence,
  showDetails = true,
  defaultSelected,
  toneByGroup = false,
  nodeTone,
  footer,
  scenarios,
}: NodeGraphProps) {
  const [wrapRef, wrapWidth] = useElementWidth<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const markerId = useId().replace(/:/g, "");
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelected ?? null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);

  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const scenario = scenarios?.find((sc) => sc.id === scenarioId);
  const order = useMemo(
    () => scenario?.sequence ?? sequence ?? graph.nodes.map((n) => n.id),
    [scenario, sequence, graph.nodes],
  );
  const canPlay = playable || !!scenarios?.length;

  const hasGroups = (graph.groups?.length ?? 0) > 0;
  const topPad = hasGroups ? 34 : 10;
  const width = Math.max(wrapWidth, graph.columns * minColWidth);
  const colW = width / graph.columns;
  const maxRow = Math.max(...graph.nodes.map((n) => n.row), ...(graph.groups ?? []).map((g) => g.rowEnd));
  const height = (maxRow + 1) * rowHeight + topPad + 10;
  const nodeW = Math.min(colW - 28, maxNodeWidth);

  const nodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);

  const center = (n: GraphNode) => ({
    cx: (n.col + 0.5) * colW,
    cy: topPad + n.row * rowHeight + rowHeight / 2,
  });

  // Playback
  useEffect(() => {
    if (!playing) return;
    if (step >= order.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), step < 0 ? 150 : 1050);
    return () => window.clearTimeout(t);
  }, [playing, step, order.length]);

  useEffect(() => {
    if (step >= 0 && order[step]) setSelectedId(order[step]);
  }, [step, order]);

  const visited = useMemo(() => new Set(step >= 0 ? order.slice(0, step + 1) : []), [order, step]);
  const playEdges = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < step; i++) {
      s.add(`${order[i]}->${order[i + 1]}`);
      s.add(`${order[i + 1]}->${order[i]}`);
    }
    return s;
  }, [order, step]);
  const inPlayback = step >= 0;

  const neighbours = useMemo(() => {
    if (!selectedId) return null;
    const s = new Set<string>([selectedId]);
    graph.edges.forEach((e) => {
      if (e.from === selectedId) s.add(e.to);
      if (e.to === selectedId) s.add(e.from);
    });
    return s;
  }, [selectedId, graph.edges]);

  const toneFor = (n: GraphNode): Tone => {
    if (nodeTone) return nodeTone(n);
    if (toneByGroup && n.group) {
      const g = graph.groups?.find((gg) => gg.id === n.group);
      if (g?.tone) return g.tone as Tone;
    }
    return kindTone[n.kind ?? "default"];
  };

  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const incoming = selected ? graph.edges.filter((e) => e.to === selected.id).map((e) => nodeById.get(e.from)!) : [];
  const outgoing = selected ? graph.edges.filter((e) => e.from === selected.id).map((e) => nodeById.get(e.to)!) : [];

  const startPlayback = () => {
    if (step >= order.length - 1) setStep(-1);
    setPlaying(true);
  };

  const reset = () => {
    setPlaying(false);
    setStep(-1);
    setScenarioId(null);
    setSelectedId(defaultSelected ?? null);
  };

  return (
    <div
      className={clsx(
        "grid gap-4",
        showDetails &&
          (graph.columns * minColWidth > 760 ? "2xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-[minmax(0,1fr)_320px]"),
      )}
    >
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
            Click any component for details
          </div>
          {scenarios && scenarios.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500">Trace:</span>
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  aria-pressed={sc.id === scenarioId}
                  onClick={() => {
                    setScenarioId(sc.id);
                    setStep(-1);
                    setPlaying(true);
                  }}
                  className={clsx(
                    "rounded-lg border px-2.5 py-1 text-xs font-semibold transition",
                    sc.id === scenarioId
                      ? "border-brand-400/50 bg-brand-500/15 text-brand-100"
                      : "border-canvas-border text-slate-300 hover:border-slate-500 hover:text-white",
                  )}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          )}
          {canPlay && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-500" aria-live="polite">
                {inPlayback ? `Step ${step + 1}/${order.length}` : `${order.length} steps`}
              </span>
              <button
                type="button"
                onClick={() => (playing ? setPlaying(false) : startPlayback())}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-brand-500/30 transition hover:bg-brand-500/25"
              >
                {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                {playing ? "Pause" : inPlayback && step < order.length - 1 ? "Resume" : "Play flow"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset flow"
                className="rounded-lg p-1.5 text-slate-400 ring-1 ring-inset ring-canvas-border transition hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div ref={wrapRef} className="overflow-x-auto">
          <div className="relative" style={{ width, height }} role="group" aria-label={title}>
            {/* Groups */}
            {graph.groups?.map((g) => {
              const x = g.colStart * colW + 6;
              const w = (g.colEnd - g.colStart + 1) * colW - 12;
              const y = topPad + g.rowStart * rowHeight - 26 + 8;
              const h = (g.rowEnd - g.rowStart + 1) * rowHeight + 26 - 12;
              const tone = g.tone ?? "slate";
              return (
                <div
                  key={g.id}
                  className="absolute rounded-2xl border border-dashed"
                  style={{ left: x, top: y, width: w, height: h, borderColor: groupStroke[tone], background: groupFill[tone] }}
                >
                  <span className="absolute left-3 top-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {g.label}
                  </span>
                </div>
              );
            })}

            {/* Edges */}
            <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden="true">
              <defs>
                <marker id={`${markerId}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#46607a" />
                </marker>
                <marker id={`${markerId}-arrow-hi`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2ad6dc" />
                </marker>
              </defs>
              {graph.edges.map((e, i) => {
                const a = nodeById.get(e.from);
                const b = nodeById.get(e.to);
                if (!a || !b) return null;
                const ca = center(a);
                const cb = center(b);
                const route = routeEdge(
                  { ...ca, w: nodeW, h: nodeHeight },
                  { ...cb, w: nodeW, h: nodeHeight },
                  a.col === b.col,
                  b.row - a.row,
                );
                const key = `${e.from}->${e.to}`;
                const hi = inPlayback
                  ? playEdges.has(key)
                  : selectedId != null && (e.from === selectedId || e.to === selectedId);
                const dim = !inPlayback && selectedId != null && !hi;
                return (
                  <g key={key + i} style={{ opacity: dim ? 0.25 : 1, transition: "opacity 200ms" }}>
                    <motion.path
                      d={route.d}
                      fill="none"
                      stroke={hi ? "#2ad6dc" : "#34495f"}
                      strokeWidth={hi ? 2 : 1.4}
                      strokeDasharray={e.dashed ? "5 5" : undefined}
                      markerEnd={`url(#${markerId}-${hi ? "arrow-hi" : "arrow"})`}
                      initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.035, ease: "easeInOut" }}
                    />
                    {hi && !reduced && (
                      <path
                        d={route.d}
                        fill="none"
                        stroke="#98f8f6"
                        strokeWidth={2}
                        strokeLinecap="round"
                        className="diagram-edge diagram-edge-animated"
                        opacity={0.8}
                      />
                    )}
                    {e.label && (
                      <g transform={`translate(${route.mid.x}, ${route.mid.y})`}>
                        <rect x={-(e.label.length * 3.4 + 8)} y={-9} width={e.label.length * 6.8 + 16} height={18} rx={9} fill="#0d1420" stroke={hi ? "#2ad6dc" : "#1c2a3d"} />
                        <text textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={600} fill={hi ? "#98f8f6" : "#94a3b8"}>
                          {e.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {graph.nodes.map((n, i) => {
              const { cx, cy } = center(n);
              const tone = toneHex[toneFor(n)];
              const isSel = selectedId === n.id;
              const isVisited = visited.has(n.id);
              const dim = inPlayback ? !isVisited : neighbours != null && !neighbours.has(n.id);
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  aria-pressed={isSel}
                  aria-label={`${n.label}${n.sublabel ? `, ${n.sublabel}` : ""}`}
                  onClick={() => {
                    setPlaying(false);
                    setStep(-1);
                    setSelectedId(isSel ? null : n.id);
                  }}
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: dim ? 0.35 : 1, scale: isSel ? 1.04 : 1 }}
                  transition={{ duration: 0.3, delay: reduced ? 0 : Math.min(i * 0.03, 0.6) }}
                  className="group absolute flex items-center gap-2.5 rounded-xl border px-3 text-left shadow-card outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-brand-400"
                  style={{
                    left: cx - nodeW / 2,
                    top: cy - nodeHeight / 2,
                    width: nodeW,
                    height: nodeHeight,
                    borderColor: isSel || (inPlayback && isVisited) ? tone.stroke : "rgba(148,163,184,0.18)",
                    background: isSel ? `linear-gradient(${tone.strong}, ${tone.strong}), #0d1420` : "#0d1420",
                    boxShadow: isSel ? `0 0 0 1px ${tone.stroke}, 0 10px 30px -10px ${tone.stroke}` : undefined,
                  }}
                >
                  {n.icon && (
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                      style={{ background: tone.fill, color: tone.stroke }}
                    >
                      <Icon name={n.icon} className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-[12.5px] font-semibold leading-tight text-slate-100">{n.label}</span>
                    {n.sublabel && <span className="block truncate text-[11px] text-slate-400">{n.sublabel}</span>}
                  </span>
                  {inPlayback && order[step] === n.id && !reduced && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full" style={{ background: tone.stroke }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        {scenario?.description && (
          <div className="border-t border-canvas-border px-4 py-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{scenario.label}:</span> {scenario.description}
          </div>
        )}
        {footer && <div className="border-t border-canvas-border px-4 py-3">{footer}</div>}
      </div>

      {showDetails && (
        <aside className="panel p-5 xl:self-start" aria-live="polite">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  {selected.icon && (
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl"
                      style={{ background: toneHex[toneFor(selected)].fill, color: toneHex[toneFor(selected)].stroke }}
                    >
                      <Icon name={selected.icon} className="h-5 w-5" />
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{selected.label}</h3>
                    {selected.sublabel && <p className="text-xs text-slate-400">{selected.sublabel}</p>}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{selected.description}</p>
                {selected.detail && (
                  <ul className="mt-4 space-y-1.5">
                    {selected.detail.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-slate-300">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: toneHex[toneFor(selected)].stroke }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {(incoming.length > 0 || outgoing.length > 0) && (
                  <div className="mt-5 space-y-3 border-t border-canvas-border pt-4">
                    {incoming.length > 0 && <NeighbourList label="Receives from" nodes={incoming} onPick={setSelectedId} />}
                    {outgoing.length > 0 && <NeighbourList label="Connects to" nodes={outgoing} onPick={setSelectedId} />}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-slate-400">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-canvas-border text-slate-500">
                  <MousePointerClick className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="font-medium text-slate-200">Select a component</p>
                <p className="mt-1">
                  Choose any node in the diagram to see its responsibility, key properties and connections.
                  {canPlay && " Or press Play to walk through it step by step."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      )}
    </div>
  );
}

function NeighbourList({ label, nodes, onPick }: { label: string; nodes: GraphNode[]; onPick: (id: string) => void }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onPick(n.id)}
            className="rounded-md border border-canvas-border bg-white/[0.03] px-2 py-1 text-xs text-slate-300 transition hover:border-brand-500/40 hover:text-white"
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}
