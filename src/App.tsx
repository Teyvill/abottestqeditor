import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/Canvas';

function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
