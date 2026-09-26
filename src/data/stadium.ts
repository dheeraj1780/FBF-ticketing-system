import type { IconName } from "@/types";

/** Section 5.2 Domain B + FR-003 — venue hierarchy */
export const venueHierarchy: { level: string; description: string; icon: IconName }[] = [
  { level: "Stadium", description: "A venue. The platform must be usable across multiple stadiums.", icon: "stadium" },
  { level: "Tribune", description: "Major stand of the stadium.", icon: "building" },
  { level: "Sector / Section", description: "Subdivision of a tribune.", icon: "layers" },
  { level: "Block", description: "Seat block within a sector.", icon: "boxes" },
  { level: "Row", description: "Row within a block.", icon: "hash" },
  { level: "Seat", description: "Numbered seat — used for assigned seating.", icon: "ticket" },
];

export const accessConcepts = [
  { label: "Gates", description: "Physical entry points; each scanner is assigned to a gate.", icon: "gate" as IconName },
  { label: "Access zones", description: "Gate ↔ zone mapping (gate_zones) determines which tickets a gate accepts.", icon: "map" as IconName },
  { label: "Restricted areas", description: "VIP, VVIP, officials, press and staff areas with dedicated rules.", icon: "lock" as IconName },
];

export const admissionModes = [
  { mode: "General admission", description: "Ticket bound to a category/zone, not a specific seat." },
  { mode: "Assigned seating", description: "Ticket bound to a specific seat — seat inventory is concurrency-protected." },
];

export const ticketAudiences = ["VIP", "VVIP", "Protocol", "Partner", "Press", "Staff", "Officials"];

// ---------------------------------------------------------------------------
// Illustrative mock stadium used by the interactive map. Numbers are not from
// the blueprint — they exist only to demonstrate the configuration model.
// ---------------------------------------------------------------------------

export interface MockZone {
  id: string;
  name: string;
  type: "Seated" | "General admission" | "VIP" | "VVIP" | "Press" | "Restricted";
  capacity: number;
  sold: number;
  entered: number;
  gates: string[];
  blocks: number;
  price: string;
}

export const mockStadium = {
  name: "Demo National Stadium",
  zones: [
    { id: "nord", name: "Tribune Nord", type: "Seated", capacity: 12000, sold: 10840, entered: 7210, gates: ["Gate A", "Gate B"], blocks: 12, price: "Category 2" },
    { id: "sud", name: "Tribune Sud", type: "General admission", capacity: 14000, sold: 13020, entered: 9870, gates: ["Gate C", "Gate D"], blocks: 0, price: "Category 3" },
    { id: "est", name: "Tribune Est", type: "Seated", capacity: 9000, sold: 7420, entered: 5104, gates: ["Gate E"], blocks: 8, price: "Category 1" },
    { id: "ouest", name: "Tribune Ouest (Officielle)", type: "Seated", capacity: 6000, sold: 5540, entered: 3920, gates: ["Gate F"], blocks: 6, price: "Category 1" },
    { id: "vip", name: "VIP / VVIP Lounge", type: "VVIP", capacity: 600, sold: 588, entered: 410, gates: ["Gate V"], blocks: 2, price: "VIP / VVIP" },
    { id: "press", name: "Press Box", type: "Press", capacity: 200, sold: 182, entered: 140, gates: ["Gate V"], blocks: 1, price: "Accreditation" },
  ] as MockZone[],
};
