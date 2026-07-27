import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  AnyNodeData,
  FlowEdge,
  FlowNode,
  GraphData,
  NodeKind,
  OptionItem,
  PathEntry,
} from './types';
import { buildSeed } from './seed';

let idCounter = 1;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

function makeStartNode(position = { x: 80, y: 200 }): FlowNode {
  return {
    id: nextId('start'),
    type: 'start',
    position,
    data: { kind: 'start' },
  };
}

function defaultDataFor(kind: NodeKind): AnyNodeData {
  switch (kind) {
    case 'start':
      return { kind: 'start' };
    case 'folder':
      return { kind: 'folder', name: 'New Folder' };
    case 'functional':
      return { kind: 'functional', name: 'New Functional' };
    case 'eventActor':
      return {
        kind: 'eventActor',
        name: 'New Event',
        idOverride: null,
        continent: 'fo',
        sector: 'Sector1',
        settlement: 'Capital',
        locationName: 'Lindenmoor',
        seq: '01',
        image: '',
        repeatable: false,
        unique: true,
        maxRuns: 1,
      };
    case 'dialogue':
      return { kind: 'dialogue', text: 'New dialogue line...', options: [] };
    case 'location':
      return { kind: 'location', x: 0, y: 0, z: 0, radius: 10 };
    case 'end':
      return { kind: 'end' };
    case 'unlock':
      return { kind: 'unlock', label: 'new-unlock' };
    default:
      throw new Error(`unknown kind ${kind}`);
  }
}

interface StoreState {
  graphs: Record<string, GraphData>;
  path: PathEntry[];
  selectedNodeId: string | null;
  toast: string | null;
  playEventActorId: string | null;

  currentGraph: () => GraphData;
  currentContainerId: () => string;

  setSelected: (id: string | null) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (kind: NodeKind, position: { x: number; y: number }) => string;
  updateNodeData: (id: string, patch: Partial<AnyNodeData>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;

  addOption: (dialogueId: string) => void;
  updateOption: (dialogueId: string, optionId: string, patch: Partial<OptionItem>) => void;
  deleteOption: (dialogueId: string, optionId: string) => void;
  reorderOptions: (dialogueId: string, fromIndex: number, toIndex: number) => void;

  enterContainer: (nodeId: string) => void;
  goToPathIndex: (index: number) => void;

  showToast: (msg: string) => void;
  clearToast: () => void;

  openPlay: (eventActorId: string) => void;
  closePlay: () => void;

  exportJSON: () => string;
  importJSON: (json: string) => void;
  resetSeed: () => void;
}

function ensureChildGraph(graphs: Record<string, GraphData>, containerId: string, withStart: boolean) {
  if (!graphs[containerId]) {
    graphs[containerId] = {
      nodes: withStart ? [makeStartNode()] : [],
      edges: [],
    };
  }
}

const AUTOSAVE_KEY = 'storyflow-lite-autosave-v1';
const AUTOSAVE_ENABLED = true;

function initialGraphs(): Record<string, GraphData> {
  if (AUTOSAVE_ENABLED) {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) return (JSON.parse(raw) as { graphs: Record<string, GraphData> }).graphs;
    } catch {
      // fall through to seed
    }
  }
  return buildSeed();
}

