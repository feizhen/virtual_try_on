import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SidebarUser.css';

interface SidebarUserProps {
  /** Whether sidebar is in collapsed state */
  collapsed?: boolean;
}

export const SidebarUser: React.FC<SidebarUserProps> = ({
  collapsed = false,
}) => {
  const { user } = useAuth();

  if (!user) return null;

  // Generate avatar initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = user.username ? getInitials(user.username) : 'U';

  return (
    <div
      className={`sidebar-user ${collapsed ? 'sidebar-user--collapsed' : ''}`}
    >
      <div
        className="sidebar-user__avatar"
        aria-label={`${user.username}的头像`}
      >
        {initials}
      </div>
      {!collapsed && (
        <div className="sidebar-user__info">
          <div className="sidebar-user__name">{user.username}</div>
          {user.email && (
            <div className="sidebar-user__email">{user.email}</div>
          )}
        </div>
      )}
    </div>
  );
};
