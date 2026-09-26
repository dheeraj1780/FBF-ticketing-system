import type { IconName } from "@/types";

export interface BackendModule {
  id: string;
  name: string;
  path: string;
  icon: IconName;
  layer: "identity" | "event" | "commerce" | "ticketing" | "access" | "governance" | "support";
  responsibility: string;
  owns: string[];
  endpoints: string[];
  extractionCandidate?: string;
}

/** Section 19 backend/ modules, enriched with the entities (Section 21) and API routes (Section 32) they own. */
export const backendModules: BackendModule[] = [
  {
    id: "identity", name: "identity", path: "backend/identity/", icon: "user-cog", layer: "identity",
    responsibility: "Users, roles, permissions and device identities; integrates with Keycloak (OIDC/OAuth 2.0, RBAC, MFA).",
    owns: ["users", "roles", "permissions", "user_roles", "devices", "device_permissions"],
    endpoints: ["POST /devices/register"],
  },
  {
    id: "competitions", name: "competitions", path: "backend/competitions/", icon: "trophy", layer: "event",
    responsibility: "Create, modify, publish and manage competitions (FR-001).",
    owns: ["competitions", "teams"],
    endpoints: ["GET /competitions", "POST /competitions"],
  },
  {
    id: "matches", name: "matches", path: "backend/matches/", icon: "calendar", layer: "event",
    responsibility: "Match lifecycle: teams, date/time, stadium, capacity, categories, prices, quotas, sales windows, buyer limits (FR-002).",
    owns: ["matches"],
    endpoints: ["GET /matches", "POST /matches", "GET /matches/{match_id}"],
  },
  {
    id: "stadiums", name: "stadiums", path: "backend/stadiums/", icon: "stadium", layer: "event",
    responsibility: "Venue model — zones, blocks, rows, seats, gates and gate/zone mapping (FR-003).",
    owns: ["stadiums", "zones", "blocks", "rows", "seats", "gates", "gate_zones"],
    endpoints: ["GET /stadiums", "POST /stadiums"],
  },
  {
    id: "inventory", name: "inventory", path: "backend/inventory/", icon: "boxes", layer: "commerce",
    responsibility: "Categories, quotas, holds, reservations and availability. Seat concurrency via PostgreSQL row locks.",
    owns: ["ticket categories", "holds", "reservations"],
    endpoints: ["GET /matches/{match_id}/inventory"],
  },
  {
    id: "orders", name: "orders", path: "backend/orders/", icon: "receipt", layer: "commerce",
    responsibility: "Customer orders and order items; idempotent order creation.",
    owns: ["customers", "orders", "order_items"],
    endpoints: ["POST /orders", "GET /orders/{order_id}"],
  },
  {
    id: "payments", name: "payments", path: "backend/payments/", icon: "credit-card", layer: "commerce",
    responsibility: "PaymentProvider abstraction, idempotent webhooks, payment state machine, refunds.",
    owns: ["payments", "refunds", "payment_events"],
    endpoints: ["POST /payments/{payment_id}/confirm", "POST /payments/webhooks/{provider}"],
    extractionCandidate: "payment service",
  },
  {
    id: "tickets", name: "tickets", path: "backend/tickets/", icon: "ticket", layer: "ticketing",
    responsibility: "Issuance, Ed25519 credential signing, static/dynamic credentials, ticket lifecycle and status history.",
    owns: ["tickets", "ticket_credentials", "ticket_status_history"],
    endpoints: ["GET /tickets/{ticket_id}"],
    extractionCandidate: "ticket/redemption service",
  },
  {
    id: "redemption", name: "redemption", path: "backend/redemption/", icon: "scan", layer: "access",
    responsibility: "Atomic online redemption, batch offline sync, scan nonce deduplication and conflict detection.",
    owns: ["redemption_attempts", "redemptions", "scanner_devices", "offline_scan_events", "synchronization_batches"],
    endpoints: ["POST /redemptions", "POST /redemptions/batch", "POST /devices/{device_id}/sync"],
    extractionCandidate: "scanner synchronization service",
  },
  {
    id: "transfers", name: "transfers", path: "backend/transfers/", icon: "shuffle", layer: "ticketing",
    responsibility: "Platform-mediated ownership transfer: revoke old credential, issue new credential, audit.",
    owns: ["ticket_transfers"],
    endpoints: ["POST /tickets/{ticket_id}/transfer"],
  },
  {
    id: "audit", name: "audit", path: "backend/audit/", icon: "file-text", layer: "governance",
    responsibility: "Append-only audit, security and system events. Application can append; users cannot edit/delete.",
    owns: ["audit_events", "security_events", "system_events"],
    endpoints: ["GET /audit/events"],
  },
  {
    id: "reporting", name: "reporting", path: "backend/reporting/", icon: "bar-chart", layer: "governance",
    responsibility: "Revenue, attendance and reconciliation reports generated from transactional records or dedicated read models.",
    owns: ["read models"],
    endpoints: ["GET /reports/revenue", "GET /reports/attendance"],
    extractionCandidate: "analytics service",
  },
  {
    id: "notifications", name: "notifications", path: "backend/notifications/", icon: "bell", layer: "support",
    responsibility: "Email/SMS dispatch driven by the transactional outbox via Celery workers.",
    owns: ["outbox consumers"],
    endpoints: [],
    extractionCandidate: "notification service",
  },
];

