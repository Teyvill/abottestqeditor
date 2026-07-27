import type { NodeProps } from '@xyflow/react';
import type { FolderData } from '../types';
import { useStore } from '../store';
import { NodeShell, Field, inputCls } from './NodeShell';
import { PinRow } from './Pin';

export function FolderNode({ id, data, selected }: NodeProps) {
  const d = data as FolderData;
  const updateNodeData = useStore((s) => s.updateNodeData);
  const enterContainer = useStore((s) => s.enterContainer);
  const count = useStore((s) => s.graphs[id]?.nodes.length ?? 0);

  return (
    <NodeShell
      kind="folder"
      title="📁 Folder"
      selected={selected}
      onDoubleClick={() => enterContainer(id)}
      headerRight={
        <span className="text-[10px] bg-black/25 rounded-full px-1.5 py-0.5" title="nodes inside">
          {count}
        </span>
      }
    >
      <PinRow side="left" type="target" id="trigger" label="" pinType="flow" />
      <Field label="Name">
        <input
          className={inputCls}
          value={d.name}
          onChange={(e) => updateNodeData(id, { name: e.target.value })}
        />
      </Field>
      <div className="text-[10px] text-neutral-500 italic">Double-click to open</div>
    </NodeShell>
  );
}
