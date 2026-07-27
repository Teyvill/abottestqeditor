import type { FlowEdge, FlowNode, GraphData } from './types';

// Fixed ids so the seed graph is deterministic and easy to reason about.
const ID = {
  rootStart: 'seed_root_start',
  folder: 'seed_folder',
  folderStart: 'seed_folder_start',
  functional: 'seed_functional',
  folderEnd: 'seed_folder_end',
  location: 'seed_location',
  eventActor: 'seed_event_actor',
  dialogue1: 'seed_dialogue_1',
  dialogue2: 'seed_dialogue_2',
  dialogue3: 'seed_dialogue_3',
  scriptEnd: 'seed_script_end',
  unlock: 'seed_unlock',
  optAsk: 'seed_opt_ask',
  optOffer: 'seed_opt_offer',
  optWalk: 'seed_opt_walk',
};

function edge(id: string, source: string, target: string, sourceHandle?: string, targetHandle?: string): FlowEdge {
  return { id, source, target, sourceHandle, targetHandle, type: 'default' };
}

export function buildSeed(): Record<string, GraphData> {
  const root: FlowNode[] = [
    { id: ID.rootStart, type: 'start', position: { x: 60, y: 200 }, data: { kind: 'start' } },
    {
      id: ID.folder,
      type: 'folder',
      position: { x: 340, y: 180 },
      data: { kind: 'folder', name: 'Lindenmoor — Events' },
    },
  ];
  const rootEdges: FlowEdge[] = [edge('seed_e_start_folder', ID.rootStart, ID.folder, 'out', 'conditions')];

  const folderGraph: FlowNode[] = [
    { id: ID.folderStart, type: 'start', position: { x: 60, y: 200 }, data: { kind: 'start' } },
    {
      id: ID.functional,
      type: 'functional',
      position: { x: 340, y: 180 },
      data: { kind: 'functional', name: 'The Passenger' },
    },
    { id: ID.folderEnd, type: 'end', position: { x: 660, y: 200 }, data: { kind: 'end' } },
  ];
  const folderEdges: FlowEdge[] = [
    edge('seed_e_folder_start_functional', ID.folderStart, ID.functional, 'out', 'conditions'),
    edge('seed_e_functional_end', ID.functional, ID.folderEnd, 'impact', 'in'),
  ];

  const scriptNodes: FlowNode[] = [
    {
      id: ID.location,
      type: 'location',
      position: { x: 40, y: 380 },
      data: { kind: 'location', x: 1420, y: 0, z: 880, radius: 15 },
    },
    {
      id: ID.eventActor,
      type: 'eventActor',
      position: { x: 380, y: 260 },
      data: {
        kind: 'eventActor',
        name: 'The Passenger',
        idOverride: null,
        continent: 'fo',
        sector: 'Sector1',
        settlement: 'Capital',
        locationName: 'Lindenmoor',
        seq: '01',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=60',
        repeatable: false,
        unique: true,
        maxRuns: 1,
      },
    },
    {
      id: ID.dialogue1,
      type: 'dialogue',
      position: { x: 780, y: 60 },
      data: {
        kind: 'dialogue',
        text: "A cloaked figure sits atop a root that wasn't there yesterday. \"Room for one more?\" it asks, though there is no cart in sight.",
        options: [
          { id: ID.optAsk, text: 'Ask who they are.', conditionType: 'none', conditionValue: '' },
          { id: ID.optOffer, text: "Offer a seat you don't have.", conditionType: 'none', conditionValue: '' },
          { id: ID.optWalk, text: 'Walk away.', conditionType: 'none', conditionValue: '' },
        ],
      },
    },
    {
      id: ID.dialogue2,
      type: 'dialogue',
      position: { x: 1180, y: -60 },
      data: {
        kind: 'dialogue',
        text: '"Names are heavy things to carry this deep in the woods," it says, and the roots lean in to listen.',
        options: [],
      },
    },
    {
      id: ID.dialogue3,
      type: 'dialogue',
      position: { x: 1180, y: 260 },
      data: {
        kind: 'dialogue',
        text: "The figure laughs. A root curls into the shape of a bench. \"Generous. He'll like that about you.\"",
        options: [],
      },
    },
    { id: ID.scriptEnd, type: 'end', position: { x: 1560, y: -60 }, data: { kind: 'end' } },
    {
      id: ID.unlock,
      type: 'unlock',
      position: { x: 1560, y: 260 },
      data: { kind: 'unlock', label: 'cressos-remembers' },
    },
  ];

  const scriptEdges: FlowEdge[] = [
    edge('seed_e_loc_actor', ID.location, ID.eventActor, 'out', 'conditions'),
    edge('seed_e_actor_d1', ID.eventActor, ID.dialogue1, 'text', 'in'),
    edge('seed_e_opt_ask', ID.dialogue1, ID.dialogue2, `opt-${ID.optAsk}`, 'in'),
    edge('seed_e_opt_offer', ID.dialogue1, ID.dialogue3, `opt-${ID.optOffer}`, 'in'),
    edge('seed_e_opt_walk', ID.dialogue1, ID.scriptEnd, `opt-${ID.optWalk}`, 'in'),
    edge('seed_e_d2_end', ID.dialogue2, ID.scriptEnd, 'impact', 'in'),
    edge('seed_e_d3_unlock', ID.dialogue3, ID.unlock, 'impact', 'in'),
  ];

  return {
    root: { nodes: root, edges: rootEdges },
    [ID.folder]: { nodes: folderGraph, edges: folderEdges },
    [ID.functional]: { nodes: scriptNodes, edges: scriptEdges },
  };
}

export const SEED_EVENT_ACTOR_ID = ID.eventActor;
