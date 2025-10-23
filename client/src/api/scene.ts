import { apiClient } from './client';
import type { Scene, SceneListResponse } from '../types/scene';
import { uploadFile } from '../utils/fileUpload';
import type { UploadOptions } from '../utils/fileUpload';

/**
 * Scene API
 * 背景场景管理 (P3 优先级,后端可能需要新增端点)
 *
 * 注意: 后端当前可能尚未实现场景管理 API
 * 此文件为前端预留接口,待后端实现后对接
 */

/**
 * 上传场景图片
 * POST /outfit-change/scenes/upload (待后端实现)
 */
export async function uploadScene(
  file: File,
  options?: UploadOptions
): Promise<Scene> {
  const result = await uploadFile<Scene>(
    file,
    '/outfit-change/scenes/upload',
    options
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.data;
}

/**
 * 获取场景列表
 * GET /outfit-change/scenes (待后端实现)
 */
export async function getScenes(): Promise<SceneListResponse> {
  const response = await apiClient.get<{ data: Scene[] }>(
    '/outfit-change/scenes'
  );

  return {
    data: response.data.data || [],
    total: response.data.data?.length || 0,
  };
}

/**
 * 获取单个场景详情
 * GET /outfit-change/scenes/:id (待后端实现)
 */
export async function getSceneById(id: string): Promise<Scene> {
  const response = await apiClient.get<{ data: Scene }>(
    `/outfit-change/scenes/${id}`
  );
  return response.data.data;
}

/**
 * 删除场景
 * DELETE /outfit-change/scenes/:id (待后端实现)
 */
export async function deleteScene(id: string): Promise<void> {
  await apiClient.delete(`/outfit-change/scenes/${id}`);
}

/**
 * 获取预设场景列表 (系统内置场景)
 * GET /outfit-change/scenes/presets (待后端实现)
 */
export async function getPresetScenes(): Promise<Scene[]> {
  const response = await apiClient.get<{ data: Scene[] }>(
    '/outfit-change/scenes/presets'
  );
  return response.data.data || [];
}

/**
 * Scene API 对象 (可选的命名空间导出)
 */
export const sceneApi = {
  upload: uploadScene,
  getAll: getScenes,
  getById: getSceneById,
  delete: deleteScene,
  getPresets: getPresetScenes,
};
