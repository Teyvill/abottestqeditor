import type { Edge, Node } from '@xyflow/react';

export type NodeKind =
  | 'start'
  | 'folder'
  | 'functional'
  | 'eventActor'
  | 'dialogue'
  | 'location'
  | 'end'
  | 'unlock';

export interface OptionItem {
  id: string;
  text: string;
  /** stub, "later": future condition types for this option */
  conditionType: 'none' | 'hidden' | 'locked';
  conditionValue: string;
}

export interface StartData {
  kind: 'start';
  [key: string]: unknown;
}

export interface FolderData {
  kind: 'folder';
  name: string;
  [key: string]: unknown;
}

export interface FunctionalData {
  kind: 'functional';
  name: string;
  [key: string]: unknown;
}

export interface EventActorData {
  kind: 'eventActor';
  name: string;
  idOverride: string | null;
  continent: string;
  sector: string;
  settlement: string;
  locationName: string;
  seq: string;
  image: string;
  repeatable: boolean;
  unique: boolean;
  /** stub, "later": limited number of runs */
  maxRuns: number;
  [key: string]: unknown;
}

export interface DialogueData {
  kind: 'dialogue';
  text: string;
  options: OptionItem[];
  [key: string]: unknown;
}

export interface LocationData {
  kind: 'location';
  x: number;
  y: number;
  z: number;
  radius: number;
  [key: string]: unknown;
}

export interface EndData {
  kind: 'end';
  [key: string]: unknown;
}

export interface UnlockData {
  kind: 'unlock';
  label: string;
  [key: string]: unknown;
}

export type AnyNodeData =
  | StartData
  | FolderData
  | FunctionalData
  | EventActorData
  | DialogueData
  | LocationData
  | EndData
  | UnlockData;

export type FlowNode = Node<AnyNodeData>;
export type FlowEdge = Edge;

export interface GraphData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface PathEntry {
  containerId: string;
  label: string;
  level: number; // 1 = root/org, 2 = functional, 3 = script
}

// TODO: spec text says the event-name segment should be "uppercase", but the
// spec's own reference example is lower-case kebab (…Event01the-passenger).
// We follow the reference example, not the prose.
export function computeEventActorId(d: EventActorData): string {
  if (d.idOverride) return d.idOverride;
  const kebab = d.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${d.continent}${d.sector}${d.settlement}${d.locationName}Event${d.seq}${kebab}`;
}
