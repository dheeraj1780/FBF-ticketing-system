import type { Stakeholder } from "@/types";

export const stakeholders: Stakeholder[] = [
  { role: "FGF Executive", needs: "Ownership, transparency, revenue, strategic control", icon: "building" },
  { role: "Ticketing Administration", needs: "Match/ticket configuration and sales", icon: "clipboard" },
  { role: "Competition Manager", needs: "Match lifecycle", icon: "trophy" },
  { role: "Stadium Manager", needs: "Zones, gates, capacity, access", icon: "stadium" },
  { role: "Finance", needs: "Payments, reconciliation, revenue", icon: "landmark" },
  { role: "Gate Supervisor", needs: "Live entry monitoring", icon: "eye" },
  { role: "Gate Agent", needs: "Fast, reliable scan decisions", icon: "scan" },
  { role: "Auditor", needs: "Immutable traceability", icon: "file-text" },
  { role: "Customer", needs: "Simple purchase and reliable entry", icon: "user" },
  { role: "Payment Provider", needs: "Correct payment/webhook integration", icon: "credit-card" },
  { role: "Hardware Provider", needs: "Scanner/device compatibility", icon: "smartphone" },
  { role: "Security Auditor", needs: "Independent verification", icon: "shield-check" },
  { role: "DevOps / Infrastructure", needs: "Availability, backup, recovery", icon: "server" },
  { role: "Legal / Compliance", needs: "Data protection, contracts, payment obligations", icon: "badge" },
];
