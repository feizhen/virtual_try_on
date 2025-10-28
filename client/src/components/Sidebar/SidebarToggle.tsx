import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import './SidebarToggle.css';

interface SidebarToggleProps {
  /** Whether sidebar is currently open */
  isOpen: boolean;

  /** Callback when toggle is clicked */
  onToggle: () => void;

  /** Whether in mobile mode */
  isMobile?: boolean;

  /** Optional additional CSS class names */
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isOpen,
  onToggle,
  isMobile = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`sidebar-toggle ${className} ${
        isMobile ? 'sidebar-toggle--mobile' : 'sidebar-toggle--desktop'
      }`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? '关闭侧边栏' : '打开侧边栏'}
      title={isOpen ? '关闭侧边栏' : '打开侧边栏'}
    >
      {isOpen ? (
        <FiX className="sidebar-toggle__icon" size={24} aria-hidden="true" />
      ) : (
        <FiMenu className="sidebar-toggle__icon" size={24} aria-hidden="true" />
      )}
    </button>
  );
};
