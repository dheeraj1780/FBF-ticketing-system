import type { IconName } from "@/types";

export interface NavItem {
  path: string;
  title: string;
  short: string;
  icon: IconName;
  blueprint: string;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Foundation",
    items: [
      { path: "/", title: "Overview", short: "Overview", icon: "flag", blueprint: "§0–2, §53, §55", description: "Executive summary, business objective, scope and core principle." },
      { path: "/requirements", title: "Requirements", short: "Requirements", icon: "clipboard", blueprint: "§6–7", description: "Functional and non-functional requirements and stakeholders." },
      { path: "/traceability", title: "Requirements Traceability", short: "Traceability", icon: "link", blueprint: "§6–7, §43, §45", description: "Requirement → component → phase → acceptance test matrix." },
    ],
  },
  {
    label: "Business",
    items: [
      { path: "/journey", title: "User Journey", short: "User journey", icon: "route", blueprint: "§3–4", description: "Customer purchase and match-day entry flows." },
      { path: "/business", title: "Business Architecture", short: "Business", icon: "boxes", blueprint: "§5", description: "Business lifecycle and eight business domains." },
    ],
  },
  {
    label: "Architecture",
    items: [
      { path: "/architecture", title: "Technical Architecture", short: "Technical", icon: "network", blueprint: "§16, §34–35, §37–39", description: "System architecture, outbox, observability and infrastructure." },
      { path: "/backend", title: "Backend Modules", short: "Backend", icon: "layers", blueprint: "§18–19, §32–33", description: "Modular monolith modules, API surface and repository structure." },
      { path: "/data-model", title: "Data Model", short: "Data model", icon: "database", blueprint: "§20–21", description: "Entity relationships and core tables." },
      { path: "/stack", title: "Technology Stack", short: "Tech stack", icon: "package", blueprint: "§17, §40", description: "Recommended technologies and vendor strategy." },
    ],
  },
  {
    label: "Ticketing core",
    items: [
      { path: "/lifecycle", title: "Ticket Lifecycle", short: "Lifecycle", icon: "workflow", blueprint: "§8–10", description: "Ticket, payment and redemption state machines." },
      { path: "/payments", title: "Payment Flow", short: "Payments", icon: "credit-card", blueprint: "§22–23, §41", description: "Payment sequence, idempotency, inventory concurrency and provider abstraction." },
      { path: "/ticket-security", title: "Ticket Security", short: "Ticket security", icon: "qr", blueprint: "§11, §28–29", description: "Signed credentials, dynamic QR and transfers." },
      { path: "/scanner", title: "Scanner & Access Control", short: "Scanner", icon: "scan", blueprint: "§24–27, §42", description: "Online and offline scanner flows and device security." },
      { path: "/stadium", title: "Stadium Model", short: "Stadium", icon: "stadium", blueprint: "§5.2 B, FR-003", description: "Venue hierarchy, zones, gates and access rules." },
    ],
  },
  {
    label: "Trust & operations",
    items: [
      { path: "/security", title: "Security Architecture", short: "Security", icon: "shield", blueprint: "§30, §36, §48–49", description: "Security layers, audit, data protection and ownership." },
      { path: "/fraud", title: "Fraud & Abuse", short: "Fraud & abuse", icon: "shield-alert", blueprint: "§1.1, §31", description: "Fraud rule set and threat-to-control mapping." },
      { path: "/finance", title: "Financial Reconciliation", short: "Finance", icon: "landmark", blueprint: "FR-011, FR-012", description: "Reconciliation chain and reporting." },
      { path: "/match-day", title: "Match-Day Operations", short: "Match day", icon: "calendar", blueprint: "§46–47", description: "Operational flow and incident categories." },
    ],
  },
  {
    label: "Delivery",
    items: [
      { path: "/roadmap", title: "Implementation Roadmap", short: "Roadmap", icon: "git-branch", blueprint: "§43–45, §52, §54", description: "Phases, scope tiers, testing and acceptance tests." },
      { path: "/industry", title: "Industry Patterns", short: "Industry", icon: "trending-up", blueprint: "§12–15", description: "Benchmarks and pattern decisions." },
      { path: "/decisions", title: "Architecture Decisions", short: "ADRs", icon: "book", blueprint: "§38–39, §51", description: "Architecture decision records." },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

/** Maps a section title used in requirement traceability to its route. */
export const sectionRoutes: Record<string, string> = {
  ...Object.fromEntries(allNavItems.map((i) => [i.title, i.path])),
  "Testing & Acceptance": "/roadmap",
};
