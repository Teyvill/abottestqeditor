import type { FlowEdge, FlowNode, GraphData } from './types';

// Bump this whenever buildSeed()'s content changes so a browser's stale
// localStorage autosave (from a previous version of the seed) gets thrown
// away instead of permanently shadowing the new seed content.
export const SEED_VERSION = 3;

// Seed content sourced from the Lindenmoor design doc ("Lindenmoor. Ивенты
// WIP"): the approved "Пассажир" event, and the "Завидный урожай" ->
// "Мельница" pair, which the doc gates behind one another (harvest the
// wheat first, then the mill becomes available) — a natural fit for the
// Unlock node. Dialogue/option text below is copied verbatim from the doc.

const ID = {
  rootStart: 'seed_root_start',
  folder: 'seed_folder',
  folderStart: 'seed_folder_start',
  folderEnd: 'seed_folder_end',

  // "The Passenger" (cat-on-head) event
  passengerFunctional: 'seed_passenger_functional',
  passengerStart: 'seed_passenger_start',
  passengerLocation: 'seed_passenger_location',
  passengerActor: 'seed_passenger_actor',
  passengerIntro: 'seed_passenger_intro',
  passengerPutBack: 'seed_passenger_put_back',
  passengerKeep: 'seed_passenger_keep',
  passengerShake: 'seed_passenger_shake',
  passengerOptPutBack: 'seed_passenger_opt_put_back',
  passengerOptKeep: 'seed_passenger_opt_keep',
  passengerOptShake: 'seed_passenger_opt_shake',
  passengerEnd: 'seed_passenger_end',

  // "Field Harvest" (Завидный урожай -> unlocks -> Мельница)
  fieldFunctional: 'seed_field_functional',
  harvestStart: 'seed_harvest_start',
  harvestLocation: 'seed_harvest_location',
  harvestActor: 'seed_harvest_actor',
  harvestIntro: 'seed_harvest_intro',
  harvestHelp: 'seed_harvest_help',
  harvestWalk: 'seed_harvest_walk',
  harvestOptHelp: 'seed_harvest_opt_help',
  harvestOptWalk: 'seed_harvest_opt_walk',
  millUnlock: 'seed_mill_unlock',
  millLocation: 'seed_mill_location',
  millActor: 'seed_mill_actor',
  millIntro: 'seed_mill_intro',
  millStones: 'seed_mill_stones',
  millHands: 'seed_mill_hands',
  millGiant: 'seed_mill_giant',
  millOptStones: 'seed_mill_opt_stones',
  millOptHands: 'seed_mill_opt_hands',
  millOptGiant: 'seed_mill_opt_giant',
  fieldEnd: 'seed_field_end',
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
  const rootEdges: FlowEdge[] = [edge('seed_e_start_folder', ID.rootStart, ID.folder, 'out', 'trigger')];

  const folderGraph: FlowNode[] = [
    { id: ID.folderStart, type: 'start', position: { x: 60, y: 200 }, data: { kind: 'start' } },
    {
      id: ID.passengerFunctional,
      type: 'functional',
      position: { x: 340, y: 60 },
      data: { kind: 'functional', name: 'Passenger' },
    },
    {
      id: ID.fieldFunctional,
      type: 'functional',
      position: { x: 340, y: 340 },
      data: { kind: 'functional', name: 'Field Harvest' },
    },
    { id: ID.folderEnd, type: 'end', position: { x: 700, y: 200 }, data: { kind: 'end' } },
  ];
  const folderEdges: FlowEdge[] = [
    edge('seed_e_folder_start_passenger', ID.folderStart, ID.passengerFunctional, 'out', 'trigger'),
    edge('seed_e_folder_start_field', ID.folderStart, ID.fieldFunctional, 'out', 'trigger'),
    edge('seed_e_passenger_end', ID.passengerFunctional, ID.folderEnd, 'impact', 'in'),
    edge('seed_e_field_end', ID.fieldFunctional, ID.folderEnd, 'impact', 'in'),
  ];

  // ---- Passenger script graph ----
  const passengerNodes: FlowNode[] = [
    { id: ID.passengerStart, type: 'start', position: { x: 40, y: 60 }, data: { kind: 'start' } },
    {
      id: ID.passengerLocation,
      type: 'location',
      position: { x: 40, y: 300 },
      data: { kind: 'location', x: 860, y: 0, z: 430, radius: 12 },
    },
    {
      id: ID.passengerActor,
      type: 'eventActor',
      position: { x: 380, y: 180 },
      data: {
        kind: 'eventActor',
        name: 'Passenger',
        idOverride: null,
        continent: 'fo',
        sector: 'Sector1',
        settlement: 'Capital',
        locationName: 'Lindenmoor',
        seq: '01',
        image: '',
        repeatable: true,
        unique: false,
        maxRuns: 1,
      },
    },
    {
      id: ID.passengerIntro,
      type: 'dialogue',
      position: { x: 780, y: 20 },
      data: {
        kind: 'dialogue',
        text: "An old woman is shouting up at you. It takes a while to work out that she's accusing you of theft, and you have not stolen anything in at least an hour. Then something on your head shifts its weight and starts purring. Apparently, her cat found a new place to sleep.",
        options: [
          { id: ID.passengerOptPutBack, text: 'Put the cat back', conditionType: 'none', conditionValue: '' },
          { id: ID.passengerOptKeep, text: 'Keep the cat', conditionType: 'none', conditionValue: '' },
          { id: ID.passengerOptShake, text: 'Shake the cat off', conditionType: 'none', conditionValue: '' },
        ],
      },
    },
    {
      id: ID.passengerPutBack,
      type: 'dialogue',
      position: { x: 1200, y: -180 },
      data: {
        kind: 'dialogue',
        text: 'You lower the cat past the roofs and set it down on the cobbles without breaking anything, which takes more concentration than your last fight. The old woman checks the cat for damages and leaves without thanking you, ungrateful skunk\n\n[Status: Steady Hands. Useful for precision operations.]',
        options: [],
      },
    },
    {
      id: ID.passengerKeep,
      type: 'dialogue',
      position: { x: 1200, y: 60 },
      data: {
        kind: 'dialogue',
        text: "The cat isn't going anywhere. It has a new bed, you have a new hat. It purrs, and it swipes at things that come near your face, which is arguably an improvement.\n\n[Acquired: Cat Hat]",
        options: [],
      },
    },
    {
      id: ID.passengerShake,
      type: 'dialogue',
      position: { x: 1200, y: 300 },
      data: {
        kind: 'dialogue',
        text: "The cat tries its damnedest to hold on, but to no avail. It falls off and lands on its feet, spending one of its lives. The village saw it, though. They don't appreciate animal cruelty.\n\n[Penalty: Lindenmoore prices +10%]",
        options: [],
      },
    },
    { id: ID.passengerEnd, type: 'end', position: { x: 1620, y: 60 }, data: { kind: 'end' } },
  ];
  const passengerEdges: FlowEdge[] = [
    edge('seed_e_pstart_pactor', ID.passengerStart, ID.passengerActor, 'out', 'trigger'),
    edge('seed_e_ploc_pactor', ID.passengerLocation, ID.passengerActor, 'out', 'context'),
    edge('seed_e_pactor_intro', ID.passengerActor, ID.passengerIntro, 'text', 'in'),
    edge('seed_e_popt_putback', ID.passengerIntro, ID.passengerPutBack, `opt-${ID.passengerOptPutBack}`, 'in'),
    edge('seed_e_popt_keep', ID.passengerIntro, ID.passengerKeep, `opt-${ID.passengerOptKeep}`, 'in'),
    edge('seed_e_popt_shake', ID.passengerIntro, ID.passengerShake, `opt-${ID.passengerOptShake}`, 'in'),
    edge('seed_e_putback_end', ID.passengerPutBack, ID.passengerEnd, 'impact', 'in'),
    edge('seed_e_keep_end', ID.passengerKeep, ID.passengerEnd, 'impact', 'in'),
    edge('seed_e_shake_end', ID.passengerShake, ID.passengerEnd, 'impact', 'in'),
  ];

  // ---- Field Harvest script graph (Завидный урожай -> Unlock -> Мельница) ----
  const fieldNodes: FlowNode[] = [
    { id: ID.harvestStart, type: 'start', position: { x: 40, y: -160 }, data: { kind: 'start' } },
    {
      id: ID.harvestLocation,
      type: 'location',
      position: { x: 40, y: 60 },
      data: { kind: 'location', x: -540, y: 0, z: 1200, radius: 20 },
    },
    {
      id: ID.harvestActor,
      type: 'eventActor',
      position: { x: 380, y: -20 },
      data: {
        kind: 'eventActor',
        name: 'Bountiful Harvest',
        idOverride: null,
        continent: 'fo',
        sector: 'Sector1',
        settlement: 'Capital',
        locationName: 'Lindenmoor',
        seq: '02',
        image: '',
        repeatable: false,
        unique: false,
        maxRuns: 1,
      },
    },
    {
      id: ID.harvestIntro,
      type: 'dialogue',
      position: { x: 780, y: -80 },
      data: {
        kind: 'dialogue',
        text: 'A farmer is staring at her wheat with the face of someone doing calculations that keep coming out wrong. At some point the wheat forgot to stop. There is a Count-sized loaf standing in that field, and none of it is any use to her, because it is between her and her front door.\n\nShe would like a hand.',
        options: [
          { id: ID.harvestOptHelp, text: 'Help harvest it', conditionType: 'none', conditionValue: '' },
          { id: ID.harvestOptWalk, text: 'Walk right by', conditionType: 'none', conditionValue: '' },
        ],
      },
    },
    {
      id: ID.harvestHelp,
      type: 'dialogue',
      position: { x: 1200, y: -260 },
      data: {
        kind: 'dialogue',
        text: "You pick it one spikelet at a time, which takes the afternoon and a degree of care you normally save for arguments. The bushel comes out larger than her house, so you put it down somewhere it can't fall on the roof. She pays you fifty coins, entirely seriously, as though this were a normal transaction between two people of similar size.\n\nThen you turn away, and the weeds come up behind you, taller than the wheat was. Looks like this farmer is off with her Floral magic, and this isn't something you can help with.\n\n[Bonus: 50 coins]\n[Status: Fatigued. Can't act during the first 5 turns in the next 3 combat encounters]",
        options: [],
      },
    },
    {
      id: ID.harvestWalk,
      type: 'dialogue',
      position: { x: 1200, y: 20 },
      data: {
        kind: 'dialogue',
        text: "You consider the amount of work it would take to harvest everything, and decide against helping. You aren't that hungry anyway.\n\n[Bonus: +1 Smart, +1 Infamous]",
        options: [],
      },
    },
    {
      id: ID.millUnlock,
      type: 'unlock',
      position: { x: 1620, y: -260 },
      data: { kind: 'unlock', label: 'field-mill-available' },
    },
    {
      id: ID.millLocation,
      type: 'location',
      position: { x: 1620, y: 220 },
      data: { kind: 'location', x: -500, y: 0, z: 1260, radius: 15 },
    },
    {
      id: ID.millActor,
      type: 'eventActor',
      position: { x: 2040, y: -20 },
      data: {
        kind: 'eventActor',
        name: 'Mill',
        idOverride: null,
        continent: 'fo',
        sector: 'Sector1',
        settlement: 'Capital',
        locationName: 'Lindenmoor',
        seq: '03',
        image: '',
        repeatable: false,
        unique: true,
        maxRuns: 1,
      },
    },
    {
      id: ID.millIntro,
      type: 'dialogue',
      position: { x: 2440, y: -80 },
      data: {
        kind: 'dialogue',
        text: 'Farmer Maryll, whom you helped with wheat infestation, finds you again. One spikelet went in, the millstones did what millstones do for about a second and a half, and then stopped doing anything ever again. A stalk sticks out through the roof like a flag of surrender.\n\nShe would be happy if the wheat could still become flour.',
        options: [
          { id: ID.millOptStones, text: 'Find two stones and use as grindstones', conditionType: 'none', conditionValue: '' },
          { id: ID.millOptHands, text: 'Use your hands', conditionType: 'none', conditionValue: '' },
          { id: ID.millOptGiant, text: 'Build a giant mill', conditionType: 'none', conditionValue: '' },
        ],
      },
    },
    {
      id: ID.millStones,
      type: 'dialogue',
      position: { x: 2860, y: -280 },
      data: {
        kind: 'dialogue',
        text: "You choose a flat one and a round one and get to work. It takes hours and produces flour, and somewhere in the middle of it you realise you have invented a mill: several thousand years late, and about forty times too big. Could've just built a normal one, though.\n\n[Bonus: +1 Smart]",
        options: [],
      },
    },
    {
      id: ID.millHands,
      type: 'dialogue',
      position: { x: 2860, y: -40 },
      data: {
        kind: 'dialogue',
        text: "Wheat at this size stops being wheat and starts being timber. You get flour, some of it, and a palmful of splinters the length of javelins, and the sensation of having lost a fight with a plant.\n\n[Status: Wounded hands. Can't use weapons for the first 5 rounds in the next 3 combat encounters.]",
        options: [],
      },
    },
    {
      id: ID.millGiant,
      type: 'dialogue',
      position: { x: 2860, y: 200 },
      data: {
        kind: 'dialogue',
        text: "You build one to your own scale, because there isn't another scale available. It works beautifully. It also requires a giant to turn it, so they'll feel dependent on you now.\n\n[Status: Builder. Helps in situations where a structure has to be built.]",
        options: [],
      },
    },
    { id: ID.fieldEnd, type: 'end', position: { x: 3280, y: -40 }, data: { kind: 'end' } },
  ];

  const fieldEdges: FlowEdge[] = [
    edge('seed_e_hstart_hactor', ID.harvestStart, ID.harvestActor, 'out', 'trigger'),
    edge('seed_e_hloc_hactor', ID.harvestLocation, ID.harvestActor, 'out', 'context'),
    edge('seed_e_hactor_intro', ID.harvestActor, ID.harvestIntro, 'text', 'in'),
    edge('seed_e_hopt_help', ID.harvestIntro, ID.harvestHelp, `opt-${ID.harvestOptHelp}`, 'in'),
    edge('seed_e_hopt_walk', ID.harvestIntro, ID.harvestWalk, `opt-${ID.harvestOptWalk}`, 'in'),
    edge('seed_e_help_unlock', ID.harvestHelp, ID.millUnlock, 'impact', 'in'),
    edge('seed_e_walk_end', ID.harvestWalk, ID.fieldEnd, 'impact', 'in'),
    edge('seed_e_unlock_millactor', ID.millUnlock, ID.millActor, 'out', 'trigger'),
    edge('seed_e_mloc_mactor', ID.millLocation, ID.millActor, 'out', 'context'),
    edge('seed_e_mactor_intro', ID.millActor, ID.millIntro, 'text', 'in'),
    edge('seed_e_mopt_stones', ID.millIntro, ID.millStones, `opt-${ID.millOptStones}`, 'in'),
    edge('seed_e_mopt_hands', ID.millIntro, ID.millHands, `opt-${ID.millOptHands}`, 'in'),
    edge('seed_e_mopt_giant', ID.millIntro, ID.millGiant, `opt-${ID.millOptGiant}`, 'in'),
    edge('seed_e_stones_end', ID.millStones, ID.fieldEnd, 'impact', 'in'),
    edge('seed_e_hands_end', ID.millHands, ID.fieldEnd, 'impact', 'in'),
    edge('seed_e_giant_end', ID.millGiant, ID.fieldEnd, 'impact', 'in'),
  ];

  return {
    root: { nodes: root, edges: rootEdges },
    [ID.folder]: { nodes: folderGraph, edges: folderEdges },
    [ID.passengerFunctional]: { nodes: passengerNodes, edges: passengerEdges },
    [ID.fieldFunctional]: { nodes: fieldNodes, edges: fieldEdges },
  };
}
