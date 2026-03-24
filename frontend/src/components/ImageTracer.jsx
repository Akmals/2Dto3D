import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, X, Trash2, CheckCircle2 } from 'lucide-react';
import './ImageTracer.css';

export default function ImageTracer({ parts, currentPoints, onPointsUpdate, onFinishPart }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const svgRef = useRef(null);
  const imgRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onPointsUpdate([]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onPointsUpdate]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onPointsUpdate([]);
  };

  const clearPoints = () => {
    onPointsUpdate([]);
  };

  const handleSvgClick = (e) => {
    if (!svgRef.current || !imgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Scale mapping relative to image frame size
    const scale = Math.max(rect.width, rect.height) / 5; 
    
    const normalizedX = (x - centerX) / scale;
    const normalizedY = -(y - centerY) / scale;

    const newPoint = { px: x, py: y, nx: normalizedX, ny: normalizedY };
    onPointsUpdate([...currentPoints, newPoint]);
  };

  return (
    <div 
      className={`tracer-container ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleChange} 
        id="file-upload" 
        className="file-input"
      />
      
      {preview ? (
        <div className="workspace-container">
          <div className="image-wrapper">
            <img 
              ref={imgRef}
              src={preview} 
              alt="Upload preview" 
              className="trace-image" 
              draggable={false}
            />
            
            <svg 
              ref={svgRef}
              className="trace-svg" 
              onClick={handleSvgClick}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Render completed parts */}
              {parts.map(part => (
                <polygon 
                  key={part.id}
                  points={part.points.map(p => `${p.px},${p.py}`).join(' ')} 
                  className="polygon-fill"
                  style={{ fill: part.color, opacity: 0.5 }}
                />
              ))}

              {/* Render current drawing points */}
              {currentPoints.length > 0 && (
                <polygon 
                  points={currentPoints.map(p => `${p.px},${p.py}`).join(' ')} 
                  className="polygon-fill" 
                />
              )}
              {currentPoints.length > 1 && (
                <polyline 
                  points={currentPoints.map(p => `${p.px},${p.py}`).join(' ')} 
                  className="line" 
                />
              )}
              {currentPoints.length > 2 && (
                <line 
                  x1={currentPoints[currentPoints.length - 1].px} 
                  y1={currentPoints[currentPoints.length - 1].py}
                  x2={currentPoints[0].px}
                  y2={currentPoints[0].py}
                  className="line"
                  strokeDasharray="4"
                  opacity="0.5"
                />
              )}
              {currentPoints.map((p, i) => (
                <circle key={i} cx={p.px} cy={p.py} className="point" />
              ))}
            </svg>
          </div>
          
          <div className="workspace-controls">
            <button className="control-btn" onClick={clearImage}>
               New Image
            </button>
            <button className="control-btn danger" onClick={clearPoints} disabled={currentPoints.length === 0}>
               Clear Points
            </button>
            <button 
                className="control-btn" 
                onClick={onFinishPart} 
                disabled={currentPoints.length < 3}
                style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            >
              <CheckCircle2 size={16} /> Finish Shape
            </button>
          </div>
        </div>
      ) : (
        <label htmlFor="file-upload" className="upload-prompt">
          <UploadCloud size={48} className="upload-icon" />
          <h3>Drag & Drop an image to trace</h3>
          <p>or click to browse files</p>
          <span className="file-hint">Supports JPG, PNG</span>
        </label>
      )}
    </div>
  );
}
