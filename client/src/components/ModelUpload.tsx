import React, { useRef, useState } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ModelPhoto } from '../types/outfit-change';
import './ModelUpload.css';

interface ModelUploadProps {
  onUploadSuccess?: (photo: ModelPhoto) => void;
}

export const ModelUpload: React.FC<ModelUploadProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploading, progress, error, uploadedPhoto, uploadImage, reset } =
    useImageUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    const photo = await uploadImage(file);
    if (photo && onUploadSuccess) {
      onUploadSuccess(photo);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    reset();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="model-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {!previewUrl && !uploadedPhoto && (
        <div className="upload-area" onClick={handleButtonClick}>
          <div className="upload-icon">📸</div>
          <p className="upload-text">点击上传模特照片</p>
          <p className="upload-hint">支持 JPG、PNG、WebP，最大 10MB</p>
        </div>
      )}

      {previewUrl && !uploadedPhoto && (
        <div className="preview-area">
          <img src={previewUrl} alt="Preview" className="preview-image" />
          {uploading && (
            <div className="upload-overlay">
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="progress-text">{progress}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadedPhoto && (
        <div className="success-area">
          <img
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${uploadedPhoto.url}`}
            alt="Uploaded"
            className="uploaded-image"
          />
          <div className="success-overlay">
            <div className="success-icon">✓</div>
            <p className="success-text">上传成功！</p>
          </div>
          <button onClick={handleReset} className="btn btn-secondary btn-reset">
            继续上传
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={handleReset} className="btn-retry">
            重试
          </button>
        </div>
      )}
    </div>
  );
};
