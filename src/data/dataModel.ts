import type { DataEntity, EntityRelation } from "@/types";

/**
 * Section 20 — Database high-level model.
 * Fields listed are the attributes the blueprint explicitly documents (FR-002, FR-006,
 * Sections 13, 27 and 30). The complete schema is a deliverable of "Database/ERD v1.0" (Section 57).
 */
export const entities: DataEntity[] = [
  {
    id: "ORGANIZATION", label: "ORGANIZATION", domain: "Identity", col: 0, row: 0,
    fields: [{ name: "id", type: "uuid" }],
  },
  {
    id: "USER", label: "USER", domain: "Identity", col: 0, row: 1,
    fields: [
      { name: "id", type: "uuid" },
      { name: "roles", type: "→ user_roles", note: "configurable RBAC (FR-009)" },
      { name: "mfa", type: "Keycloak", note: "sensitive roles" },
    ],
  },
  {
    id: "AUDIT_EVENT", label: "AUDIT_EVENT", domain: "Governance", col: 0, row: 3,
    fields: [
      { name: "event_id", type: "id" }, { name: "timestamp", type: "timestamptz" },
      { name: "actor_type", type: "text" }, { name: "actor_id", type: "id" },
      { name: "device_id", type: "id" }, { name: "action", type: "text" },
      { name: "resource_type", type: "text" }, { name: "resource_id", type: "id" },
      { name: "request_id", type: "id" }, { name: "before_state", type: "json" },
      { name: "after_state", type: "json" }, { name: "result", type: "text" },
      { name: "reason", type: "text" }, { name: "ip", type: "inet" },
      { name: "metadata", type: "json" },
    ],
  },
  {
    id: "ORDER", label: "ORDER", domain: "Commerce", col: 1, row: 1,
    fields: [
      { name: "id", type: "uuid" }, { name: "customer", type: "→ USER" },
      { name: "idempotency_key", type: "text", note: "Section 33" },
    ],
  },
  {
    id: "ORDER_ITEM", label: "ORDER_ITEM", domain: "Commerce", col: 1, row: 2,
    fields: [{ name: "id", type: "uuid" }, { name: "order", type: "→ ORDER" }, { name: "category/seat", type: "ref" }],
  },
  {
    id: "PAYMENT", label: "PAYMENT", domain: "Commerce", col: 1, row: 0,
    fields: [
      { name: "id", type: "uuid" }, { name: "order", type: "→ ORDER" },
      { name: "status", type: "enum", note: "payment state machine" },
      { name: "provider_reference", type: "text" },
    ],
  },
  {
    id: "COMPETITION", label: "COMPETITION", domain: "Event", col: 2, row: 0,
    fields: [{ name: "id", type: "uuid" }, { name: "publication_state", type: "enum" }],
  },
  {
    id: "MATCH", label: "MATCH", domain: "Event", col: 2, row: 1,
    fields: [
      { name: "competition", type: "→ COMPETITION" }, { name: "home_team", type: "→ team" },
      { name: "away_team", type: "→ team" }, { name: "date / time", type: "timestamptz" },
      { name: "stadium", type: "→ STADIUM" }, { name: "capacity", type: "int" },
      { name: "sales_windows", type: "range" }, { name: "buyer_limits", type: "int" },
      { name: "special_conditions", type: "text" },
    ],
  },
  {
    id: "TICKET_CATEGORY", label: "TICKET_CATEGORY", domain: "Inventory", col: 3, row: 0,
    fields: [
      { name: "match", type: "→ MATCH" }, { name: "price", type: "money" },
      { name: "quota", type: "int" },
    ],
  },
  {
    id: "TICKET", label: "TICKET", domain: "Tickets", col: 2, row: 2,
    fields: [
      { name: "id", type: "uuid", note: "unique internal identity" },
      { name: "match", type: "→ MATCH", note: "event association" },
      { name: "category / zone", type: "ref" }, { name: "seat", type: "→ SEAT" },
      { name: "order_item", type: "→ ORDER_ITEM", note: "payment relationship" },
      { name: "status", type: "enum", note: "server-side state" },
      { name: "credential", type: "→ ticket_credentials", note: "Ed25519-signed" },
    ],
  },
  {
    id: "REDEMPTION", label: "REDEMPTION", domain: "Access", col: 2, row: 3,
    fields: [
      { name: "ticket", type: "→ TICKET" }, { name: "device", type: "→ DEVICE" },
      { name: "scan_nonce", type: "text", note: "idempotency / dedupe" },
      { name: "result", type: "enum" },
    ],
  },
  {
    id: "STADIUM", label: "STADIUM", domain: "Venue", col: 3, row: 1,
    fields: [{ name: "id", type: "uuid" }, { name: "name", type: "text" }],
  },
  {
    id: "ZONE", label: "ZONE", domain: "Venue", col: 4, row: 1,
    fields: [{ name: "stadium", type: "→ STADIUM" }, { name: "type", type: "enum", note: "GA / seated / VIP / restricted" }],
  },
  {
    id: "SEAT", label: "SEAT", domain: "Venue", col: 3, row: 2,
    fields: [{ name: "zone", type: "→ ZONE" }, { name: "block / row / number", type: "ref" }],
  },
  {
    id: "GATE", label: "GATE", domain: "Venue", col: 4, row: 2,
    fields: [{ name: "stadium", type: "→ STADIUM" }, { name: "zones", type: "→ gate_zones" }],
  },
  {
    id: "DEVICE", label: "DEVICE", domain: "Access", col: 3, row: 3,
    fields: [
      { name: "device_id", type: "id" }, { name: "device_public_key", type: "bytes" },
      { name: "assigned_gate", type: "→ GATE" }, { name: "assigned_event(s)", type: "→ MATCH" },
      { name: "app_version", type: "text" }, { name: "status", type: "enum" },
      { name: "last_sync", type: "timestamptz" }, { name: "last_seen", type: "timestamptz" },
    ],
  },
  {
    id: "SYNC_EVENT", label: "SYNC_EVENT", domain: "Access", col: 4, row: 3,
    fields: [{ name: "device", type: "→ DEVICE" }, { name: "batch", type: "signed scan batch" }],
  },
];

