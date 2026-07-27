import { useEffect } from 'react';
import { useStore } from '../store';

export function Toast() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2800);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-neutral-800 border border-violet-500/60 text-violet-100 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium animate-in fade-in">
      {toast}
    </div>
  );
}
