import React, { useRef, useState } from 'react';

export function HomeView({ onUpload, uploadError }) {
  const [isDrag, setIsDrag] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="home-view">
      <div className="glass-card upload-card">
        <h1>Upload Your Notes</h1>
        <p>Turn your notes into smart learning instantly.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        
        <div className={`upload-area ${isDrag ? 'dragover' : ''}`} id="drop-zone"
             onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
             onDragLeave={() => setIsDrag(false)}
             onDrop={handleDrop}
             onClick={openFilePicker}>
          <i className="ph ph-file-pdf"></i>
          <p>Drag and drop your PDF here or click to browse</p>
        </div>
        
        <button className="btn-primary" id="upload-btn" onClick={openFilePicker}>
          <i className="ph ph-upload-simple"></i>
          Upload File
        </button>
        {uploadError ? <p className="upload-error">{uploadError}</p> : null}
      </div>
    </div>
  );
}
