import type { NodeProps } from '@xyflow/react';
import type { UnlockData } from '../types';
import { useStore } from '../store';
import { NodeShell, Field, inputCls, LaterBadge } from './NodeShell';
import { PinRow } from './Pin';

export function UnlockNode({ id, data, selected }: NodeProps) {
  const d = data as UnlockData;
  const updateNodeData = useStore((s) => s.updateNodeData);

  return (
    <NodeShell kind="unlock" title="Unlock" selected={selected} width={220}>
      <PinRow side="left" type="target" id="in" label="in" activeColor="#a78bfa" />
      <Field label="Unlock id / label">
        <input
          className={inputCls}
          value={d.label}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
        />
      </Field>
      <div className="flex items-center gap-1.5">
        <LaterBadge tooltip="later: spawns a persistent state variable" />
        <span className="text-[10px] text-neutral-500">state variable</span>
      </div>
      <PinRow side="right" type="source" id="out" label="→ Event Actor conditions" activeColor="#a78bfa" />
    </NodeShell>
  );
}
