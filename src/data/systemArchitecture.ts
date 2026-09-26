import type { ArchitectureGraph } from "@/types";

/** Section 16 — Proposed System Architecture */
export const systemArchitecture: ArchitectureGraph = {
  columns: 5,
  rows: 5,
  groups: [
    { id: "clients", label: "Clients", colStart: 0, colEnd: 0, rowStart: 0, rowEnd: 3, tone: "brand" },
    { id: "edge", label: "Edge", colStart: 1, colEnd: 1, rowStart: 0, rowEnd: 1, tone: "slate" },
    { id: "platform", label: "Platform", colStart: 2, colEnd: 2, rowStart: 0, rowEnd: 4, tone: "violet" },
    { id: "data", label: "Core DB & Storage", colStart: 3, colEnd: 3, rowStart: 0, rowEnd: 1, tone: "amber" },
    { id: "external", label: "External", colStart: 3, colEnd: 3, rowStart: 2, rowEnd: 4, tone: "rose" },
    { id: "observability", label: "Observability", colStart: 4, colEnd: 4, rowStart: 0, rowEnd: 4, tone: "slate" },
  ],
  nodes: [
    // Clients
    {
      id: "customer-web", label: "Customer Web", sublabel: "Next.js", icon: "globe", col: 0, row: 0, kind: "client", group: "clients",
      description: "Mobile-first, low-bandwidth friendly public ticket shop where customers browse, buy and hold tickets.",
      detail: ["Next.js + TypeScript + Tailwind", "TanStack Query, React Hook Form, Zod", "Reaches the platform via DNS/CDN"],
    },
    {
      id: "admin-web", label: "FGF Admin Web", sublabel: "Next.js", icon: "monitor", col: 0, row: 1, kind: "client", group: "clients",
      description: "Back-office for competitions, matches, stadiums, pricing, quotas, reports, audit and user management.",
      detail: ["Role-based UI backed by Keycloak RBAC", "MFA for sensitive administrative roles"],
    },
    {
      id: "scanner", label: "Flutter Scanner", sublabel: "Dart + SQLite", icon: "scan", col: 0, row: 2, kind: "client", group: "clients",
      description: "Enrolled gate device that validates credentials online and, when disconnected, offline against signed manifests.",
      detail: ["Explicitly enrolled device identity + keypair", "Local SQLite scan journal", "Never holds the signing private key"],
    },
    {
      id: "pos", label: "POS Application", icon: "receipt", col: 0, row: 3, kind: "client", group: "clients",
      description: "Physical points of sale use the same central inventory/payment/ticket platform (FR-014).",
      detail: ["Same central inventory", "Same payment and ticket engine"],
    },
    // Edge
    {
      id: "cdn", label: "DNS / CDN", icon: "cloud", col: 1, row: 0, kind: "edge", group: "edge",
      description: "Domain, DNS and optional CDN in front of web clients. Controlled by FGF (Section 49).",
      detail: ["FGF-owned domain and DNS", "Optional CDN (vendor behind adapter)"],
    },
    {
      id: "waf", label: "WAF / Reverse Proxy", sublabel: "Caddy / Nginx", icon: "shield", col: 1, row: 1, kind: "edge", group: "edge",
      description: "TLS termination, WAF rules and rate limiting — the first security layers in front of the API.",
      detail: ["TLS", "WAF / reverse proxy", "Rate limiting"],
    },
    // Platform
    {
      id: "api", label: "FastAPI API", sublabel: "Modular monolith", icon: "server", col: 2, row: 1, kind: "service", group: "platform",
      description: "Single deployable application containing strict domain modules: identity, competitions, matches, stadiums, inventory, orders, payments, tickets, redemption, transfers, audit, reporting and notifications.",
      detail: ["Python, FastAPI, Pydantic", "SQLAlchemy 2.x, Alembic, asyncpg", "Base path /api/v1", "Idempotency keys on critical mutations"],
    },
    {
      id: "keycloak", label: "Keycloak", sublabel: "OIDC / OAuth 2.0", icon: "key", col: 2, row: 0, kind: "service", group: "platform",
      description: "Identity provider — avoids building authentication from scratch (ADR-003). RBAC and MFA for sensitive roles.",
      detail: ["OpenID Connect", "OAuth 2.0", "RBAC", "MFA for sensitive roles"],
    },
    {
      id: "redis", label: "Redis", icon: "zap", col: 2, row: 2, kind: "service", group: "platform",
      description: "Cache and Celery broker. Never the sole source of inventory correctness — PostgreSQL remains the source of truth.",
      detail: ["Caching", "Celery broker", "Not authoritative for inventory"],
    },
    {
      id: "outbox", label: "Transactional Outbox", icon: "send", col: 2, row: 3, kind: "service", group: "platform",
      description: "Outbox events are written in the same PostgreSQL transaction as the business state change, then published after commit.",
      detail: ["Avoids external broker for core correctness", "Feeds email, reporting, notifications, integrations"],
    },
    {
      id: "workers", label: "Celery Workers", icon: "cpu", col: 2, row: 4, kind: "service", group: "platform",
      description: "Asynchronous workers consuming outbox events: notifications, reporting read models and external integrations.",
      detail: ["Celery", "Redis broker", "Email/SMS dispatch"],
    },
    // Data
    {
      id: "postgres", label: "PostgreSQL", sublabel: "System of record", icon: "database", col: 3, row: 0, kind: "store", group: "data",
      description: "Source of truth for all transactional state: inventory, orders, payments, tickets, redemptions and audit (ADR-002).",
      detail: ["Row locking (SELECT … FOR UPDATE)", "Constraints & transaction isolation", "Outbox table"],
    },
    {
      id: "storage", label: "Object Storage", sublabel: "S3-compatible / MinIO", icon: "package", col: 3, row: 1, kind: "store", group: "data",
      description: "S3-compatible object storage for exports, documents and backups; MinIO where self-hosting is appropriate.",
      detail: ["S3-compatible API", "MinIO for self-hosted"],
    },
    // External
    {
      id: "payment-gateway", label: "Payment Gateway", icon: "credit-card", col: 3, row: 2, kind: "external", group: "external",
      description: "Card, mobile-money and banking providers, isolated behind the PaymentProvider abstraction. Webhooks must be idempotent.",
      detail: ["create_payment / verify_payment / refund / parse_webhook", "Hosted/tokenized — avoid storing card data"],
    },
    {
      id: "messaging", label: "Email / SMS Provider", icon: "bell", col: 3, row: 3, kind: "external", group: "external",
      description: "Notification vendors invoked only by workers, never inside the core transaction.",
      detail: ["Vendor behind adapter", "Triggered from outbox"],
    },
    {
      id: "accounting", label: "Accounting System", icon: "landmark", col: 3, row: 4, kind: "external", group: "external",
      description: "Future accounting and partner integrations via secure APIs (FR-015).",
      detail: ["Exports & reconciliation feeds", "Automated integration in V2"],
    },
    // Observability
    {
      id: "otel", label: "OpenTelemetry", icon: "activity", col: 4, row: 0, kind: "observability", group: "observability",
      description: "Unified instrumentation for logs, metrics and traces with a correlation/request ID on every request.",
      detail: ["Every request carries a request ID", "Every redemption is traceable end-to-end"],
    },
    {
      id: "prometheus", label: "Prometheus", icon: "gauge", col: 4, row: 1, kind: "observability", group: "observability",
      description: "Metrics collection: API latency (P95/P99), scan rate, rejected scans, device health.",
    },
    {
      id: "loki", label: "Loki", icon: "file-text", col: 4, row: 2, kind: "observability", group: "observability",
      description: "Structured log aggregation.",
    },
    {
      id: "tempo", label: "Tempo", icon: "route", col: 4, row: 3, kind: "observability", group: "observability",
      description: "Distributed tracing backend.",
    },
    {
      id: "grafana", label: "Grafana", icon: "bar-chart", col: 4, row: 4, kind: "observability", group: "observability",
      description: "Dashboards and alerting over metrics, logs and traces — used heavily on match day.",
    },
  ],
  edges: [
    { from: "customer-web", to: "cdn" },
    { from: "admin-web", to: "cdn" },
    { from: "scanner", to: "waf" },
    { from: "pos", to: "waf" },
    { from: "cdn", to: "waf" },
    { from: "waf", to: "api" },
    { from: "api", to: "keycloak" },
    { from: "api", to: "postgres" },
    { from: "api", to: "redis" },
    { from: "api", to: "outbox" },
    { from: "outbox", to: "workers" },
    { from: "workers", to: "messaging" },
    { from: "api", to: "payment-gateway" },
    { from: "api", to: "accounting", dashed: true },
    { from: "api", to: "storage" },
    { from: "api", to: "otel", dashed: true },
    { from: "otel", to: "prometheus" },
    { from: "otel", to: "loki" },
    { from: "otel", to: "tempo" },
    { from: "prometheus", to: "grafana" },
    { from: "loki", to: "grafana" },
    { from: "tempo", to: "grafana" },
  ],
};