export const monolithAdvantages = [
  "Much easier for a solo developer",
  "One transactional database",
  "Simpler debugging",
  "Fewer network failures",
  "Easier deployment",
  "Easier local development",
  "Simpler testing",
  "Lower infrastructure cost",
  "Clear future extraction boundaries",
];

export const futureServices = [
  "Payment service",
  "Ticket/redemption service",
  "Notification service",
  "Analytics service",
  "Scanner synchronization service",
];

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  note?: string;
}

export const repositoryStructure: TreeNode = {
  name: "fgf-ticketing/",
  children: [
    { name: "apps/", children: [{ name: "api/" }, { name: "worker/" }, { name: "web/" }, { name: "scanner/" }] },
    {
      name: "backend/",
      children: backendModules.map((m) => ({ name: `${m.name}/` })),
    },
    {
      name: "infrastructure/",
      children: [{ name: "docker/" }, { name: "opentofu/" }, { name: "monitoring/" }, { name: "reverse-proxy/" }],
    },
    {
      name: "docs/",
      children: [
        { name: "requirements/" }, { name: "architecture/" }, { name: "security/" }, { name: "api/" },
        { name: "operations/" }, { name: "offline/" }, { name: "adr/" },
      ],
    },
    {
      name: "tests/",
      children: [{ name: "unit/" }, { name: "integration/" }, { name: "contract/" }, { name: "performance/" }, { name: "security/" }],
    },
  ],
};

export const apiEndpoints: { method: "GET" | "POST"; path: string; module: string }[] = [
  { method: "GET", path: "/competitions", module: "competitions" },
  { method: "POST", path: "/competitions", module: "competitions" },
  { method: "GET", path: "/matches", module: "matches" },
  { method: "POST", path: "/matches", module: "matches" },
  { method: "GET", path: "/matches/{match_id}", module: "matches" },
  { method: "GET", path: "/stadiums", module: "stadiums" },
  { method: "POST", path: "/stadiums", module: "stadiums" },
  { method: "GET", path: "/matches/{match_id}/inventory", module: "inventory" },
  { method: "POST", path: "/orders", module: "orders" },
  { method: "GET", path: "/orders/{order_id}", module: "orders" },
  { method: "POST", path: "/payments/{payment_id}/confirm", module: "payments" },
  { method: "POST", path: "/payments/webhooks/{provider}", module: "payments" },
  { method: "GET", path: "/tickets/{ticket_id}", module: "tickets" },
  { method: "POST", path: "/tickets/{ticket_id}/transfer", module: "transfers" },
  { method: "POST", path: "/redemptions", module: "redemption" },
  { method: "POST", path: "/redemptions/batch", module: "redemption" },
  { method: "POST", path: "/devices/register", module: "identity" },
  { method: "POST", path: "/devices/{device_id}/sync", module: "redemption" },
  { method: "GET", path: "/reports/revenue", module: "reporting" },
  { method: "GET", path: "/reports/attendance", module: "reporting" },
  { method: "GET", path: "/audit/events", module: "audit" },
];

export const mutationChecklist = [
  "Authentication",
  "Authorization",
  "Validation",
  "Idempotency where applicable",
  "Structured errors",
  "Request ID",
  "Audit where sensitive",
];

export const idempotentOperations = [
  "Create order",
  "Payment confirmation",
  "Ticket issuance",
  "Refund",
  "Transfer",
  "Redemption submission",
  "Offline synchronization batch",
];
