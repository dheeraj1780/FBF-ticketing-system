import type { ArchitectureGraph, IncidentCategory } from "@/types";

/** Section 46 — Operational Match-Day Flow */
export const matchDayOpsGraph: ArchitectureGraph = {
  columns: 3,
  rows: 7,
  groups: [
    { id: "pre", label: "24–48h before match", colStart: 0, colEnd: 0, rowStart: 0, rowEnd: 6, tone: "slate" },
    { id: "live", label: "Match day — live", colStart: 1, colEnd: 1, rowStart: 0, rowEnd: 6, tone: "brand" },
    { id: "post", label: "Post-match", colStart: 2, colEnd: 2, rowStart: 0, rowEnd: 4, tone: "violet" },
  ],
  nodes: [
    { id: "t-minus", label: "24–48h before match", icon: "calendar", col: 0, row: 0, group: "pre", description: "Preparation window." },
    { id: "provision", label: "Provision event data", icon: "download", col: 0, row: 1, group: "pre", description: "Signed event manifests delivered to enrolled scanners." },
    { id: "verify-scanners", label: "Verify scanners", icon: "smartphone", col: 0, row: 2, group: "pre", description: "App version, keypair, gate/event assignment, battery." },
    { id: "verify-gates", label: "Verify gates/zones", icon: "gate", col: 0, row: 3, group: "pre", description: "Gate ↔ zone mapping matches the stadium configuration." },
    { id: "test-connectivity", label: "Test connectivity", icon: "wifi", col: 0, row: 4, group: "pre", description: "Online validation path end-to-end." },
    { id: "test-offline", label: "Test offline mode", icon: "wifi-off", col: 0, row: 5, group: "pre", description: "Disconnected scanning + journal sync rehearsal." },
    { id: "verify-payment", label: "Verify payment/reporting", icon: "credit-card", col: 0, row: 6, group: "pre", description: "Payment provider and dashboards healthy." },
    { id: "match-day", label: "Match day", icon: "stadium", col: 1, row: 0, group: "live", description: "Operations center active." },
    { id: "open-gates", label: "Open gates", icon: "gate", col: 1, row: 1, group: "live", description: "Scanning begins." },
    { id: "scan-rate", label: "Monitor scan rate", icon: "activity", col: 1, row: 2, group: "live", description: "Throughput per gate." },
    { id: "rejected", label: "Monitor rejected scans", icon: "x-circle", col: 1, row: 3, group: "live", description: "Spikes may indicate fraud or misconfiguration." },
    { id: "device-health", label: "Monitor device health", icon: "radio", col: 1, row: 4, group: "live", description: "last_seen, sync lag, offline devices." },
    { id: "occupancy", label: "Monitor occupancy", icon: "users", col: 1, row: 5, group: "live", description: "Entries vs capacity per zone." },
    { id: "incidents", label: "Incident handling", icon: "alert-triangle", col: 1, row: 6, group: "live", description: "P0 / P1 / P2 classification with owner and timestamps." },
    { id: "close-gates", label: "Close gates", icon: "lock", col: 2, row: 0, group: "post", description: "Scanning ends." },
    { id: "sync-all", label: "Sync all devices", icon: "refresh", col: 2, row: 1, group: "post", description: "All offline journals uploaded and deduplicated." },
    { id: "reconcile-attendance", label: "Reconcile attendance", icon: "clipboard-check", col: 2, row: 2, group: "post", description: "Redemptions vs sold vs occupancy." },
    { id: "reconcile-revenue", label: "Reconcile revenue", icon: "landmark", col: 2, row: 3, group: "post", description: "Payments vs settlement vs refunds." },
    { id: "event-report", label: "Generate event report", icon: "file-text", col: 2, row: 4, group: "post", description: "Final report and post-event review." },
  ],
  edges: [
    { from: "t-minus", to: "provision" },
    { from: "provision", to: "verify-scanners" },
    { from: "verify-scanners", to: "verify-gates" },
    { from: "verify-gates", to: "test-connectivity" },
    { from: "test-connectivity", to: "test-offline" },
    { from: "test-offline", to: "verify-payment" },
    { from: "verify-payment", to: "match-day" },
    { from: "match-day", to: "open-gates" },
    { from: "open-gates", to: "scan-rate" },
    { from: "scan-rate", to: "rejected" },
    { from: "rejected", to: "device-health" },
    { from: "device-health", to: "occupancy" },
    { from: "occupancy", to: "incidents" },
    { from: "incidents", to: "close-gates" },
    { from: "close-gates", to: "sync-all" },
    { from: "sync-all", to: "reconcile-attendance" },
    { from: "reconcile-attendance", to: "reconcile-revenue" },
    { from: "reconcile-revenue", to: "event-report" },
  ],
};

/** Section 47 — Match-Day Incident Categories */
export const incidentCategories: IncidentCategory[] = [
  {
    severity: "P0",
    label: "Critical",
    tone: "rose",
    examples: ["Central ticket validation unavailable", "Payment corruption", "Mass invalidation", "Security breach"],
  },
  {
    severity: "P1",
    label: "Major",
    tone: "amber",
    examples: ["Gate scanner fleet unavailable", "Synchronization failure", "Severe payment failure"],
  },
  {
    severity: "P2",
    label: "Operational",
    tone: "brand",
    examples: ["Individual scanner failure", "Individual customer ticket problem", "Isolated payment issue"],
  },
];

export const incidentRequirements = ["Owner", "Timestamp", "Impact", "Mitigation", "Resolution", "Post-event review"];

// Illustrative mock live gate feed for the operations dashboard.
export const mockGates = [
  { gate: "Gate A", zone: "Tribune Nord", devices: 6, online: 6, scansPerMin: 142, rejected: 3 },
  { gate: "Gate B", zone: "Tribune Nord", devices: 4, online: 3, scansPerMin: 88, rejected: 1 },
  { gate: "Gate C", zone: "Tribune Sud", devices: 6, online: 6, scansPerMin: 171, rejected: 6 },
  { gate: "Gate D", zone: "Tribune Sud", devices: 5, online: 4, scansPerMin: 120, rejected: 2 },
  { gate: "Gate E", zone: "Tribune Est", devices: 4, online: 4, scansPerMin: 96, rejected: 1 },
  { gate: "Gate F", zone: "Tribune Ouest", devices: 3, online: 3, scansPerMin: 64, rejected: 0 },
  { gate: "Gate V", zone: "VIP / Press", devices: 2, online: 2, scansPerMin: 12, rejected: 0 },
];
