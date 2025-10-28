import React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import { Sidebar } from '../Sidebar';
import { SidebarToggle } from '../Sidebar/SidebarToggle';
import './AppLayout.css';

interface AppLayoutProps {
  /** Page content to render */
  children: React.ReactNode;

  /** Optional: Whether to show sidebar (default: true) */
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
}) => {
  const { state, toggleSidebar } = useSidebar();
  const { isOpen, isCollapsed, isMobile } = state;

  return (
    <div className="app-layout">
      {showSidebar && (
        <>
          {/* Mobile hamburger toggle */}
          {isMobile && (
            <SidebarToggle
              isOpen={isOpen}
              onToggle={toggleSidebar}
              isMobile={true}
            />
          )}

          {/* Sidebar */}
          <Sidebar />

          {/* Mobile backdrop */}
          {isMobile && isOpen && (
            <div
              className="app-layout__backdrop"
              onClick={() => toggleSidebar()}
              aria-hidden="true"
            />
          )}
        </>
      )}

      {/* Main content */}
      <main
        className={`app-layout__main ${
          showSidebar ? 'app-layout__main--with-sidebar' : ''
        } ${isCollapsed ? 'app-layout__main--sidebar-collapsed' : ''} ${
          isMobile ? 'app-layout__main--mobile' : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
};
