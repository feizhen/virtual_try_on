import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { navigationItems } from '../config/navigation';
import type {
  SidebarContextType,
  SidebarState,
  SidebarPreferences,
} from '../types/sidebar';

const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [preferences, setPreferences] = useLocalStorage<SidebarPreferences>(
    'sidebar-preferences',
    {
      collapsed: false,
      updatedAt: new Date().toISOString(),
      version: 1,
    }
  );

  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isCollapsed, setIsCollapsed] = useState(preferences.collapsed);

  // Sync isCollapsed with viewport changes
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false); // Mobile never collapses
    } else {
      setIsCollapsed(preferences.collapsed);
    }
  }, [isMobile, preferences.collapsed]);

  // Close sidebar on navigation (mobile only)
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

  const state: SidebarState = {
    isOpen,
    isCollapsed,
    isMobile,
  };

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  const toggleCollapse = () => {
    if (!isMobile) {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      setPreferences({
        ...preferences,
        collapsed: newCollapsed,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Calculate active item ID
  const activeItemId =
    navigationItems
      .filter((item) => {
        if (item.exact) {
          return location.pathname === item.route;
        }
        return location.pathname.startsWith(item.route);
      })
      .sort((a, b) => b.route.length - a.route.length)[0]?.id || null;

  return (
    <SidebarContext.Provider
      value={{
        state,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        toggleCollapse,
        activeItemId,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
