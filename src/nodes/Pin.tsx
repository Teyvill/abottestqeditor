import { Handle, Position, type HandleType } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { LaterBadge } from './NodeShell';
import { PIN_TYPE_COLOR, type PinType } from './pinTypes';

interface PinRowProps {
  side: 'left' | 'right';
  type: HandleType;
  id: string;
  label: string;
  pinType: PinType;
  active?: boolean;
  laterTooltip?: string;
}

const baseHandleStyle: CSSProperties = {
  position: 'static',
  transform: 'none',
  flexShrink: 0,
};

function handleStyle(pinType: PinType, active: boolean): CSSProperties {
  const color = active ? PIN_TYPE_COLOR[pinType] : '#525252';
  if (pinType === 'trigger') {
    // exec-style arrow/triangle pin, Blueprint-flavored
    return {
      ...baseHandleStyle,
      width: 12,
      height: 11,
      background: color,
      borderRadius: 2,
      border: 'none',
      clipPath: 'polygon(0% 0%, 65% 0%, 100% 50%, 65% 100%, 0% 100%)',
      opacity: active ? 1 : 0.55,
    };
  }
  return {
    ...baseHandleStyle,
    width: 10,
    height: 10,
    background: color,
    borderRadius: '50%',
    border: '2px solid #171717',
    opacity: active ? 1 : 0.55,
  };
}

export function PinRow({ side, type, id, label, pinType, active = true, laterTooltip }: PinRowProps) {
  const position = side === 'left' ? Position.Left : Position.Right;
  const handle = (
    <Handle type={type} position={position} id={id} isConnectable={active} style={handleStyle(pinType, active)} />
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
