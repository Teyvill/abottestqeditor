import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { DialogueData, EventActorData, UnlockData } from '../types';

export function PlayModal() {
  const playEventActorId = useStore((s) => s.playEventActorId);
  const closePlay = useStore((s) => s.closePlay);
  const showToast = useStore((s) => s.showToast);
  const graph = useStore((s) => s.currentGraph());
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    if (!playEventActorId) {
      setCurrentId(null);
      return;
    }
    const startEdge = graph.edges.find((e) => e.source === playEventActorId && e.sourceHandle === 'text');
    setCurrentId(startEdge?.target ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playEventActorId]);

  if (!playEventActorId) return null;
  const eventActor = graph.nodes.find((n) => n.id === playEventActorId);
  if (!eventActor || eventActor.data.kind !== 'eventActor') return null;
  const actorData = eventActor.data as EventActorData;

  const currentNode = graph.nodes.find((n) => n.id === currentId);
  const dialogueData = currentNode?.data.kind === 'dialogue' ? (currentNode.data as DialogueData) : null;

  function goTo(targetId: string | undefined) {
    if (!targetId) {
      closePlay();
      return;
    }
    const node = graph.nodes.find((n) => n.id === targetId);
    if (!node) {
      closePlay();
      return;
    }
    if (node.data.kind === 'end') {
      closePlay();
      return;
    }
    if (node.data.kind === 'unlock') {
      showToast(`Unlocked: ${(node.data as UnlockData).label}`);
      closePlay();
      return;
    }
    setCurrentId(targetId);
  }

  const handleContinue = () => {
    const edge = graph.edges.find((e) => e.source === currentId && e.sourceHandle === 'impact');
    goTo(edge?.target);
  };

  const handleOption = (optId: string) => {
    const edge = graph.edges.find((e) => e.source === currentId && e.sourceHandle === `opt-${optId}`);
    goTo(edge?.target);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/75 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative">
          {actorData.image ? (
            <img src={actorData.image} alt="" className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-amber-800 to-neutral-900" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pt-8 pb-2.5">
            <h2 className="text-amber-300 font-bold text-lg leading-tight">{actorData.name}</h2>
          </div>
          <button
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-neutral-200 text-sm"
            onClick={closePlay}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 min-h-24 text-neutral-100 text-sm leading-relaxed whitespace-pre-wrap">
          {dialogueData ? dialogueData.text : 'No dialogue connected to this event yet.'}
        </div>

        <div className="px-5 pb-5 flex flex-col gap-2">
          {dialogueData && dialogueData.options.length > 0 ? (
            dialogueData.options
              .filter((o) => o.conditionType !== 'hidden')
              .map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleOption(o.id)}
                  className="text-left px-3.5 py-2 rounded-lg bg-pink-950/50 hover:bg-pink-900/60 border border-pink-800/60 text-pink-100 text-sm flex items-center gap-2"
                >
                  {o.conditionType === 'locked' && <span title="locked (demo: still clickable)">🔒</span>}
                  {o.text}
                </button>
              ))
          ) : dialogueData ? (
            <button
              onClick={handleContinue}
              className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-teal-50 text-sm font-medium self-end"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={closePlay}
              className="px-3.5 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-100 text-sm self-end"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
