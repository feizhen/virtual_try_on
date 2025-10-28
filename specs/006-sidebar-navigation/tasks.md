# Tasks: Sidebar Navigation System

**Input**: Design documents from `/specs/006-sidebar-navigation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sidebar-api.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification, so they are excluded from this task list. The feature will be validated through manual testing against acceptance criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- This is a web application with `client/` and `server/` directories
- Frontend code in `client/src/`
- This is a frontend-only feature, no backend changes required

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for sidebar components

- [X] T001 [P] Create type definitions file client/src/types/sidebar.ts with NavigationItem, SidebarState, SidebarContextType, SidebarPreferences interfaces
- [X] T002 [P] Create navigation configuration file client/src/config/navigation.ts with navigationItems array (4 items: Home, Virtual Try-On, History, Credits)
- [X] T003 [P] Create Sidebar component directory structure client/src/components/Sidebar/ with index.ts for public exports
- [X] T004 [P] Create Layout component directory client/src/components/Layout/ with index.ts for public exports
- [X] T005 [P] Add CSS variables to client/src/index.css for sidebar theming (widths, colors, transitions, z-index)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure (hooks and context) that MUST be complete before ANY user story UI component can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Implement useMediaQuery hook in client/src/hooks/useMediaQuery.ts (detects viewport breakpoints using window.matchMedia)
- [X] T007 [P] Implement useLocalStorage hook in client/src/hooks/useLocalStorage.ts (persists sidebar preferences)
- [X] T008 [P] Implement useOnClickOutside hook in client/src/hooks/useOnClickOutside.ts (closes sidebar on outside click)
- [X] T009 [P] Implement useFocusTrap hook in client/src/hooks/useFocusTrap.ts (traps focus for mobile overlay accessibility)
- [X] T010 Create SidebarContext in client/src/contexts/SidebarContext.tsx with SidebarProvider and useSidebar hook (manages state, calculates activeItemId, handles localStorage sync)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Sidebar Navigation (Priority: P1) 🎯 MVP

**Goal**: Users can access a sidebar menu that displays all available features, with toggle functionality and active item highlighting

**Independent Test**: Click sidebar toggle button, verify sidebar opens/closes with navigation items list, click a navigation item and verify routing works and item is highlighted

### Implementation for User Story 1

- [X] T011 [P] [US1] Create SidebarNav component in client/src/components/Sidebar/SidebarNav.tsx (renders navigation items list with active highlighting)
- [X] T012 [P] [US1] Create SidebarNav styles in client/src/components/Sidebar/SidebarNav.css (item layout, hover states, active indicator)
- [X] T013 [P] [US1] Create SidebarToggle component in client/src/components/Sidebar/SidebarToggle.tsx (toggle button with hamburger/X icon animation)
- [X] T014 [P] [US1] Create SidebarToggle styles in client/src/components/Sidebar/SidebarToggle.css (button layout, icon animations)
- [X] T015 [US1] Create Sidebar main component in client/src/components/Sidebar/Sidebar.tsx (container integrating SidebarNav, SidebarToggle, handles open/close animations)
- [X] T016 [US1] Create Sidebar styles in client/src/components/Sidebar/Sidebar.css (layout, positioning, slide animations, z-index)
- [X] T017 [US1] Update Sidebar index.ts in client/src/components/Sidebar/index.ts to export Sidebar, SidebarNav, SidebarToggle components
- [X] T018 [US1] Create AppLayout component in client/src/components/Layout/AppLayout.tsx (wraps page content with sidebar integration)
- [X] T019 [US1] Create AppLayout styles in client/src/components/Layout/AppLayout.css (flex layout for sidebar + main content)
- [X] T020 [US1] Update Layout index.ts in client/src/components/Layout/index.ts to export AppLayout component
- [X] T021 [US1] Integrate AppLayout into client/src/App.tsx (wrap protected routes with SidebarProvider and AppLayout)

**Checkpoint**: At this point, User Story 1 should be fully functional - sidebar opens/closes, displays navigation items, clicking items navigates and highlights correctly

---

## Phase 4: User Story 2 - Virtual Try-On Integration (Priority: P2)

**Goal**: Users can navigate to virtual try-on feature through the sidebar, with proper routing and active state

**Independent Test**: Open sidebar, click "Virtual Try-On" navigation item, verify navigation to /tryon page and that virtual try-on functionality works as expected

### Implementation for User Story 2

- [X] T022 [US2] Verify /tryon route exists in client/src/App.tsx and is wrapped by AppLayout (should already be done in T021)
- [X] T023 [US2] Verify Virtual Try-On navigation item in client/src/config/navigation.ts has correct route '/tryon' and icon
- [X] T024 [US2] Test Virtual Try-On page navigation from sidebar and verify existing VirtualTryOn page functionality is unaffected
- [X] T025 [US2] Add ARIA label "虚拟试衣" to Virtual Try-On navigation item for screen reader accessibility

**Checkpoint**: Virtual Try-On is accessible via sidebar, active state shows correctly when on /tryon page

---

## Phase 5: User Story 4 - Responsive Mobile Sidebar (Priority: P2)

**Goal**: Mobile users can access sidebar through hamburger menu as full-screen overlay that auto-closes after navigation

**Independent Test**: Open app on mobile device (<768px width), tap hamburger menu, verify sidebar opens as full-screen overlay, tap navigation item, verify sidebar auto-closes

### Implementation for User Story 4

- [X] T026 [P] [US4] Add mobile-specific styles to client/src/components/Sidebar/Sidebar.css (full-screen overlay, transform animations)
- [X] T027 [P] [US4] Create backdrop overlay styles in client/src/components/Layout/AppLayout.css (semi-transparent overlay for mobile)
- [X] T028 [US4] Update Sidebar component in client/src/components/Sidebar/Sidebar.tsx to render backdrop on mobile and implement click-outside-to-close behavior using useOnClickOutside hook
- [X] T029 [US4] Update Sidebar component to implement focus trap on mobile using useFocusTrap hook
- [X] T030 [US4] Add Escape key handler in client/src/components/Sidebar/Sidebar.tsx to close sidebar on Escape key press
- [X] T031 [US4] Verify SidebarContext auto-closes sidebar on navigation for mobile (already implemented in T010, just verify)
- [X] T032 [US4] Update SidebarToggle component in client/src/components/Sidebar/SidebarToggle.tsx to show hamburger icon on mobile
- [X] T033 [US4] Test mobile sidebar on device widths <768px (portrait and landscape orientations)

**Checkpoint**: Mobile sidebar works as overlay, auto-closes after navigation, backdrop click closes sidebar, focus is trapped, Escape key closes sidebar

---

## Phase 6: User Story 3 - Collapsible Sidebar on Desktop (Priority: P3)

**Goal**: Desktop users can collapse sidebar to icon-only view with hover tooltips, preference persists across sessions

**Independent Test**: On desktop (≥768px width), click collapse button, verify sidebar shrinks to show only icons, hover over icon to see tooltip, reload page, verify collapsed state persists

### Implementation for User Story 3

- [X] T034 [P] [US3] Add collapsed state styles to client/src/components/Sidebar/Sidebar.css (64px width, icon-only layout, smooth width transition)
- [X] T035 [P] [US3] Add collapsed state styles to client/src/components/Sidebar/SidebarNav.css (hide labels, center icons, show tooltips on hover)
- [X] T036 [P] [US3] Create collapse button in client/src/components/Sidebar/Sidebar.tsx (toggle between expanded/collapsed, desktop only)
- [X] T037 [US3] Add tooltip component or ARIA labels to client/src/components/Sidebar/SidebarNav.tsx for icon-only mode (show full label on hover)
- [X] T038 [US3] Verify SidebarContext persists collapsed preference to localStorage (already implemented in T010, just verify)
- [X] T039 [US3] Update AppLayout component in client/src/components/Layout/AppLayout.tsx to adjust main content margin based on collapsed state (240px vs 64px)
- [X] T040 [US3] Test collapsed sidebar on desktop widths ≥768px (expanded/collapsed toggle, tooltips, preference persistence)

**Checkpoint**: Desktop sidebar can collapse to icon-only view, tooltips appear on hover, preference persists after page reload

---

## Phase 7: User Info Display

**Goal**: Display user account information (avatar, name) in sidebar

**Independent Test**: Open sidebar, verify user avatar and name appear at bottom of sidebar (collapsed: avatar only, expanded: avatar + name)

### Implementation for User Info

- [X] T041 [P] Create SidebarUser component in client/src/components/Sidebar/SidebarUser.tsx (fetches user from AuthContext, displays avatar + name)
- [X] T042 [P] Create SidebarUser styles in client/src/components/Sidebar/SidebarUser.css (user info layout, collapsed vs expanded states)
- [X] T043 Update Sidebar component in client/src/components/Sidebar/Sidebar.tsx to include SidebarUser component at bottom
- [X] T044 Export SidebarUser from client/src/components/Sidebar/index.ts
- [X] T045 Add ARIA labels to SidebarUser component for accessibility (avatar alt text with user name)

**Checkpoint**: User info displays correctly in sidebar footer, adapts to collapsed/expanded states

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, accessibility, and final validation

- [X] T046 [P] Add keyboard navigation support: verify Tab key navigates through all sidebar items in logical order
- [X] T047 [P] Add keyboard navigation support: verify Enter/Space keys activate buttons and links
- [X] T048 [P] Verify all ARIA attributes are correct: role="navigation", aria-label, aria-expanded, aria-current="page"
- [X] T049 [P] Verify all interactive elements have visible focus indicators (CSS :focus-visible)
- [X] T050 [P] Verify color contrast meets WCAG 2.1 Level AA (4.5:1 for text, 3:1 for interactive elements)
- [X] T051 [P] Test sidebar animations: verify open/close completes in <300ms, feels smooth on low-end devices
- [X] T052 [P] Test sidebar with rapid clicks: verify navigation debounces to prevent multiple simultaneous page loads
- [X] T053 [P] Test sidebar with deep-linked URLs: verify sidebar initializes with correct active item based on current route
- [X] T054 [P] Test sidebar edge case: extremely narrow screen (<320px), verify sidebar adapts gracefully
- [X] T055 [P] Test SSR/hydration: verify useMediaQuery doesn't cause hydration mismatch
- [X] T056 [P] Test localStorage unavailable: verify sidebar works with session state fallback (private browsing mode)
- [X] T057 Review and update CLAUDE.md in repository root if needed (document sidebar navigation feature)
- [X] T058 Run through quickstart.md validation steps to ensure integration guide is accurate
- [X] T059 Final manual QA pass: test all user stories on multiple browsers (Chrome, Firefox, Safari) and devices (mobile, tablet, desktop)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T005) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (T006-T010)
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (needs sidebar to exist)
- **User Story 4 (Phase 5)**: Depends on User Story 1 completion (needs sidebar to exist)
- **User Story 3 (Phase 6)**: Depends on User Story 1 completion (needs sidebar to exist)
- **User Info (Phase 7)**: Depends on User Story 1 completion (needs sidebar to exist)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - THIS IS THE MVP
- **User Story 2 (P2)**: Depends on US1 (needs basic sidebar to integrate Virtual Try-On)
- **User Story 4 (P2)**: Depends on US1 (needs basic sidebar to add mobile overlay behavior)
- **User Story 3 (P3)**: Depends on US1 (needs basic sidebar to add collapse functionality)

### Within Each User Story

- Tasks marked [P] can run in parallel (different files)
- Component + corresponding CSS can be created in parallel
- Components must be created before being integrated into parent components
- Styles must be created before final visual testing

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks T001-T005 can run in parallel
- **Phase 2 (Foundational)**: All hooks T006-T009 can run in parallel, T010 must wait for hooks
- **Phase 3 (US1)**: T011-T014 can run in parallel, T015-T016 must wait, T017-T020 can run in parallel after, T021 integrates everything
- **Phase 4 (US2)**: All tasks T022-T025 can run in parallel (verification tasks)
- **Phase 5 (US4)**: T026-T027 can run in parallel, then T028-T033 sequentially
- **Phase 6 (US3)**: T034-T036 can run in parallel, T037-T040 sequentially
- **Phase 7 (User Info)**: T041-T042 can run in parallel, then T043-T045
- **Phase 8 (Polish)**: Most tasks T046-T056 can run in parallel, T057-T059 sequentially

---

## Parallel Example: User Story 1 Core Components

```bash
# Launch navigation and toggle components together:
Task: "Create SidebarNav component in client/src/components/Sidebar/SidebarNav.tsx"
Task: "Create SidebarNav styles in client/src/components/Sidebar/SidebarNav.css"
Task: "Create SidebarToggle component in client/src/components/Sidebar/SidebarToggle.tsx"
Task: "Create SidebarToggle styles in client/src/components/Sidebar/SidebarToggle.css"