export const relations: EntityRelation[] = [
  { from: "ORGANIZATION", to: "USER", label: "has", cardinality: "1 — 0..n" },
  { from: "COMPETITION", to: "MATCH", label: "contains", cardinality: "1 — 0..n" },
  { from: "STADIUM", to: "ZONE", label: "contains", cardinality: "1 — 0..n" },
  { from: "ZONE", to: "SEAT", label: "contains", cardinality: "1 — 0..n" },
  { from: "STADIUM", to: "GATE", label: "has", cardinality: "1 — 0..n" },
  { from: "MATCH", to: "STADIUM", label: "occurs_at", cardinality: "0..n — 1" },
  { from: "MATCH", to: "TICKET_CATEGORY", label: "offers", cardinality: "1 — 0..n" },
  { from: "MATCH", to: "TICKET", label: "issues", cardinality: "1 — 0..n" },
  { from: "SEAT", to: "TICKET", label: "allocated_to", cardinality: "1 — 0..n" },
  { from: "USER", to: "ORDER", label: "places", cardinality: "1 — 0..n" },
  { from: "ORDER", to: "ORDER_ITEM", label: "contains", cardinality: "1 — 0..n" },
  { from: "ORDER", to: "PAYMENT", label: "has", cardinality: "1 — 0..n" },
  { from: "ORDER_ITEM", to: "TICKET", label: "creates", cardinality: "1 — 0..1" },
  { from: "TICKET", to: "REDEMPTION", label: "has", cardinality: "1 — 0..n" },
  { from: "DEVICE", to: "REDEMPTION", label: "performs", cardinality: "1 — 0..n" },
  { from: "USER", to: "AUDIT_EVENT", label: "creates", cardinality: "1 — 0..n" },
  { from: "DEVICE", to: "SYNC_EVENT", label: "submits", cardinality: "1 — 0..n" },
];

/** Section 21 — Core database entities */
export const coreTables: { domain: string; tables: string[] }[] = [
  { domain: "Identity", tables: ["users", "roles", "permissions", "user_roles", "devices", "device_permissions"] },
  { domain: "Event", tables: ["competitions", "teams", "matches"] },
  { domain: "Venue", tables: ["stadiums", "zones", "blocks", "rows", "seats", "gates", "gate_zones"] },
  { domain: "Commerce", tables: ["customers", "orders", "order_items", "payments", "refunds", "payment_events"] },
  { domain: "Tickets", tables: ["tickets", "ticket_credentials", "ticket_transfers", "ticket_status_history"] },
  { domain: "Access", tables: ["redemption_attempts", "redemptions", "scanner_devices", "offline_scan_events", "synchronization_batches"] },
  { domain: "Governance", tables: ["audit_events", "security_events", "system_events"] },
];

export const reportingNote =
  "Reports should primarily be generated from transactional records or dedicated read models; avoid maintaining manually edited financial totals.";
