import React, { useState } from 'react';
import { Layers, Wand2 } from 'lucide-react';
import ImageTracer from './components/ImageTracer';
import ModelViewer from './components/ModelViewer';
import './App.css';

function App() {
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [activePolygon, setActivePolygon] = useState([]);
  const [extrusionDepth, setExtrusionDepth] = useState(0.5);

  const handlePolygonUpdate = (points) => {
    setPolygonPoints(points);
    // Real-time update for a smoother experience
    if (points.length >= 3) {
      setActivePolygon(points);
    } else {
      setActivePolygon([]);
    }
  };

  const handleDepthChange = (e) => {
    setExtrusionDepth(parseFloat(e.target.value));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>2D to 3D Extruder</h1>
        <p>Upload an image, trace its outline, and instantly see it in 3D!</p>
      </header>

      <main className="main-content">
        <section className="panel glass-panel">
          <h2>
            <span style={{ color: "var(--color-primary)" }}>1.</span> 
            Trace Image
          </h2>
          
          <div style={{ flex: 1, position: 'relative', marginTop: '1rem', marginBottom: '1rem' }}>
            <ImageTracer onPolygonUpdate={handlePolygonUpdate} />
          </div>

          <div className="controls-container" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label>Thickness / Extrusion Depth</label>
              <span>{Math.round(extrusionDepth * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.05" 
              max="2.0" 
              step="0.05" 
              value={extrusionDepth} 
              onChange={handleDepthChange}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
          </div>

        </section>

        <section className="panel glass-panel">
          <h2>
            <span style={{ color: "var(--color-primary)" }}>2.</span> 
            View 3D Model
          </h2>
          <ModelViewer 
            polygonPoints={activePolygon} 
            depth={extrusionDepth} 
          />
        </section>
      </main>
    </div>
  );
}

export default App;
