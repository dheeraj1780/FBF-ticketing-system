import type { AcceptanceTest, ChecklistGroup, RoadmapPhase } from "@/types";

/** Section 43 — Development Roadmap */
export const roadmapPhases: RoadmapPhase[] = [
  { id: "p0", phase: 0, title: "Discovery and architecture", items: ["SRS", "Architecture", "Threat model", "Domain model", "State machines", "ERD", "API contract", "ADRs"], outcome: "Reviewed specification baseline" },
  { id: "p1", phase: 1, title: "Platform foundation", items: ["Repositories", "CI/CD", "Database", "Identity", "API", "Web foundation", "Observability"], outcome: "Deployable skeleton with identity and telemetry" },
  { id: "p2", phase: 2, title: "FGF administration", items: ["Competitions", "Matches", "Stadiums", "Zones", "Seats", "Gates", "Categories", "Prices", "Quotas"], outcome: "Configurable events and venues" },
  { id: "p3", phase: 3, title: "Inventory", items: ["Seat reservation", "Holds", "Expiry", "Concurrency", "Quotas"], outcome: "Concurrency-safe inventory" },
  { id: "p4", phase: 4, title: "Checkout/payment", items: ["Orders", "Payment adapter", "Webhook handling", "Idempotency", "Reconciliation"], outcome: "Idempotent paid orders" },
  { id: "p5", phase: 5, title: "Ticket engine", items: ["Issuance", "Credential signing", "Ticket lifecycle", "Cancellation", "Refund"], outcome: "Signed tickets with full lifecycle" },
  { id: "p6", phase: 6, title: "Online scanner", items: ["Flutter app", "Device enrollment", "Gate assignment", "Online validation", "Atomic redemption"], outcome: "Strongly consistent gate entry" },
  { id: "p7", phase: 7, title: "Offline scanner", items: ["Local database", "Signed manifests", "Offline validation", "Scan journal", "Synchronization", "Conflict handling"], outcome: "Resilient disconnected gates" },
  { id: "p8", phase: 8, title: "Reporting/finance", items: ["Revenue", "Attendance", "Reconciliation", "Exports", "Dashboards"], outcome: "Auditable financial picture" },
  { id: "p9", phase: 9, title: "Security hardening", items: ["Threat-model review", "Automated security tests", "Load testing", "Penetration testing", "Backup restore testing"], outcome: "Independently verified platform" },
  { id: "p10", phase: 10, title: "Pilot", items: ["Limited match", "Limited gates", "Real payment", "Real scanners", "Controlled audience", "Incident review"], outcome: "Validated in real conditions" },
  { id: "p11", phase: 11, title: "Production", items: ["Operational runbook", "Match-day support", "SLA", "Monitoring", "DR", "Final acceptance"], outcome: "Accepted production platform" },
];

/** Section 52 — Recommended V1 Scope */
export const scopeTiers: { tier: string; tagline: string; items: string[] }[] = [
  {
    tier: "V1 — Must-have",
    tagline: "Sell → Pay → Issue → Scan → Redeem → Report",
    items: [
      "FGF admin", "Competitions", "Matches", "Stadiums", "Zones", "Seats", "Ticket categories",
      "Pricing", "Quotas", "Customer web", "Orders", "Payment integration", "Secure ticket issuance",
      "QR credential", "Scanner application", "Online redemption", "Audit", "Reports",
      "Financial reconciliation", "Monitoring", "Backups",
    ],
  },
  {
    tier: "V1.5",
    tagline: "Resilience & mobile security",
    items: ["Offline scanner", "Dynamic mobile credentials", "Transfer", "Refunds automation", "Physical POS"],
  },
  {
    tier: "V2",
    tagline: "Scale & ecosystem",
    items: [
      "Advanced resale", "Multiple payment providers", "Multiple stadiums at scale", "Advanced analytics",
      "Mobile wallet integrations", "Automated accounting integrations", "Advanced fraud analytics",
    ],
  },
];

