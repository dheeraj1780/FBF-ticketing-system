/**
 * Requirement → acceptance test / test category mapping.
 * The blueprint defines requirements (§6–7), tests (§44) and acceptance tests (§45)
 * separately; this mapping links them by subject matter so coverage can be explored.
 */
export const requirementTests: Record<string, { acceptance: string[]; testTypes: string[] }> = {
  "FR-001": { acceptance: [], testTypes: ["Unit tests"] },
  "FR-002": { acceptance: [], testTypes: ["Unit tests"] },
  "FR-003": { acceptance: [], testTypes: ["Unit tests"] },
  "FR-004": { acceptance: [], testTypes: ["Unit tests", "Concurrency tests", "Load tests (k6)"] },
  "FR-005": { acceptance: ["AT-003"], testTypes: ["Integration tests", "Contract tests"] },
  "FR-006": { acceptance: ["AT-004", "AT-005"], testTypes: ["Unit tests"] },
  "FR-007": { acceptance: ["AT-001", "AT-002", "AT-004"], testTypes: ["Unit tests", "Concurrency tests"] },
  "FR-008": { acceptance: ["AT-006", "AT-007"], testTypes: ["Offline tests"] },
  "FR-009": { acceptance: ["AT-007"], testTypes: ["Integration tests"] },
  "FR-010": { acceptance: [], testTypes: ["Integration tests"] },
  "FR-011": { acceptance: [], testTypes: ["Load tests (k6)"] },
  "FR-012": { acceptance: ["AT-003", "AT-004"], testTypes: ["Unit tests"] },
  "FR-013": { acceptance: ["AT-005"], testTypes: ["Unit tests", "Concurrency tests"] },
  "FR-014": { acceptance: [], testTypes: ["Integration tests"] },
  "FR-015": { acceptance: [], testTypes: ["Contract tests"] },
  "NFR-001": { acceptance: ["AT-001", "AT-002"], testTypes: ["Concurrency tests"] },
  "NFR-002": { acceptance: [], testTypes: [] },
  "NFR-003": { acceptance: [], testTypes: ["Load tests (k6)"] },
  "NFR-004": { acceptance: [], testTypes: ["Load tests (k6)"] },
  "NFR-005": { acceptance: ["AT-007"], testTypes: [] },
  "NFR-006": { acceptance: [], testTypes: [] },
  "NFR-007": { acceptance: [], testTypes: [] },
  "NFR-008": { acceptance: [], testTypes: ["Unit tests"] },
  "NFR-009": { acceptance: [], testTypes: ["Contract tests"] },
};
