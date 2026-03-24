import React, { useState } from 'react';
import { Layers, Cuboid, PlusCircle, Trash, Eye, EyeOff } from 'lucide-react';
import ImageTracer from './components/ImageTracer';
import ModelViewer from './components/ModelViewer';
import './App.css';

// Pre-defined layer colors for distinction
const LAYER_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function App() {
  const [parts, setParts] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [currentPoints, setCurrentPoints] = useState([]);
  
  // CSG Trigger
  const [triggerMerge, setTriggerMerge] = useState(false);

  const handleFinishPart = () => {
    if (currentPoints.length < 3) return;
    
    const newPart = {
      id: Date.now().toString(),
      name: `Part ${parts.length + 1}`,
      color: LAYER_COLORS[parts.length % LAYER_COLORS.length],
      points: currentPoints,
      visible: true,
      position: [0, 0, 0],   // 3D position
      rotation: [0, 0, 0],   // 3D rotation (euler)
      scale: [1, 1, 1],      // 3D stretching
      extrudeSettings: {
        depth: 0.1,
        bevelEnabled: true,
        bevelSegments: 10,
        bevelSize: 0.1,
        bevelThickness: 0.1
      }
    };
    
    setParts([...parts, newPart]);
    setSelectedPartId(newPart.id);
    setCurrentPoints([]);
  };

  const deletePart = (id) => {
    setParts(parts.filter(p => p.id !== id));
    if (selectedPartId === id) setSelectedPartId(null);
  };

  const toggleVisibility = (id) => {
    setParts(parts.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  const updateSelectedPartSettings = (key, value) => {
    if (!selectedPartId) return;
    setParts(parts.map(p => {
      if (p.id === selectedPartId) {
        return {
          ...p,
          extrudeSettings: {
             ...p.extrudeSettings,
             [key]: value
          }
        };
      }
      return p;
    }));
  };

  const snapToPreviousPart = () => {
    if (!selectedPartId) return;
    const currentIndex = parts.findIndex(p => p.id === selectedPartId);
    if (currentIndex <= 0) return;
    
    const prevPart = parts[currentIndex - 1];
    const selectedPart = parts[currentIndex];
    
    // Rough estimate of where the front face of the previous part is, ignoring rotation
    const prevFrontZ = prevPart.position[2] + prevPart.extrudeSettings.depth;
    
    setParts(parts.map(p => {
      if (p.id === selectedPartId) {
        return {
          ...p,
          position: [p.position[0], p.position[1], prevFrontZ]
        };
      }
      return p;
    }));
  };
  
  // Callback when user manipulates object in 3D (TransformControls)
  const handleTransformUpdate = (id, property, values) => {
    setParts(prevParts => prevParts.map(p => 
       p.id === id ? { ...p, [property]: values } : p
    ));
  };

  const selectedPart = parts.find(p => p.id === selectedPartId);

  return (
    <div className="app-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 250px minmax(350px, 1fr)' }}>
      {/* 1. Tracing Area */}
      <section className="panel glass-panel">
        <h2>
          <span style={{ color: "var(--color-primary)" }}>1.</span> Trace Shapes
        </h2>
        <div style={{ flex: 1, position: 'relative', margin: '1rem 0' }}>
          <ImageTracer 
            parts={parts} 
            currentPoints={currentPoints} 
            onPointsUpdate={setCurrentPoints} 
            onFinishPart={handleFinishPart} 
          />
        </div>
      </section>

      {/* 2. Layers & Properties (Middle Column) */}
      <section className="panel glass-panel" style={{ overflowY: 'auto' }}>
        <h2><Layers size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Layers</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {parts.length === 0 && <p style={{fontSize: '0.9rem', color: '#888'}}>No parts created yet.</p>}
          {parts.map(part => (
             <div 
               key={part.id} 
               onClick={() => setSelectedPartId(part.id)}
               style={{
                 padding: '0.5rem',
                 borderRadius: '6px',
                 background: selectedPartId === part.id ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                 border: `1px solid ${selectedPartId === part.id ? 'var(--color-primary)' : 'transparent'}`,
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 cursor: 'pointer'
               }}
             >
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(part.id); }}
                    style={{ cursor: 'pointer', color: part.visible ? '#fff' : '#888', display: 'flex', alignItems: 'center' }}
                  >
                    {part.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: part.color, opacity: part.visible ? 1 : 0.3 }} />
                  <span style={{ opacity: part.visible ? 1 : 0.5 }}>{part.name}</span>
               </div>
               <Trash size={16} onClick={(e) => { e.stopPropagation(); deletePart(part.id) }} style={{ cursor: 'pointer', color: '#ef4444' }} />
             </div>
          ))}
        </div>

        {selectedPart && (
           <div className="controls-container" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Shape Settings</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <label>Thickness (Depth)</label>
                  <span>{selectedPart.extrudeSettings.depth.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="5.0" step="0.05" 
                  value={selectedPart.extrudeSettings.depth} 
                  onChange={(e) => updateSelectedPartSettings('depth', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <label>Expand (Bevel Size)</label>
                  <span>{selectedPart.extrudeSettings.bevelSize.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="5.0" step="0.05" 
                  value={selectedPart.extrudeSettings.bevelSize} 
                  onChange={(e) => updateSelectedPartSettings('bevelSize', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <label>Curvature Depth (Bevel Thickness)</label>
                  <span>{selectedPart.extrudeSettings.bevelThickness.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="5.0" step="0.05" 
                  value={selectedPart.extrudeSettings.bevelThickness} 
                  onChange={(e) => updateSelectedPartSettings('bevelThickness', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <label>Smoothness (Bevel Segments)</label>
                  <span>{selectedPart.extrudeSettings.bevelSegments}</span>
                </div>
                <input 
                  type="range" min="1" max="64" step="1" 
                  value={selectedPart.extrudeSettings.bevelSegments} 
                  onChange={(e) => updateSelectedPartSettings('bevelSegments', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <button 
                  onClick={snapToPreviousPart}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Auto-Snap to Previous Layer
                </button>
              </div>
           </div>
        )}

        {parts.filter(p => p.visible).length > 1 && (
           <button 
             onClick={() => setTriggerMerge(Date.now())}
             style={{ 
               width: '100%', padding: '0.8rem', marginTop: '1rem', 
               background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', 
               cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center'
             }}
           >
             <Cuboid size={18} /> Merge All Visble Layers (CSG)
           </button>
        )}
      </section>

      {/* 3. 3D Viewer Area */}
      <section className="panel glass-panel">
        <h2>
          <span style={{ color: "var(--color-primary)" }}>3.</span> Build in 3D
        </h2>
        <div style={{ flex: 1, position: 'relative', marginTop: '1rem' }}>
           <ModelViewer 
             parts={parts.filter(p => p.visible)} 
             selectedPartId={selectedPartId}
             onTransformUpdate={handleTransformUpdate}
             onSelectPart={setSelectedPartId}
             triggerMerge={triggerMerge}
             currentDrawingPoints={currentPoints}
           />
        </div>
      </section>
    </div>
  );
}

export default App;
