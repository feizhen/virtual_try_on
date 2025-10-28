# Quickstart Guide: Integrating Sidebar Navigation

**Feature**: Sidebar Navigation System
**Date**: 2025-10-26
**Audience**: Developers implementing or integrating the sidebar

## Overview

This guide walks you through integrating the sidebar navigation system into the virtual try-on application. Follow these steps in order to add the sidebar to your app.

---

## Prerequisites

Before starting, ensure:
- ✅ React 19.2+ and React Router DOM 7.9+ are installed
- ✅ TypeScript is configured in your project
- ✅ `AuthContext` is available (for user information)
- ✅ Routes are defined with React Router

---

## Step 1: Create Type Definitions

**File**: `client/src/types/sidebar.ts`

```typescript
import { IconType } from 'react-icons';

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: IconType;
  order: number;
  badge?: number;
  exact?: boolean;
}

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
}

export interface SidebarContextType {
  state: SidebarState;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapse: () => void;
  activeItemId: string | null;
}

export interface SidebarPreferences {
  collapsed: boolean;
  updatedAt: string;
  version: number;
}
```

---

## Step 2: Create Custom Hooks

### 2.1: useMediaQuery Hook

**File**: `client/src/hooks/useMediaQuery.ts`

```typescript
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
```

### 2.2: useLocalStorage Hook

**File**: `client/src/hooks/useLocalStorage.ts`

```typescript
import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Failed to load from localStorage: ${key}`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
    }
  };

  return [storedValue, setValue];
}
```

### 2.3: useOnClickOutside Hook

**File**: `client/src/hooks/useOnClickOutside.ts`

```typescript
import { useEffect, RefObject } from 'react';

export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

---

## Step 3: Create Sidebar Context

**File**: `client/src/contexts/SidebarContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { navigationItems } from '../config/navigation';
import type { SidebarContextType, SidebarState, SidebarPreferences } from '../types/sidebar';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

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
  const activeItemId = navigationItems
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
```

---

## Step 4: Create Navigation Configuration

**File**: `client/src/config/navigation.ts`

```typescript
import { FiHome, FiShirt, FiClock, FiDollarSign } from 'react-icons/fi';
import type { NavigationItem } from '../types/sidebar';

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    route: '/',
    icon: FiHome,
    order: 1,
    exact: true,
  },
  {
    id: 'tryon',
    label: '虚拟试衣',
    route: '/tryon',
    icon: FiShirt,
    order: 2,
  },
  {
    id: 'history',
    label: '历史记录',
    route: '/history',
    icon: FiClock,
    order: 3,
  },
  {
    id: 'credits',
    label: '积分余额',
    route: '/credits',
    icon: FiDollarSign,
    order: 4,
  },
];
```

---

## Step 5: Implement Sidebar Components

Now implement the component files following the contracts in `contracts/sidebar-api.md`. The main components are:

1. **`Sidebar.tsx`** - Main container
2. **`SidebarNav.tsx`** - Navigation list
3. **`SidebarToggle.tsx`** - Toggle button
4. **`SidebarUser.tsx`** - User info
5. **`AppLayout.tsx`** - Layout wrapper

See the full component implementations in the implementation phase (tasks.md).

---

## Step 6: Integrate into App

**File**: `client/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CreditProvider } from './contexts/CreditContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { AppLayout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import your pages
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { VirtualTryOn } from './pages/VirtualTryOn';
import { History } from './pages/History';
// ... other pages

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CreditProvider>
          <SidebarProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes with sidebar */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tryon" element={<VirtualTryOn />} />
                        <Route path="/history" element={<History />} />
                        {/* ... other routes */}
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SidebarProvider>
        </CreditProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## Step 7: Add CSS Variables

**File**: `client/src/index.css`

Add these CSS variables to support the sidebar theme:

```css
:root {
  /* Existing variables ... */

  /* Sidebar specific */
  --sidebar-width-expanded: 280px;
  --sidebar-width-collapsed: 64px;
  --sidebar-bg: var(--card-background);
  --sidebar-border: var(--border-color);
  --sidebar-transition: 250ms ease-in-out;

  /* Z-index layers */
  --z-sidebar: 100;
  --z-backdrop: 90;
}
```

---

## Step 8: Test Integration

### Manual Testing Checklist

Desktop:
- [ ] Sidebar is visible on page load
- [ ] Clicking toggle button opens/closes sidebar
- [ ] Clicking collapse button toggles icon-only view
- [ ] Active navigation item is highlighted
- [ ] Collapsed state persists on page reload
- [ ] All navigation items navigate correctly

Mobile:
- [ ] Sidebar is hidden by default
- [ ] Hamburger menu opens sidebar as overlay
- [ ] Sidebar closes when clicking nav item
- [ ] Sidebar closes when clicking backdrop
- [ ] Escape key closes sidebar

Accessibility:
- [ ] Tab key navigates through all sidebar items
- [ ] Enter/Space activates buttons and links
- [ ] Screen reader announces sidebar state
- [ ] Focus is trapped in sidebar (mobile overlay)
- [ ] All colors meet 4.5:1 contrast ratio

---

## Troubleshooting

### Sidebar doesn't appear

**Problem**: Sidebar component renders but isn't visible

**Solutions**:
- Check that `SidebarProvider` wraps your app
- Verify CSS is imported (Sidebar.css, AppLayout.css)
- Check browser console for React errors

### Active item not highlighting

**Problem**: Current page's nav item not highlighted

**Solutions**:
- Verify route matches navigation item `route` property
- Check `exact` flag for home route (`/`)
- Inspect `location.pathname` in React DevTools

### Collapsed state not persisting

**Problem**: Sidebar resets to expanded on reload

**Solutions**:
- Check localStorage in browser DevTools (key: `sidebar-preferences`)
- Verify `useLocalStorage` hook is called in `SidebarProvider`
- Check browser console for localStorage errors (private browsing)

### Mobile overlay not closing

**Problem**: Sidebar stays open after navigation on mobile

**Solutions**:
- Verify `useEffect` hook listens to `location.pathname`
- Check `isMobile` is true (inspect with React DevTools)
- Ensure `useLocation` hook is imported from `react-router-dom`

---

## Performance Optimization

### Code Splitting

Lazy load sidebar components to reduce initial bundle size:

```typescript
const Sidebar = lazy(() => import('./components/Sidebar'));
const AppLayout = lazy(() => import('./components/Layout'));

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <AppLayout>
    <YourContent />
  </AppLayout>
</Suspense>
```

### Memoization

Memoize navigation items to prevent re-renders:

```typescript
const memoizedItems = useMemo(() => navigationItems, []);
```

---

## Next Steps

After integration:

1. **Run tests**: Execute unit and E2E tests
2. **Manual QA**: Test on different devices and browsers
3. **Accessibility audit**: Use axe DevTools or Lighthouse
4. **Performance check**: Measure animation frame rate
5. **User feedback**: Gather feedback on navigation UX

---

## Additional Resources

- **Spec**: `specs/006-sidebar-navigation/spec.md`
- **Contracts**: `specs/006-sidebar-navigation/contracts/sidebar-api.md`
- **Data Model**: `specs/006-sidebar-navigation/data-model.md`
- **Research**: `specs/006-sidebar-navigation/research.md`

For implementation tasks, see `/speckit.tasks` output (tasks.md).

---

**Quickstart Complete**: You now have a fully integrated sidebar navigation system! 🎉