export const useStore = create<StoreState>((set, get) => ({
  graphs: initialGraphs(),
  path: [{ containerId: 'root', label: 'Root', level: 1 }],
  selectedNodeId: null,
  toast: null,
  playEventActorId: null,

  currentContainerId: () => {
    const { path } = get();
    return path[path.length - 1].containerId;
  },

  currentGraph: () => {
    const containerId = get().currentContainerId();
    return get().graphs[containerId] ?? { nodes: [], edges: [] };
  },

  setSelected: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const nodes = applyNodeChanges(changes, graph.nodes) as FlowNode[];
      return { graphs: { ...state.graphs, [containerId]: { ...graph, nodes } } };
    });
    persist(get);
  },

  onEdgesChange: (changes) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const edges = applyEdgeChanges(changes, graph.edges) as FlowEdge[];
      return { graphs: { ...state.graphs, [containerId]: { ...graph, edges } } };
    });
    persist(get);
  },

  onConnect: (connection) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const edges = addEdge(
        { ...connection, type: 'default', animated: false },
        graph.edges,
      ) as FlowEdge[];
      return { graphs: { ...state.graphs, [containerId]: { ...graph, edges } } };
    });
    persist(get);
  },

  addNode: (kind, position) => {
    const containerId = get().currentContainerId();
    const id = nextId(kind);
    const node: FlowNode = { id, type: kind, position, data: defaultDataFor(kind) };
    set((state) => {
      const graphs = { ...state.graphs };
      const graph = graphs[containerId] ?? { nodes: [], edges: [] };
      graphs[containerId] = { ...graph, nodes: [...graph.nodes, node] };
      if (kind === 'folder' || kind === 'functional') {
        ensureChildGraph(graphs, id, true);
      }
      return { graphs };
    });
    persist(get);
    return id;
  },

  updateNodeData: (id, patch) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const nodes = graph.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } as AnyNodeData } : n,
      );
      return { graphs: { ...state.graphs, [containerId]: { ...graph, nodes } } };
    });
    persist(get);
  },

  deleteNode: (id) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graphs = { ...state.graphs };
      const graph = graphs[containerId] ?? { nodes: [], edges: [] };
      graphs[containerId] = {
        nodes: graph.nodes.filter((n) => n.id !== id),
        edges: graph.edges.filter((e) => e.source !== id && e.target !== id),
      };
      delete graphs[id]; // drop child graph if any
      return {
        graphs,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    });
    persist(get);
  },

  deleteEdge: (id) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      return {
        graphs: {
          ...state.graphs,
          [containerId]: { ...graph, edges: graph.edges.filter((e) => e.id !== id) },
        },
      };
    });
    persist(get);
  },

  addOption: (dialogueId) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const nodes = graph.nodes.map((n) => {
        if (n.id !== dialogueId || n.data.kind !== 'dialogue') return n;
        const options = [...n.data.options, {
          id: nextId('opt'),
          text: 'New option',
          conditionType: 'none' as const,
          conditionValue: '',
        }];
        return { ...n, data: { ...n.data, options } };
      });
      return { graphs: { ...state.graphs, [containerId]: { ...graph, nodes } } };
    });
    persist(get);
  },

  updateOption: (dialogueId, optionId, patch) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const nodes = graph.nodes.map((n) => {
        if (n.id !== dialogueId || n.data.kind !== 'dialogue') return n;
        const options = n.data.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o));
        return { ...n, data: { ...n.data, options } };
      });
      return { graphs: { ...state.graphs, [containerId]: { ...graph, nodes } } };
    });
    persist(get);
  },

  deleteOption: (dialogueId, optionId) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const nodes = graph.nodes.map((n) => {
        if (n.id !== dialogueId || n.data.kind !== 'dialogue') return n;
        const options = n.data.options.filter((o) => o.id !== optionId);
        return { ...n, data: { ...n.data, options } };
      });
      const handleId = `opt-${optionId}`;
      const edges = graph.edges.filter(
        (e) => !(e.source === dialogueId && e.sourceHandle === handleId),
      );
      return { graphs: { ...state.graphs, [containerId]: { nodes, edges } } };
    });
    persist(get);
  },

  reorderOptions: (dialogueId, fromIndex, toIndex) => {
    const containerId = get().currentContainerId();
    set((state) => {
      const graph = state.graphs[containerId] ?? { nodes: [], edges: [] };
      const nodes = graph.nodes.map((n) => {
        if (n.id !== dialogueId || n.data.kind !== 'dialogue') return n;
        const options = [...n.data.options];
        const [moved] = options.splice(fromIndex, 1);
        options.splice(toIndex, 0, moved);
        return { ...n, data: { ...n.data, options } };
      });
      return { graphs: { ...state.graphs, [containerId]: { ...graph, nodes } } };
    });
    persist(get);
  },

  enterContainer: (nodeId) => {
    const graph = get().currentGraph();
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    if (node.data.kind !== 'folder' && node.data.kind !== 'functional') return;
    const level = node.data.kind === 'folder' ? 2 : 3;
    const label = (node.data as { name: string }).name || 'Untitled';
    ensureChildGraph(get().graphs, nodeId, true);
    set((state) => ({
      path: [...state.path, { containerId: nodeId, label, level }],
      selectedNodeId: null,
    }));
  },

  goToPathIndex: (index) => {
    set((state) => ({ path: state.path.slice(0, index + 1), selectedNodeId: null }));
  },

  showToast: (msg) => set({ toast: msg }),
  clearToast: () => set({ toast: null }),

  openPlay: (eventActorId) => set({ playEventActorId: eventActorId }),
  closePlay: () => set({ playEventActorId: null }),

  exportJSON: () => {
    const { graphs, path } = get();
    return JSON.stringify({ graphs, path: [path[0]] }, null, 2);
  },

  importJSON: (json) => {
    const parsed = JSON.parse(json) as { graphs: Record<string, GraphData>; path?: PathEntry[] };
    set({
      graphs: parsed.graphs,
      path: parsed.path && parsed.path.length ? parsed.path : [{ containerId: 'root', label: 'Root', level: 1 }],
      selectedNodeId: null,
    });
    persist(get);
  },

  resetSeed: () => {
    set({
      graphs: buildSeed(),
      path: [{ containerId: 'root', label: 'Root', level: 1 }],
      selectedNodeId: null,
    });
    persist(get);
  },
}));

function persist(get: () => StoreState) {
  if (!AUTOSAVE_ENABLED) return;
  try {
    const { graphs } = get();
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ graphs }));
  } catch {
    // ignore quota / serialization errors in demo
  }
}

