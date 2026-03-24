import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, RotateCcw } from 'lucide-react';
import './DrawingCanvas.css';

export default function DrawingCanvas({ onImageReady }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set internal resolution
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    // Fill background
    ctx.fillStyle = '#0f0c29';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = isEraser ? '#0f0c29' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    updateExport();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f0c29';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateExport();
  };

  const updateExport = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'drawing.png', { type: 'image/png' });
        onImageReady(file, URL.createObjectURL(blob));
      }
    }, 'image/png');
  };

  return (
    <div className="drawing-container">
      <div className="toolbar">
        <button 
          className={`tool-btn ${!isEraser ? 'active' : ''}`} 
          onClick={() => setIsEraser(false)}
          title="Brush"
        >
          <PenTool size={18} />
        </button>
        <button 
          className={`tool-btn ${isEraser ? 'active' : ''}`} 
          onClick={() => setIsEraser(true)}
          title="Eraser"
        >
          <Eraser size={18} />
        </button>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          disabled={isEraser}
          className="color-picker"
        />
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={brushSize} 
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="size-slider"
        />
        <button className="tool-btn" onClick={clearCanvas} title="Clear Canvas">
          <RotateCcw size={18} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="drawing-board"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
}
