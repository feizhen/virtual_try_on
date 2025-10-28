# Research: Sidebar Navigation Implementation

**Feature**: Sidebar Navigation System
**Phase**: 0 - Research & Architecture Decisions
**Date**: 2025-10-26

## Overview

This document consolidates research findings for implementing a responsive sidebar navigation system in the virtual try-on application. The research addresses navigation patterns, state management approaches, responsive design strategies, and accessibility requirements.

## Research Areas

### 1. Navigation Patterns & Best Practices

**Question**: What are the industry-standard patterns for sidebar navigation in React applications?

**Research Findings**:

Common sidebar navigation patterns include:

1. **Persistent Sidebar (Desktop)**
   - Always visible on desktop viewports
   - Fixed position alongside main content
   - Common widths: 240-280px (expanded), 64-80px (collapsed icon-only)

2. **Overlay Sidebar (Mobile)**
   - Hidden by default, triggered by hamburger menu
   - Full-screen or partial overlay (with backdrop)
   - Auto-closes after navigation to prevent content obstruction

3. **Hybrid Approach** (Chosen for this project)
   - Desktop: Persistent side panel with collapse capability
   - Mobile: Overlay with backdrop
   - Breakpoint: 768px (standard tablet/mobile boundary)

**Decision**: Implement hybrid sidebar pattern

**Rationale**:
- Matches user expectations based on common web applications (Gmail, Notion, GitHub)
- Provides optimal experience for both device types
- Existing codebase already uses responsive patterns (History page grid layout)
- Aligns with spec requirements (FR-008, FR-009)

**Alternatives Considered**:
- **Top navigation bar**: Rejected - doesn't scale well with many navigation items, spec explicitly requests sidebar
- **Tab bar (mobile only)**: Rejected - inconsistent cross-platform experience
- **Drawer from edge**: Rejected - less discoverable than hamburger menu, harder to implement with keyboard navigation

---

### 2. State Management Approach

**Question**: How should sidebar state (open/closed, expanded/collapsed) be managed in React?

**Research Findings**:

State management options evaluated:

1. **Local Component State (useState)**
   - Pros: Simple, no external dependencies
   - Cons: State not shareable, complex prop drilling

2. **React Context API**
   - Pros: Global state, no prop drilling, already used in codebase
   - Cons: Re-renders entire context consumers (acceptable for this use case)

3. **URL/Query Parameters**
   - Pros: Shareable state, deep linking
   - Cons: Pollutes URL, unnecessary for UI-only state

4. **Global State Library (Redux/Zustand)**
   - Pros: Powerful, DevTools
   - Cons: Overkill for simple sidebar state, new dependency

**Decision**: Use React Context API

**Rationale**:
- Codebase already uses Context pattern extensively (`AuthContext`, `CreditContext`)
- Sidebar state needs to be accessible from multiple components (toggle button, navigation items, layout)
- Simple state model (only 2-3 boolean flags: `isOpen`, `isCollapsed`, `isMobile`)
- No performance concerns - sidebar state changes infrequently
- Consistent with existing architecture

**Implementation Details**:
```typescript
// Sidebar state shape
interface SidebarState {
  isOpen: boolean;          // Current open/closed state
  isCollapsed: boolean;     // Desktop only: expanded/collapsed
  isMobile: boolean;        // Computed from viewport width
  toggleSidebar: () => void;
  toggleCollapse: () => void;
  closeSidebar: () => void;
}
```

**Alternatives Considered**:
- **Component state**: Rejected - requires prop drilling through App → Layout → Sidebar → SidebarNav
- **URL parameters**: Rejected - sidebar state is UI-only, shouldn't be in URL
- **Redux**: Rejected - introduces unnecessary complexity and bundle size

---

### 3. Responsive Breakpoint Detection

**Question**: How to detect and respond to viewport changes for mobile/desktop sidebar behavior?

**Research Findings**:

Methods for responsive state management:

1. **CSS Media Queries Only**
   - Pros: Performant, declarative
   - Cons: Can't conditionally render components, JavaScript unaware of breakpoint

2. **`window.matchMedia` + React Hook**
   - Pros: JavaScript-aware breakpoints, enables conditional logic
   - Cons: Requires custom hook, event listener management

3. **Resize Listener**
   - Pros: Simple, direct window width check
   - Cons: High re-render frequency, performance concerns

**Decision**: Implement `useMediaQuery` hook with `window.matchMedia`

**Rationale**:
- Need JavaScript awareness for conditional rendering (different sidebar variants)
- `matchMedia` API is performant (native browser API)
- Hook can be reused for future responsive needs
- Handles server-side rendering gracefully (returns default value)
- Event listeners cleaned up automatically with React effect cleanup

**Implementation Pattern**:
```typescript
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 767px)');
```

