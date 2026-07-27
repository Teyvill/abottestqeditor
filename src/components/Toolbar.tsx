import { useRef } from 'react';
import { useStore } from '../store';

export function Toolbar() {
  const exportJSON = useStore((s) => s.exportJSON);
  const importJSON = useStore((s) => s.importJSON);
  const resetSeed = useStore((s) => s.resetSeed);
  const showToast = useStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storyflow-event.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importJSON(text);
      showToast('Imported JSON');
    } catch {
      showToast('Import failed: invalid JSON');
    }
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 border border-neutral-700 rounded-lg shadow backdrop-blur text-xs">
      <button className="px-2.5 py-1 rounded bg-neutral-700 hover:bg-neutral-600" onClick={handleExport}>
        ⬇ Export JSON
      </button>
      <button className="px-2.5 py-1 rounded bg-neutral-700 hover:bg-neutral-600" onClick={handleImportClick}>
        ⬆ Import JSON
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
      <button
        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400"
        onClick={() => {
          if (confirm('Reset to seed demo content? This discards current changes.')) resetSeed();
        }}
      >
        ↺ Reset demo
      </button>
    </div>
  );
}
