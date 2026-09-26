import type { ArchitectureGraph, SequenceDiagramData } from "@/types";

/** Section 24 — Online Redemption */
export const onlineRedemptionSequence: SequenceDiagramData = {
  title: "Online redemption",
  participants: [
    { id: "S", label: "Scanner", icon: "scan" },
    { id: "API", label: "Redemption API", icon: "server" },
    { id: "DB", label: "PostgreSQL", icon: "database" },
  ],
  messages: [
    { from: "S", to: "API", label: "Scan credential + device ID + nonce", detail: "The nonce makes retransmissions idempotent." },
    { from: "API", to: "API", label: "Verify credential signature" },
    { from: "API", to: "API", label: "Validate event/zone/time" },
    { from: "API", to: "DB", label: "Begin transaction" },
    { from: "API", to: "DB", label: "Lock ticket", detail: "Two scanners on one ticket serialize here — exactly one wins (AT-002)." },
    { from: "API", to: "DB", label: "Check status" },
    { from: "API", to: "DB", label: "Mark redeemed", branch: "Valid and unused" },
    { from: "API", to: "DB", label: "Create redemption event", branch: "Valid and unused" },
    { from: "API", to: "DB", label: "Create audit event", branch: "Valid and unused" },
    { from: "API", to: "DB", label: "Commit", branch: "Valid and unused" },
    { from: "API", to: "S", label: "ACCESS GRANTED", kind: "return", branch: "Valid and unused" },
    { from: "API", to: "S", label: "ACCESS DENIED", kind: "return", branch: "Already redeemed" },
    { from: "API", to: "S", label: "ACCESS DENIED", kind: "return", branch: "Invalid" },
  ],
};

/** Section 25 — Offline Scanner Architecture */
export const offlineScannerGraph: ArchitectureGraph = {
  columns: 3,
  rows: 7,
  groups: [
    { id: "before", label: "Before match", colStart: 0, colEnd: 0, rowStart: 0, rowEnd: 3, tone: "slate" },
    { id: "matchday", label: "Match day (disconnected)", colStart: 1, colEnd: 1, rowStart: 0, rowEnd: 6, tone: "amber" },
    { id: "sync", label: "Reconnection", colStart: 2, colEnd: 2, rowStart: 0, rowEnd: 6, tone: "brand" },
  ],
  nodes: [
    { id: "before", label: "Before match", description: "Preparation happens 24–48h before kickoff.", icon: "calendar", col: 0, row: 0, group: "before" },
    { id: "enroll", label: "Device enrollment", description: "Scanner explicitly enrolled with device_id and keypair — not a generic API client.", icon: "smartphone", col: 0, row: 1, group: "before" },
    { id: "assign", label: "Assigned to gate/event", description: "Device-scoped permissions: assigned events and ticket types only; never admin privileges.", icon: "gate", col: 0, row: 2, group: "before" },
    { id: "provision", label: "Provision signed event data", description: "Signed manifest of event data and the public verification key.", icon: "download", col: 0, row: 3, group: "before" },
    { id: "store", label: "Store minimum data locally", description: "Data minimization in the local SQLite database.", icon: "database", col: 1, row: 0, group: "matchday" },
    { id: "matchday", label: "Match day", description: "Gates open; connectivity may be unreliable.", icon: "stadium", col: 1, row: 1, group: "matchday" },
    { id: "scan", label: "Scan ticket", description: "Camera or hardware scanner via the scan engine abstraction.", icon: "scan", col: 1, row: 2, group: "matchday" },
    { id: "verify-local", label: "Verify credential locally", description: "Ed25519 signature verified with the public key — no server needed.", icon: "shield-check", col: 1, row: 3, group: "matchday" },
    { id: "check-event", label: "Check event/time/zone", description: "Local rules from the signed manifest.", icon: "clock", col: 1, row: 4, group: "matchday" },
    { id: "check-local", label: "Check local redemption state", description: "Only this device's knowledge — another device may have redeemed the same ticket.", icon: "repeat", col: 1, row: 5, group: "matchday" },
    { id: "decide", label: "Accept / Reject", description: "Decision shown to the gate agent.", icon: "check-circle", col: 1, row: 6, group: "matchday" },
    { id: "journal", label: "Append local scan journal", description: "Every scan (accepted or rejected) stored with a unique scan nonce.", icon: "file-text", col: 2, row: 0, group: "sync" },
    { id: "connectivity", label: "Connectivity restored?", description: "If not, keep journaling locally.", icon: "wifi", col: 2, row: 1, group: "sync" },
    { id: "upload", label: "Upload signed scan batch", description: "POST /redemptions/batch with an idempotency key.", icon: "upload", col: 2, row: 2, group: "sync" },
    { id: "reconcile", label: "Server reconciliation", description: "Server applies journal against authoritative state.", icon: "server", col: 2, row: 3, group: "sync" },
    { id: "dedupe", label: "Deduplicate by scan nonce", description: "Retransmitted batches never create duplicate redemptions.", icon: "hash", col: 2, row: 4, group: "sync" },
    { id: "conflicts", label: "Detect conflicts", description: "Same ticket accepted by multiple devices while offline → flagged for operational procedure.", icon: "alert-triangle", col: 2, row: 5, group: "sync" },
    { id: "finalize", label: "Finalize audit trail", description: "Complete, traceable record of every offline decision.", icon: "clipboard-check", col: 2, row: 6, group: "sync" },
  ],
  edges: [
    { from: "before", to: "enroll" },
    { from: "enroll", to: "assign" },
    { from: "assign", to: "provision" },
    { from: "provision", to: "store" },
    { from: "store", to: "matchday" },
    { from: "matchday", to: "scan" },
    { from: "scan", to: "verify-local" },
    { from: "verify-local", to: "check-event" },
    { from: "check-event", to: "check-local" },
    { from: "check-local", to: "decide" },
    { from: "decide", to: "journal" },
    { from: "journal", to: "connectivity" },
    { from: "connectivity", to: "upload", label: "Yes" },
    { from: "upload", to: "reconcile" },
    { from: "reconcile", to: "dedupe" },
    { from: "dedupe", to: "conflicts" },
    { from: "conflicts", to: "finalize" },
  ],
};