**Alternatives Considered**:
- **CSS-only**: Rejected - need JavaScript control for overlay behavior, auto-close logic
- **Resize listener**: Rejected - excessive re-renders, performance impact
- **Third-party library (react-responsive)**: Rejected - avoids new dependency, simple to implement

---

### 4. State Persistence Strategy

**Question**: How to persist user's sidebar preference (expanded/collapsed) across sessions?

**Research Findings**:

Persistence options:

1. **LocalStorage**
   - Pros: Simple, synchronous, no backend needed
   - Cons: Per-domain limit (5-10MB), not synced across devices

2. **SessionStorage**
   - Pros: Simple, cleared on tab close
   - Cons: Lost on refresh (not suitable for preference)

3. **Backend User Profile**
   - Pros: Synced across devices, centralized
   - Cons: Requires API changes, network dependency, overkill for sidebar state

4. **IndexedDB**
   - Pros: Large storage limit
   - Cons: Async API, overkill for simple boolean

**Decision**: Use localStorage with custom hook

**Rationale**:
- Sidebar preference is UI-only, doesn't need backend sync
- localStorage is sufficient for boolean flag storage
- Synchronous API simplifies state initialization
- Spec assumes localStorage availability (Assumptions section mentions "local storage or user profile")
- Existing codebase uses localStorage for tokens (`client/src/utils/token.ts`)

**Implementation Pattern**:
```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
    }
  };

  return [storedValue, setValue];
}
```

**Alternatives Considered**:
- **Backend storage**: Rejected - introduces unnecessary API complexity, spec doesn't require cross-device sync
- **SessionStorage**: Rejected - preference should persist across browser sessions
- **Cookies**: Rejected - sent with every request (unnecessary overhead), same limitations as localStorage

---

### 5. Accessibility (A11y) Requirements

**Question**: How to meet WCAG 2.1 Level AA standards for sidebar navigation?

**Research Findings**:

WCAG 2.1 AA requirements for navigation:

1. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Logical tab order (toggle button → navigation items → user section)
   - Escape key closes sidebar
   - Enter/Space activates buttons and links

2. **Screen Reader Support**
   - Proper ARIA labels and roles
   - `role="navigation"` for sidebar
   - `aria-label` for toggle button
   - `aria-expanded` attribute reflecting state
   - `aria-current="page"` for active navigation item

3. **Focus Management**
   - Visible focus indicators
   - Focus trap within sidebar (when mobile overlay is open)
   - Return focus to toggle button when sidebar closes

4. **Color Contrast**
   - Text contrast ratio ≥4.5:1 (normal text)
   - Interactive elements contrast ≥3:1

**Decision**: Implement comprehensive A11y patterns

**Rationale**:
- Spec explicitly requires WCAG 2.1 Level AA compliance (SC-008)
- Accessibility improves usability for all users, not just those with disabilities
- Keyboard navigation enables power users
- Screen reader support is mandatory for public-facing applications

**Implementation Checklist**:
- [ ] Add `role="navigation"` and `aria-label="Main navigation"` to sidebar
- [ ] Toggle button has `aria-expanded={isOpen}` and `aria-label="Toggle sidebar"`
- [ ] Active nav item has `aria-current="page"`
- [ ] Implement focus trap for mobile overlay (using `focus-trap-react` or custom)
- [ ] Escape key handler closes sidebar
- [ ] Tab order is logical (top to bottom)
- [ ] All colors meet 4.5:1 contrast ratio
- [ ] Visible focus outlines (CSS `:focus-visible`)

**Alternatives Considered**:
- **Basic keyboard support only**: Rejected - doesn't meet WCAG AA requirements
- **Third-party A11y library**: Considered focus-trap-react, but decided to implement custom (avoids dependency, learning opportunity)

---

### 6. Animation & Performance

**Question**: How to implement smooth sidebar animations while meeting performance goals?

**Research Findings**:

Animation approaches:

1. **CSS Transitions**
   - Pros: GPU-accelerated, simple, performant
   - Cons: Limited control, can't interrupt mid-animation

2. **CSS Animations (@keyframes)**
   - Pros: More control than transitions, GPU-accelerated
   - Cons: More verbose, overkill for simple transitions

3. **JavaScript Animation Libraries (Framer Motion, React Spring)**
   - Pros: Powerful, interruptible, physics-based
   - Cons: Additional bundle size, complexity

4. **Manual JavaScript (requestAnimationFrame)**
   - Pros: Full control
   - Cons: Performance concerns, complexity

**Decision**: Use CSS transitions with `transform` property

**Rationale**:
- Spec requires animation under 300ms (easily achievable with CSS)
- `transform: translateX()` is GPU-accelerated (60fps even on low-end devices)
- No additional dependencies needed
- Simple to implement and maintain
- Existing codebase uses CSS transitions (`History.css`, `ModelPhotoCard.css`)

**Implementation Pattern**:
```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 250ms ease-in-out;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-desktop.collapsed {
  width: 64px;
  transition: width 250ms ease-in-out;
}
```

