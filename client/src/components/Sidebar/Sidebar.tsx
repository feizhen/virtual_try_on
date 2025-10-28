import React, { useRef } from 'react';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useSidebar } from '../../contexts/SidebarContext';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { navigationItems } from '../../config/navigation';
import { SidebarNav } from './SidebarNav';
import { SidebarToggle } from './SidebarToggle';
import { SidebarUser } from './SidebarUser';
import './Sidebar.css';

interface SidebarProps {
  /** Optional additional CSS class names */
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { state, toggleSidebar, closeSidebar, toggleCollapse, activeItemId } =
    useSidebar();
  const { isOpen, isCollapsed, isMobile } = state;
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Close sidebar when clicking outside (mobile only)
  useOnClickOutside(sidebarRef, () => {
    if (isMobile && isOpen) {
      closeSidebar();
    }
  });

  // Trap focus within sidebar when open on mobile
  useFocusTrap(isMobile && isOpen, sidebarRef);

  // Handle Escape key to close sidebar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeSidebar]);

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${className} ${isOpen ? 'sidebar--open' : ''} ${
        isCollapsed ? 'sidebar--collapsed' : ''
      } ${isMobile ? 'sidebar--mobile' : 'sidebar--desktop'}`}
      role="navigation"
      aria-label="主导航"
    >
      <div className="sidebar__header">
        {!isMobile && (
          <SidebarToggle
            isOpen={isOpen}
            onToggle={toggleSidebar}
            isMobile={false}
          />
        )}
        {!isCollapsed && <h1 className="sidebar__title">虚拟试衣</h1>}
      </div>

      <SidebarNav
        items={navigationItems}
        activeItemId={activeItemId}
        collapsed={isCollapsed}
      />

      {/* User info */}
      <SidebarUser collapsed={isCollapsed} />

      {/* Collapse button (desktop only) */}
      {!isMobile && (
        <div className="sidebar__footer">
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
            title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {isCollapsed ? (
              <FiChevronsRight size={20} aria-hidden="true" />
            ) : (
              <>
                <FiChevronsLeft size={20} aria-hidden="true" />
                <span className="sidebar__collapse-label">收起</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
