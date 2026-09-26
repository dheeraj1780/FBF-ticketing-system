export type Tone = "brand" | "violet" | "amber" | "rose" | "slate" | "lime";

export const toneText: Record<Tone, string> = {
  brand: "text-brand-300",
  violet: "text-violet-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
  slate: "text-slate-300",
  lime: "text-lime-300",
};

export const toneBadge: Record<Tone, string> = {
  brand: "border-brand-500/30 bg-brand-500/10 text-brand-200",
  violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  slate: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  lime: "border-lime-400/30 bg-lime-400/10 text-lime-200",
};

/** Hex values used inside SVG diagrams. */
export const toneHex: Record<Tone, { stroke: string; fill: string; strong: string; text: string }> = {
  brand: { stroke: "#2ad6dc", fill: "rgba(42,214,220,0.10)", strong: "rgba(42,214,220,0.20)", text: "#98f8f6" },
  violet: { stroke: "#a78bfa", fill: "rgba(167,139,250,0.12)", strong: "rgba(167,139,250,0.22)", text: "#ddd6fe" },
  amber: { stroke: "#f5b942", fill: "rgba(245,185,66,0.12)", strong: "rgba(245,185,66,0.22)", text: "#fde68a" },
  rose: { stroke: "#f0577a", fill: "rgba(240,87,122,0.12)", strong: "rgba(240,87,122,0.22)", text: "#fecdd3" },
  slate: { stroke: "#94a3b8", fill: "rgba(100,116,139,0.14)", strong: "rgba(100,116,139,0.26)", text: "#cbd5e1" },
  lime: { stroke: "#a3e635", fill: "rgba(163,230,53,0.12)", strong: "rgba(163,230,53,0.22)", text: "#d9f99d" },
};

export const kindTone: Record<string, Tone> = {
  client: "brand",
  edge: "slate",
  service: "violet",
  store: "amber",
  external: "rose",
  observability: "lime",
  default: "brand",
};
