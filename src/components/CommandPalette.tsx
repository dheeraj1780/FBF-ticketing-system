import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import clsx from "clsx";
import { allNavItems } from "@/data/nav";
import { allRequirements } from "@/data/requirements";
import { adrs } from "@/data/adr";
import { acceptanceTests } from "@/data/roadmap";
import { backendModules } from "@/data/backendModules";
import { Icon } from "./Icon";
import type { IconName } from "@/types";

interface Entry {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  icon: IconName;
  kind: string;
}

const entries: Entry[] = [
  ...allNavItems.map((n) => ({ id: `nav-${n.path}`, title: n.title, subtitle: n.description, to: n.path, icon: n.icon, kind: "Section" })),
  ...allRequirements.map((r) => ({
    id: r.id,
    title: `${r.id} · ${r.title}`,
    subtitle: r.summary,
    to: `/traceability?req=${r.id}`,
    icon: "clipboard" as IconName,
    kind: r.category === "functional" ? "Functional req." : "Non-functional req.",
  })),
  ...adrs.map((a) => ({ id: a.id, title: `${a.id} · ${a.title}`, subtitle: a.decision, to: `/decisions#${a.id}`, icon: "book" as IconName, kind: "ADR" })),
  ...acceptanceTests.map((t) => ({ id: t.id, title: `${t.id} · ${t.title}`, subtitle: t.outcome, to: `/roadmap#acceptance`, icon: "clipboard-check" as IconName, kind: "Acceptance test" })),
  ...backendModules.map((m) => ({ id: `mod-${m.id}`, title: m.path, subtitle: m.responsibility, to: `/backend#${m.id}`, icon: m.icon, kind: "Module" })),
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, allNavItems.length);
    const terms = q.split(/\s+/);
    return entries
      .filter((e) => {
        const hay = `${e.title} ${e.subtitle} ${e.kind}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 40);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const go = (e: Entry) => {
    onClose();
    navigate(e.to);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the blueprint"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-canvas-border bg-canvas-raised shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(results.length - 1, c + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === "Enter" && results[cursor]) {
                e.preventDefault();
                go(results[cursor]);
              }
            }}
          >
            <div className="flex items-center gap-3 border-b border-canvas-border px-4">
              <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, requirements, ADRs, modules…"
                className="h-12 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={results[cursor] ? `palette-${results[cursor].id}` : undefined}
              />
              <kbd className="rounded border border-canvas-border px-1.5 py-0.5 font-mono text-[10px] text-slate-500">ESC</kbd>
            </div>
            <ul ref={listRef} id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-500">No matches for “{query}”.</li>}
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={`palette-${r.id}`}
                  role="option"
                  aria-selected={i === cursor}
                  data-index={i}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => go(r)}
                  className={clsx(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5",
                    i === cursor ? "bg-brand-500/10 text-white" : "text-slate-300",
                  )}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-canvas-border bg-white/[0.03] text-brand-300">
                    <Icon name={r.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className="block truncate text-xs text-slate-500">{r.subtitle}</span>
                  </span>
                  <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:block">{r.kind}</span>
                  {i === cursor && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