/** Section 37 — Infrastructure strategy */
export const environments = [
  {
    id: "development",
    label: "Development",
    tagline: "Developer laptop",
    stack: ["Docker Compose", "PostgreSQL", "Redis", "Keycloak", "API / Web"],
  },
  {
    id: "staging",
    label: "Staging",
    tagline: "Internet → Reverse Proxy → API/Web → PostgreSQL → Redis/Workers",
    stack: ["Internet", "Reverse Proxy", "API / Web", "PostgreSQL", "Redis / Workers"],
  },
  {
    id: "production",
    label: "Production",
    tagline: "Start small but highly observable. Scale only after load testing.",
    stack: ["Load Balancer", "API 1", "API 2", "PostgreSQL", "Redis", "Workers"],
  },
];

/** Section 38/39 decisions */
export const infraDecisions = [
  {
    title: "Kubernetes",
    verdict: "Not required for V1",
    reasons: [
      "Operational complexity",
      "Larger attack surface",
      "More infrastructure work",
      "Unnecessary for early scale",
      "Distracts from ticketing correctness",
    ],
    note: "Use containers so Kubernetes remains possible later.",
  },
  {
    title: "Kafka",
    verdict: "Not required initially",
    reasons: ["PostgreSQL", "Transactional outbox", "Celery", "Redis"],
    note: "Introduce Kafka only if measured throughput or integration requirements justify it.",
  },
];

