import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PreviewArea } from '../components/VirtualTryOn/PreviewArea';
import { GarmentPanel } from '../components/VirtualTryOn/GarmentPanel';
import { TryOnButton } from '../components/VirtualTryOn/TryOnButton';
import { CreditBadge } from '../components/Credit/CreditBadge';
import '../components/VirtualTryOn/styles.css';

/**
 * 虚拟试衣页面
 * 简化版布局:
 * - 顶部导航栏（用户信息、余额、操作按钮）
 * - 中央预览区域 (点击上传模特照片)
 * - 右侧服装选择面板 (可折叠)
 */
const VirtualTryOn: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="tryon-container">
      {/* Top Navigation Bar */}
      <nav className="tryon-navbar">
        <div className="tryon-navbar-left">
          <h1 className="tryon-navbar-title">虚拟试衣</h1>
        </div>

        <div className="tryon-navbar-right">
          {/* User Info */}
          {user && (
            <div className="tryon-navbar-user">
              <div className="tryon-navbar-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="tryon-navbar-user-info">
                <div className="tryon-navbar-user-name">{user.name}</div>
                <div className="tryon-navbar-user-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Credit Badge */}
          <CreditBadge />

          {/* Action Buttons */}
          <button onClick={() => navigate('/')} className="tryon-navbar-btn tryon-navbar-btn-secondary">
            返回首页
          </button>
          <button onClick={handleLogout} className="tryon-navbar-btn tryon-navbar-btn-logout">
            退出登录
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="tryon-main">
        {/* Center: Preview Area */}
        <PreviewArea />

        {/* Right: Side Panel */}
        <div className="tryon-side-panel">
          {/* Garment Selection Panel */}
          <div className="tryon-panel-content-wrapper">
            <GarmentPanel />
          </div>

          {/* Try-On Button - Fixed at Bottom */}
          <div className="tryon-panel-footer">
            <TryOnButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
