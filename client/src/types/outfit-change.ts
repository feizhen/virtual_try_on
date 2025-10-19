/**
 * Outfit Change Feature Types
 */

export interface ModelPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  originalFileName: string | null;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  uploadedAt: string;
  deletedAt: string | null;
  url?: string; // Full URL for display
}

export interface UploadModelPhotoRequest {
  file: File;
  width?: number;
  height?: number;
}

export interface UploadModelPhotoResponse {
  success: boolean;
  data: ModelPhoto;
}

export interface GetModelPhotosResponse {
  success: boolean;
  data: ModelPhoto[];
  total: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Clothing Item Types
export interface ClothingItem {
  id: string;
  userId: string;
  imageUrl: string;
  originalFileName: string | null;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  uploadedAt: string;
  deletedAt: string | null;
  url?: string; // Full URL for display
}

export interface UploadClothingRequest {
  file: File;
  width?: number;
  height?: number;
}

export interface UploadClothingResponse {
  success: boolean;
  data: ClothingItem;
}

export interface GetClothingItemsResponse {
  success: boolean;
  data: ClothingItem[];
  total: number;
}

// Virtual Try-On Types
export interface ProcessingSession {
  sessionId: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  result?: OutfitResult;
}

export interface OutfitResult {
  id: string;
  userId: string;
  modelPhotoId: string;
  clothingItemId: string;
  imageUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  deletedAt: string | null;
  url?: string;
  modelPhoto?: ModelPhoto;
  clothingItem?: ClothingItem;
}

export interface StartVirtualTryonRequest {
  modelPhotoId: string;
  clothingItemId: string;
  seed?: number;
}

export interface StartVirtualTryonResponse {
  success: boolean;
  data: {
    sessionId: string;
    status: string;
  };
}

export interface GetSessionStatusResponse {
  success: boolean;
  data: ProcessingSession;
}

export interface GetOutfitResultsResponse {
  success: boolean;
  data: OutfitResult[];
  total: number;
}
