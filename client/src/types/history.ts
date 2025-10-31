/**
 * History-related type definitions
 */

export interface ModelPhoto {
  id: string;
  imageUrl: string;
  url: string;
  originalFileName: string;
}

export interface ClothingItem {
  id: string;
  imageUrl: string;
  url: string;
  originalFileName: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  modelPhotoId: string;
  clothingItemId: string;
  resultImageUrl: string;
  url: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  processingDuration: number;
  creditsUsed: number;
  createdAt: string;
  modelPhoto: ModelPhoto;
  clothingItem: ClothingItem;
}

export interface HistoryListResponse {
  data: HistoryItem[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface HistoryDetailResponse {
  data: HistoryItem;
}

export interface DeleteHistoryResponse {
  id: string;
  message: string;
}

export interface HistoryQueryParams {
  cursor?: string;
  limit?: number;
}
