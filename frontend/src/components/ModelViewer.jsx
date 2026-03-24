import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three-stdlib';
import { Box } from 'lucide-react';
import './ModelViewer.css';

// A component to load and render the OBJ file
function OBJModel({ url }) {
  const obj = useLoader(OBJLoader, url);
  
  // Need to clone the object if we want to render it multiple times or manage its state safely
  return <primitive object={obj} />;
}

export default function ModelViewer({ modelUrl, isProcessing }) {
  if (isProcessing) {
    return (
      <div className="viewer-container placeholder processing-state">
        <div className="scanner"></div>
        <div className="processing-content">
          <div className="spinner-large"></div>
          <h3>Generating 3D Model</h3>
          <p>This AI magic takes a few moments...</p>
        </div>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="viewer-container placeholder empty-state">
        <Box size={64} className="placeholder-icon" />
        <h3>Waiting for Input</h3>
        <p>Submit a drawing to see it in 3D!</p>
      </div>
    );
  }

  return (
    <div className="viewer-container active-state">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Center>
              <OBJModel url={modelUrl} />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={2} makeDefault />
      </Canvas>
      <div className="viewer-hint">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
