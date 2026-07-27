import { useState } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { DialogueData } from '../types';
import { useStore } from '../store';
import { NodeShell, inputCls, LaterBadge } from './NodeShell';
import { PinRow } from './Pin';

export function DialogueNode({ id, data, selected }: NodeProps) {
  const d = data as DialogueData;
  const updateNodeData = useStore((s) => s.updateNodeData);
  const addOption = useStore((s) => s.addOption);
  const updateOption = useStore((s) => s.updateOption);
  const deleteOption = useStore((s) => s.deleteOption);
  const reorderOptions = useStore((s) => s.reorderOptions);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const hasOptions = d.options.length > 0;

  return (
    <NodeShell kind="dialogue" title="Dialogue" selected={selected} width={300}>
      <PinRow side="left" type="target" id="in" label="in" activeColor="#2dd4bf" />
      <textarea
        className={`${inputCls} min-h-20 resize-y`}
        value={d.text}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Dialogue text..."
      />

      {!hasOptions && <PinRow side="right" type="source" id="impact" label="impact (Continue)" activeColor="#2dd4bf" />}

      <div className="space-y-1.5">
        {d.options.map((opt, i) => (
          <div
            key={opt.id}
            draggable
            className={`nodrag rounded-lg bg-pink-950/40 border border-pink-800/60 px-2 py-1.5 space-y-1 cursor-grab ${
              dragIndex === i ? 'opacity-40' : ''
            }`}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== i) reorderOptions(id, dragIndex, i);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <div className="flex items-center gap-1">
              <span className="text-pink-400 text-[10px]" title="drag to reorder">⠿</span>
              <Handle side="left" active={false} optionId={opt.id} />
              <input
                className={`${inputCls} !bg-pink-900/30 !border-pink-800 flex-1`}
                value={opt.text}
                onChange={(e) => updateOption(id, opt.id, { text: e.target.value })}
                placeholder="Option text..."
              />
              <button
                className="text-pink-300 hover:text-pink-100 text-xs px-1"
                onClick={() => deleteOption(id, opt.id)}
                title="Delete option"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between">
              <LaterBadge tooltip="later: condition type — hidden (option invisible) or locked (visible with a lock + requirement text)" />
              <div className="flex items-center gap-1 text-pink-300 text-[10px]">
                impact
                <Handle side="right" active optionId={opt.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="nodrag w-full text-[10px] py-1 rounded border border-dashed border-pink-700 text-pink-300 hover:bg-pink-950/40"
        onClick={() => addOption(id)}
      >
        + Add option
      </button>
    </NodeShell>
  );
}

function Handle({ side, active, optionId }: { side: 'left' | 'right'; active: boolean; optionId: string }) {
  return (
    <PinRow
      side={side}
      type={side === 'left' ? 'target' : 'source'}
      id={side === 'left' ? `opt-cond-${optionId}` : `opt-${optionId}`}
      label=""
      active={active}
      activeColor="#f472b6"
    />
  );
}
