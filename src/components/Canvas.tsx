import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  MarkerType,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';
import { nodeTypes } from '../nodes';
import { PIN_TYPE_COLOR, resolvePinType } from '../nodes/pinTypes';
import { Breadcrumbs } from './Breadcrumbs';
import { Palette } from './Palette';
import { Toolbar } from './Toolbar';
import { PlayModal } from './PlayModal';
import { Toast } from './Toast';

export function Canvas() {
  const containerId = useStore((s) => s.currentContainerId());
  const graph = useStore((s) => s.currentGraph());
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const enterContainer = useStore((s) => s.enterContainer);
  const deleteNode = useStore((s) => s.deleteNode);
  const deleteEdge = useStore((s) => s.deleteEdge);

  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      if (node.data.kind === 'folder' || node.data.kind === 'functional') enterContainer(node.id);
    },
    [enterContainer],
  );

  const styledEdges = useMemo(
    () =>
      graph.edges.map((e) => {
        const color = PIN_TYPE_COLOR[resolvePinType(e.sourceHandle)];
        return {
          ...e,
          style: { stroke: color, strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
        };
      }),
    [graph.edges],
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        key={containerId}
        nodes={graph.nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodesDelete={(nodes) => nodes.forEach((n) => deleteNode(n.id))}
        onEdgesDelete={(edges) => edges.forEach((e) => deleteEdge(e.id))}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-neutral-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.4} color="#3f3f46" />
        <MiniMap
          pannable
          zoomable
          className="!bg-neutral-900 !border !border-neutral-700"
          maskColor="rgba(0,0,0,0.6)"
          nodeColor="#525252"
        />
        <Controls className="!bg-neutral-900 !border !border-neutral-700 [&>button]:!bg-neutral-800 [&>button]:!border-neutral-700 [&>button]:!text-neutral-200" />
      </ReactFlow>

      <div className="absolute top-3 left-3 z-10">
        <Breadcrumbs />
      </div>
      <div className="absolute top-3 right-3 z-10">
        <Toolbar />
      </div>
      <div className="absolute top-14 left-3 z-10">
        <Palette />
      </div>

      <PlayModal />
      <Toast />
    </div>
  );
}
