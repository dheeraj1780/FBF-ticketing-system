import type { ArchitectureGraph, FraudRule, IconName } from "@/types";

/** Section 36 — Security Architecture */
export const securityGraph: ArchitectureGraph = {
  columns: 4,
  rows: 4,
  groups: [
    { id: "actors", label: "Actors", colStart: 0, colEnd: 0, rowStart: 0, rowEnd: 3, tone: "slate" },
    { id: "trust", label: "Trusted platform zone", colStart: 2, colEnd: 3, rowStart: 0, rowEnd: 3, tone: "brand" },
  ],
  nodes: [
    { id: "customer", label: "Customer", icon: "user", col: 0, row: 0, kind: "client", group: "actors", description: "Authenticates through Keycloak." },
    { id: "admin", label: "Admin User", icon: "user-cog", col: 0, row: 1, kind: "client", group: "actors", description: "Sensitive roles require MFA (FR-009)." },
    { id: "scanner", label: "Scanner Device", icon: "scan", col: 0, row: 2, kind: "client", group: "actors", description: "Enrolled device identity with device-scoped permissions." },
    { id: "user-device", label: "User / Device traffic", icon: "globe", col: 0, row: 3, kind: "client", group: "actors", description: "All inbound traffic passes through the WAF / reverse proxy." },
    { id: "waf", label: "WAF / Reverse Proxy", icon: "shield", col: 1, row: 3, kind: "edge", description: "TLS termination, WAF, rate limiting." },
    { id: "auth", label: "Keycloak", icon: "key", col: 1, row: 0, kind: "service", description: "Authentication & MFA. Custom identity providers are explicitly out of scope." },
    { id: "api", label: "API", icon: "server", col: 2, row: 2, kind: "service", group: "trust", description: "Authorization, validation, idempotency, rate limits and structured errors on every mutation." },
    { id: "db", label: "PostgreSQL", icon: "database", col: 3, row: 0, kind: "store", group: "trust", description: "Database constraints + transaction isolation." },
    { id: "redis", label: "Redis", icon: "zap", col: 3, row: 1, kind: "store", group: "trust", description: "Cache/broker — not a source of truth." },
    { id: "storage", label: "Object Storage", icon: "package", col: 3, row: 2, kind: "store", group: "trust", description: "Exports and backups." },
    { id: "audit", label: "Audit Pipeline", icon: "file-text", col: 2, row: 3, kind: "service", group: "trust", description: "Append-only: application can append; users cannot edit/delete." },
    { id: "logs", label: "Protected Logs", icon: "lock", col: 3, row: 3, kind: "store", group: "trust", description: "For stronger environments, forward to separately controlled storage." },
  ],
  edges: [
    { from: "user-device", to: "waf" },
    { from: "waf", to: "api" },
    { from: "api", to: "auth" },
    { from: "api", to: "db" },
    { from: "api", to: "redis" },
    { from: "api", to: "storage" },
    { from: "api", to: "audit" },
    { from: "audit", to: "logs" },
    { from: "admin", to: "auth" },
    { from: "scanner", to: "auth" },
    { from: "customer", to: "auth" },
  ],
};

export const securityLayers: { name: string; icon: IconName; note: string }[] = [
  { name: "TLS", icon: "lock", note: "Encrypted transport everywhere." },
  { name: "WAF / reverse proxy", icon: "shield", note: "Caddy or Nginx at the edge; optional vendor WAF." },
  { name: "Authentication", icon: "key", note: "Keycloak, OIDC/OAuth 2.0, MFA for sensitive roles." },
  { name: "Authorization", icon: "user-check", note: "RBAC and device-scoped permissions; least privilege." },
  { name: "Input validation", icon: "clipboard-check", note: "Pydantic / Zod schemas at every boundary." },
  { name: "Rate limiting", icon: "gauge", note: "Throttle abusive order, payment and scan attempts." },
  { name: "Database constraints", icon: "database", note: "Uniqueness and foreign keys enforce invariants." },
  { name: "Transaction isolation", icon: "layers", note: "Row locks for seats, payments and redemptions." },
  { name: "Audit", icon: "file-text", note: "Append-only audit events for every sensitive action." },
  { name: "Secrets management", icon: "key", note: "KMS/HSM-backed signing keys in production." },
  { name: "Monitoring", icon: "activity", note: "OpenTelemetry → Prometheus / Loki / Tempo / Grafana." },
  { name: "Backups", icon: "download", note: "Defined RPO/RTO, restore testing." },
  { name: "Independent security testing", icon: "shield-check", note: "OWASP ZAP + independent penetration testing." },
];

