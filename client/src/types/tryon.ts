export type TryOnStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TryOnSession {
  sessionId: string;
  status: TryOnStatus;
  modelPhotoId?: string;
  clothingItemId?: string;
  createdAt: string;
  completedAt?: string;
  result?: TryOnResult;
  errorMessage?: string;
}

export interface TryOnResult {
  id: string;
  resultImageUrl: string;
  url: string; // 完整URL
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  processingDuration: number; // milliseconds
  createdAt: string;
}

export interface CreateTryOnRequest {
  modelPhotoId: string;
  clothingItemId: string;
  seed?: number;
}

export interface TryOnSessionResponse {
  sessionId: string;
  status: TryOnStatus;
}
