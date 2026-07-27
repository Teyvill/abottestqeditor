import type { NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import { PinRow } from './Pin';

export function StartNode({ selected }: NodeProps) {
  return (
    <NodeShell kind="start" title="Start" selected={selected} width={140}>
      <PinRow side="right" type="source" id="out" label="out" />
    </NodeShell>
  );
}
