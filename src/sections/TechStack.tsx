import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Callout, Card, PageHeader, Section } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { openSourcePreferences, techStack, vendorCapabilities, vendorRule } from "@/data/techStack";
import { notFirst } from "@/data/overview";

export default function TechStack() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return null;
    const set = new Set<string>();
    techStack.forEach((c) => c.items.forEach((i) => `${i.name} ${i.note ?? ""} ${c.category}`.toLowerCase().includes(q) && set.add(i.name)));
    return set;
  }, [q]);

  return (
    <div>
      <PageHeader
        kicker="Architecture"
        title="Technology Stack"
        icon="package"
        blueprint="§17, §40"
        description="An open-source-first stack chosen for reliability and solo-developer productivity. Vendors are used only where the business requires them, each isolated behind an adapter."
      >
        <label className="relative block w-full md:w-64">
          <span className="sr-only">Highlight technology</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Highlight e.g. “redis”"
            className="h-9 w-full rounded-lg border border-canvas-border bg-canvas-raised px-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none"
          />
        </label>
      </PageHeader>

      <Section title="Recommended technology stack">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {techStack.map((c, i) => {
            const catHit = !matches || c.items.some((it) => matches.has(it.name));
            return (
              <motion.div
                key={c.category}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: catHit ? 1 : 0.35, y: 0 }}
                transition={{ delay: matches ? 0 : i * 0.04 }}
              >
                <Card className="h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand-500/25 bg-brand-500/10 text-brand-300">
                      <Icon name={c.icon} className="h-4 w-4" />
                    </span>
                    <h3 className="font-semibold text-white">{c.category}</h3>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {c.items.map((it) => {
                      const hit = matches?.has(it.name);
                      return (
                        <li
                          key={it.name}
                          title={it.note}
                          className={clsx(
                            "rounded-lg border px-2.5 py-1 text-sm transition",
                            hit ? "border-brand-400 bg-brand-500/20 text-white" : "border-canvas-border bg-white/[0.03] text-slate-200",
                          )}
                        >
                          {it.name}
                          {it.note && <span className="ml-1 text-xs text-slate-500">· {it.note}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Section>

      <div className="mb-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Section title="Prefer open source" className="mb-0">
          <div className="panel overflow-hidden">
            <table className="w-full text-sm">
              <caption className="sr-only">Open-source preferences by capability</caption>
              <thead>
                <tr className="border-b border-canvas-border text-left text-xs text-slate-400">
                  <th scope="col" className="px-4 py-2.5 font-semibold">Capability</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Preferred</th>
                </tr>
              </thead>
              <tbody>
                {openSourcePreferences.map((p) => (
                  <tr key={p.capability} className="border-b border-canvas-border/50 last:border-0">
                    <td className="px-4 py-2 text-slate-400">{p.capability}</td>
                    <td className="px-4 py-2 font-medium text-slate-100">{p.preferred}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <div className="space-y-4">
          <Section title="Use vendors where the business requires them" className="mb-0">
            <Card>
              <ul className="grid gap-2 sm:grid-cols-2">
                {vendorCapabilities.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm text-slate-300">
                    <Icon name="link" className="h-4 w-4 text-rose-300" />
                    {v}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium text-slate-200">{vendorRule}</p>
            </Card>
          </Section>
          <Card>
            <div className="kicker mb-3">Do not start with</div>
            <div className="flex flex-wrap gap-1.5">
              {notFirst.avoid.map((a) => (
                <span key={a} className="rounded-md border border-rose-400/25 bg-rose-400/[0.06] px-2 py-1 text-xs text-rose-200/90 line-through decoration-rose-400/40">
                  {a}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Callout tone="brand" icon="lock" title="Cryptography rule">
        Use Ed25519 signatures through platform-supported cryptographic libraries, with KMS/HSM-backed private keys in production.
        Custom cryptography is explicitly on the “do not build” list.
      </Callout>
    </div>
  );
}