export const offlineSecurityModel = {
  questions: [
    {
      q: "Can the device verify the credential without the server?",
      a: "Yes.",
      body: "Use asymmetric digital signatures.",
      tone: "lime" as const,
    },
    {
      q: "Can the device know whether another device has already redeemed the ticket?",
      a: "Not universally while disconnected.",
      body: "Therefore the architecture must define an operational policy.",
      tone: "amber" as const,
    },
  ],
  approaches: [
    "Prefer online validation.",
    "Pre-provision event-specific credentials.",
    "Use short validity windows.",
    "Bind credentials to authorized devices/accounts where appropriate.",
    "Minimize the duration of disconnected operation.",
    "Synchronize frequently.",
    "Detect conflicts after reconnection.",
    "Establish operational procedures for conflict resolution.",
  ],
  disclosure: "This limitation must be disclosed in the security and acceptance documentation.",
};

export const deviceFields = [
  "device_id",
  "device_keypair",
  "event_assignment",
  "gate_assignment",
  "device_status",
  "app_version",
  "last_sync",
  "last_seen",
];

export const devicePermissions = [
  "Access assigned events",
  "Validate assigned ticket types",
  "Submit scans",
  "Synchronize its own scan journal",
];

// ---------------------------------------------------------------------------
// Mock data for the interactive gate simulator. Purely illustrative.
// ---------------------------------------------------------------------------

export type SimTicketStatus = "VALID" | "REDEEMED" | "CANCELLED" | "REFUNDED" | "REVOKED";

export interface SimTicket {
  id: string;
  holder: string;
  match: string;
  zone: string;
  gate: string;
  category: string;
  status: SimTicketStatus;
  signatureValid: boolean;
}

export const simMatch = "Guinea vs Team B — Qualifier";

export const simTickets: SimTicket[] = [
  { id: "TKT-8F21-A12", holder: "Customer #1042", match: simMatch, zone: "Tribune Nord", gate: "Gate A", category: "Tribune", status: "VALID", signatureValid: true },
  { id: "TKT-8F21-B07", holder: "Customer #2210", match: simMatch, zone: "VIP", gate: "Gate V", category: "VIP", status: "VALID", signatureValid: true },
  { id: "TKT-8F21-C33", holder: "Customer #3381", match: simMatch, zone: "Tribune Sud", gate: "Gate B", category: "Tribune", status: "REDEEMED", signatureValid: true },
  { id: "TKT-8F21-D90", holder: "Customer #4410", match: simMatch, zone: "Tribune Nord", gate: "Gate A", category: "Tribune", status: "REFUNDED", signatureValid: true },
  { id: "TKT-8F21-E15", holder: "Customer #5521", match: simMatch, zone: "Tribune Nord", gate: "Gate A", category: "Tribune", status: "CANCELLED", signatureValid: true },
  { id: "TKT-8F21-F66", holder: "Customer #6602", match: simMatch, zone: "Tribune Nord", gate: "Gate A", category: "Tribune", status: "REVOKED", signatureValid: true },
  { id: "TKT-7A00-X01", holder: "Customer #7710", match: "Club A vs Club B — Ligue 1", zone: "Tribune Nord", gate: "Gate A", category: "Tribune", status: "VALID", signatureValid: true },
  { id: "FAKE-0000-000", holder: "Unknown", match: simMatch, zone: "Tribune Nord", gate: "Gate A", category: "Tribune", status: "VALID", signatureValid: false },
];

export const simGates = ["Gate A", "Gate B", "Gate V"];
