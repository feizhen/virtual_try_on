import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

export const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">欢迎回来!</h1>
          <button onClick={handleLogout} className="btn btn-logout">
            退出登录
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <h2>{user?.username}</h2>
            <p className="user-email">{user?.email}</p>
            <p className="user-id">用户ID: {user?.id}</p>
          </div>
        </div>

        <div className="welcome-message">
          <h3>🎉 欢迎使用我们的应用!</h3>
          <p>
            您已成功登录。这是一个使用 React + NestJS 构建的全栈应用示例。
          </p>
        </div>

        <div className="info-section">
          <h4>账号信息</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">用户名</span>
              <span className="info-value">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">邮箱</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">注册时间</span>
              <span className="info-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('zh-CN')
                  : '-'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">最后更新</span>
              <span className="info-value">
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString('zh-CN')
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
