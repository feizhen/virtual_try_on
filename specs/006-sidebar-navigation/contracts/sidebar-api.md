# API Contracts: Sidebar Navigation Components

**Feature**: Sidebar Navigation System
**Phase**: 1 - Design & Contracts
**Date**: 2025-10-26

## Overview

This document defines the public API contracts for all sidebar navigation components, hooks, and contexts. These contracts serve as the specification for implementation and testing.

---

## Component APIs

### 1. Sidebar (Main Container)

**File**: `client/src/components/Sidebar/Sidebar.tsx`

**Props**:
```typescript
interface SidebarProps {
  /** Optional additional CSS class names */
  className?: string;
}
```

**Usage**:
```tsx
import { Sidebar } from '@/components/Sidebar';

function App() {
  return (
    <SidebarProvider>
      <Sidebar />
      <main>{/* Page content */}</main>
    </SidebarProvider>
  );
}
```

**Behavior**:
- Renders navigation panel with conditional styling based on state
- Desktop: Fixed side panel (240px expanded, 64px collapsed)
- Mobile: Full-screen overlay with backdrop
- Manages own transition animations
- Automatically closes on navigation (mobile only)

**Accessibility**:
- `role="navigation"`
- `aria-label="Main navigation"`
- Keyboard accessible (Tab, Escape)

---

### 2. SidebarNav (Navigation List)

**File**: `client/src/components/Sidebar/SidebarNav.tsx`

**Props**:
```typescript
interface SidebarNavProps {
  /** Navigation items to render */
  items: NavigationItem[];

  /** Current active item ID */
  activeItemId: string | null;

  /** Whether sidebar is in collapsed state (icon-only) */
  collapsed?: boolean;
}
```

**Usage**:
```tsx
import { SidebarNav } from '@/components/Sidebar';
import { navigationItems } from '@/config/navigation';

<SidebarNav
  items={navigationItems}
  activeItemId={activeItemId}
  collapsed={isCollapsed}
/>
```

**Behavior**:
- Renders list of navigation items sorted by `order` property
- Highlights active item based on `activeItemId`
- Collapsed mode shows only icons (with tooltips on hover)
- Clicking item navigates using React Router `navigate()`

**Accessibility**:
- Each item is a `<NavLink>` with proper ARIA attributes
- Active item has `aria-current="page"`
- Tooltips for icons have `aria-label`

---

### 3. SidebarToggle (Toggle Button)

**File**: `client/src/components/Sidebar/SidebarToggle.tsx`

**Props**:
```typescript
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
```

**Usage**:
```tsx
import { SidebarToggle } from '@/components/Sidebar';

<SidebarToggle
  isOpen={state.isOpen}
  onToggle={toggleSidebar}
  isMobile={state.isMobile}
/>
```

**Behavior**:
- Desktop: Renders at top of sidebar (when open) or floating button (when closed)
- Mobile: Hamburger menu icon, fixed position in app header
- Animated icon transition (hamburger ↔ X)
- Keyboard accessible (Enter/Space)

**Accessibility**:
- `role="button"`
- `aria-expanded={isOpen}`
- `aria-label="Toggle sidebar menu"`

---

### 4. SidebarUser (User Info Display)

**File**: `client/src/components/Sidebar/SidebarUser.tsx`

**Props**:
```typescript
interface SidebarUserProps {
  /** Whether sidebar is in collapsed state */
  collapsed?: boolean;
}
```

**Usage**:
```tsx
import { SidebarUser } from '@/components/Sidebar';

<SidebarUser collapsed={isCollapsed} />
```

**Behavior**:
- Fetches user data from `AuthContext`
- Displays avatar + name (expanded) or avatar only (collapsed)
- Positioned at bottom of sidebar
- Optional: Dropdown menu on click (logout, settings) - future enhancement

**Accessibility**:
- Avatar has `alt` text with user name
- Semantic HTML for user info

---

### 5. AppLayout (Page Wrapper)

**File**: `client/src/components/Layout/AppLayout.tsx`

**Props**:
```typescript
interface AppLayoutProps {
  /** Page content to render */
  children: React.ReactNode;

  /** Optional: Whether to show sidebar (default: true) */
  showSidebar?: boolean;
}
```

**Usage**:
```tsx
import { AppLayout } from '@/components/Layout';

function App() {
  return (
    <SidebarProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* ... other routes */}
        </Routes>
      </AppLayout>
    </SidebarProvider>
  );
}
```

