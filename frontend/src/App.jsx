import React, { useState } from 'react';
import { Palette, Upload, Wand2 } from 'lucide-react';
import DrawingCanvas from './components/DrawingCanvas';
import ImageUploader from './components/ImageUploader';
import ModelViewer from './components/ModelViewer';
import './App.css';

function App() {
  const [inputMode, setInputMode] = useState('draw'); // 'draw' or 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleImageReady = (file, url) => {
    setImageFile(file);
    setPreviewUrl(url);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Please provide an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Clear previous model if any
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl);
      setModelUrl(null);
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const blob = await response.blob();
      const newModelUrl = URL.createObjectURL(blob);
      setModelUrl(newModelUrl);

    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to generate model. Please ensure the backend is running and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>2D to 3D Creator</h1>
        <p>Sketch your ideas or upload an image and watch them come to life in 3D.</p>
      </header>

      <main className="main-content">
        <section className="panel glass-panel">
          <h2>
            <span style={{ color: "var(--color-primary)" }}>1.</span> 
            Provide Input
          </h2>
          
          <div className="input-modes">
            <button 
              className={`mode-btn ${inputMode === 'draw' ? 'active' : ''}`}
              onClick={() => setInputMode('draw')}
            >
              <Palette size={20} /> Draw
            </button>
            <button 
              className={`mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
            >
              <Upload size={20} /> Upload
            </button>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {inputMode === 'draw' ? (
              <DrawingCanvas onImageReady={handleImageReady} />
            ) : (
              <ImageUploader onImageReady={handleImageReady} />
            )}
          </div>

          {error && <div style={{ color: '#ff4d4f', padding: '0.5rem', textAlign: 'center' }}>{error}</div>}

          <button 
            className={`action-btn ${isProcessing ? 'processing' : ''}`}
            onClick={handleGenerate}
            disabled={!imageFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div> Generating Magic...
              </>
            ) : (
              <>
                <Wand2 size={20} /> Generate 3D Model
              </>
            )}
          </button>
        </section>

        <section className="panel glass-panel">
          <h2>
            <span style={{ color: "var(--color-primary)" }}>2.</span> 
            View Result
          </h2>
          <ModelViewer modelUrl={modelUrl} isProcessing={isProcessing} />
        </section>
      </main>
    </div>
  );
}

export default App;
