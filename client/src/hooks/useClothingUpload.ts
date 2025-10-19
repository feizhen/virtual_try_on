import { useState, useCallback } from 'react';
import { outfitChangeApi } from '../api/outfit-change';
import type { ClothingItem, UploadProgress } from '../types/outfit-change';

interface UseClothingUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedClothing: ClothingItem | null;
  uploadClothing: (file: File) => Promise<ClothingItem | null>;
  reset: () => void;
}

/**
 * Custom hook for handling clothing item upload with progress tracking
 */
export const useClothingUpload = (): UseClothingUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedClothing, setUploadedClothing] = useState<ClothingItem | null>(null);

  const uploadClothing = useCallback(async (file: File): Promise<ClothingItem | null> => {
    // Reset state
    setError(null);
    setProgress(0);
    setUploading(true);
    setUploadedClothing(null);

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
      const clothing = await outfitChangeApi.uploadClothingItem(
        { file },
        (uploadProgress: UploadProgress) => {
          setProgress(uploadProgress.percentage);
        },
      );

      console.log('=== Uploaded clothing data ===');
      console.log('Full clothing object:', clothing);
      console.log('Clothing URL field:', clothing.url);
      console.log('Clothing imageUrl field:', clothing.imageUrl);
      console.log('Clothing id:', clothing.id);
      console.log('===========================');

      setUploadedClothing(clothing);
      setProgress(100);
      return clothing;
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
    setUploadedClothing(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedClothing,
    uploadClothing,
    reset,
  };
};
