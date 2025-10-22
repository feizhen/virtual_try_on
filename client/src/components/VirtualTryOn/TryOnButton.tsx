import React, { useState } from 'react';
import { useTryOn } from '../../contexts/TryOnContext';
import { createTryOnSession, pollTryOnSession } from '../../api/tryon';
import './styles.css';

export const TryOnButton: React.FC = () => {
  const {
    selectedModel,
    selectedGarment,
    currentSession,
    setCurrentSession,
    addToHistory,
  } = useTryOn();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canTryOn = selectedModel && selectedGarment && !processing;

  const handleTryOn = async () => {
    if (!selectedModel || !selectedGarment) {
      setError('请先选择模特和服装');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // 1. 创建试衣会话
      const sessionResponse = await createTryOnSession({
        modelPhotoId: selectedModel.id,
        clothingItemId: selectedGarment.id,
      });

      // 2. 设置初始会话状态
      const initialSession = {
        sessionId: sessionResponse.sessionId,
        status: sessionResponse.status,
        modelPhotoId: selectedModel.id,
        clothingItemId: selectedGarment.id,
        createdAt: new Date().toISOString(),
      };
      setCurrentSession(initialSession);

      // 3. 轮询会话状态直到完成
      const finalSession = await pollTryOnSession(
        sessionResponse.sessionId,
        {
          onProgress: (session) => {
            setCurrentSession(session);
          },
          pollInterval: 2000, // 每 2 秒轮询一次
          maxAttempts: 60, // 最多 2 分钟
        }
      );

      // 4. 处理最终结果
      if (finalSession.status === 'completed') {
        addToHistory(finalSession);
      } else if (finalSession.status === 'failed') {
        setError(finalSession.errorMessage || '试衣失败');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '试衣过程出错';
      setError(errorMessage);

      // 更新会话状态为失败
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          status: 'failed',
          errorMessage,
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
      {error && (
        <div className="tryon-error" style={{ marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <button
        className="tryon-btn tryon-btn-primary"
        onClick={handleTryOn}
        disabled={!canTryOn}
        style={{ width: '100%' }}
      >
        {processing
          ? '试衣中...'
          : !selectedModel
          ? '请选择模特'
          : !selectedGarment
          ? '请选择服装'
          : '开始试衣'}
      </button>

      {currentSession && (
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          {currentSession.status === 'pending' && '等待处理...'}
          {currentSession.status === 'processing' && '正在生成试衣效果...'}
          {currentSession.status === 'completed' && '✓ 试衣完成'}
          {currentSession.status === 'failed' && '✗ 试衣失败'}
        </div>
      )}
    </div>
  );
};
