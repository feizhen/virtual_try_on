import { apiClient } from './client';
import type {
  TryOnSession,
  TryOnSessionResponse,
  CreateTryOnRequest,
} from '../types/tryon';

/**
 * TryOn API
 * 映射到后端 /api/outfit-change/tryon 和 /api/outfit-change/sessions 端点
 */

/**
 * 创建虚拟试衣会话
 * POST /outfit-change/tryon
 */
export async function createTryOnSession(
  request: CreateTryOnRequest
): Promise<TryOnSessionResponse> {
  const response = await apiClient.post<{ data: TryOnSessionResponse }>(
    '/outfit-change/tryon',
    request
  );
  return response.data.data;
}

/**
 * 获取试衣会话状态
 * GET /outfit-change/sessions/:sessionId
 */
export async function getTryOnSessionStatus(
  sessionId: string
): Promise<TryOnSession> {
  const response = await apiClient.get<{ data: TryOnSession }>(
    `/outfit-change/sessions/${sessionId}`
  );
  return response.data.data;
}

/**
 * 轮询试衣会话状态直到完成或失败
 * @param sessionId 会话 ID
 * @param onProgress 进度回调 (status 改变时触发)
 * @param pollInterval 轮询间隔 (毫秒),默认 2000ms
 * @param maxAttempts 最大轮询次数,默认 60 次 (2分钟)
 */
export async function pollTryOnSession(
  sessionId: string,
  options: {
    onProgress?: (session: TryOnSession) => void;
    pollInterval?: number;
    maxAttempts?: number;
  } = {}
): Promise<TryOnSession> {
  const {
    onProgress,
    pollInterval = 2000,
    maxAttempts = 60,
  } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    const session = await getTryOnSessionStatus(sessionId);

    if (onProgress) {
      onProgress(session);
    }

    // 终止条件: completed 或 failed
    if (session.status === 'completed' || session.status === 'failed') {
      return session;
    }

    // 等待后继续轮询
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    attempts++;
  }

  // 超时
  throw new Error('Try-on session polling timeout');
}

/**
 * 取消试衣会话 (如果后端支持)
 * DELETE /outfit-change/sessions/:sessionId
 */
export async function cancelTryOnSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/outfit-change/sessions/${sessionId}`);
}

/**
 * TryOn API 对象 (可选的命名空间导出)
 */
export const tryonApi = {
  create: createTryOnSession,
  getStatus: getTryOnSessionStatus,
  poll: pollTryOnSession,
  cancel: cancelTryOnSession,
};
