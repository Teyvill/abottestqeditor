// Pin "type" governs color + shape, independent of node color — mirrors
// Blueprint-style typed pins (e.g. white exec pins regardless of node color).
export type PinType = 'trigger' | 'story';

export const PIN_TYPE_COLOR: Record<PinType, string> = {
  // trigger: what activates a node (Start / Location / Unlock -> Folder/Functional/EventActor)
  trigger: '#f4f4f5',
  // story: narrative sequence flow (EventActor text -> Dialogue -> ... -> End/Unlock)
  story: '#2dd4bf',
};

const HANDLE_TYPE: Record<string, PinType> = {
  out: 'trigger',
  conditions: 'trigger',
  text: 'story',
  in: 'story',
  impact: 'story',
};

export function resolvePinType(handleId: string | null | undefined): PinType {
  if (!handleId) return 'story';
  if (handleId in HANDLE_TYPE) return HANDLE_TYPE[handleId];
  if (handleId.startsWith('opt-cond-')) return 'trigger';
  if (handleId.startsWith('opt-')) return 'story';
  return 'story';
}
