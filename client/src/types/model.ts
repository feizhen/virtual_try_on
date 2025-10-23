export interface Model {
  id: string;
  userId?: string;
  imageUrl: string;
  url: string; // 完整URL
  thumbnailUrl?: string;
  originalFileName?: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  uploadedAt?: string;
  deletedAt?: string | null;
}

export interface ModelListResponse {
  data: Model[];
  total: number;
}
