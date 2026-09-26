/** FR-012 reconciliation chain */
export const reconciliationChain = [
  { id: "generated", label: "Generated tickets" },
  { id: "sold", label: "Sold tickets" },
  { id: "payments", label: "Payments" },
  { id: "cancellations", label: "Cancellations" },
  { id: "refunds", label: "Refunds" },
  { id: "redeemed", label: "Redeemed tickets" },
  { id: "revenue", label: "Revenue" },
];

export const reportingMetrics = [
  "Tickets available", "Tickets sold", "Revenue", "Free tickets", "VIP/VVIP",
  "Cancellations", "Refunds", "Spectators entered", "Occupancy",
  "Sales by category", "Sales by channel", "Sales by POS", "Sales by payment method",
];

// ---------------------------------------------------------------------------
// Illustrative mock ledger for one match. Values are invented for demonstration.
// Amounts in GNF (Guinean franc).
// ---------------------------------------------------------------------------

export interface MockLedger {
  capacity: number;
  generated: number;
  sold: number;
  complimentary: number;
  paymentsCaptured: number;
  cancelled: number;
  refunded: number;
  redeemed: number;
  grossRevenue: number;
  refundedAmount: number;
  providerSettled: number;
}

export const mockLedger: MockLedger = {
  capacity: 41800,
  generated: 38000,
  sold: 37140,
  complimentary: 860,
  paymentsCaptured: 37140,
  cancelled: 212,
  refunded: 318,
  redeemed: 26654,
  grossRevenue: 2_785_500_000,
  refundedAmount: 23_850_000,
  providerSettled: 2_761_650_000,
};

export const salesByChannel = [
  { label: "Customer web", value: 24110 },
  { label: "Physical POS", value: 9870 },
  { label: "Partner allocation", value: 3160 },
];

export const salesByPaymentMethod = [
  { label: "Mobile money", value: 21780 },
  { label: "Card", value: 9420 },
  { label: "Cash at POS", value: 4630 },
  { label: "Bank transfer", value: 1310 },
];

export const salesByCategory = [
  { label: "Category 3 (GA)", value: 13020 },
  { label: "Category 2", value: 10840 },
  { label: "Category 1", value: 12960 },
  { label: "VIP / VVIP", value: 320 },
];

export interface ReconciliationCheck {
  id: string;
  label: string;
  formula: string;
  compute: (l: MockLedger) => { left: number; right: number };
  money?: boolean;
}

export const reconciliationChecks: ReconciliationCheck[] = [
  {
    id: "sold-vs-paid",
    label: "Every sold ticket has a captured payment",
    formula: "sold tickets = captured payments",
    compute: (l) => ({ left: l.sold, right: l.paymentsCaptured }),
  },
  {
    id: "generated",
    label: "Generated tickets are fully accounted for",
    formula: "generated = sold + complimentary",
    compute: (l) => ({ left: l.generated, right: l.sold + l.complimentary }),
  },
  {
    id: "redeemed-bound",
    label: "Redemptions never exceed valid tickets",
    formula: "redeemed ≤ generated − cancelled − refunded",
    compute: (l) => ({ left: l.redeemed, right: l.generated - l.cancelled - l.refunded }),
  },
  {
    id: "revenue",
    label: "Net revenue matches provider settlement",
    formula: "gross revenue − refunds = provider settled",
    compute: (l) => ({ left: l.grossRevenue - l.refundedAmount, right: l.providerSettled }),
    money: true,
  },
];
