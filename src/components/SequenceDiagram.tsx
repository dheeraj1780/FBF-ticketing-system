import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { SequenceDiagramData } from "@/types";
import { Icon } from "./Icon";
import { usePrefersReducedMotion } from "@/lib/useElementWidth";

const COL_W = 230;
const HEAD_H = 70;
const ROW_H = 46;
const PAD_X = 20;

export function SequenceDiagram({ data, stepMs = 900 }: { data: SequenceDiagramData; stepMs?: number }) {
  const reduced = usePrefersReducedMotion();
  const total = data.messages.length;
  const [shown, setShown] = useState(reduced ? total : 0);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView && !reduced) setPlaying(true);
  }, [inView, reduced]);

  useEffect(() => {
    if (!playing) return;
    if (shown >= total) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => {
      setShown((s) => s + 1);
    }, shown === 0 ? 350 : stepMs);
    return () => window.clearTimeout(t);
  }, [playing, shown, total, stepMs]);

  useEffect(() => {
    if (shown > 0) setActive(shown - 1);
  }, [shown]);

  const idx = useMemo(() => new Map(data.participants.map((p, i) => [p.id, i])), [data.participants]);
  const width = data.participants.length * COL_W + PAD_X * 2;
  const height = HEAD_H + total * ROW_H + 30;
  const colX = (id: string) => PAD_X + idx.get(id)! * COL_W + COL_W / 2;
  const rowY = (i: number) => HEAD_H + 22 + i * ROW_H;

  // Consecutive messages sharing a branch → alt/else frames
  const frames = useMemo(() => {
    const out: { label: string; start: number; end: number; first: boolean }[] = [];
    let firstSeen = false;
    data.messages.forEach((m, i) => {
      if (!m.branch) return;
      const last = out[out.length - 1];
      if (last && last.label === m.branch && last.end === i - 1) last.end = i;
      else {
        out.push({ label: m.branch, start: i, end: i, first: !firstSeen });
        firstSeen = true;
      }
    });
    return out;
  }, [data.messages]);

  const activeMsg = active != null ? data.messages[active] : undefined;

  return (
    <div ref={rootRef} className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border px-4 py-2.5">
        <div className="text-xs text-slate-400">
          <span className="font-semibold text-slate-200">{data.title}</span> · {total} messages
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-500" aria-live="polite">
            {shown}/{total}
          </span>
          <button
            type="button"
            onClick={() => {
              if (shown >= total) setShown(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-brand-500/30 hover:bg-brand-500/25"
          >
            {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {playing ? "Pause" : shown >= total ? "Replay" : "Play"}
          </button>
          <button
            type="button"
            aria-label="Next message"
            disabled={shown >= total}
            onClick={() => {
              setPlaying(false);
              setShown((s) => Math.min(total, s + 1));
            }}
            className="rounded-lg p-1.5 text-slate-400 ring-1 ring-inset ring-canvas-border hover:text-white disabled:opacity-40"
          >
            <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Show all messages"
            onClick={() => {
              setPlaying(false);
              setShown(total);
            }}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 ring-1 ring-inset ring-canvas-border hover:text-white"
          >
            All
          </button>
          <button
            type="button"
            aria-label="Reset"
            onClick={() => {
              setPlaying(false);
              setShown(0);
              setActive(null);
            }}
            className="rounded-lg p-1.5 text-slate-400 ring-1 ring-inset ring-canvas-border hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" style={{ minWidth: Math.min(width, 720) }} role="img" aria-label={`${data.title} sequence diagram`}>
          <defs>
            <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
            <marker id="seq-arrow-hi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2ad6dc" />
            </marker>
            <marker id="seq-arrow-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#f5b942" strokeWidth="1.6" />
            </marker>
          </defs>

          {/* Lifelines */}
          {data.participants.map((p) => (
            <line key={p.id} x1={colX(p.id)} x2={colX(p.id)} y1={HEAD_H - 8} y2={height - 10} stroke="#26384d" strokeDasharray="4 5" />
          ))}

          {/* Alt frames */}
          {frames.map((f, i) => {
            const y1 = rowY(f.start) - ROW_H / 2 + 4;
            const y2 = rowY(f.end) + ROW_H / 2 - 8;
            const visible = shown > f.start;
            return (
              <g key={i} opacity={visible ? 1 : 0.15} style={{ transition: "opacity 300ms" }}>
                <rect x={PAD_X + 6} y={y1} width={width - PAD_X * 2 - 12} height={y2 - y1} rx={8} fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.35)" strokeDasharray="5 4" />
                <rect x={PAD_X + 6} y={y1} width={f.label.length * 6.4 + 50} height={18} rx={6} fill="rgba(167,139,250,0.18)" />
                <text x={PAD_X + 14} y={y1 + 9} dominantBaseline="central" fontSize={10.5} fontWeight={700} fill="#ddd6fe">
                  {f.first ? "alt" : "else"} [{f.label}]
                </text>
              </g>
            );
          })}

          {/* Messages */}
          {data.messages.map((m, i) => {
            if (i >= shown) return null;
            const y = rowY(i);
            const x1 = colX(m.from);
            const x2 = colX(m.to);
            const isActive = active === i;
            const color = isActive ? "#2ad6dc" : m.kind === "async" ? "#f5b942" : m.kind === "return" ? "#7c8ea3" : "#94a3b8";
            const marker = isActive ? "url(#seq-arrow-hi)" : m.kind === "async" ? "url(#seq-arrow-open)" : "url(#seq-arrow)";
            const self = m.from === m.to;
            const d = self
              ? `M ${x1} ${y - 8} h 46 v 16 h -44`
              : `M ${x1 + (x2 > x1 ? 4 : -4)} ${y} L ${x2 + (x2 > x1 ? -6 : 6)} ${y}`;
            const labelX = self ? x1 + 54 : (x1 + x2) / 2;
            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Step ${i + 1}: ${m.label}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <rect x={Math.min(x1, x2) - 10} y={y - ROW_H / 2 + 2} width={Math.abs(x2 - x1) + (self ? 240 : 20)} height={ROW_H - 4} fill="transparent" />
                <motion.path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  strokeDasharray={m.kind === "return" ? "6 5" : undefined}
                  markerEnd={marker}
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
                <motion.g initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                  <circle cx={self ? x1 - 16 : Math.min(x1, x2) + 16} cy={y - 12} r={8} fill={isActive ? "#2ad6dc" : "#1c2a3d"} />
                  <text x={self ? x1 - 16 : Math.min(x1, x2) + 16} y={y - 12} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill={isActive ? "#062f38" : "#94a3b8"}>
                    {i + 1}
                  </text>
                  <text
                    x={labelX}
                    y={self ? y : y - 10}
                    textAnchor={self ? "start" : "middle"}
                    dominantBaseline={self ? "central" : "auto"}
                    fontSize={12}
                    fontWeight={isActive ? 700 : 500}
                    fill={isActive ? "#e0fdfc" : m.label.startsWith("ACCESS GRANTED") ? "#bef264" : m.label.startsWith("ACCESS DENIED") ? "#fda4af" : "#cbd5e1"}
                  >
                    {m.label}
                  </text>
                </motion.g>
              </g>
            );
          })}

          {/* Participant headers (drawn last so they sit on top) */}
          {data.participants.map((p) => {
            const x = colX(p.id);
            return (
              <g key={p.id}>
                <rect x={x - 88} y={10} width={176} height={46} rx={12} fill="#101a29" stroke="#2a3d55" />
                <foreignObject x={x - 80} y={14} width={160} height={38}>
                  <div className="flex h-full items-center justify-center gap-2 text-[13px] font-semibold text-slate-100">
                    {p.icon && <Icon name={p.icon} className="h-4 w-4 text-brand-300" />}
                    <span className="truncate">{p.label}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex min-h-[64px] items-start gap-3 border-t border-canvas-border px-4 py-3" aria-live="polite">
        {activeMsg ? (
          <>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/20 font-mono text-[11px] font-bold text-brand-200">
              {active! + 1}
            </span>
            <div className="text-sm">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-200">
                <span className="font-medium">{data.participants[idx.get(activeMsg.from)!].label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span className="font-medium">{data.participants[idx.get(activeMsg.to)!].label}</span>
                <span className="text-slate-500">·</span>
                <span className={clsx("font-semibold", activeMsg.kind === "async" ? "text-amber-300" : "text-brand-300")}>{activeMsg.label}</span>
                {activeMsg.kind === "return" && <span className="text-xs text-slate-500">(response)</span>}
                {activeMsg.kind === "async" && <span className="text-xs text-slate-500">(asynchronous callback)</span>}
              </div>
              {activeMsg.detail && <p className="mt-1 text-slate-400">{activeMsg.detail}</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Press Play to animate the sequence, or click any message to inspect it.</p>
        )}
      </div>
    </div>
  );
}
