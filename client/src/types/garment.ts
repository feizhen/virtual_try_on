export interface Garment {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  url: string; // 完整URL (后端返回)
  thumbnailUrl?: string;
  originalFileName?: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
  quantity?: number;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarmentUploadResponse {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface GarmentListResponse {
  data: Garment[];
  total: number;
}
