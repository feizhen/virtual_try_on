import { apiClient } from './client';
import type {
  ModelPhoto,
  UploadModelPhotoRequest,
  UploadModelPhotoResponse,
  GetModelPhotosResponse,
  ClothingItem,
  UploadClothingRequest,
  UploadClothingResponse,
  GetClothingItemsResponse,
  UploadProgress,
  StartVirtualTryonRequest,
  StartVirtualTryonResponse,
  GetSessionStatusResponse,
  GetOutfitResultsResponse,
  ProcessingSession,
  OutfitResult,
} from '../types/outfit-change';

/**
 * Outfit Change API Client
 */
export const outfitChangeApi = {
  /**
   * Upload a model photo
   */
  async uploadModelPhoto(
    request: UploadModelPhotoRequest,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<ModelPhoto> {
    const formData = new FormData();
    formData.append('file', request.file);

    if (request.width !== undefined) {
      formData.append('width', request.width.toString());
    }
    if (request.height !== undefined) {
      formData.append('height', request.height.toString());
    }

    const response = await apiClient.post<UploadModelPhotoResponse>(
      '/outfit-change/models/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      },
    );

    console.log('[API] Raw response:', response);
    console.log('[API] response.data:', response.data);
    console.log('[API] response.data.data:', response.data.data);

    // Backend returns: { success: true, data: { photo object } }
    // So we need response.data.data, but if that contains another wrapper, use response.data.data.data
    const result = response.data.data.data || response.data.data;
    console.log('[API] Final result:', result);

    return result;
  },

  /**
   * Get user's model photos
   */
  async getModelPhotos(): Promise<ModelPhoto[]> {
    const response = await apiClient.get<GetModelPhotosResponse>(
      '/outfit-change/models',
    );
    return response.data.data;
  },

  /**
   * Replace a model photo with a new one
   */
  async replaceModelPhoto(
    modelPhotoId: string,
    request: UploadModelPhotoRequest,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<ModelPhoto> {
    const formData = new FormData();
    formData.append('file', request.file);

    if (request.width !== undefined) {
      formData.append('width', request.width.toString());
    }
    if (request.height !== undefined) {
      formData.append('height', request.height.toString());
    }

    const response = await apiClient.put<UploadModelPhotoResponse>(
      `/outfit-change/models/${modelPhotoId}/replace`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      },
    );

    console.log('[API] Replace model photo response:', response);
    const result = response.data.data.data || response.data.data;
    console.log('[API] Replace result:', result);

    return result;
  },

  /**
   * Upload a clothing item photo
   */
  async uploadClothingItem(
    request: UploadClothingRequest,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<ClothingItem> {
    const formData = new FormData();
    formData.append('file', request.file);

    if (request.width !== undefined) {
      formData.append('width', request.width.toString());
    }
    if (request.height !== undefined) {
      formData.append('height', request.height.toString());
    }

    const response = await apiClient.post<UploadClothingResponse>(
      '/outfit-change/clothing/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      },
    );

    console.log('[API] Clothing upload response:', response);
    console.log('[API] response.data:', response.data);
    console.log('[API] response.data.data:', response.data.data);

    const result = response.data.data.data || response.data.data;
    console.log('[API] Final result:', result);

    return result;
  },

  /**
   * Get user's clothing items
   */
  async getClothingItems(): Promise<ClothingItem[]> {
    const response = await apiClient.get<GetClothingItemsResponse>(
      '/outfit-change/clothing',
    );
    return response.data.data;
  },

  /**
   * Start virtual try-on
   */
  async startVirtualTryon(
    request: StartVirtualTryonRequest,
  ): Promise<{ sessionId: string; status: string }> {
    console.log('[API] Starting virtual tryon with request:', request);
    const response = await apiClient.post<StartVirtualTryonResponse>(
      '/outfit-change/tryon',
      request,
    );
    console.log('[API] Tryon response:', response);
    console.log('[API] Tryon response.data:', response.data);
    console.log('[API] Tryon response.data.data:', response.data.data);

    // Backend returns: { success: true, data: { sessionId, status } }
    // So we should return response.data.data, but check if it exists
    const result = response.data.data;
    console.log('[API] Final result to return:', result);
    console.log('[API] Result type:', typeof result);
    console.log('[API] Result has sessionId?', 'sessionId' in (result || {}));

    return result;
  },

  /**
   * Get processing session status
   */
  async getSessionStatus(sessionId: string): Promise<ProcessingSession> {
    console.log('[API] Getting session status for:', sessionId);
    const response = await apiClient.get<GetSessionStatusResponse>(
      `/outfit-change/sessions/${sessionId}`,
    );
    console.log('[API] Session status response:', response);
    console.log('[API] response.data:', response.data);
    console.log('[API] response.data.data:', response.data.data);

    // Backend returns: { success: true, data: { sessionId, status, ... } }
    let result = response.data.data;

    // Double-check if result is wrapped again
    if (result && 'data' in result && typeof result.data === 'object') {
      console.log('[API] Session status has double wrapper, unwrapping again...');
      result = result.data as any;
    }

    console.log('[API] Final session status to return:', result);
    return result;
  },

  /**
   * Get user's outfit results
   */
  async getOutfitResults(): Promise<OutfitResult[]> {
    const response = await apiClient.get<GetOutfitResultsResponse>(
      '/outfit-change/results',
    );
    return response.data.data;
  },
};