export const securityStandards = [
  "OWASP ASVS",
  "OWASP API Security guidance",
  "OWASP MASVS principles for mobile",
  "Secure secrets management",
  "Least privilege",
  "Threat modelling",
  "Independent penetration testing",
];

export const auditFields = [
  "event_id", "timestamp", "actor_type", "actor_id", "device_id", "action",
  "resource_type", "resource_id", "request_id", "before_state", "after_state",
  "result", "reason", "ip", "metadata",
];

export const auditedOperations = [
  "Ticket creation", "Ticket modification", "Cancellation", "Refund", "Price changes",
  "Configuration changes", "Sale", "Scan", "Fraud attempt", "User creation",
  "Permission changes", "Administrator login",
];

export const dataProtection = {
  principles: [
    "Data minimization", "Purpose limitation", "Encryption", "Retention policy",
    "Deletion/anonymization workflow", "Access control", "Audit",
    "Processor/vendor contracts", "Incident response",
  ],
  note: "Do not store payment-card data if the selected payment architecture allows tokenized/hosted payment processing.",
  legal: "The final production design should be reviewed by legal/compliance specialists for the actual jurisdictions and payment arrangements involved.",
};

export const ownership = {
  controls: [
    "Source repository", "Production cloud accounts", "DNS", "Database",
    "Encryption/key-management accounts where appropriate", "Monitoring", "Backups",
    "Domain", "Payment accounts", "Documentation",
  ],
  rule: "The development vendor should not be the sole holder of production credentials.",
};

/** Section 31 — Fraud and Abuse Controls */
export const fraudRules: FraudRule[] = [
  {
    category: "Customer-side",
    icon: "user",
    rules: [
      "Excessive order attempts",
      "Excessive payment failures",
      "Abnormal ticket reservation rate",
      "Account/device abuse",
      "Transfer abuse",
    ],
  },
  {
    category: "Ticket-side",
    icon: "ticket",
    rules: [
      "Repeated scan attempts",
      "Credential replay",
      "Invalid signature",
      "Revoked credential",
      "Wrong event",
      "Wrong gate",
      "Wrong zone",
      "Suspicious device",
    ],
  },
  {
    category: "Administrative",
    icon: "user-cog",
    rules: [
      "Unusual refunds",
      "Unusual price changes",
      "Mass ticket cancellation",
      "Repeated privilege escalation",
      "Unusual manual ticket issuance",
      "Deletion attempts",
      "Configuration changes immediately before events",
    ],
  },
];

export const fraudPolicy =
  "Do not automatically block users solely because a rule fired. Record the reason and route according to an explicit policy.";

/** Threats from Section 1.1 mapped to the controls described throughout the blueprint. */
export const threatControls: { threat: string; controls: string[] }[] = [
  { threat: "Counterfeit tickets", controls: ["Ed25519-signed credentials", "Server-side ticket state"] },
  { threat: "Ticket duplication", controls: ["Atomic redemption (row lock)", "Scan nonce dedupe"] },
  { threat: "Photocopy / reproduction", controls: ["Dynamic rotating QR (Mode B)", "Single-use redemption"] },
  { threat: "Fraudulent resale", controls: ["Platform-only transfer", "Old credential revoked on transfer"] },
  { threat: "Multiple use of one ticket", controls: ["REDEEMED terminal state", "Offline conflict detection"] },
  { threat: "Revenue diversion", controls: ["Idempotent payments", "Financial reconciliation", "Audit"] },
  { threat: "Lack of sales traceability", controls: ["Append-only audit events", "Request/correlation IDs"] },
  { threat: "Difficulty monitoring entry", controls: ["Live scan-rate & occupancy dashboards"] },
  { threat: "Reconciliation errors", controls: ["Reports from transactional records", "No manually edited totals"] },
];
