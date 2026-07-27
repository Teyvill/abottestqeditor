import { useStore } from '../store';

export function Breadcrumbs() {
  const path = useStore((s) => s.path);
  const goToPathIndex = useStore((s) => s.goToPathIndex);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900/90 border border-neutral-700 rounded-lg text-xs backdrop-blur shadow">
      {path.map((p, i) => (
        <span key={p.containerId} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-600">▸</span>}
          <button
            className={`px-1.5 py-0.5 rounded hover:bg-neutral-700 ${
              i === path.length - 1 ? 'text-amber-300 font-semibold' : 'text-neutral-300'
            }`}
            onClick={() => goToPathIndex(i)}
          >
            {p.label}
          </button>
        </span>
      ))}
      {path.length > 1 && (
        <button
          className="ml-2 px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200"
          onClick={() => goToPathIndex(path.length - 2)}
        >
          ↑ up
        </button>
      )}
    </div>
  );
}
