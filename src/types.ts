// Shared type definitions for diagrams and domain content used across the explorer.
// All content is derived from the engineering blueprint in docs/

export type IconName =
  | "shield"
  | "shield-check"
  | "shield-alert"
  | "lock"
  | "key"
  | "qr"
  | "ticket"
  | "credit-card"
  | "wallet"
  | "landmark"
  | "receipt"
  | "database"
  | "server"
  | "cloud"
  | "cpu"
  | "network"
  | "globe"
  | "smartphone"
  | "scan"
  | "camera"
  | "wifi"
  | "wifi-off"
  | "radio"
  | "gate"
  | "stadium"
  | "map"
  | "users"
  | "user"
  | "user-check"
  | "user-cog"
  | "badge"
  | "gauge"
  | "activity"
  | "bar-chart"
  | "pie-chart"
  | "trending-up"
  | "clipboard"
  | "clipboard-check"
  | "file-text"
  | "layers"
  | "boxes"
  | "workflow"
  | "git-branch"
  | "git-merge"
  | "route"
  | "flag"
  | "calendar"
  | "clock"
  | "alert-triangle"
  | "alert-octagon"
  | "check-circle"
  | "x-circle"
  | "search"
  | "eye"
  | "settings"
  | "refresh"
  | "upload"
  | "download"
  | "send"
  | "bell"
  | "building"
  | "trophy"
  | "target"
  | "link"
  | "book"
  | "package"
  | "terminal"
  | "monitor"
  | "hash"
  | "repeat"
  | "shuffle"
  | "zap";

/** A node in a flow / architecture / ERD style graph, positioned on a percentage grid. */
export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  description: string;
  detail?: string[];
  icon?: IconName;
  /** column position 0-based, used for layout */
  col: number;
  /** row position 0-based, used for layout */
  row: number;
  group?: string;
  kind?: "client" | "edge" | "service" | "store" | "external" | "observability" | "default";
  tags?: string[];
}

export interface GraphEdge {
  id?: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  bidirectional?: boolean;
}

export interface GraphGroup {
  id: string;
  label: string;
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
  tone?: "brand" | "violet" | "amber" | "rose" | "slate";
}

export interface ArchitectureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups?: GraphGroup[];
  columns: number;
  rows: number;
}

/** Sequence diagram types */
export interface SequenceParticipant {
  id: string;
  label: string;
  icon?: IconName;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  kind?: "call" | "return" | "async" | "note";
  detail?: string;
  branch?: string;
}

export interface SequenceDiagramData {
  title: string;
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
}

/** State machine types */
export interface StateNodeData {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  terminal?: "start" | "end";
  tone?: "brand" | "violet" | "amber" | "rose" | "slate" | "lime";
}

export interface StateEdgeData {
  from: string;
  to: string;
  label: string;
  /** perpendicular bend of the edge, in viewBox units (positive = bend left of direction) */
  curve?: number;
}

export interface StateMachinePath {
  id: string;
  label: string;
  description: string;
  steps: string[]; // sequence of state ids visited in order
  tone?: "brand" | "violet" | "amber" | "rose" | "lime";
}

export interface StateMachineData {
  title: string;
  width: number;
  height: number;
  states: StateNodeData[];
  edges: StateEdgeData[];
  paths: StateMachinePath[];
}

/** Requirements */
export type RequirementCategory = "functional" | "non-functional";

export interface Requirement {
  id: string;
  category: RequirementCategory;
  title: string;
  summary: string;
  details: string[];
  relatedComponents: string[];
  relatedPhases: string[];
  relatedSections: string[];
}

export interface Stakeholder {
  role: string;
  needs: string;
  icon: IconName;
}

export interface BusinessDomain {
  id: string;
  label: string;
  description: string;
  items: string[];
  icon: IconName;
}

export interface TechStackCategory {
  category: string;
  icon: IconName;
  items: { name: string; note?: string }[];
}

export interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  items: string[];
  outcome: string;
}

export interface AdrRecord {
  id: string;
  title: string;
  decision: string;
  reason: string;
  future?: string;
  status: "accepted";
}

export interface EntityField {
  name: string;
  type: string;
  note?: string;
}

export interface DataEntity {
  id: string;
  label: string;
  domain: string;
  fields: EntityField[];
  col: number;
  row: number;
}

export interface EntityRelation {
  from: string;
  to: string;
  label: string;
  cardinality: string;
}

export interface IndustryReference {
  id: string;
  name: string;
  summary: string;
  lessons: string[];
}

export interface PatternComparisonRow {
  pattern: string;
  examples: string;
  decision: "Adopt" | "Mandatory" | "Reject initially" | "Adopt in Phase 2" | "Conditional";
}

export interface AcceptanceTest {
  id: string;
  title: string;
  steps: string[];
  outcome: string;
}

export interface IncidentCategory {
  severity: "P0" | "P1" | "P2";
  label: string;
  examples: string[];
  tone: "rose" | "amber" | "brand";
}

export interface FraudRule {
  category: string;
  icon: IconName;
  rules: string[];
}

export interface ChecklistGroup {
  title: string;
  items: string[];
}
