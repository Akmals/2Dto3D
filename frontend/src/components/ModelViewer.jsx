import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import { Box, Check } from 'lucide-react';
import './ModelViewer.css';

// A single extruded part
function PartMesh({ part, isSelected, onSelect, onTransformUpdate }) {
  const meshRef = useRef();
  
  const geometry = useMemo(() => {
    if (!part.points || part.points.length < 3) return null;

    const shape = new THREE.Shape();
    shape.moveTo(part.points[0].nx, part.points[0].ny);
    for (let i = 1; i < part.points.length; i++) {
        shape.lineTo(part.points[i].nx, part.points[i].ny);
    }
    shape.lineTo(part.points[0].nx, part.points[0].ny);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: part.extrudeSettings.depth,
      bevelEnabled: part.extrudeSettings.bevelSize > 0,
      bevelSegments: part.extrudeSettings.bevelSegments,
      bevelSize: part.extrudeSettings.bevelSize,
      bevelThickness: part.extrudeSettings.bevelThickness || part.extrudeSettings.bevelSize,
    });
    geom.center(); 
    return geom;
  }, [part.points, part.extrudeSettings]);

  if (!geometry) return null;

  const content = (
    <mesh 
      ref={meshRef}
      geometry={geometry} 
      position={part.position}
      rotation={part.rotation}
      scale={part.scale}
      onClick={(e) => { e.stopPropagation(); onSelect(part.id); }}
      castShadow 
      receiveShadow
    >
      <meshStandardMaterial 
        color={isSelected ? '#fde047' : part.color} 
        roughness={0.4} 
        metalness={0.6} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );

  // Wrap with TransformControls if selected
  if (isSelected) {
    return (
      <TransformControls 
        mode="translate" // Could alternatively be "scale" or "rotate" based on a UI toggle
        onMouseUp={() => {
          if (meshRef.current) {
             onTransformUpdate(part.id, 'position', [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]);
             onTransformUpdate(part.id, 'rotation', [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z]);
             onTransformUpdate(part.id, 'scale', [meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z]);
          }
        }}
      >
        {content}
      </TransformControls>
    );
  }

  return content;
}


export default function ModelViewer({ parts, selectedPartId, onTransformUpdate, onSelectPart, triggerMerge, currentDrawingPoints }) {
  const [mergedGeometry, setMergedGeometry] = useState(null);

  // CSG Merge Logic
  useEffect(() => {
    if (!triggerMerge || parts.length < 2) return;
    
    let combinedCSG = null;

    // We must manually reconstruct the meshes to perform CSG
    parts.forEach(part => {
       const shape = new THREE.Shape();
       shape.moveTo(part.points[0].nx, part.points[0].ny);
       for (let i = 1; i < part.points.length; i++) {
           shape.lineTo(part.points[i].nx, part.points[i].ny);
       }
       shape.lineTo(part.points[0].nx, part.points[0].ny);

       const geom = new THREE.ExtrudeGeometry(shape, {
         depth: part.extrudeSettings.depth,
         bevelEnabled: part.extrudeSettings.bevelSize > 0,
         bevelSegments: part.extrudeSettings.bevelSegments,
         bevelSize: part.extrudeSettings.bevelSize,
         bevelThickness: part.extrudeSettings.bevelThickness || part.extrudeSettings.bevelSize,
       });
       geom.center();

       const mesh = new THREE.Mesh(geom);
       // Apply transforms
       mesh.position.set(...part.position);
       mesh.rotation.set(...part.rotation);
       mesh.scale.set(...part.scale);
       mesh.updateMatrixWorld();

       const bsp = CSG.fromMesh(mesh);
       if (!combinedCSG) {
         combinedCSG = bsp;
       } else {
         combinedCSG = combinedCSG.union(bsp);
       }
    });

    if (combinedCSG) {
       const mergedMesh = CSG.toMesh(combinedCSG, new THREE.Matrix4());
       setMergedGeometry(mergedMesh.geometry);
    }
  }, [triggerMerge, parts]);

  // If we are in "Merged" mode, we display the generated geometry
  if (mergedGeometry) {
    return (
      <div className="viewer-container active-state">
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: '#10b981', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', gap: '8px', color: 'white' }}>
          <Check size={20} /> Successfully Merged
          <button onClick={() => setMergedGeometry(null)} style={{ marginLeft: '10px', background: 'white', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit Parts</button>
        </div>
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 0, 5] }}>
          <Stage environment="city" intensity={0.6}>
            <Center>
              <mesh geometry={mergedGeometry} castShadow receiveShadow>
                <meshStandardMaterial color="#6366f1" roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
              </mesh>
            </Center>
          </Stage>
          <OrbitControls autoRotate autoRotateSpeed={2} makeDefault />
        </Canvas>
      </div>
    );
  }

  const hasContent = parts.length > 0 || currentDrawingPoints.length >= 3;

  if (!hasContent) {
    return (
      <div className="viewer-container placeholder empty-state">
        <Box size={64} className="placeholder-icon" />
        <h3>Waiting for Input</h3>
        <p>Trace shapes to start building your 3D model!</p>
      </div>
    );
  }

  return (
    <div className="viewer-container active-state" onClick={() => onSelectPart(null)}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 0, 5] }}>
        <Stage environment="city" intensity={0.6}>
          <Center>
            <group>
               {parts.map(part => (
                 <PartMesh 
                   key={part.id} 
                   part={part} 
                   isSelected={selectedPartId === part.id}
                   onSelect={onSelectPart}
                   onTransformUpdate={onTransformUpdate}
                 />
               ))}
               
               {/* Show an in-progress preview if the user is currently drawing a valid shape */}
               {currentDrawingPoints.length >= 3 && (
                 <PartMesh 
                   part={{
                     id: 'preview',
                     points: currentDrawingPoints,
                     position: [0, 0, 0],
                     rotation: [0, 0, 0],
                     scale: [1, 1, 1],
                     color: 'rgba(255, 255, 255, 0.5)',
                     extrudeSettings: { depth: 0.1, bevelEnabled: false, bevelSize: 0 }
                   }}
                   isSelected={false}
                   onSelect={() => {}}
                   onTransformUpdate={() => {}}
                 />
               )}
            </group>
          </Center>
        </Stage>
        {/* Disable orbit controls when a transform control is active so they don't fight over the mouse */}
        <OrbitControls makeDefault enabled={!selectedPartId} />
      </Canvas>
      <div className="viewer-hint">
        {selectedPartId ? "Drag arrows to move. Click background to deselect." : "Drag to rotate view • Click a part to move it"}
      </div>
    </div>
  );
}
