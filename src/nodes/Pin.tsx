import { Handle, Position, type HandleType } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { LaterBadge } from './NodeShell';

interface PinRowProps {
  side: 'left' | 'right';
  type: HandleType;
  id: string;
  label: string;
  active?: boolean;
  laterTooltip?: string;
  activeColor?: string;
}

const inlineHandleStyle: CSSProperties = {
  position: 'static',
  transform: 'none',
  width: 10,
  height: 10,
  borderWidth: 2,
  borderColor: '#171717',
  flexShrink: 0,
};

export function PinRow({ side, type, id, label, active = true, laterTooltip, activeColor }: PinRowProps) {
  const position = side === 'left' ? Position.Left : Position.Right;
  const bg = active ? activeColor ?? '#38bdf8' : '#525252';
  const handle = (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={active}
      style={{ ...inlineHandleStyle, background: bg, opacity: active ? 1 : 0.6 }}
    />
  );
  const text = (
    <span className={`text-[10px] leading-tight ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>
      {label}
    </span>
  );
  return (
    <div className={`flex items-center gap-1.5 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {handle}
      {text}
      {!active && laterTooltip && <LaterBadge tooltip={laterTooltip} />}
    </div>
  );
}
