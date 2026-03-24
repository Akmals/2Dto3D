import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import './ImageUploader.css';

export default function ImageUploader({ onImageReady }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);

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
      onImageReady(file, url);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onImageReady]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageReady(null, null);
  };

  return (
    <div 
      className={`uploader-container ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''}`}
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
        <div className="preview-container">
          <img src={preview} alt="Upload preview" className="image-preview" />
          <div className="preview-overlay">
            <button className="clear-btn" onClick={clearImage}>
              <X size={20} />
            </button>
            <label htmlFor="file-upload" className="change-btn">
              Change Image
            </label>
          </div>
        </div>
      ) : (
        <label htmlFor="file-upload" className="upload-prompt">
          <UploadCloud size={48} className="upload-icon" />
          <h3>Drag & Drop your sketch</h3>
          <p>or click to browse files</p>
          <span className="file-hint">Supports JPG, PNG</span>
        </label>
      )}
    </div>
  );
}
