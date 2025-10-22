import { apiClient } from './client';
import type {
  Garment,
  GarmentUploadResponse,
  GarmentListResponse,
} from '../types/garment';
import { uploadFile } from '../utils/fileUpload';
import type { UploadOptions } from '../utils/fileUpload';

/**
 * Garment API
 * 映射到后端 /api/outfit-change/clothing 端点
 */

/**
 * 上传服装图片
 * POST /outfit-change/clothing/upload
 */
export async function uploadGarment(
  file: File,
  options?: UploadOptions
): Promise<GarmentUploadResponse> {
  const result = await uploadFile<GarmentUploadResponse>(
    file,
    '/outfit-change/clothing/upload',
    options
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.data;
}

/**
 * 获取服装列表
 * GET /outfit-change/clothing
 */
export async function getGarments(): Promise<GarmentListResponse> {
  const response = await apiClient.get<{ data: Garment[] }>(
    '/outfit-change/clothing'
  );

  // 后端返回数组,转换为带 total 的格式
  return {
    data: response.data.data || [],
    total: response.data.data?.length || 0,
  };
}

/**
 * 获取单个服装详情
 * GET /outfit-change/clothing/:id
 */
export async function getGarmentById(id: string): Promise<Garment> {
  const response = await apiClient.get<{ data: Garment }>(
    `/outfit-change/clothing/${id}`
  );
  return response.data.data;
}

/**
 * 删除服装
 * DELETE /outfit-change/clothing/:id
 */
export async function deleteGarment(id: string): Promise<void> {
  await apiClient.delete(`/outfit-change/clothing/${id}`);
}

/**
 * Garment API 对象 (可选的命名空间导出)
 */
export const garmentApi = {
  upload: uploadGarment,
  getAll: getGarments,
  getById: getGarmentById,
  delete: deleteGarment,
};
