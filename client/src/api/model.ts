import { apiClient } from './client';
import type { Model, ModelListResponse } from '../types/model';
import { uploadFile } from '../utils/fileUpload';
import type { UploadOptions } from '../utils/fileUpload';

/**
 * Model API
 * 映射到后端 /api/outfit-change/models 端点
 */

/**
 * 上传模特照片
 * POST /outfit-change/models/upload
 */
export async function uploadModel(
  file: File,
  options?: UploadOptions
): Promise<Model> {
  const result = await uploadFile<Model>(
    file,
    '/outfit-change/models/upload',
    options
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.data;
}

/**
 * 获取模特照片列表
 * GET /outfit-change/models
 */
export async function getModels(): Promise<ModelListResponse> {
  const response = await apiClient.get<{ data: Model[] }>(
    '/outfit-change/models'
  );

  // 后端返回数组,转换为带 total 的格式
  return {
    data: response.data.data || [],
    total: response.data.data?.length || 0,
  };
}

/**
 * 获取单个模特照片详情
 * GET /outfit-change/models/:id
 */
export async function getModelById(id: string): Promise<Model> {
  const response = await apiClient.get<{ data: Model }>(
    `/outfit-change/models/${id}`
  );
  return response.data.data;
}

/**
 * 删除模特照片
 * DELETE /outfit-change/models/:id
 */
export async function deleteModel(id: string): Promise<void> {
  await apiClient.delete(`/outfit-change/models/${id}`);
}

/**
 * Model API 对象 (可选的命名空间导出)
 */
export const modelApi = {
  upload: uploadModel,
  getAll: getModels,
  getById: getModelById,
  delete: deleteModel,
};