**Behavior**:
- Wraps page content with sidebar layout
- Handles responsive layout (sidebar + main content area)
- Manages content margin based on sidebar state (desktop)
- Renders backdrop overlay when sidebar is open (mobile)

---

## Context APIs

### SidebarProvider & SidebarContext

**File**: `client/src/contexts/SidebarContext.tsx`

**Context Type**:
```typescript
interface SidebarContextType {
  state: SidebarState;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapse: () => void;
  activeItemId: string | null;
}
```

**Provider Props**:
```typescript
interface SidebarProviderProps {
  children: React.ReactNode;
}
```

**Usage**:
```tsx
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

// At app root
function App() {
  return (
    <SidebarProvider>
      <YourApp />
    </SidebarProvider>
  );
}

// In any descendant component
function MyComponent() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <button onClick={toggleSidebar}>
      {state.isOpen ? 'Close' : 'Open'} Sidebar
    </button>
  );
}
```

**Behavior**:
- Manages sidebar state in React state
- Syncs `collapsed` preference with localStorage
- Calculates `isMobile` from viewport width
- Calculates `activeItemId` from current route
- Auto-closes sidebar on navigation (mobile)

---

## Hook APIs

### 1. useSidebar

**File**: `client/src/contexts/SidebarContext.tsx` (exported from context)

**Signature**:
```typescript
function useSidebar(): SidebarContextType;
```

**Returns**: `SidebarContextType` (see above)

**Usage**:
```tsx
const { state, toggleSidebar, closeSidebar } = useSidebar();
```

**Error**: Throws if used outside `<SidebarProvider>`

---

### 2. useMediaQuery

**File**: `client/src/hooks/useMediaQuery.ts`

**Signature**:
```typescript
function useMediaQuery(query: string): boolean;
```

**Parameters**:
- `query`: CSS media query string (e.g., `"(max-width: 767px)"`)

**Returns**: `boolean` - Whether media query currently matches

**Usage**:
```tsx
const isMobile = useMediaQuery('(max-width: 767px)');
const isDesktop = useMediaQuery('(min-width: 768px)');
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
```

**Behavior**:
- Listens to `window.matchMedia` change events
- Re-renders component when match state changes
- Returns `false` during SSR (no window object)
- Cleans up event listeners on unmount

---

### 3. useLocalStorage

**File**: `client/src/hooks/useLocalStorage.ts`

**Signature**:
```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void];
```

**Parameters**:
- `key`: localStorage key
- `initialValue`: Default value if key doesn't exist

**Returns**: Tuple `[storedValue, setValue]` (similar to `useState`)

**Usage**:
```tsx
const [preferences, setPreferences] = useLocalStorage<SidebarPreferences>(
  'sidebar-preferences',
  { collapsed: false, updatedAt: new Date().toISOString(), version: 1 }
);

setPreferences({ ...preferences, collapsed: true });
```

**Behavior**:
- Reads from localStorage on mount
- Writes to localStorage on value change
- Handles JSON serialization/deserialization
- Gracefully handles localStorage errors (private browsing)

---

### 4. useOnClickOutside

**File**: `client/src/hooks/useOnClickOutside.ts`

**Signature**:
```typescript
function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void;
```

**Parameters**:
- `ref`: React ref to the element
- `handler`: Callback when click occurs outside element

**Usage**:
```tsx
const sidebarRef = useRef<HTMLDivElement>(null);

useOnClickOutside(sidebarRef, () => {
  if (isMobile && isOpen) {
    closeSidebar();
  }
});

return <div ref={sidebarRef}>{/* Sidebar content */}</div>;
```

**Behavior**:
- Listens to `mousedown` and `touchstart` events on document
- Calls handler if event target is outside ref element
- Cleans up listeners on unmount
- Ignores events when ref is null

---

### 5. useFocusTrap

**File**: `client/src/hooks/useFocusTrap.ts`

**Signature**:
```typescript
function useFocusTrap(
  enabled: boolean,
  containerRef: React.RefObject<HTMLElement>
): void;
```

**Parameters**:
- `enabled`: Whether focus trap is active
- `containerRef`: Ref to container element to trap focus within

**Usage**:
```tsx
const sidebarRef = useRef<HTMLDivElement>(null);

useFocusTrap(isMobile && isOpen, sidebarRef);

return <div ref={sidebarRef}>{/* Sidebar content */}</div>;
```

