import type { NodeTypes } from '@xyflow/react';
import { StartNode } from './StartNode';
import { FolderNode } from './FolderNode';
import { FunctionalNode } from './FunctionalNode';
import { EventActorNode } from './EventActorNode';
import { DialogueNode } from './DialogueNode';
import { LocationNode } from './LocationNode';
import { EndNode } from './EndNode';
import { UnlockNode } from './UnlockNode';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  folder: FolderNode,
  functional: FunctionalNode,
  eventActor: EventActorNode,
  dialogue: DialogueNode,
  location: LocationNode,
  end: EndNode,
  unlock: UnlockNode,
};
