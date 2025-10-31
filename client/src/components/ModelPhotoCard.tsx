import React, { useState, useRef } from 'react';
import { outfitChangeApi } from '../api/outfit-change';
import type { ModelPhoto } from '../types/outfit-change';
import './ModelPhotoCard.css';

interface ModelPhotoCardProps {
  photo: ModelPhoto;
  isSelected?: boolean;
  onClick?: () => void;
  onPhotoUpdated?: (updatedPhoto: ModelPhoto) => void;
}

export const ModelPhotoCard: React.FC<ModelPhotoCardProps> = ({
  photo,
  isSelected,
  onClick,
  onPhotoUpdated,
}) => {
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [showReplaceMenu, setShowReplaceMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReplaceMenu(!showReplaceMenu);
  };

  const handleFileSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
    setShowReplaceMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setReplaceError('只支持 JPEG、PNG 和 WebP 格式');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setReplaceError('文件大小不能超过 10MB');
      return;
    }

    try {
      setIsReplacing(true);
      setReplaceError(null);

      const updatedPhoto = await outfitChangeApi.replaceModelPhoto(photo.id, {
        file,
      });

      console.log('Photo replaced successfully:', updatedPhoto);

      // Notify parent component
      if (onPhotoUpdated) {
        onPhotoUpdated(updatedPhoto);
      }
    } catch (error: any) {
      console.error('Failed to replace photo:', error);
      setReplaceError(
        error.response?.data?.message || '替换失败，请稍后再试',
      );
    } finally {
      setIsReplacing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className={`model-photo-card ${isSelected ? 'selected' : ''} ${isReplacing ? 'replacing' : ''}`}
      onClick={onClick}
    >
      <div className="model-photo-card-image-container">
        <img
          src={`${apiUrl}${photo.url}`}
          alt={photo.originalFileName || 'Model photo'}
          className="model-photo-card-image"
        />
        {isReplacing && (
          <div className="model-photo-card-overlay">
            <div className="spinner-small"></div>
            <span>替换中...</span>
          </div>
        )}
      </div>

      <div className="model-photo-card-info">
        <p className="model-photo-card-filename">
          {photo.originalFileName || 'Unknown'}
        </p>
        <p className="model-photo-card-date">
          {new Date(photo.uploadedAt).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {isSelected && <div className="selected-badge">已选择</div>}

      {/* Replace Button */}
      <div className="model-photo-card-actions">
        <button
          className="model-photo-card-replace-btn"
          onClick={handleReplaceClick}
          disabled={isReplacing}
          title="替换照片"
        >
          ⟳
        </button>
        {showReplaceMenu && (
          <div className="model-photo-card-replace-menu">
            <button onClick={handleFileSelect}>选择新照片</button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Error message */}
      {replaceError && (
        <div className="model-photo-card-error">{replaceError}</div>
      )}
    </div>
  );
};