**Behavior**:
- When `enabled=true`, traps Tab focus within container
- Prevents focus from leaving container
- Returns focus to trigger element when trap is disabled
- Handles Shift+Tab (reverse direction)

---

## Configuration APIs

### navigationItems

**File**: `client/src/config/navigation.ts`

**Type**: `NavigationItem[]`

**Export**:
```typescript
export const navigationItems: NavigationItem[] = [ /* ... */ ];
```

**Usage**:
```tsx
import { navigationItems } from '@/config/navigation';

<SidebarNav items={navigationItems} activeItemId={activeItemId} />
```

**Extensibility**: To add new navigation items, append to this array. Items are automatically sorted by `order` property.

---

## Event Handling

### Sidebar Events

| Event | Trigger | Handler | Side Effects |
|-------|---------|---------|--------------|
| **Toggle Click** | User clicks toggle button | `toggleSidebar()` | Opens/closes sidebar, updates state |
| **Collapse Click** | User clicks collapse button (desktop) | `toggleCollapse()` | Toggles collapsed state, saves to localStorage |
| **Navigation Click** | User clicks nav item | React Router navigation | Mobile: auto-closes sidebar |
| **Outside Click** | User clicks backdrop (mobile) | `closeSidebar()` | Closes sidebar |
| **Escape Key** | User presses Escape | `closeSidebar()` | Closes sidebar |
| **Resize** | Window resized across breakpoint | `isMobile` state updated | Sidebar state reset if mode changes |

---

## CSS Class Conventions

Components use BEM-style class naming:

```css
/* Sidebar container */
.sidebar { /* Base styles */ }
.sidebar--open { /* When open */ }
.sidebar--collapsed { /* When collapsed */ }
.sidebar--mobile { /* Mobile mode */ }

/* Navigation */
.sidebar-nav { /* Nav list container */ }
.sidebar-nav__item { /* Individual nav item */ }
.sidebar-nav__item--active { /* Active item */ }
.sidebar-nav__icon { /* Item icon */ }
.sidebar-nav__label { /* Item label */ }

/* Toggle */
.sidebar-toggle { /* Toggle button */ }
.sidebar-toggle__icon { /* Icon (hamburger/X) */ }

/* User section */
.sidebar-user { /* User info container */ }
.sidebar-user__avatar { /* User avatar */ }
.sidebar-user__name { /* User name */ }
```

---

## Error Handling

### Invalid Configuration

```typescript
// Missing required navigation item properties
const invalidItem = {
  id: 'test',
  // Missing label, route, icon
};
// Result: TypeScript compile error (type checking prevents this)
```

### Context Outside Provider

```typescript
// Using useSidebar() outside <SidebarProvider>
function BadComponent() {
  const sidebar = useSidebar(); // Throws error
}
// Error message: "useSidebar must be used within SidebarProvider"
```

### LocalStorage Failure

```typescript
// Private browsing mode or storage quota exceeded
setPreferences({ collapsed: true });
// Gracefully falls back to session state, logs warning to console
```

---

## Testing Contracts

### Component Tests

Each component must have:
- **Render test**: Component renders without crashing
- **Props test**: All props are respected
- **Accessibility test**: ARIA attributes and keyboard navigation
- **State test**: State changes trigger expected UI updates

### Hook Tests

Each hook must have:
- **Return value test**: Hook returns expected type/shape
- **State update test**: Hook updates state correctly
- **Cleanup test**: Event listeners removed on unmount
- **Edge case test**: Handles invalid inputs gracefully

### Integration Tests

End-to-end tests cover:
- **Navigation flow**: Click nav item → route changes → item highlighted
- **Responsive behavior**: Resize window → sidebar mode changes
- **Persistence**: Reload page → collapsed state restored
- **Accessibility**: Tab through sidebar → all items reachable

---

## Summary

- **5 Component APIs**: Sidebar, SidebarNav, SidebarToggle, SidebarUser, AppLayout
- **1 Context API**: SidebarProvider/SidebarContext
- **5 Hook APIs**: useSidebar, useMediaQuery, useLocalStorage, useOnClickOutside, useFocusTrap
- **1 Configuration API**: navigationItems
- **Comprehensive event handling** with clear side effects
- **Type-safe contracts** enforced by TypeScript
- **Accessibility-first** design with ARIA and keyboard support

**Phase 1 (Contracts): Complete**

Next: Quickstart guide for integration.
