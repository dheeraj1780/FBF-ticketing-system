import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Menu, Search, X } from "lucide-react";
import clsx from "clsx";
import { allNavItems, navGroups } from "@/data/nav";
import { Icon } from "./Icon";
import { CommandPalette } from "./CommandPalette";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-lg">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-canvas shadow-glow">
        <Icon name="ticket" className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">FGF Ticketing</span>
        <span className="block text-[11px] text-slate-400">Architecture Explorer</span>
      </span>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Blueprint sections" className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">{group.label}</div>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    clsx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive ? "text-white" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-brand-500/10 ring-1 ring-inset ring-brand-500/25"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                        />
                      )}
                      <Icon name={item.icon} className={clsx("relative h-4 w-4", isActive ? "text-brand-300" : "text-slate-500 group-hover:text-slate-300")} />
                      <span className="relative">{item.title}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function PageFooterNav() {
  const { pathname } = useLocation();
  const i = allNavItems.findIndex((n) => n.path === pathname);
  if (i < 0) return null;
  const prev = allNavItems[i - 1];
  const next = allNavItems[i + 1];
  return (
    <nav aria-label="Previous and next section" className="mt-16 grid gap-3 border-t border-canvas-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link to={prev.path} className="panel group flex items-center gap-3 p-4 transition hover:border-brand-500/40">
          <ArrowLeft className="h-4 w-4 text-slate-500 transition group-hover:-translate-x-0.5 group-hover:text-brand-300" aria-hidden="true" />
          <span>
            <span className="block text-xs text-slate-500">Previous</span>
            <span className="text-sm font-medium text-slate-200">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={next.path} className="panel group flex items-center justify-end gap-3 p-4 text-right transition hover:border-brand-500/40">
          <span>
            <span className="block text-xs text-slate-500">Next</span>
            <span className="text-sm font-medium text-slate-200">{next.title}</span>
          </span>
          <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-brand-300" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const current = allNavItems.find((n) => n.path === location.pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const t = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.title = current ? `${current.title} · FGF Ticketing Architecture Explorer` : "FGF Ticketing Architecture Explorer";
  }, [current]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-500 focus:px-3 focus:py-2 focus:text-canvas">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-canvas-border bg-canvas/80 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center px-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
          <SidebarNav />
        </div>
        <div className="border-t border-canvas-border px-5 py-4 text-[11px] leading-relaxed text-slate-500">
          Source: <span className="text-slate-400">FGF Engineering Blueprint v1.0</span>
          <br />
          Proposed architecture · pre-implementation baseline
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-xs flex-col border-r border-canvas-border bg-canvas lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Brand />
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-canvas-border bg-canvas/75 px-4 backdrop-blur-xl sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="rounded-lg p-2 text-slate-400 hover:text-white lg:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            {current && (
              <div className="flex items-center gap-2 truncate text-sm">
                <span className="hidden text-slate-500 sm:inline">{navGroups.find((g) => g.items.includes(current))?.label}</span>
                <span className="hidden text-slate-600 sm:inline">/</span>
                <span className="truncate font-medium text-slate-200">{current.title}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-canvas-border bg-white/[0.03] px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Search blueprint</span>
            <kbd className="hidden rounded border border-canvas-border px-1.5 font-mono text-[10px] text-slate-500 sm:inline">⌘K</kbd>
          </button>
        </header>

        <main id="main" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
            <PageFooterNav />
          </motion.div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
