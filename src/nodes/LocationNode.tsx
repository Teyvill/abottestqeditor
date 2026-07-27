import type { NodeProps } from '@xyflow/react';
import type { LocationData } from '../types';
import { useStore } from '../store';
import { NodeShell, Field, inputCls, LaterBadge } from './NodeShell';
import { PinRow } from './Pin';

export function LocationNode({ id, data, selected }: NodeProps) {
  const d = data as LocationData;
  const updateNodeData = useStore((s) => s.updateNodeData);

  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <NodeShell kind="location" title="📍 Location" selected={selected} width={220}>
      <div className="grid grid-cols-3 gap-1.5">
        <Field label="X">
          <input type="number" className={inputCls} value={d.x} onChange={(e) => updateNodeData(id, { x: num(e.target.value) })} />
        </Field>
        <Field label="Y">
          <input type="number" className={inputCls} value={d.y} onChange={(e) => updateNodeData(id, { y: num(e.target.value) })} />
        </Field>
        <Field label="Z">
          <input type="number" className={inputCls} value={d.z} onChange={(e) => updateNodeData(id, { z: num(e.target.value) })} />
        </Field>
      </div>
      <Field label="Activation radius (m)">
        <input
          type="number"
          className={inputCls}
          value={d.radius}
          onChange={(e) => updateNodeData(id, { radius: num(e.target.value) })}
        />
      </Field>
      <div className="flex items-center gap-1.5">
        <LaterBadge tooltip="later: irregular zones / collider shapes" />
        <span className="text-[10px] text-neutral-500">irregular zones</span>
      </div>
      <PinRow side="right" type="source" id="out" label="conditions" pinType="pin" />
    </NodeShell>
  );
}
