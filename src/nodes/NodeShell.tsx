import type { ReactNode } from 'react';

export const KIND_COLORS: Record<string, { header: string; ring: string; text: string }> = {
  start: { header: 'bg-neutral-600', ring: 'ring-neutral-400', text: 'text-neutral-100' },
  folder: { header: 'bg-indigo-600', ring: 'ring-indigo-400', text: 'text-indigo-50' },
  functional: { header: 'bg-blue-600', ring: 'ring-blue-400', text: 'text-blue-50' },
  eventActor: { header: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-950' },
  dialogue: { header: 'bg-teal-700', ring: 'ring-teal-400', text: 'text-teal-50' },
  location: { header: 'bg-emerald-600', ring: 'ring-emerald-400', text: 'text-emerald-50' },
  end: { header: 'bg-rose-900', ring: 'ring-rose-500', text: 'text-rose-50' },
  unlock: { header: 'bg-violet-600', ring: 'ring-violet-400', text: 'text-violet-50' },
};

interface NodeShellProps {
  kind: string;
  title: string;
  icon?: ReactNode;
  selected?: boolean;
  width?: number;
  children?: ReactNode;
  headerRight?: ReactNode;
  onDoubleClick?: () => void;
}

export function NodeShell({
  kind,
  title,
  icon,
  selected,
  width = 260,
  children,
  headerRight,
  onDoubleClick,
}: NodeShellProps) {
  const colors = KIND_COLORS[kind] ?? KIND_COLORS.start;
  return (
    <div
      onDoubleClick={onDoubleClick}
      style={{ width, boxShadow: selected ? undefined : '0 4px 14px rgba(0,0,0,0.55)' }}
      className={`rounded-md overflow-hidden bg-[#1a1c22] border ${
        selected ? `ring-2 ${colors.ring} border-transparent` : 'border-black/60'
      }`}
    >
      <div
        className={`${colors.header} ${colors.text} px-3 py-1.5 flex items-center gap-1.5 text-sm font-bold tracking-wide bg-gradient-to-b from-white/10 to-transparent`}
      >
        {icon}
        <span className="truncate flex-1">{title}</span>
        {headerRight}
      </div>
      {children && (
        <div className="px-3 py-2.5 text-xs text-neutral-200 space-y-2 bg-[#202329]">{children}</div>
      )}
    </div>
  );
}

export function LaterBadge({ tooltip }: { tooltip: string }) {
  return (
    <span
      title={tooltip}
      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-neutral-700 text-neutral-400 border border-neutral-600 cursor-help select-none"
    >
      later
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wide text-neutral-500 mb-0.5">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 nodrag';
