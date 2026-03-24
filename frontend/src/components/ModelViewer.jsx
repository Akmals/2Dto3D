import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from 'lucide-react';
import './ModelViewer.css';

function ExtrudedPolygon({ points, depth }) {
  // Memoize the geometry so we don't recreate it every frame unless points or depth change
  const geometry = useMemo(() => {
    if (!points || points.length < 3) return null;

    // Create a Three.js shape from the normalized 2D points
    const shape = new THREE.Shape();
    
    // Move to the first point
    shape.moveTo(points[0].nx, points[0].ny);
    
    // Line to subsequent points
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].nx, points[i].ny);
    }
    
    // Close the shape back to the first point
    shape.lineTo(points[0].nx, points[0].ny);

    // Apply the extrusion settings
    const extrudeSettings = {
        depth: depth,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.02,
        bevelThickness: 0.02,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center the geometry so it rotates nicely
    geom.center(); 
    return geom;
  }, [points, depth]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#4f46e5" 
        roughness={0.4} 
        metalness={0.6} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function ModelViewer({ polygonPoints, depth }) {
  if (!polygonPoints || polygonPoints.length < 3) {
    return (
      <div className="viewer-container placeholder empty-state">
        <Box size={64} className="placeholder-icon" />
        <h3>Waiting for Input</h3>
        <p>Trace an image to see it extruded into 3D!</p>
      </div>
    );
  }

  return (
    <div className="viewer-container active-state">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 0, 5] }}>
        <Stage environment="city" intensity={0.6}>
          <Center>
            <ExtrudedPolygon points={polygonPoints} depth={depth} />
          </Center>
        </Stage>
        <OrbitControls autoRotate autoRotateSpeed={2} makeDefault />
      </Canvas>
      <div className="viewer-hint">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
