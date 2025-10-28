import type { IconType } from 'react-icons';

export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;

  /** Display label shown to user (localized) */
  label: string;

  /** Route path for navigation (React Router path) */
  route: string;

  /** Icon component from react-icons */
  icon: IconType;

  /** Display order in navigation list (lower number = higher priority) */
  order: number;

  /** Optional badge count (e.g., notification count) */
  badge?: number;

  /** Optional exact match requirement for active state */
  exact?: boolean;
}

export interface SidebarState {
  /** Whether the sidebar is currently open/visible */
  isOpen: boolean;

  /** Desktop only: whether sidebar is collapsed to icon-only view */
  isCollapsed: boolean;

  /** Computed: whether current viewport is mobile (<768px) */
  isMobile: boolean;
}

export interface SidebarContextType {
  /** Current sidebar state */
  state: SidebarState;

  /** Toggle sidebar open/closed */
  toggleSidebar: () => void;

  /** Explicitly open sidebar */
  openSidebar: () => void;

  /** Explicitly close sidebar */
  closeSidebar: () => void;

  /** Toggle collapsed state (desktop only) */
  toggleCollapse: () => void;

  /** Get active navigation item based on current route */
  activeItemId: string | null;
}

export interface SidebarPreferences {
  /** Desktop: user's preferred collapsed state */
  collapsed: boolean;

  /** Last updated timestamp (for future migrations) */
  updatedAt: string; // ISO 8601 format

  /** Preference version (for future migrations) */
  version: number;
}
