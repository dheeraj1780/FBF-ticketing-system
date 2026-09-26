import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { StateMachineData, StateNodeData } from "@/types";
import { toneHex, toneBadge, type Tone } from "@/lib/tones";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

const NODE_W = 172;
const NODE_H = 44;
const TERM_R = 10;

interface Pt {
  x: number;
  y: number;
}

function clip(s: StateNodeData, toward: Pt): Pt {
  const dx = toward.x - s.x;
  const dy = toward.y - s.y;
  if (dx === 0 && dy === 0) return { x: s.x, y: s.y };
  if (s.terminal) {
    const len = Math.hypot(dx, dy);
    const r = TERM_R + 3;
    return { x: s.x + (dx / len) * r, y: s.y + (dy / len) * r };
  }
  const hw = NODE_W / 2 + 3;
  const hh = NODE_H / 2 + 3;
  const t = Math.min(dx !== 0 ? hw / Math.abs(dx) : Infinity, dy !== 0 ? hh / Math.abs(dy) : Infinity);
  return { x: s.x + dx * t, y: s.y + dy * t };
}

function edgeGeometry(a: StateNodeData, b: StateNodeData, curve = 0) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular unit vector (-dy, dx); negative y is "up" on screen
  const nx = dy / len;
  const ny = -dx / len;
  const c = { x: mx + nx * curve, y: my + ny * curve };
  const p0 = clip(a, curve ? c : b);
  const p2 = clip(b, curve ? c : a);
  const d = `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y}`;
  const off = curve ? 0 : Math.abs(dx) > Math.abs(dy) ? 31 : 0;
  const mid = { x: 0.25 * p0.x + 0.5 * c.x + 0.25 * p2.x + nx * off, y: 0.25 * p0.y + 0.5 * c.y + 0.25 * p2.y + ny * off };
  return { d, mid };
}

