import React, { useState } from 'react';
import { useTryOn } from '../../contexts/TryOnContext';
import { useCredit } from '../../contexts/CreditContext';
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

  const { balance, refreshBalance } = useCredit();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CREDITS_PER_TRYON = 10;
  const hasEnoughCredits = (balance?.creditBalance ?? 0) >= CREDITS_PER_TRYON;
  const canTryOn = selectedModel && selectedGarment && !processing && hasEnoughCredits;

  const handleTryOn = async () => {
    if (!selectedModel || !selectedGarment) {
      setError('请先选择模特和服装');
      return;
    }

    // Credit 余额检查
    if (!hasEnoughCredits) {
      setError(`Credits 不足！需要 ${CREDITS_PER_TRYON} credits，当前余额: ${balance?.creditBalance ?? 0}`);
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

      console.log('[TryOnButton] Session response:', sessionResponse);
      console.log('[TryOnButton] Session response keys:', Object.keys(sessionResponse));
      console.log('[TryOnButton] sessionId:', sessionResponse.sessionId);

      // 处理可能的双层包装
      const sessionData = (sessionResponse as any).success && (sessionResponse as any).data
        ? (sessionResponse as any).data
        : sessionResponse;

      console.log('[TryOnButton] Unwrapped session data:', sessionData);
      console.log('[TryOnButton] Unwrapped sessionId:', sessionData.sessionId);

      if (!sessionData.sessionId) {
        throw new Error('无法获取会话ID,请重试');
      }

      // 2. 设置初始会话状态
      const initialSession = {
        sessionId: sessionData.sessionId,
        status: sessionData.status || 'pending',
        modelPhotoId: selectedModel.id,
        clothingItemId: selectedGarment.id,
        createdAt: new Date().toISOString(),
      };
      setCurrentSession(initialSession);

      // 3. 轮询会话状态直到完成
      const finalSession = await pollTryOnSession(
        sessionData.sessionId,
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
        // 刷新 credit 余额
        await refreshBalance();
      } else if (finalSession.status === 'failed') {
        setError(finalSession.errorMessage || '试衣失败');
        // 失败时也刷新余额（因为可能已经退款）
        await refreshBalance();
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
        title={
          !hasEnoughCredits
            ? `Credits 不足，需要 ${CREDITS_PER_TRYON} credits`
            : ''
        }
      >
        {processing
          ? '试衣中...'
          : !hasEnoughCredits
          ? `Credits 不足 (需要 ${CREDITS_PER_TRYON})`
          : !selectedGarment
          ? '请选择服装'
          : `开始试衣 (-${CREDITS_PER_TRYON} Credits)`}
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
