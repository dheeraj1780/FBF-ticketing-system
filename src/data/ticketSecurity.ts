import type { ArchitectureGraph, SequenceDiagramData } from "@/types";

export const securitySources = [
  "Cryptographic authenticity",
  "Server-side ticket state",
  "Event binding",
  "Gate/zone rules",
  "Redemption state",
  "Device identity",
  "Transfer controls",
  "Audit",
  "Short-lived/dynamic credentials where appropriate",
];

/** Section 11.2 — Recommended credential architecture */
export const credentialGraph: ArchitectureGraph = {
  columns: 6,
  rows: 2,
  nodes: [
    { id: "record", label: "Ticket record", description: "Server-side ticket row in PostgreSQL — authoritative state.", icon: "database", col: 0, row: 0, kind: "store" },
    { id: "claims", label: "Canonical ticket claims", description: "Ticket ID, event, category/zone. Sensitive personal data is never embedded in the QR (FR-006).", icon: "file-text", col: 1, row: 0 },
    { id: "sign", label: "Sign with Ed25519", sublabel: "private key", description: "Signing key held in KMS/HSM in production. The scanner never holds it.", icon: "key", col: 2, row: 0, kind: "service" },
    { id: "token", label: "Credential / token", description: "Signed payload that any scanner can verify with the public key.", icon: "lock", col: 3, row: 0 },
    { id: "qr", label: "QR / Dynamic QR", description: "The QR code is a credential carrier, not the security system.", icon: "qr", col: 4, row: 0 },
    { id: "device", label: "Customer device", description: "Ticket wallet; can display the ticket without continuous Internet once provisioned.", icon: "smartphone", col: 5, row: 0, kind: "client" },
    { id: "scanner", label: "Scanner", description: "Enrolled gate device.", icon: "scan", col: 5, row: 1, kind: "client" },
    { id: "verify", label: "Verify signature", description: "Public-key verification — works offline.", icon: "shield-check", col: 4, row: 1 },
    { id: "validate", label: "Validate event/time/zone", description: "Binding to the correct match, time window and gate/zone.", icon: "gate", col: 3, row: 1 },
    { id: "check", label: "Check redemption", description: "Server-side (online) or local journal (offline) single-use check.", icon: "repeat", col: 2, row: 1 },
    { id: "decision", label: "Accept or reject", description: "Decision with an explicit reason, recorded for audit.", icon: "check-circle", col: 1, row: 1 },
  ],
  edges: [
    { from: "record", to: "claims" },
    { from: "claims", to: "sign" },
    { from: "sign", to: "token" },
    { from: "token", to: "qr" },
    { from: "qr", to: "device" },
    { from: "device", to: "scanner" },
    { from: "scanner", to: "verify" },
    { from: "verify", to: "validate" },
    { from: "validate", to: "check" },
    { from: "check", to: "decision" },
  ],
};

export const credentialModes = [
  {
    id: "static",
    title: "Mode A — Static signed credential",
    tagline: "Signed once, printable",
    usefulFor: ["Controlled pilot", "Printable tickets", "Operational fallback", "Low-risk event configurations"],
  },
  {
    id: "dynamic",
    title: "Mode B — Dynamic mobile credential",
    tagline: "Stable ticket ID, rotating short-lived display token",
    usefulFor: ["High-value matches", "Anti-screenshot requirements", "Account-bound mobile tickets", "Transfer-enabled tickets"],
  },
];

/** Section 29 — Ticket Transfer */
export const transferSequence: SequenceDiagramData = {
  title: "Ticket transfer",
  participants: [
    { id: "A", label: "Current Holder", icon: "user" },
    { id: "API", label: "FGF API", icon: "server" },
    { id: "B", label: "New Holder", icon: "user-check" },
    { id: "DB", label: "Database", icon: "database" },
  ],
  messages: [
    { from: "A", to: "API", label: "Initiate transfer", detail: "Transfer must occur through the platform (FR-013)." },
    { from: "API", to: "DB", label: "Lock ticket", detail: "Prevents a simultaneous transfer and entry race." },
    { from: "API", to: "DB", label: "Mark transfer pending" },
    { from: "API", to: "B", label: "Transfer invitation", kind: "async" },
    { from: "B", to: "API", label: "Accept transfer" },
    { from: "API", to: "DB", label: "Revoke old credential", detail: "Original holder loses access; copies outside the platform are worthless." },
    { from: "API", to: "DB", label: "Create new ownership" },
    { from: "API", to: "DB", label: "Issue new credential" },
    { from: "API", to: "DB", label: "Audit transfer" },
    { from: "API", to: "B", label: "New ticket", kind: "return" },
  ],
};

export const transferRules = [
  "Transfer must occur through the platform",
  "Original holder loses access",
  "New holder receives a valid credential",
  "Transfer is audited",
  "Copied credentials outside the platform do not transfer ownership",
];
