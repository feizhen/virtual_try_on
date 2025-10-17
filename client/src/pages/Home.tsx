import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

export const Home = () => {
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
          <h1 className="home-title">欢迎, {user?.name}!</h1>
          <button onClick={handleLogout} className="btn btn-logout">
            退出登录
          </button>
        </div>

        <div className="welcome-section">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="welcome-message">
            <h2>🎉 登录成功!</h2>
            <p>欢迎使用我们的全栈应用示例</p>
            <p className="tech-stack">
              React + TypeScript + NestJS + PostgreSQL
            </p>
          </div>
        </div>

        <div className="user-info">
          <div className="info-item">
            <span className="info-label">姓名</span>
            <span className="info-value">{user?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">邮箱</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">用户ID</span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">注册时间</span>
            <span className="info-value">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleString('zh-CN')
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
