import type { NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import { PinRow } from './Pin';

export function EndNode({ selected }: NodeProps) {
  return (
    <NodeShell kind="end" title="End" selected={selected} width={140}>
      <PinRow side="left" type="target" id="in" label="in" activeColor="#f43f5e" />
    </NodeShell>
  );
}
