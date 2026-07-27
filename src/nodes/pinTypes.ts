// Two kinds of connector, independent of node header color:
// - "flow": anything that MOVES the graph forward (Start -> Folder/Functional/
//   Event Actor, Event Actor -> Dialogue, Dialogue/Option -> Dialogue/End/
//   Unlock, Unlock -> Event Actor). Rendered as an arrow, unlabeled.
// - "pin": anything that provides CONTEXT/conditions without advancing
//   anything itself (Location -> Event Actor, Option's condition stub).
//   Rendered as a small circle.
export type PinType = 'flow' | 'pin';

export const PIN_TYPE_COLOR: Record<PinType, string> = {
  flow: '#f4f4f5',
  pin: '#94a3b8',
};

const HANDLE_TYPE: Record<string, PinType> = {
  trigger: 'flow',
  text: 'flow',
  in: 'flow',
  impact: 'flow',
  context: 'pin',
};

export function resolvePinType(nodeKind: string | undefined, handleId: string | null | undefined): PinType {
  if (!handleId) return 'flow';
  if (handleId === 'out') return nodeKind === 'location' ? 'pin' : 'flow';
  if (handleId in HANDLE_TYPE) return HANDLE_TYPE[handleId];
  if (handleId.startsWith('opt-cond-')) return 'pin';
  if (handleId.startsWith('opt-')) return 'flow';
  return 'flow';
}
