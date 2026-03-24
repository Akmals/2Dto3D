import React, { useCallback, useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Trash2, CheckCircle2 } from 'lucide-react';
import './ImageTracer.css';

export default function ImageTracer({ onPolygonUpdate }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [points, setPoints] = useState([]); // Array of {x, y} relative to image dimensions

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
      setPoints([]);
      onPolygonUpdate([]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onPolygonUpdate]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setPoints([]);
    onPolygonUpdate([]);
  };

  const clearPoints = () => {
    setPoints([]);
    onPolygonUpdate([]);
  };

  const handleSvgClick = (e) => {
    if (!svgRef.current || !imgRef.current) return;
    
    // Get click coords relative to the SVG element
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // We want the coordinates relative to the center of the image to map naturally to 3D space
    // Let's normalize them so the bounding box is around 1 unit
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Determine a scale factor so the model doesn't come out massive or tiny
    const scale = Math.max(rect.width, rect.height) / 5; // Arises from 3D unit mapping scale
    
    const normalizedX = (x - centerX) / scale;
    // Y is inverted in 3D compared to browser DOM!
    const normalizedY = -(y - centerY) / scale;

    const newPoint = { px: x, py: y, nx: normalizedX, ny: normalizedY };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    onPolygonUpdate(newPoints);
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
              {points.length > 0 && (
                <polygon 
                  points={points.map(p => `${p.px},${p.py}`).join(' ')} 
                  className="polygon-fill" 
                />
              )}
              {points.length > 1 && (
                <polyline 
                  points={points.map(p => `${p.px},${p.py}`).join(' ')} 
                  className="line" 
                />
              )}
              {points.length > 2 && (
                <line 
                  x1={points[points.length - 1].px} 
                  y1={points[points.length - 1].py}
                  x2={points[0].px}
                  y2={points[0].py}
                  className="line"
                  strokeDasharray="4"
                  opacity="0.5"
                />
              )}
              {points.map((p, i) => (
                <circle key={i} cx={p.px} cy={p.py} className="point" />
              ))}
            </svg>
          </div>
          
          <div className="workspace-controls">
            <button className="control-btn" onClick={clearImage}>
              <X size={16} /> New Image
            </button>
            <button className="control-btn danger" onClick={clearPoints}>
              <Trash2 size={16} /> Clear Points
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