**Performance Optimizations**:
- Use `transform` instead of `left` (avoids layout reflow)
- Use `will-change: transform` for frequently animated elements
- Avoid animating `width` on desktop collapse (use `transform: scaleX()` if needed)
- Use `ease-in-out` timing for natural feel

**Alternatives Considered**:
- **Framer Motion**: Rejected - 26KB gzipped bundle size, overkill for simple slide animation
- **JavaScript animation**: Rejected - CSS is more performant and simpler

---

### 7. Navigation Item Configuration

**Question**: How should navigation items be defined and managed?

**Research Findings**:

Configuration approaches:

1. **Hardcoded in Component**
   - Pros: Simple, type-safe
   - Cons: Not flexible, requires code change to add items

2. **External Configuration File**
   - Pros: Easy to modify, centralized
   - Cons: Requires import, not type-safe without extra work

3. **Hook/Context with Configuration**
   - Pros: Centralized, type-safe, easy to extend
   - Cons: Slightly more complex

**Decision**: Use typed configuration array in separate file

**Rationale**:
- Balance between simplicity and maintainability
- Type-safe with TypeScript interfaces
- Easy to add/remove/reorder items
- Can include metadata (icon, label, route, badge count, etc.)
- Separation of concerns (config vs. rendering)

**Implementation Pattern**:
```typescript
// types/sidebar.ts
export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: IconType; // from react-icons
  order: number;
  badge?: number; // Optional notification badge
}

// config/navigation.ts
import { FiHome, FiShirt, FiClock, FiDollarSign } from 'react-icons/fi';

export const navigationItems: NavigationItem[] = [
  { id: 'home', label: '首页', route: '/', icon: FiHome, order: 1 },
  { id: 'tryon', label: '虚拟试衣', route: '/tryon', icon: FiShirt, order: 2 },
  { id: 'history', label: '历史记录', route: '/history', icon: FiClock, order: 3 },
  { id: 'credits', label: '积分余额', route: '/credits', icon: FiDollarSign, order: 4 },
];
```

**Alternatives Considered**:
- **Hardcoded JSX**: Rejected - not scalable, mixes data and presentation
- **Backend API**: Rejected - navigation items are static, no need for network request

---

## Technology Decisions Summary

| Decision Area | Chosen Approach | Key Rationale |
|---------------|-----------------|---------------|
| **Navigation Pattern** | Hybrid (desktop persistent + mobile overlay) | Matches user expectations, optimal per-device UX |
| **State Management** | React Context API | Existing pattern in codebase, sufficient for use case |
| **Responsive Detection** | `useMediaQuery` hook with `matchMedia` | JavaScript-aware, performant, reusable |
| **State Persistence** | localStorage with custom hook | Simple, synchronous, existing pattern in codebase |
| **Accessibility** | Full WCAG 2.1 AA compliance | Spec requirement, improves usability |
| **Animation** | CSS transitions with `transform` | GPU-accelerated, simple, meets performance goals |
| **Navigation Config** | Typed array in separate file | Type-safe, maintainable, extensible |

---

## Implementation Dependencies

### New Custom Hooks Needed

1. **`useSidebar`**: Access sidebar context (state + actions)
2. **`useMediaQuery`**: Detect viewport breakpoints
3. **`useLocalStorage`**: Persist sidebar preferences
4. **`useOnClickOutside`**: Close sidebar when clicking outside (mobile)
5. **`useFocusTrap`**: Trap focus within sidebar overlay (mobile a11y)

### External Dependencies (Already in Project)

- `react-icons`: Icon library (already used in existing components)
- `react-router-dom`: Routing and active route detection (already in use)
- `clsx` / `tailwind-merge`: Conditional class names (already in use)

### No New npm Packages Required

All functionality can be implemented with existing dependencies and custom hooks.

---

## Risk Mitigation

### Identified Risks

1. **SSR/Hydration Mismatch**
   - Risk: `useMediaQuery` returns different value on server vs. client
   - Mitigation: Initialize with safe default, update after mount

2. **LocalStorage Unavailability**
   - Risk: Private browsing mode, user disabled storage
   - Mitigation: Try-catch blocks, graceful fallback to session state

3. **Performance on Low-End Devices**
   - Risk: Sidebar animation stutters on old mobile devices
   - Mitigation: Use GPU-accelerated `transform`, test on low-end devices

4. **Focus Trap Complexity**
   - Risk: Custom focus trap implementation has bugs
   - Mitigation: Extensive keyboard navigation testing, consider `focus-trap-react` if custom fails

---

## Next Steps (Phase 1)

1. **Data Model**: Define TypeScript interfaces for all sidebar entities
2. **API Contracts**: Document component props, context shape, hook signatures
3. **Quickstart Guide**: Create integration guide for connecting sidebar to existing app

**Phase 0 Complete**: All research questions resolved, ready for design phase.
