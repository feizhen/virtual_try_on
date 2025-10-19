import React, { useEffect, useRef, useState } from "react";
import { useClothingUpload } from "../hooks/useClothingUpload";
import type { ClothingItem } from "../types/outfit-change";
import "./ClothingUpload.css";

interface ClothingUploadProps {
  onUploadSuccess?: (clothing: ClothingItem) => void;
}

export const ClothingUpload: React.FC<ClothingUploadProps> = ({
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    uploading,
    progress,
    error,
    uploadedClothing,
    uploadClothing,
    reset,
  } = useClothingUpload();

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

  useEffect(() => {
    console.log("=== Clothing upload state changed ===", {
      uploadedClothing,
      progress,
    });
  }, [uploadedClothing, progress, error]);

  const handleUpload = async (file: File) => {
    const clothing = await uploadClothing(file);
    if (clothing && onUploadSuccess) {
      onUploadSuccess(clothing);
      // Don't auto reset - let user manually choose to upload more
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    reset();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="clothing-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {!previewUrl && !uploadedClothing && (
        <div className="upload-area" onClick={handleButtonClick}>
          <div className="upload-icon">👔</div>
          <p className="upload-text">点击上传服装照片</p>
          <p className="upload-hint">支持 JPG、PNG、WebP，最大 10MB</p>
        </div>
      )}

      {previewUrl && !uploadedClothing && (
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

      {uploadedClothing && (
        <div className="success-area">
          <img
            src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}${
              uploadedClothing.url
            }`}
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
