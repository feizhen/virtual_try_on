# Data Model: Sidebar Navigation

**Feature**: Sidebar Navigation System
**Phase**: 1 - Design & Contracts
**Date**: 2025-10-26

## Overview

This document defines the data structures and state models for the sidebar navigation system. All types are defined in TypeScript to ensure type safety and developer experience.

---

## Core Entities

### 1. NavigationItem

Represents a single navigation item in the sidebar.

**Entity Definition**:
```typescript
interface NavigationItem {
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
```

**Validation Rules**:
- `id`: Required, must be unique across all navigation items
- `label`: Required, non-empty string
- `route`: Required, must be valid React Router path (starts with `/`)
- `icon`: Required, must be valid IconType from react-icons
- `order`: Required, positive integer
- `badge`: Optional, non-negative integer if provided
- `exact`: Optional, defaults to `false` (partial match for active state)

**State Transitions**: N/A (static configuration)

**Example**:
```typescript
const homeNavItem: NavigationItem = {
  id: 'home',
  label: '首页',
  route: '/',
  icon: FiHome,
  order: 1,
  exact: true, // Only active when exactly on '/'
};
```

---

### 2. SidebarState

Tracks the current runtime state of the sidebar.

**Entity Definition**:
```typescript
interface SidebarState {
  /** Whether the sidebar is currently open/visible */
  isOpen: boolean;

  /** Desktop only: whether sidebar is collapsed to icon-only view */
  isCollapsed: boolean;

  /** Computed: whether current viewport is mobile (<768px) */
  isMobile: boolean;
}
```

**Validation Rules**:
- `isOpen`: Boolean flag, default varies by device (desktop: true, mobile: false)
- `isCollapsed`: Boolean flag, only meaningful on desktop (ignored on mobile), default: false
- `isMobile`: Computed from viewport width, read-only

**State Transitions**:

1. **Open Sidebar**:
   - Precondition: `isOpen === false`
   - Action: User clicks toggle button or hamburger menu
   - Result: `isOpen = true`
   - Side effect: On mobile, backdrop overlay appears, body scroll locked

2. **Close Sidebar**:
   - Precondition: `isOpen === true`
   - Action: User clicks toggle, outside click (mobile), or navigates (mobile)
   - Result: `isOpen = false`
   - Side effect: On mobile, backdrop removed, body scroll unlocked

3. **Toggle Collapse** (Desktop only):
   - Precondition: `isMobile === false`
   - Action: User clicks collapse button
   - Result: `isCollapsed = !isCollapsed`
   - Side effect: Preference saved to localStorage

4. **Viewport Resize**:
   - Precondition: Window resize crosses 768px breakpoint
   - Action: Browser window resized
   - Result: `isMobile` updated, `isCollapsed` reset if switching to mobile
   - Side effect: Mobile → Desktop: sidebar remains closed by default

**State Diagram**:
```
Desktop Flow:
[Closed, Expanded] ←→ [Open, Expanded]
        ↑                     ↓
        └─────────────────────┘
               (collapse)
        ┌─────────────────────┐
        ↓                     ↑
[Closed, Collapsed] ←→ [Open, Collapsed]

Mobile Flow:
[Closed] ←→ [Open (Overlay)]
(Auto-close on navigation)
```

---

### 3. SidebarContext

The global context providing sidebar state and actions to all components.

**Entity Definition**:
```typescript
interface SidebarContextType {
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
```

**Relationships**:
- `state`: Contains current `SidebarState`
- `activeItemId`: Derived from current route and `navigationItems` array
- Actions modify `state` and may trigger localStorage updates

---

### 4. SidebarPreferences

User preferences persisted in localStorage.

**Entity Definition**:
```typescript
interface SidebarPreferences {
  /** Desktop: user's preferred collapsed state */
  collapsed: boolean;

  /** Last updated timestamp (for future migrations) */
  updatedAt: string; // ISO 8601 format

  /** Preference version (for future migrations) */
  version: number;
}
```

**Storage**:
- Key: `sidebar-preferences`
- Format: JSON string
- Location: `window.localStorage`

**Validation Rules**:
- `collapsed`: Boolean, default `false`
- `updatedAt`: ISO 8601 timestamp, auto-generated
- `version`: Integer, current version `1`

**Migration Strategy**:
```typescript
function migrateSidebarPreferences(stored: any): SidebarPreferences {
  // Handle old format or missing fields
  if (!stored || typeof stored.version !== 'number') {
    return {
      collapsed: false,
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  }

  // Future version migrations go here
  return stored;
}
```

---

## Derived State

### 1. Active Navigation Item

**Calculation**:
```typescript
function getActiveItemId(
  currentPath: string,
  items: NavigationItem[]
): string | null {
  // Find exact match first
  const exactMatch = items.find(
    item => item.exact && item.route === currentPath
  );
  if (exactMatch) return exactMatch.id;

  // Find partial match (longest match wins)
  const partialMatches = items
    .filter(item => !item.exact && currentPath.startsWith(item.route))
    .sort((a, b) => b.route.length - a.route.length);

  return partialMatches[0]?.id || null;
}
```

**Example**:
- Current path: `/history`
- Navigation items: `[{ route: '/', exact: true }, { route: '/history' }]`
- Result: `'history'` (partial match on `/history`)

---

### 2. Viewport Type

**Calculation**:
```typescript
const isMobile = useMediaQuery('(max-width: 767px)');
```

**Breakpoint**: 768px (standard tablet/desktop boundary)

---

## Invariants

1. **Mobile sidebar cannot be collapsed**:
   - When `isMobile === true`, `isCollapsed` is always ignored
   - Collapsed state only persists for desktop

2. **Single navigation item active**:
   - At most one `NavigationItem` can be active at a time
   - Active state determined by current route only

3. **Preferences only persist for desktop**:
   - Mobile state is always ephemeral (closes on navigation)
   - Only `collapsed` preference is stored

4. **Focus trap only on mobile overlay**:
   - Desktop sidebar doesn't trap focus (persistent navigation)
   - Mobile overlay traps focus for accessibility

---

## Type Exports

All types exported from `src/types/sidebar.ts`:

```typescript
// src/types/sidebar.ts
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

## Configuration Data

Navigation items configuration (not stored, hardcoded):

```typescript
// src/config/navigation.ts
import { FiHome, FiShirt, FiClock, FiDollarSign } from 'react-icons/fi';
import { NavigationItem } from '../types/sidebar';

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

**Future Extensibility**: To add new navigation items, simply append to this array. Order determines display position.

---

## Data Flow Diagram

```
┌─────────────────┐
│   User Action   │
│ (click, resize) │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  SidebarContext     │
│  (state + actions)  │
└─────────┬───────────┘
          │
          ├──────────────────┐
          │                  │
          ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│   SidebarState   │  │ localStorage     │
│   (runtime)      │  │ (persistence)    │
└──────────────────┘  └──────────────────┘
          │
          ▼
┌──────────────────────────┐
│   Sidebar Component      │
│   (render based on state)│
└──────────────────────────┘
```

---

## Summary

- **4 core entities**: NavigationItem, SidebarState, SidebarContext, SidebarPreferences
- **2 derived states**: Active item, viewport type
- **4 invariants** enforcing business rules
- **All types exported** from single `sidebar.ts` file for consistency
- **Configuration-driven** navigation items for easy extensibility

**Phase 1 (Data Model): Complete**

Next: Component API contracts and quickstart guide.