# Then integrate into main Sidebar component:
Task: "Create Sidebar main component in client/src/components/Sidebar/Sidebar.tsx"
Task: "Create Sidebar styles in client/src/components/Sidebar/Sidebar.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T011-T021)
4. **STOP and VALIDATE**: Test basic sidebar navigation independently
5. Demo the MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T010)
2. Add User Story 1 → Test independently → Demo (MVP with basic navigation) (T011-T021)
3. Add User Story 2 → Test independently → Demo (Virtual Try-On integration) (T022-T025)
4. Add User Story 4 → Test independently → Demo (Mobile overlay) (T026-T033)
5. Add User Story 3 → Test independently → Demo (Desktop collapse) (T034-T040)
6. Add User Info Display → Test → Demo (User account info) (T041-T045)
7. Polish and validate → Final QA → Production ready (T046-T059)
8. Each story adds value without breaking previous stories

### Recommended Execution Order

Given the priorities and dependencies:

1. **Sprint 1 (MVP)**: T001-T021 (Setup + Foundational + US1)
2. **Sprint 2**: T022-T033 (US2 Virtual Try-On integration + US4 Mobile responsive)
3. **Sprint 3**: T034-T045 (US3 Desktop collapse + User Info)
4. **Sprint 4**: T046-T059 (Polish, accessibility, final QA)

---

## Notes

- [P] tasks = different files, no dependencies, can be done in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story should be independently completable and testable
- This is a frontend-only feature, no backend changes required
- All components use TypeScript for type safety
- All styles use custom CSS (not Tailwind utilities)
- Accessibility is first-class: ARIA attributes, keyboard navigation, focus management
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Existing pages (Home, VirtualTryOn, History) do not need modification, only wrapping with AppLayout
