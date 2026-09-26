import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Icon } from "./Icon";
import type { IconName } from "@/types";
import { toneBadge, type Tone } from "@/lib/tones";

export function PageHeader({
  kicker,
  title,
  description,
  blueprint,
  icon,
  children,
}: {
  kicker: string;
  title: string;
  description: ReactNode;
  blueprint?: string;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="kicker">{kicker}</span>
            {blueprint && (
              <span className="rounded-md border border-canvas-border bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-slate-400">
                Blueprint {blueprint}
              </span>
            )}
          </div>
          <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {icon && (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300">
                <Icon name={icon} className="h-5 w-5" />
              </span>
            )}
            {title}
          </h1>
          <div className="mt-3 text-base leading-relaxed text-slate-400">{description}</div>
        </div>
        {children}
      </motion.div>
    </header>
  );
}

export function Section({
  title,
  description,
  children,
  className,
  actions,
  id,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("mb-10", className)} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="text-lg font-semibold text-white">
            {title}
          </h2>
          {description && <p className="mt-1 max-w-3xl text-sm text-slate-400">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return <As className={clsx("panel min-w-0 p-5", className)}>{children}</As>;
}

export function Badge({ children, tone = "slate", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        toneBadge[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function BulletList({
  items,
  className,
  tone = "brand",
  columns = false,
}: {
  items: string[];
  className?: string;
  tone?: Tone;
  columns?: boolean;
}) {
  const dot: Record<Tone, string> = {
    brand: "bg-brand-400",
    violet: "bg-violet-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    slate: "bg-slate-500",
    lime: "bg-lime-400",
  };
  return (
    <ul className={clsx(columns ? "grid gap-x-6 gap-y-2 sm:grid-cols-2" : "space-y-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm text-slate-300">
          <span className={clsx("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", dot[tone])} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Callout({
  children,
  tone = "brand",
  icon = "shield",
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: IconName;
  title?: string;
}) {
  return (
    <div className={clsx("flex gap-3 rounded-xl border p-4", toneBadge[tone])}>
      <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-sm leading-relaxed">
        {title && <div className="mb-1 font-semibold">{title}</div>}
        <div className="text-slate-200/90">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, tone = "brand" }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) {
  const color: Record<Tone, string> = {
    brand: "text-brand-300",
    violet: "text-violet-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    slate: "text-slate-200",
    lime: "text-lime-300",
  };
  return (
    <div className="panel p-4">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className={clsx("mt-1 text-2xl font-semibold tabular-nums", color[tone])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export interface TabDef {
  id: string;
  label: string;
  icon?: IconName;
}

/** Accessible tab list (WAI-ARIA tabs pattern with arrow-key navigation). */
export function Tabs({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: TabDef[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={clsx(
        "inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-canvas-border bg-canvas-raised/80 p-1",
        className,
      )}
    >
      {tabs.map((tab, i) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`${baseId}-${tab.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={clsx(
              "relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-white" : "text-slate-400 hover:text-slate-200",
            )}
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${label}`}
                className="absolute inset-0 rounded-lg bg-white/[0.07] ring-1 ring-inset ring-white/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            {tab.icon && <Icon name={tab.icon} className="relative h-4 w-4" />}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Chips({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {items.map((i) => (
        <span key={i} className="chip">
          {i}
        </span>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; tone: Tone }[] }) {
  const dot: Record<Tone, string> = {
    brand: "bg-brand-400",
    violet: "bg-violet-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    slate: "bg-slate-400",
    lime: "bg-lime-400",
  };
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className={clsx("h-2 w-2 rounded-full", dot[i.tone])} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