/** Section 34 — Transactional outbox */
export const outboxGraph: ArchitectureGraph = {
  columns: 5,
  rows: 4,
  nodes: [
    { id: "biz-tx", label: "Business transaction", description: "e.g. payment captured → ticket issued.", icon: "workflow", col: 0, row: 1 },
    { id: "pg-tx", label: "PostgreSQL transaction", description: "Single ACID transaction wrapping both writes.", icon: "database", col: 1, row: 1 },
    { id: "state-change", label: "Business state change", description: "Rows for order, payment and ticket are updated.", icon: "layers", col: 2, row: 0 },
    { id: "outbox-event", label: "Outbox event", description: "An outbox row is inserted in the same transaction.", icon: "send", col: 2, row: 2 },
    { id: "commit", label: "COMMIT", description: "Both writes become durable atomically, or neither does.", icon: "check-circle", col: 3, row: 1 },
    { id: "worker", label: "Outbox worker", description: "Polls committed outbox rows and dispatches side-effects.", icon: "cpu", col: 3, row: 2 },
    { id: "email", label: "Email", description: "Customer confirmation emails.", icon: "send", col: 4, row: 0 },
    { id: "reporting", label: "Reporting", description: "Read models and dashboards.", icon: "bar-chart", col: 4, row: 1 },
    { id: "notifications", label: "Notifications", description: "SMS / push notifications.", icon: "bell", col: 4, row: 2 },
    { id: "integration", label: "External integration", description: "Accounting and partner systems.", icon: "link", col: 4, row: 3 },
  ],
  edges: [
    { from: "biz-tx", to: "pg-tx" },
    { from: "pg-tx", to: "state-change" },
    { from: "pg-tx", to: "outbox-event" },
    { from: "state-change", to: "commit" },
    { from: "outbox-event", to: "commit" },
    { from: "commit", to: "worker" },
    { from: "worker", to: "notifications" },
    { from: "worker", to: "reporting" },
    { from: "worker", to: "email" },
    { from: "worker", to: "integration" },
  ],
};

export const traceChain = ["Customer", "Ticket", "Order", "Payment", "Credential", "Device", "Gate", "Redemption"];
