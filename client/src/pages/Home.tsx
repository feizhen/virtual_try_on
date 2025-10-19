import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ModelUpload } from '../components/ModelUpload';
import { ClothingUpload } from '../components/ClothingUpload';
import { outfitChangeApi } from '../api/outfit-change';
import type { ModelPhoto, ClothingItem, ProcessingSession } from '../types/outfit-change';
import './Home.css';

export const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [uploadedPhotos, setUploadedPhotos] = useState<ModelPhoto[]>([]);
  const [uploadedClothing, setUploadedClothing] = useState<ClothingItem[]>([]);

  // 虚拟试衣相关状态
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedClothingId, setSelectedClothingId] = useState<string | null>(null);
  const [processingSession, setProcessingSession] = useState<ProcessingSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handlePhotoUploadSuccess = (photo: ModelPhoto) => {
    setUploadedPhotos((prev) => {
      // Ensure prev is always an array
      const prevArray = Array.isArray(prev) ? prev : [];
      return [photo, ...prevArray];
    });
  };

  const handleClothingUploadSuccess = (clothing: ClothingItem) => {
    setUploadedClothing((prev) => {
      // Ensure prev is always an array
      const prevArray = Array.isArray(prev) ? prev : [];
      return [clothing, ...prevArray];
    });
  };

  // Load existing photos and clothing on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('=== Loading existing data ===');
        const [photos, clothing] = await Promise.all([
          outfitChangeApi.getModelPhotos(),
          outfitChangeApi.getClothingItems(),
        ]);
        console.log('Loaded photos:', photos);
        console.log('Photos count:', photos.length);
        console.log('Loaded clothing:', clothing);
        console.log('Clothing is array?', Array.isArray(clothing));
        console.log('Clothing length:', clothing?.length);
        console.log('Clothing items:', clothing);
        setUploadedPhotos(photos);
        setUploadedClothing(clothing);
      } catch (err) {
        console.error('Failed to load existing data:', err);
      }
    };

    loadExistingData();
  }, []);

  const handleStartTryon = async () => {
    if (!selectedModelId || !selectedClothingId) {
      setError('请选择模特照片和服装');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log('[Home] Starting virtual tryon...');
      const result = await outfitChangeApi.startVirtualTryon({
        modelPhotoId: selectedModelId,
        clothingItemId: selectedClothingId,
      });

      console.log('[Home] Received result from API:', result);
      console.log('[Home] result type:', typeof result);
      console.log('[Home] result keys:', Object.keys(result));

      // Handle the case where result might be wrapped in { success, data }
      let sessionData = result;
      if ('data' in result && typeof result.data === 'object') {
        console.log('[Home] Result has data wrapper, unwrapping...');
        sessionData = result.data as any;
      }

      console.log('[Home] sessionData:', sessionData);
      console.log('[Home] sessionData.sessionId:', (sessionData as any).sessionId);
      console.log('[Home] sessionData.status:', (sessionData as any).status);

      const sessionId = (sessionData as any).sessionId;
      const status = (sessionData as any).status || 'processing';

      console.log('[Home] Extracted sessionId:', sessionId);
      console.log('[Home] Extracted status:', status);

      if (!sessionId) {
        console.error('[Home] ERROR: sessionId is undefined!');
        console.error('[Home] Full result object:', JSON.stringify(result, null, 2));
        setError('启动试衣失败：无法获取会话ID');
        return;
      }

      setProcessingSession({
        sessionId: sessionId,
        status: status as any,
        createdAt: new Date().toISOString(),
      });

      console.log('[Home] ProcessingSession state set');
    } catch (err: any) {
      setError(err.response?.data?.message || '启动试衣失败');
      console.error('Start tryon error:', err);
    } finally {
      setIsStarting(false);
    }
  };

  // 轮询检查处理状态
  useEffect(() => {
    console.log('=== Polling useEffect triggered ===');
    console.log('processingSession:', processingSession);

    if (!processingSession ||
        !processingSession.sessionId ||
        processingSession.status !== 'processing') {
      console.log('Polling condition not met, exiting');
      console.log('  - has session:', !!processingSession);
      console.log('  - has sessionId:', !!processingSession?.sessionId);
      console.log('  - status:', processingSession?.status);
      return;
    }

    const sessionId = processingSession.sessionId;
    console.log('Starting polling for session:', sessionId);

    const pollInterval = setInterval(async () => {
      console.log('Polling session status for:', sessionId);
      try {
        const status = await outfitChangeApi.getSessionStatus(sessionId);
        console.log('Received status:', status);
        setProcessingSession(status);

        if (status.status === 'completed' || status.status === 'failed') {
          console.log('Session finished, stopping poll');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Poll status error:', err);
        // 如果轮询失败，停止轮询
        clearInterval(pollInterval);
      }
    }, 3000); // 每3秒轮询一次

    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [processingSession?.sessionId, processingSession?.status]);

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">欢迎, {user?.name}!</h1>
          <button onClick={handleLogout} className="btn btn-logout">
            退出登录
          </button>
        </div>

        <div className="feature-section">
          <div className="section-header">
            <h2 className="section-title">📸 AI 虚拟换装</h2>
            <p className="section-description">
              上传您的照片和服装，体验 AI 驱动的虚拟试衣功能
            </p>
          </div>

          <div className="three-column-layout">
            {/* 左侧：模特照片历史记录 */}
            <div className="left-sidebar">
              <h3 className="sidebar-title">模特照片</h3>
              {uploadedPhotos.length > 0 ? (
                <div className="sidebar-list">
                  {uploadedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`sidebar-card ${selectedModelId === photo.id ? 'selected' : ''}`}
                      onClick={() => setSelectedModelId(photo.id)}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${photo.url}`}
                        alt={photo.originalFileName || 'Model photo'}
                        className="sidebar-thumbnail"
                      />
                      <div className="sidebar-info">
                        <p className="sidebar-filename">
                          {photo.originalFileName || 'Unknown'}
                        </p>
                        <p className="sidebar-date">
                          {new Date(photo.uploadedAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {selectedModelId === photo.id && (
                        <div className="selected-badge">已选择</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sidebar-empty">
                  <p>暂无上传记录</p>
                </div>
              )}
            </div>

            {/* 中间：上传模特照片 + 虚拟试衣区域 */}
            <div className="center-content">
              <div className="upload-section">
                <h3 className="upload-section-title">上传模特照片</h3>
                <ModelUpload onUploadSuccess={handlePhotoUploadSuccess} />
              </div>

              {/* 虚拟试衣控制区 */}
              <div className="tryon-section">
                <h3 className="tryon-title">开始虚拟试衣</h3>

                {console.log('=== Tryon button state ===')}
                {console.log('selectedModelId:', selectedModelId)}
                {console.log('selectedClothingId:', selectedClothingId)}
                {console.log('isStarting:', isStarting)}

                {error && <div className="error-message">{error}</div>}

                <button
                  onClick={handleStartTryon}
                  disabled={!selectedModelId || !selectedClothingId || isStarting}
                  className="btn btn-primary btn-tryon"
                >
                  {isStarting ? '正在启动...' : '开始试衣'}
                </button>

                {processingSession && (
                  <div className="session-status">
                    {processingSession.status === 'processing' && (
                      <div className="status-processing">
                        <div className="spinner"></div>
                        <p>AI 正在处理中，请稍候...</p>
                      </div>
                    )}
                    {processingSession.status === 'completed' && processingSession.result && (
                      <div className="status-completed">
                        <p className="success-text">✓ 试衣完成！</p>
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${processingSession.result.url}`}
                          alt="Try-on result"
                          className="result-image"
                        />
                        <button
                          onClick={() => setProcessingSession(null)}
                          className="btn btn-secondary"
                        >
                          继续试衣
                        </button>
                      </div>
                    )}
                    {processingSession.status === 'failed' && (
                      <div className="status-failed">
                        <p className="error-text">✗ 处理失败</p>
                        <p className="error-detail">{processingSession.errorMessage}</p>
                        <button
                          onClick={() => setProcessingSession(null)}
                          className="btn btn-secondary"
                        >
                          重试
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：上传服装 + 服装历史记录 */}
            <div className="right-sidebar">
              <div className="upload-section">
                <h3 className="sidebar-title">上传服装</h3>
                <ClothingUpload onUploadSuccess={handleClothingUploadSuccess} />
              </div>

              {uploadedClothing.length > 0 && (
                <div className="clothing-history">
                  <h4 className="history-title">已上传服装 ({uploadedClothing.length})</h4>
                  {console.log('=== About to render clothing list ===')}
                  {console.log('uploadedClothing:', uploadedClothing)}
                  {console.log('uploadedClothing.length:', uploadedClothing.length)}
                  {console.log('Is array?', Array.isArray(uploadedClothing))}
                  <div className="sidebar-list">
                    {uploadedClothing.map((clothing) => {
                      console.log('Rendering clothing item:', clothing.id, clothing.originalFileName);
                      return (
                        <div
                          key={clothing.id}
                          className={`sidebar-card ${selectedClothingId === clothing.id ? 'selected' : ''}`}
                          onClick={() => setSelectedClothingId(clothing.id)}
                        >
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${clothing.url}`}
                            alt={clothing.originalFileName || 'Clothing'}
                            className="sidebar-thumbnail"
                          />
                          <div className="sidebar-info">
                            <p className="sidebar-filename">
                              {clothing.originalFileName || 'Unknown'}
                            </p>
                            <p className="sidebar-date">
                              {new Date(clothing.uploadedAt).toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {selectedClothingId === clothing.id && (
                            <div className="selected-badge">已选择</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
