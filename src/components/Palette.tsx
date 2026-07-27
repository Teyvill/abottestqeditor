import { useReactFlow } from '@xyflow/react';
import { useStore } from '../store';
import type { NodeKind } from '../types';
import { KIND_COLORS } from '../nodes/NodeShell';

interface PaletteItem {
  kind: NodeKind;
  label: string;
  singleton?: boolean;
}

const LEVEL_ITEMS: Record<number, PaletteItem[]> = {
  1: [
    { kind: 'start', label: 'Start', singleton: true },
    { kind: 'folder', label: 'Folder' },
  ],
  2: [
    { kind: 'start', label: 'Start', singleton: true },
    { kind: 'functional', label: 'Functional' },
    { kind: 'end', label: 'End' },
    { kind: 'unlock', label: 'Unlock' },
  ],
  3: [
    { kind: 'start', label: 'Start', singleton: true },
    { kind: 'eventActor', label: 'Event Actor' },
    { kind: 'location', label: 'Location' },
    { kind: 'dialogue', label: 'Dialogue' },
    { kind: 'end', label: 'End' },
    { kind: 'unlock', label: 'Unlock' },
  ],
};

export function Palette() {
  const path = useStore((s) => s.path);
  const addNode = useStore((s) => s.addNode);
  const currentGraph = useStore((s) => s.currentGraph());
  const { screenToFlowPosition } = useReactFlow();

  const level = path[path.length - 1].level;
  const items = LEVEL_ITEMS[level] ?? [];
  const hasStart = currentGraph.nodes.some((n) => n.data.kind === 'start');

  const handleAdd = (kind: NodeKind) => {
    const position = screenToFlowPosition({
      x: 340 + Math.random() * 120,
      y: 200 + Math.random() * 240,
    });
    addNode(kind, position);
  };

  return (
    <div className="flex flex-col gap-1.5 p-2.5 bg-neutral-900/90 border border-neutral-700 rounded-lg shadow backdrop-blur w-40">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500 px-1">Add node</div>
      {items.map((item) => {
        const disabled = item.singleton && hasStart;
        const colors = KIND_COLORS[item.kind];
        return (
          <button
            key={item.kind}
            disabled={disabled}
            onClick={() => handleAdd(item.kind)}
            className={`text-left text-xs px-2.5 py-1.5 rounded font-medium ${colors.header} ${colors.text} ${
              disabled ? 'opacity-30 cursor-not-allowed' : 'hover:brightness-110'
            }`}
            title={disabled ? 'Only one Start allowed per canvas' : `Add ${item.label}`}
          >
            + {item.label}
          </button>
        );
      })}
    </div>
  );
}
