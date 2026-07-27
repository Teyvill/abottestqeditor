import { useState } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { EventActorData } from '../types';
import { computeEventActorId } from '../types';
import { useStore } from '../store';
import { NodeShell, Field, inputCls, LaterBadge } from './NodeShell';
import { PinRow } from './Pin';

const isValidImageUrl = (url: string) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export function EventActorNode({ id, data, selected }: NodeProps) {
  const d = data as EventActorData;
  const updateNodeData = useStore((s) => s.updateNodeData);
  const openPlay = useStore((s) => s.openPlay);
  const [overriding, setOverriding] = useState(false);

  const autoId = computeEventActorId(d);
  const showPreview = isValidImageUrl(d.image);

  return (
    <NodeShell kind="eventActor" title="🎭 Event Actor" selected={selected} width={300}>
      <PinRow side="left" type="target" id="trigger" label="" pinType="flow" />
      <PinRow side="left" type="target" id="context" label="conditions (Location)" pinType="pin" />

      <Field label={`Name (${d.name.length}/60)`}>
        <input
          className={inputCls}
          maxLength={60}
          value={d.name}
          onChange={(e) => updateNodeData(id, { name: e.target.value.slice(0, 60) })}
        />
      </Field>

      <Field label="ID (auto)">
        {overriding ? (
          <input
            className={inputCls}
            value={d.idOverride ?? autoId}
            onChange={(e) => updateNodeData(id, { idOverride: e.target.value })}
            onBlur={() => setOverriding(false)}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1">
            <input className={`${inputCls} opacity-70`} value={autoId} readOnly />
            <button
              className="nodrag text-[10px] px-1.5 py-1 rounded bg-neutral-700 hover:bg-neutral-600 shrink-0"
              onClick={() => {
                updateNodeData(id, { idOverride: d.idOverride ?? autoId });
                setOverriding(true);
              }}
            >
              override
            </button>
          </div>
        )}
      </Field>

      <Field label="Image URL">
        <input
          className={inputCls}
          placeholder="https://..."
          value={d.image}
          onChange={(e) => updateNodeData(id, { image: e.target.value })}
        />
      </Field>
      {showPreview && (
        <img src={d.image} alt="" className="w-full h-20 object-cover rounded border border-neutral-700" />
      )}

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-[11px] nodrag">
          <input
            type="checkbox"
            checked={d.repeatable}
            onChange={(e) => updateNodeData(id, { repeatable: e.target.checked })}
          />
          Repeatable
        </label>
        <label className="flex items-center gap-1 text-[11px] nodrag">
          <input
            type="checkbox"
            checked={d.unique}
            onChange={(e) => updateNodeData(id, { unique: e.target.checked })}
          />
          Unique
        </label>
      </div>

      <Field label="Run limit (count)">
        <div className="flex items-center gap-1.5">
          <input type="number" className={`${inputCls} opacity-50`} value={d.maxRuns} disabled />
          <LaterBadge tooltip="later: limited number of runs" />
        </div>
      </Field>

      <PinRow side="right" type="source" id="text" label="event text" pinType="flow" />

      <button
        className="nodrag w-full mt-1 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold text-xs flex items-center justify-center gap-1"
        onClick={() => openPlay(id)}
      >
        ▶ Play
      </button>
    </NodeShell>
  );
}
