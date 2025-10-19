import { useState, useCallback } from 'react';
import { outfitChangeApi } from '../api/outfit-change';
import type { ModelPhoto, UploadProgress } from '../types/outfit-change';

interface UseImageUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedPhoto: ModelPhoto | null;
  uploadImage: (file: File) => Promise<ModelPhoto | null>;
  reset: () => void;
}

/**
 * Custom hook for handling image upload with progress tracking
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<ModelPhoto | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<ModelPhoto | null> => {
    // Reset state
    setError(null);
    setProgress(0);
    setUploading(true);
    setUploadedPhoto(null);

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('只支持 JPG、PNG 和 WebP 格式的图片');
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('图片大小不能超过 10MB');
      }

      // Upload with progress tracking
      const photo = await outfitChangeApi.uploadModelPhoto(
        { file },
        (uploadProgress: UploadProgress) => {
          setProgress(uploadProgress.percentage);
        },
      );

      console.log('=== Uploaded photo data ===');
      console.log('Full photo object:', photo);
      console.log('Photo URL field:', photo.url);
      console.log('Photo imageUrl field:', photo.imageUrl);
      console.log('Photo id:', photo.id);
      console.log('===========================');

      setUploadedPhoto(photo);
      setProgress(100);
      return photo;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '上传失败，请重试';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedPhoto(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedPhoto,
    uploadImage,
    reset,
  };
};
