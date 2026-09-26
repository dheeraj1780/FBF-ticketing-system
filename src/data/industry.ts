import type { IndustryReference, PatternComparisonRow } from "@/types";

export const industryReferences: IndustryReference[] = [
  {
    id: "ticketmaster",
    name: "Ticketmaster SafeTix",
    summary:
      "Encrypted rotating barcode credentials. The mobile barcode refreshes periodically to reduce fraud/counterfeiting. Developer docs separate the underlying barcode identity from the refreshed secure token and use a device identifier.",
    lessons: [
      "Rotating credentials for appropriate mobile tickets",
      "Device/app identity",
      "Server-generated secure token",
      "Credential refresh",
      "Ticket account binding",
      "Do not copy proprietary Ticketmaster implementation details",
    ],
  },
  {
    id: "axs",
    name: "AXS Mobile ID",
    summary:
      "Revolving QR code that changes periodically. Screenshots/printing are not supported for its Mobile ID flow; tickets are displayed through its app.",
    lessons: [
      "Dynamic mobile credential",
      "App-based ticket presentation",
      "Optional ticket transfer",
      "Pre-event ticket availability",
      "Event-day ticket access without requiring continuous Wi-Fi",
    ],
  },
  {
    id: "uefa",
    name: "UEFA Mobile Tickets",
    summary:
      "Users access tickets through a dedicated app with event-day instructions around device readiness and local time.",
    lessons: [
      "Dedicated ticket wallet experience",
      "Pre-event provisioning",
      "Strong device readiness guidance",
      "Event-specific ticket access",
      "Clear match-day UX",
    ],
  },
  {
    id: "pretix",
    name: "pretix (open source)",
    summary:
      "Open-source ticketing platform with event management, sales, REST API, device authentication, check-in, offline scanning, permissions, idempotency concepts and self-hosting.",
    lessons: [
      "Device identity: device_id, device_public_key, assigned_gate, assigned_event(s), app_version, status, last_seen",
      "Devices explicitly enrolled — not generic API clients",
      "Device-scoped permissions; never administrator privileges",
      "Scan idempotency via unique scan identifier/nonce",
      "Offline journal recorded locally and synchronized later",
    ],
  },
  {
    id: "eventyay",
    name: "Eventyay (open source)",
    summary:
      "Unified event model, organizer/admin interface, public ticket shop, API, permissions, payment services, logging/audit, caching and async workers — as a unified application rather than independent microservices.",
    lessons: ["Supports the choice of a Modular Monolith rather than starting with microservices"],
  },
];

export const patternComparison: PatternComparisonRow[] = [
  { pattern: "Rotating mobile credential", examples: "Ticketmaster, AXS, NFL ecosystem", decision: "Adopt" },
  { pattern: "App-based ticket wallet", examples: "UEFA, AXS, Ticketmaster", decision: "Adopt" },
  { pattern: "Device identity", examples: "Ticketmaster, pretix-style device auth", decision: "Adopt" },
  { pattern: "Server-side redemption", examples: "Ticketing platforms", decision: "Mandatory" },
  { pattern: "Offline scan journal", examples: "pretix-style architecture", decision: "Adopt" },
  { pattern: "Device-scoped permissions", examples: "pretix", decision: "Adopt" },
  { pattern: "Ticket transfer", examples: "AXS/major platforms", decision: "Adopt in Phase 2" },
  { pattern: "Static printable ticket", examples: "Traditional systems", decision: "Conditional" },
  { pattern: "Dynamic QR", examples: "Major mobile ticket systems", decision: "Adopt" },
  { pattern: "Unified event model", examples: "Eventyay/pretix", decision: "Adopt" },
  { pattern: "Modular monolith", examples: "Eventyay-style architecture", decision: "Adopt" },
  { pattern: "Kafka from day one", examples: "Not required", decision: "Reject initially" },
  { pattern: "Kubernetes from day one", examples: "Not required", decision: "Reject initially" },
];

/** Exact wording from the blueprint's table where it differs from the short decision tag. */
export const decisionNotes: Record<string, string> = {
  "Static printable ticket": "Support only where operationally required",
  "Dynamic QR": "Preferred",
};
