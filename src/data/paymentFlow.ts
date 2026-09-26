import type { SequenceDiagramData } from "@/types";

/** Section 22 — Payment Architecture */
export const paymentSequence: SequenceDiagramData = {
  title: "Payment → ticket issuance",
  participants: [
    { id: "U", label: "Customer", icon: "user" },
    { id: "API", label: "Sports API", icon: "server" },
    { id: "DB", label: "PostgreSQL", icon: "database" },
    { id: "PG", label: "Payment Gateway", icon: "credit-card" },
  ],
  messages: [
    { from: "U", to: "API", label: "Create order", detail: "Carries an Idempotency-Key so retries never create duplicate orders." },
    { from: "API", to: "DB", label: "Reserve inventory", detail: "SELECT seat FOR UPDATE → check availability → create hold → commit." },
    { from: "DB", to: "API", label: "Reservation created", kind: "return" },
    { from: "API", to: "U", label: "Payment session", kind: "return" },
    { from: "U", to: "PG", label: "Pay", detail: "Hosted/tokenized payment — the Sports organization avoids storing card data." },
    { from: "PG", to: "API", label: "Webhook payment.success", kind: "async", detail: "May be delivered multiple times. Must be idempotent (AT-003)." },
    { from: "API", to: "DB", label: "Lock payment/order" },
    { from: "API", to: "DB", label: "Verify idempotency", detail: "Persisted key + stored result: a repeated webhook returns the original outcome." },
    { from: "API", to: "DB", label: "Mark payment captured" },
    { from: "API", to: "DB", label: "Issue ticket" },
    { from: "API", to: "DB", label: "Write outbox event", detail: "Notification/reporting side-effects are dispatched only after commit." },
    { from: "DB", to: "API", label: "Commit", kind: "return" },
    { from: "API", to: "PG", label: "200 OK", kind: "return" },
    { from: "U", to: "API", label: "Get ticket" },
    { from: "API", to: "U", label: "Ticket credential", kind: "return" },
  ],
};

export const paymentProviderInterface = `class PaymentProvider:
    def create_payment(self, request): ...
    def verify_payment(self, reference): ...
    def refund(self, request): ...
    def parse_webhook(self, request): ...`;

export const paymentProviders = ["Provider A", "Provider B", "Provider C"];

export const inventoryConcurrencySteps = [
  { code: "SELECT seat FOR UPDATE", note: "Row lock — concurrent reservation attempts queue behind it." },
  { code: "check availability", note: "Re-read status inside the lock." },
  { code: "create hold", note: "Hold row with expiry." },
  { code: "commit", note: "Lock released; losing transaction sees HELD and fails." },
];

export const inventoryRules = [
  "Only one reservation may win.",
  "Use PostgreSQL transactional locking/constraints.",
  "Do not rely solely on Redis for inventory correctness.",
  "PostgreSQL remains the source of truth.",
];
