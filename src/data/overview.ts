export const executiveSummary = {
  posture:
    "API-first, open-source-first, modular monolith, production-oriented",
  status: "Proposed Architecture / Pre-Implementation Baseline",
  version: "1.0",
  source: "Fédération Guinéenne de Football (FGF) digital ticketing specification",
  intro:
    "The FGF project is not merely a QR-code ticketing website. It is a complete stadium ticketing and access-control platform.",
  coverage: [
    "Competitions and matches",
    "Stadium / seat configuration",
    "Ticket inventory",
    "Pricing and quotas",
    "Customer checkout",
    "Payment integration",
    "Ticket issuance",
    "Secure mobile tickets",
    "QR / dynamic credentials",
    "Gate scanning",
    "Online and offline validation",
    "Ticket redemption",
    "Transfers",
    "Refunds / cancellations",
    "Financial reconciliation",
    "Auditability",
    "Dashboards and reporting",
    "Role-based administration",
    "Multi-stadium expansion",
    "Operational support",
  ],
  lifecycle: [
    "Match creation",
    "Stadium configuration",
    "Categories / pricing",
    "Sales",
    "Payment",
    "Ticket issuance",
    "Access control",
    "Attendance",
    "Revenue",
    "Reporting / audit",
  ],
  recommendation:
    "Modular monolith + PostgreSQL + FastAPI + Next.js + Flutter scanner + Keycloak + Redis + Celery + OpenTelemetry + Prometheus/Grafana/Loki/Tempo + containerized deployment.",
  rationale:
    "The design deliberately avoids premature microservices and Kubernetes. The objective is to maximize reliability, maintainability and solo-developer productivity while preserving clear module boundaries so components can later be extracted if scale requires it.",
};

export const businessObjective = {
  intro:
    "FGF wants a federation-owned digital ticketing platform that progressively replaces manual/physical processes and addresses:",
  problems: [
    "Counterfeit tickets",
    "Ticket duplication",
    "Photocopy / reproduction",
    "Fraudulent resale",
    "Multiple use of one ticket",
    "Revenue diversion",
    "Lack of sales traceability",
    "Difficulty monitoring stadium entry",
    "Reconciliation errors",
  ],
  ownership:
    "The source specification also requires the platform to remain owned and controllable by FGF, including source code/documentation under the contractual arrangement.",
};

export const businessScope = [
  "National-team matches",
  "National competitions",
  "International matches",
  "Qualification matches",
  "Other FGF-authorized sporting events",
  "Multiple stadiums",
  "Multiple ticket categories",
  "General admission",
  "Numbered seating",
  "VIP / VVIP / protocol / partner / press / staff tickets",
  "Physical points of sale connected to the central system",
  "Future mobile applications",
  "Future integrations with accounting and partner systems",
];

export const corePrinciple = {
  quote: "The QR code is not the ticketing security system.",
  quote2: "The platform is the security system.",
  body:
    "The QR/dynamic credential is only the mechanism by which the scanner obtains a verifiable ticket credential. Authenticity, payment state, event/zone authorization, redemption state, device identity, synchronization, auditability and operational controls together provide the security model.",
};

export const finalPosition = {
  bullets: [
    "Federation-controlled",
    "API-first",
    "Open-source-heavy",
    "Modular",
    "Testable",
    "Auditable",
    "Scalable",
    "Suitable for multiple stadiums",
    "Capable of mobile ticketing",
    "Capable of offline gate operations",
    "Designed for payment-provider independence",
    "Designed for hardware-provider independence",
    "Realistic for a strong solo technical lead with specialist support",
  ],
};

export const notFirst = {
  avoid: [
    "Microservices",
    "Kubernetes",
    "Kafka",
    "AI fraud detection",
    "Complex resale marketplace",
    "Native iOS + native Android separately",
    "Custom cryptography",
    "Custom identity provider",
    "Custom payment processing",
    "Custom hardware",
  ],
  prove: "Sell → Pay → Issue → Scan → Redeem → Report.",
};

export const nextArtifacts = [
  {
    title: "SRS v1.0",
    body: "Every requirement assigned an ID and acceptance criterion.",
  },
  {
    title: "Architecture Specification v1.0",
    body: "Modules, deployment, integrations and trust boundaries.",
  },
  {
    title: "Database / ERD v1.0",
    body: "Complete PostgreSQL schema.",
  },
  {
    title: "Security & Threat Model v1.0",
    body: "Attack surfaces, mitigations and security assumptions.",
  },
  {
    title: "API Contract v1.0",
    body: "OpenAPI specification.",
  },
];

export const externalReferences = [
  "Ticketmaster SafeTix — rotating/encrypted mobile ticket credentials and secure entry integration.",
  "AXS Mobile ID — revolving QR/mobile ID, app-based ticket presentation and offline/event-day availability.",
  "UEFA Mobile Tickets — app-based ticket delivery and match-day mobile-ticket workflow.",
  "pretix — open-source ticketing platform, REST API, device authentication, check-in and offline scanning concepts.",
  "Eventyay — open-source event platform demonstrating unified event/ticketing architecture, permissions, APIs, payment services, audit/logging and asynchronous processing.",
];