export function StateMachine({ data, stepMs = 1100 }: { data: StateMachineData; stepMs?: number }) {
  const reduced = usePrefersReducedMotion();
  const [pathId, setPathId] = useState(data.paths[0]?.id);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const uid = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const path = data.paths.find((p) => p.id === pathId);
  const steps = useMemo(() => path?.steps ?? [], [path]);
  const byId = useMemo(() => new Map(data.states.map((s) => [s.id, s])), [data.states]);

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), step < 0 ? 100 : stepMs);
    return () => window.clearTimeout(t);
  }, [playing, step, steps.length, stepMs]);

  const choosePath = (id: string) => {
    setPathId(id);
    setStep(-1);
    setPlaying(true);
    setSelected(null);
  };

  const traversed = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < step; i++) set.add(`${steps[i]}->${steps[i + 1]}`);
    return set;
  }, [steps, step]);

  const visited = new Set(step >= 0 ? steps.slice(0, step + 1) : []);
  const current = step >= 0 ? steps[step] : null;
  const pathTone: Tone = (path?.tone as Tone) ?? "brand";
  const hi = toneHex[pathTone];

  const edgeKeyFor = (from: string, to: string) => `${from}->${to}`;
  const currentEdge = step > 0 ? data.edges.find((e) => e.from === steps[step - 1] && e.to === steps[step]) : undefined;

  const focusState = selected ? byId.get(selected) : current ? byId.get(current) : undefined;
  const focusIn = focusState ? data.edges.filter((e) => e.to === focusState.id && !byId.get(e.from)?.terminal) : [];
  const focusOut = focusState ? data.edges.filter((e) => e.from === focusState.id && !byId.get(e.to)?.terminal) : [];

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-canvas-border px-4 py-3">
          <span className="mr-1 text-xs font-medium text-slate-400">Simulate:</span>
          {data.paths.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => choosePath(p.id)}
              aria-pressed={p.id === pathId && step >= 0}
              className={clsx(
                "rounded-lg border px-2.5 py-1 text-xs font-semibold transition",
                p.id === pathId && step >= 0
                  ? toneBadge[(p.tone as Tone) ?? "brand"]
                  : "border-canvas-border text-slate-300 hover:border-slate-500 hover:text-white",
              )}
            >
              {p.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (step >= steps.length - 1) setStep(-1);
                setPlaying((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-brand-500/30 hover:bg-brand-500/25"
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              aria-label="Reset simulation"
              onClick={() => {
                setPlaying(false);
                setStep(-1);
              }}
              className="rounded-lg p-1.5 text-slate-400 ring-1 ring-inset ring-canvas-border hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${data.width} ${data.height}`}
            className="block w-full min-w-[760px]"
            role="img"
            aria-label={`${data.title} diagram`}
          >
            <defs>
              <marker id={`sm-arrow-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b6580" />
              </marker>
              <marker id={`sm-arrow-hi-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={hi.stroke} />
              </marker>
              <pattern id="sm-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="rgba(148,163,184,0.08)" />
              </pattern>
            </defs>
            <rect width={data.width} height={data.height} fill="url(#sm-grid)" />

            {data.edges.map((e) => {
              const a = byId.get(e.from)!;
              const b = byId.get(e.to)!;
              const { d, mid } = edgeGeometry(a, b, e.curve);
              const on = traversed.has(edgeKeyFor(e.from, e.to));
              const related = selected && (e.from === selected || e.to === selected);
              return (
                <g key={`${e.from}-${e.to}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke={on ? hi.stroke : related ? "#7dd3fc" : "#34495f"}
                    strokeWidth={on || related ? 2.2 : 1.5}
                    markerEnd={`url(#${on ? `sm-arrow-hi-${uid}` : `sm-arrow-${uid}`})`}
                    style={{ transition: "stroke 250ms" }}
                  />
                  {e.label && (
                    <g transform={`translate(${mid.x}, ${mid.y})`}>
                      <rect
                        x={-(e.label.length * 3.3 + 7)}
                        y={-9}
                        width={e.label.length * 6.6 + 14}
                        height={18}
                        rx={9}
                        fill="#0b111c"
                        stroke={on ? hi.stroke : "#1c2a3d"}
                      />
                      <text textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={600} fill={on ? hi.text : "#94a3b8"}>
                        {e.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {data.states.map((s) => {
              if (s.terminal) {
                const lit = visited.has(s.id);
                return s.terminal === "start" ? (
                  <circle key={s.id} cx={s.x} cy={s.y} r={TERM_R - 1} fill="#e2e8f0" />
                ) : (
                  <g key={s.id}>
                    <circle cx={s.x} cy={s.y} r={TERM_R + 1} fill="none" stroke={lit ? hi.stroke : "#e2e8f0"} strokeWidth={1.5} />
                    <circle cx={s.x} cy={s.y} r={TERM_R - 4} fill={lit ? hi.stroke : "#e2e8f0"} />
                  </g>
                );
              }
              const tone = toneHex[(s.tone as Tone) ?? "slate"];
              const isCurrent = current === s.id;
              const isVisited = visited.has(s.id);
              const isSel = selected === s.id;
              return (
                <g
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${s.label}: ${s.description}`}
                  aria-pressed={isSel}
                  onClick={() => setSelected(isSel ? null : s.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setSelected(isSel ? null : s.id);
                    }
                  }}
                  className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-brand-300"
                  style={{ opacity: step >= 0 && !isVisited ? 0.45 : 1, transition: "opacity 250ms" }}
                >
                  {isCurrent && !reduced && (
                    <rect
                      x={s.x - NODE_W / 2 - 6}
                      y={s.y - NODE_H / 2 - 6}
                      width={NODE_W + 12}
                      height={NODE_H + 12}
                      rx={16}
                      fill="none"
                      stroke={tone.stroke}
                      strokeOpacity={0.5}
                      className="animate-pulseGlow"
                    />
                  )}
                  <rect
                    x={s.x - NODE_W / 2}
                    y={s.y - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    fill={isCurrent || isSel ? tone.strong : "#0d1420"}
                    stroke={isCurrent || isSel || isVisited ? tone.stroke : "rgba(148,163,184,0.28)"}
                    strokeWidth={isCurrent || isSel ? 2 : 1.2}
                  />
                  <circle cx={s.x - NODE_W / 2 + 16} cy={s.y} r={4} fill={tone.stroke} />
                  <text
                    x={s.x + 6}
                    y={s.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={s.label.length > 16 ? 11.5 : 12.5}
                    fontWeight={700}
                    fontFamily="JetBrains Mono, ui-monospace, monospace"
                    fill={isCurrent || isSel ? "#fff" : "#e2e8f0"}
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}

            {currentEdge && !reduced && (
              <circle key={`${step}-token`} r={6} fill={hi.stroke} stroke="#fff" strokeWidth={1.5}>
                <animateMotion
                  dur="0.7s"
                  fill="freeze"
                  path={edgeGeometry(byId.get(currentEdge.from)!, byId.get(currentEdge.to)!, currentEdge.curve).d}
                />
              </circle>
            )}
          </svg>
        </div>

        {path && (
          <div className="border-t border-canvas-border px-4 py-3">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{path.label}:</span> {path.description}
            </p>
            <ol className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Simulation steps">
              {steps
                .filter((id) => !byId.get(id)?.terminal)
                .map((id, i, arr) => {
                  const reached = step >= 0 && i <= step;
                  return (
                    <li key={`${id}-${i}`} className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          "rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] transition-colors",
                          reached ? toneBadge[pathTone] : "border-canvas-border text-slate-500",
                        )}
                      >
                        {id}
                      </span>
                      {i < arr.length - 1 && <span className="text-slate-600">→</span>}
                    </li>
                  );
                })}
            </ol>
          </div>
        )}
      </div>

      <aside className="panel p-5 2xl:self-start" aria-live="polite">
        <AnimatePresence mode="wait">
          {focusState ? (
            <motion.div key={focusState.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {selected ? "Selected state" : "Current state"}
              </div>
              <div
                className="mt-2 inline-block rounded-lg border px-2.5 py-1 font-mono text-sm font-bold"
                style={{
                  borderColor: toneHex[(focusState.tone as Tone) ?? "slate"].stroke,
                  color: toneHex[(focusState.tone as Tone) ?? "slate"].text,
                  background: toneHex[(focusState.tone as Tone) ?? "slate"].fill,
                }}
              >
                {focusState.label || (focusState.terminal === "end" ? "[*] final" : "[*] initial")}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{focusState.description}</p>
              {focusOut.length > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Transitions out</div>
                  <ul className="space-y-1">
                    {focusOut.map((e) => (
                      <li key={e.to} className="text-sm text-slate-300">
                        → <span className="font-mono text-xs text-slate-100">{e.to}</span>
                        {e.label && <span className="text-slate-500"> · {e.label}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {focusIn.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Transitions in</div>
                  <ul className="space-y-1">
                    {focusIn.map((e) => (
                      <li key={e.from} className="text-sm text-slate-300">
                        ← <span className="font-mono text-xs text-slate-100">{e.from}</span>
                        {e.label && <span className="text-slate-500"> · {e.label}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-400">
              <p className="font-medium text-slate-200">Explore the state machine</p>
              <p className="mt-1">Pick a scenario to animate a record through its lifecycle, or click any state to inspect its transitions.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
