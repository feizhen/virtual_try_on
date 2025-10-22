export interface Scene {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  url: string; // 完整URL
  thumbnailUrl?: string;
  sceneType?: 'INDOOR' | 'OUTDOOR' | 'STUDIO' | 'CUSTOM';
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface SceneListResponse {
  data: Scene[];
  total: number;
}
