import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Upload.css';

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const isVideo = file?.type?.startsWith('video/');

  const handleFile = (f) => {
    if (!f) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(f.type)) {
      setError('Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV)');
      return;
    }

    if (f.size > 50 * 1024 * 1024) {
      setError('File must be under 50MB');
      return;
    }

    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption.trim());

      const res = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/post/${res.data.post.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="upload-page">
      <div className="page-container">
        <div className="upload-header">
          <h1 className="upload-title">Share Your Cat 🐱</h1>
          <p className="upload-subtitle">Let the world see your adorable furball!</p>
        </div>

        <div className="card upload-card">
          {error && <div className="error-msg">{error}</div>}

          {!file ? (
            // Drop zone
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="drop-zone-content">
                <div className="drop-zone-icon">🐾</div>
                <h3>Drop your cat photo or video here</h3>
                <p>or <span className="upload-browse">browse files</span></p>
                <p className="upload-hint">JPEG, PNG, GIF, WebP, MP4, WebM · Max 50MB</p>
              </div>
            </div>
          ) : (
            // Preview + form
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="upload-preview">
                {isVideo ? (
                  <video src={preview} controls className="preview-media" />
                ) : (
                  <img src={preview} alt="Preview" className="preview-media" />
                )}
                <button type="button" className="preview-clear" onClick={handleClear} title="Remove">
                  ×
                </button>
                <div className="preview-type-badge">
                  {isVideo ? '🎬 Video' : '📷 Photo'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Caption</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Tell us about your cat... 🐱"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <span className="caption-count">{caption.length}/500</span>
              </div>

              <div className="upload-actions">
                <button type="button" className="btn btn-secondary" onClick={handleClear}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? '🐾 Uploading...' : '✨ Share Post'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="upload-tips card">
          <h3>🌟 Tips for great cat content</h3>
          <ul>
            <li>🌞 Good lighting makes fur look amazing</li>
            <li>😺 Capture their personality!</li>
            <li>📸 Action shots and funny moments work great</li>
            <li>💕 Only cute, positive content — no harmful content allowed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