/** Section 54 — End-to-end implementation flow (ordered chain with parallel branches). */
export const implementationFlow: { id: string; label: string; after: string[] }[] = [
  { id: "A", label: "FGF Requirements", after: [] },
  { id: "B", label: "SRS", after: ["A"] },
  { id: "C", label: "Domain Model", after: ["B"] },
  { id: "D", label: "Threat Model", after: ["C"] },
  { id: "E", label: "Architecture", after: ["D"] },
  { id: "F", label: "Database Design", after: ["E"] },
  { id: "G", label: "API Contract", after: ["E"] },
  { id: "H", label: "Scanner Protocol", after: ["E"] },
  { id: "I", label: "Backend Foundation", after: ["F", "G", "H"] },
  { id: "J", label: "Identity / RBAC", after: ["I"] },
  { id: "K", label: "Competition & Match", after: ["J"] },
  { id: "L", label: "Stadium & Seat Model", after: ["K"] },
  { id: "M", label: "Inventory Engine", after: ["L"] },
  { id: "N", label: "Customer Checkout", after: ["M"] },
  { id: "O", label: "Payment Integration", after: ["N"] },
  { id: "P", label: "Ticket Issuance", after: ["O"] },
  { id: "Q", label: "Online Scanner", after: ["P"] },
  { id: "R", label: "Atomic Redemption", after: ["Q"] },
  { id: "S", label: "Audit", after: ["R"] },
  { id: "T", label: "Reporting", after: ["S"] },
  { id: "U", label: "Financial Reconciliation", after: ["T"] },
  { id: "V", label: "Offline Architecture", after: ["R"] },
  { id: "W", label: "Offline Scanner", after: ["V"] },
  { id: "X", label: "Synchronization", after: ["W"] },
  { id: "Y", label: "Conflict Detection", after: ["X"] },
  { id: "Z", label: "Load Testing", after: ["U", "Y"] },
  { id: "AA", label: "Security Testing", after: ["Z"] },
  { id: "AB", label: "Pilot", after: ["AA"] },
  { id: "AC", label: "Production", after: ["AB"] },
];

/** Section 44 — Testing Strategy */
export const testingStrategy: ChecklistGroup[] = [
  { title: "Unit tests", items: ["Ticket states", "Inventory", "Payment", "Redemption", "Transfers", "Quotas"] },
  { title: "Integration tests", items: ["PostgreSQL", "Keycloak", "Payment sandbox", "Redis", "Object storage"] },
  { title: "Contract tests", items: ["Payment provider webhooks", "External APIs"] },
  {
    title: "Concurrency tests",
    items: ["Two users purchasing one seat", "Two scanners scanning one ticket", "Simultaneous refund and entry", "Simultaneous transfer and entry"],
  },
  {
    title: "Offline tests",
    items: ["Device loses connection", "Duplicate scan", "Device clock incorrect", "Sync interruption", "Partial sync", "Conflict", "Device revoked while offline"],
  },
  { title: "Load tests (k6)", items: ["Ticket-sale opening", "Checkout spikes", "Scan spikes", "Dashboard load"] },
];

/** Section 45 — Critical Acceptance Tests */
export const acceptanceTests: AcceptanceTest[] = [
  { id: "AT-001", title: "Duplicate online scan", steps: ["Ticket X", "Scanner A → accepted", "Scanner B → rejected"], outcome: "Second scan rejected" },
  { id: "AT-002", title: "Simultaneous scan", steps: ["Scanner A ┐", "same ticket", "Scanner B ┘"], outcome: "Exactly one successful redemption" },
  { id: "AT-003", title: "Payment retry", steps: ["same webhook × 5"], outcome: "One payment, one ticket" },
  { id: "AT-004", title: "Refund", steps: ["Paid ticket", "Refund", "Ticket invalid"], outcome: "Gate rejects" },
  { id: "AT-005", title: "Transfer", steps: ["Old credential → invalid", "New credential → valid"], outcome: "Only new holder can enter" },
  { id: "AT-006", title: "Offline", steps: ["Device loses Internet", "Valid provisioned ticket", "Scanner still works", "Reconnect"], outcome: "Scan journal synchronizes" },
  { id: "AT-007", title: "Revoked device", steps: ["Device stolen", "Admin revokes device"], outcome: "Device cannot synchronize/use protected operations" },
];

/** Section 50 — Documentation set */
export const documentationSet: { folder: string; files: string[] }[] = [
  { folder: "01-product", files: ["project-charter.md", "scope.md", "stakeholder-register.md"] },
  { folder: "02-requirements", files: ["SRS.md", "functional-requirements.md", "non-functional-requirements.md", "acceptance-criteria.md"] },
  { folder: "03-domain", files: ["domain-model.md", "ticket-state-machine.md", "payment-state-machine.md", "redemption-state-machine.md"] },
  { folder: "04-architecture", files: ["system-architecture.md", "deployment-architecture.md", "database-architecture.md", "integration-architecture.md"] },
  { folder: "05-security", files: ["threat-model.md", "security-architecture.md", "key-management.md", "security-test-plan.md"] },
  { folder: "06-api", files: ["openapi.yaml", "api-guidelines.md"] },
  { folder: "07-offline", files: ["offline-architecture.md", "synchronization.md", "conflict-resolution.md"] },
  { folder: "08-operations", files: ["deployment.md", "monitoring.md", "backup-restore.md", "disaster-recovery.md", "match-day-runbook.md"] },
  { folder: "09-testing", files: ["test-strategy.md", "performance-plan.md", "security-plan.md"] },
  { folder: "10-adr", files: ["ADR-001-modular-monolith.md", "ADR-002-postgresql.md", "ADR-003-keycloak.md", "ADR-004-dynamic-credentials.md", "ADR-005-offline-validation.md", "ADR-006-no-kubernetes-v1.md"] },
];
