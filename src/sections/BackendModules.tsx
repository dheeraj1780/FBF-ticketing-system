import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import clsx from "clsx";
import { Badge, BulletList, Card, PageHeader, Section } from "@/components/ui";
import { Icon } from "@/components/Icon";
import {
  apiEndpoints, backendModules, futureServices, idempotentOperations, monolithAdvantages, mutationChecklist,
  repositoryStructure, type BackendModule, type TreeNode,
} from "@/data/backendModules";

const layerMeta: Record<BackendModule["layer"], { label: string; tone: string }> = {
  identity: { label: "Identity", tone: "border-brand-500/40 text-brand-200" },
  event: { label: "Event & venue", tone: "border-sky-400/40 text-sky-200" },
  commerce: { label: "Commerce", tone: "border-amber-400/40 text-amber-200" },
  ticketing: { label: "Ticketing", tone: "border-violet-400/40 text-violet-200" },
  access: { label: "Access", tone: "border-lime-400/40 text-lime-200" },
  governance: { label: "Governance", tone: "border-rose-400/40 text-rose-200" },
  support: { label: "Support", tone: "border-slate-400/40 text-slate-200" },
};

function Tree({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1 || node.name === "backend/");
  const hasChildren = !!node.children?.length;
  return (
    <li>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((o) => !o)}
        aria-expanded={hasChildren ? open : undefined}
        className={clsx("flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[13px]", hasChildren ? "text-slate-200 hover:bg-white/[0.04]" : "cursor-default text-slate-400")}
      >
        {hasChildren ? (
          <ChevronRight className={clsx("h-3.5 w-3.5 text-slate-500 transition-transform", open && "rotate-90")} aria-hidden="true" />
        ) : (
          <span className="w-3.5" />
        )}
        {hasChildren && open ? (
          <FolderOpen className="h-4 w-4 text-amber-300/80" aria-hidden="true" />
        ) : (
          <Folder className="h-4 w-4 text-amber-300/60" aria-hidden="true" />
        )}
        {node.name}
      </button>
      {hasChildren && open && (
        <ul className="ml-4 border-l border-canvas-border pl-2">
          {node.children!.map((c) => (
            <Tree key={c.name} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BackendModules() {
  const location = useLocation();
  const [selected, setSelected] = useState<string>("redemption");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);

  useEffect(() => {
    const id = location.hash.slice(1);
    if (backendModules.some((m) => m.id === id)) setSelected(id);
  }, [location.hash]);

  const mod = backendModules.find((m) => m.id === selected)!;
  const endpoints = moduleFilter ? apiEndpoints.filter((e) => e.module === moduleFilter) : apiEndpoints;

  return (
    <div>
      <PageHeader
        kicker="Architecture"
        title="Backend Modules"
        icon="layers"
        blueprint="§18–19, §32–33"
        description="One deployable, many strict modules. Each module owns its tables and API routes, and all of them share a single transactional PostgreSQL database."
      />

      <Section title="Modular monolith" description="Select a module to see what it owns. Modules marked with an extraction tag are the blueprint's candidates for future services.">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="panel p-5">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-400/10 px-4 py-3 font-semibold text-violet-100">
              <Icon name="server" className="h-5 w-5" /> FastAPI API · /api/v1
            </motion.div>
            <div className="mx-auto h-6 w-px bg-gradient-to-b from-violet-400/60 to-transparent" />

            <div className="rounded-2xl border border-dashed border-canvas-border p-3 sm:p-4">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">backend/ — strict domain modules, one deployment</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="listbox" aria-label="Backend modules">
                {backendModules.map((m, i) => {
                  const on = m.id === selected;
                  return (
                    <motion.button
                      key={m.id}
                      id={m.id}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => setSelected(m.id)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 + i * 0.03 }}
                      className={clsx(
                        "relative flex scroll-mt-24 flex-col items-start gap-2 rounded-xl border bg-canvas-raised p-3 text-left transition",
                        on ? "border-brand-400 shadow-glow" : "border-canvas-border hover:border-slate-500",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Icon name={m.icon} className={clsx("h-4 w-4", on ? "text-brand-300" : "text-slate-400")} />
                        <span className={clsx("rounded border px-1.5 text-[9.5px] font-semibold uppercase tracking-wider", layerMeta[m.layer].tone)}>
                          {layerMeta[m.layer].label}
                        </span>
                      </div>
                      <span className="font-mono text-[13px] font-semibold text-slate-100">{m.name}/</span>
                      {m.extractionCandidate && <span className="text-[10px] text-amber-300/80">↗ future {m.extractionCandidate}</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="mx-auto h-6 w-px bg-gradient-to-b from-transparent to-amber-400/60" />
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 font-semibold text-amber-100">
              <Icon name="database" className="h-5 w-5" /> PostgreSQL — one transactional database
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.aside
              key={mod.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="panel p-5 xl:self-start"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                  <Icon name={mod.icon} className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-mono text-sm font-semibold text-white">{mod.path}</div>
                  <div className="text-xs text-slate-400">{layerMeta[mod.layer].label}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{mod.responsibility}</p>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Owns</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {mod.owns.map((o) => (
                  <Badge key={o} tone="amber">
                    <span className="font-mono">{o}</span>
                  </Badge>
                ))}
              </div>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">API routes</div>
              {mod.endpoints.length ? (
                <ul className="mt-2 space-y-1">
                  {mod.endpoints.map((e) => {
                    const [method, path] = e.split(" ");
                    return (
                      <li key={e} className="flex items-center gap-2 font-mono text-xs">
                        <span className={clsx("w-11 rounded px-1 text-center font-bold", method === "GET" ? "bg-sky-400/15 text-sky-300" : "bg-lime-400/15 text-lime-300")}>{method}</span>
                        <span className="text-slate-300">{path}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Internal module driven by outbox events. It exposes no public routes.</p>
              )}
              {mod.extractionCandidate && (
                <div className="mt-5 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] p-3 text-xs text-amber-100">
                  Future extraction candidate: <strong>{mod.extractionCandidate}</strong>. Extract it only when actual scale or organizational boundaries justify it.
                </div>
              )}
            </motion.aside>
          </AnimatePresence>
        </div>
      </Section>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="kicker mb-3">Why a modular monolith?</div>
          <BulletList items={monolithAdvantages} tone="lime" />
        </Card>
        <Card>
          <div className="kicker mb-3">Extract later, only if needed</div>
          <BulletList items={futureServices} tone="amber" />
          <p className="mt-4 text-sm text-slate-400">Extract them only when actual scale or organizational boundaries justify it.</p>
        </Card>
      </div>

      <Section
        title="API surface"
        description="Base path /api/v1. Filter by module."
        actions={
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setModuleFilter(null)}
              className={clsx("rounded-md border px-2 py-1 text-xs", !moduleFilter ? "border-brand-400 text-white" : "border-canvas-border text-slate-400")}
            >
              all
            </button>
            {[...new Set(apiEndpoints.map((e) => e.module))].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModuleFilter(m)}
                aria-pressed={moduleFilter === m}
                className={clsx("rounded-md border px-2 py-1 font-mono text-xs", moduleFilter === m ? "border-brand-400 text-white" : "border-canvas-border text-slate-400 hover:text-slate-200")}
              >
                {m}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="panel overflow-hidden">
            <ul className="divide-y divide-canvas-border/70">
              <AnimatePresence initial={false}>
                {endpoints.map((e) => (
                  <motion.li
                    key={`${e.method}${e.path}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-4 py-2.5 font-mono text-sm"
                  >
                    <span className={clsx("w-12 shrink-0 rounded px-1.5 py-0.5 text-center text-[11px] font-bold", e.method === "GET" ? "bg-sky-400/15 text-sky-300" : "bg-lime-400/15 text-lime-300")}>
                      {e.method}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-slate-200">
                      <span className="text-slate-500">/api/v1</span>
                      {e.path}
                    </span>
                    <button type="button" onClick={() => setSelected(e.module)} className="hidden shrink-0 text-[11px] text-slate-500 hover:text-brand-300 sm:block">
                      {e.module}
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
          <div className="space-y-4">
            <Card>
              <div className="kicker mb-3">Every mutation should have</div>
              <div className="flex flex-wrap gap-1.5">
                {mutationChecklist.map((m) => (
                  <Badge key={m} tone="brand">
                    {m}
                  </Badge>
                ))}
              </div>
            </Card>
            <Card>
              <div className="kicker mb-3">Idempotency keys (§33)</div>
              <pre className="mb-3 overflow-x-auto rounded-lg border border-canvas-border bg-canvas p-3 font-mono text-xs text-lime-200">Idempotency-Key: 01JSPT...</pre>
              <BulletList items={idempotentOperations} />
              <p className="mt-3 text-xs text-slate-500">The database persists the key and the final response/result.</p>
            </Card>
          </div>
        </div>
      </Section>

      <Section title="Repository structure" description="§19 — one repository with apps, backend modules, infrastructure, docs and tests.">
        <Card>
          <ul aria-label="Repository tree">
            <Tree node={repositoryStructure} />
          </ul>
        </Card>
      </Section>
    </div>
  );
}
