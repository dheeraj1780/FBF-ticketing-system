import type { TechStackCategory } from "@/types";

/** Section 17 — Recommended Technology Stack */
export const techStack: TechStackCategory[] = [
  {
    category: "Backend",
    icon: "server",
    items: [{ name: "Python" }, { name: "FastAPI" }, { name: "Pydantic" }, { name: "SQLAlchemy 2.x" }, { name: "Alembic" }, { name: "asyncpg" }],
  },
  {
    category: "Database",
    icon: "database",
    items: [{ name: "PostgreSQL", note: "Source of truth for transactional state" }],
  },
  {
    category: "Identity",
    icon: "key",
    items: [{ name: "Keycloak" }, { name: "OpenID Connect" }, { name: "OAuth 2.0" }, { name: "RBAC" }, { name: "MFA", note: "for sensitive roles" }],
  },
  {
    category: "Frontend",
    icon: "monitor",
    items: [{ name: "Next.js" }, { name: "TypeScript" }, { name: "Tailwind CSS" }, { name: "shadcn/ui" }, { name: "TanStack Query" }, { name: "React Hook Form" }, { name: "Zod" }],
  },
  {
    category: "Scanner",
    icon: "scan",
    items: [{ name: "Flutter" }, { name: "Dart" }, { name: "SQLite" }],
  },
  {
    category: "Async processing",
    icon: "cpu",
    items: [{ name: "Celery" }, { name: "Redis" }],
  },
  {
    category: "Cryptography",
    icon: "lock",
    items: [{ name: "Ed25519 signatures" }, { name: "Platform-supported crypto libraries" }, { name: "KMS/HSM-backed private keys", note: "in production" }],
  },
  {
    category: "Storage",
    icon: "package",
    items: [{ name: "S3-compatible storage" }, { name: "MinIO", note: "where self-hosted object storage is appropriate" }],
  },
  {
    category: "Observability",
    icon: "activity",
    items: [{ name: "OpenTelemetry" }, { name: "Prometheus" }, { name: "Grafana" }, { name: "Loki" }, { name: "Tempo" }],
  },
  {
    category: "Infrastructure",
    icon: "cloud",
    items: [{ name: "Linux" }, { name: "Docker/OCI" }, { name: "Caddy or Nginx" }, { name: "OpenTofu" }, { name: "GitHub Actions" }],
  },
  {
    category: "Testing",
    icon: "clipboard-check",
    items: [{ name: "Pytest" }, { name: "Playwright" }, { name: "Schemathesis" }, { name: "k6" }, { name: "Flutter unit/integration tests" }, { name: "OWASP ZAP" }, { name: "Independent penetration testing" }],
  },
];

/** Section 40 — Open-source preferences */
export const openSourcePreferences = [
  { capability: "Database", preferred: "PostgreSQL" },
  { capability: "Identity", preferred: "Keycloak" },
  { capability: "Backend", preferred: "FastAPI" },
  { capability: "ORM", preferred: "SQLAlchemy" },
  { capability: "Web", preferred: "Next.js" },
  { capability: "Scanner", preferred: "Flutter" },
  { capability: "Cache", preferred: "Redis" },
  { capability: "Jobs", preferred: "Celery" },
  { capability: "Monitoring", preferred: "Prometheus" },
  { capability: "Dashboards", preferred: "Grafana" },
  { capability: "Logs", preferred: "Loki" },
  { capability: "Traces", preferred: "Tempo" },
  { capability: "Telemetry", preferred: "OpenTelemetry" },
  { capability: "IaC", preferred: "OpenTofu" },
  { capability: "Reverse proxy", preferred: "Caddy/Nginx" },
];

export const vendorCapabilities = [
  "Payment gateway",
  "SMS provider",
  "Email delivery",
  "Cloud infrastructure",
  "Domain/DNS",
  "Optional CDN/WAF",
  "Optional KMS/HSM",
];

export const vendorRule = "The architecture must isolate each vendor behind an adapter/interface.";
