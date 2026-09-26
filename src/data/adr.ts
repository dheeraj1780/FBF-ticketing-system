import type { AdrRecord } from "@/types";

/** Section 51 — Architecture Decision Records */
export const adrs: AdrRecord[] = [
  {
    id: "ADR-001",
    title: "Modular Monolith",
    decision: "Use a modular monolith for V1.",
    reason: "Solo development, transactional consistency, simpler operations and lower infrastructure complexity.",
    future: "Extract services only after measured need.",
    status: "accepted",
  },
  {
    id: "ADR-002",
    title: "PostgreSQL",
    decision: "PostgreSQL is the system of record.",
    reason: "Ticket inventory, payment, redemption and financial state require strong relational consistency.",
    status: "accepted",
  },
  {
    id: "ADR-003",
    title: "Keycloak",
    decision: "Use Keycloak rather than building authentication from scratch.",
    reason: "Reduces security-sensitive custom code while retaining open protocols.",
    status: "accepted",
  },
  {
    id: "ADR-004",
    title: "Dynamic Credentials",
    decision: "Support signed static credentials and dynamic mobile credentials.",
    reason: "Different event/security requirements require different delivery modes.",
    status: "accepted",
  },
  {
    id: "ADR-005",
    title: "Offline",
    decision: "Offline scanning is a separately specified subsystem.",
    reason: "Disconnected devices cannot observe global redemption state in real time.",
    status: "accepted",
  },
  {
    id: "ADR-006",
    title: "No Kubernetes V1",
    decision: "Containerize but do not require Kubernetes initially.",
    reason: "Complexity is not justified before actual scale is measured.",
    status: "accepted",
  },
];

/** Links from each ADR to explorer sections for navigation. */
export const adrLinks: Record<string, { label: string; to: string }[]> = {
  "ADR-001": [{ label: "Backend modules", to: "/backend" }, { label: "Technical architecture", to: "/architecture" }],
  "ADR-002": [{ label: "Data model", to: "/data-model" }, { label: "Payment flow", to: "/payments" }],
  "ADR-003": [{ label: "Security architecture", to: "/security" }],
  "ADR-004": [{ label: "Ticket security", to: "/ticket-security" }],
  "ADR-005": [{ label: "Scanner flows", to: "/scanner" }],
  "ADR-006": [{ label: "Technical architecture", to: "/architecture" }],
};
