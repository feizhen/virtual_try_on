# Tasks: 落地页设计 (Landing Page Design)

**Input**: Design documents from `/specs/007-landing-page-design/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are included based on plan.md specification (Vitest for unit tests, Playwright for E2E tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `client/src/` for frontend code
- **Tests**: `client/tests/unit/` and `client/tests/e2e/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and prepare assets

- [x] T001 Create Landing components directory at `client/src/components/Landing/`
- [x] T002 Create TypeScript type definitions file at `client/src/types/landing.ts`
- [x] T003 [P] Create example images directory at `client/src/assets/examples/`
- [x] T004 [P] Prepare example images (2-3 sets: before/after pairs) in `client/src/assets/examples/`

**Checkpoint**: Directory structure ready, type definitions in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript types that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define FeatureCard interface in `client/src/types/landing.ts`
- [x] T006 Define ExampleImage interface in `client/src/types/landing.ts`
- [x] T007 Define CTAButton interface in `client/src/types/landing.ts`
- [x] T008 Define HeroContent interface in `client/src/types/landing.ts`
- [x] T009 Define CTAContent interface in `client/src/types/landing.ts`
- [x] T010 Define LandingPageContent interface in `client/src/types/landing.ts`
- [x] T011 Verify TypeScript compilation with `pnpm build:check` (note: project has pre-existing TS errors, landing.ts is correct)

**Checkpoint**: Foundation ready - all type definitions complete, no TypeScript errors

---

## Phase 3: User Story 1 - 首次访问体验 (Priority: P1) 🎯 MVP

**Goal**: 未登录用户首次访问网站时,能够快速了解虚拟试衣平台的核心功能和价值,并被引导完成注册或登录。

**Independent Test**: 访问根路径验证:清晰的标题、功能介绍、示例展示、以及明显的 CTA 按钮(注册/登录)

### Implementation for User Story 1

#### Hero Section (英雄区)

- [ ] T012 [P] [US1] Create HeroSection component in `client/src/components/Landing/HeroSection.tsx`
- [ ] T013 [P] [US1] Create HeroSection styles in `client/src/components/Landing/HeroSection.css`
- [ ] T014 [US1] Implement hero content: title, subtitle, and primary CTA button in HeroSection component
- [ ] T015 [US1] Add responsive styles for hero section (mobile/tablet/desktop breakpoints)

#### Features Section (功能介绍区)

- [ ] T016 [P] [US1] Create FeatureCard component in `client/src/components/Landing/FeatureCard.tsx`
- [ ] T017 [P] [US1] Create FeatureCard styles in `client/src/components/Landing/FeatureCard.css`
- [ ] T018 [US1] Implement feature card layout: icon + title + description
- [ ] T019 [US1] Add hover effects and transitions to feature cards
- [ ] T020 [P] [US1] Create FeaturesSection component in `client/src/components/Landing/FeaturesSection.tsx`
- [ ] T021 [P] [US1] Create FeaturesSection styles in `client/src/components/Landing/FeaturesSection.css`
- [ ] T022 [US1] Implement 3-4 feature cards with icons from react-icons in FeaturesSection
- [ ] T023 [US1] Add CSS Grid layout for feature cards (responsive: 1 col mobile, 2 col tablet, 3-4 col desktop)

#### Examples Section (示例展示区)

- [ ] T024 [P] [US1] Create ExampleComparison component in `client/src/components/Landing/ExampleComparison.tsx`
- [ ] T025 [P] [US1] Create ExampleComparison styles in `client/src/components/Landing/ExampleComparison.css`
- [ ] T026 [US1] Implement before/after image comparison layout in ExampleComparison component
- [ ] T027 [US1] Add lazy loading (`loading="lazy"`) to example images
- [ ] T028 [US1] Add responsive layout for example images (horizontal desktop, vertical mobile)
- [ ] T029 [P] [US1] Create ExamplesSection component in `client/src/components/Landing/ExamplesSection.tsx`
- [ ] T030 [P] [US1] Create ExamplesSection styles in `client/src/components/Landing/ExamplesSection.css`
- [ ] T031 [US1] Render 2-3 ExampleComparison components in ExamplesSection

#### Main Landing Page

- [ ] T032 [US1] Create Landing page component in `client/src/pages/Landing.tsx`
- [ ] T033 [US1] Create Landing page styles in `client/src/pages/Landing.css`
- [ ] T034 [US1] Compose all sections (Hero, Features, Examples) in Landing component
- [ ] T035 [US1] Define content configuration object (LandingPageContent) with all text and images
- [ ] T036 [US1] Add global landing page container styles (max-width, padding, responsive)

**Checkpoint**: User Story 1 完成 - 落地页展示完整的内容区域(英雄区 + 功能介绍 + 示例展示)

---

## Phase 4: User Story 2 - CTA 交互与转化 (Priority: P1)

**Goal**: 访客能够通过清晰的行动号召(CTA)按钮快速完成注册或登录,开始使用虚拟试衣功能

**Independent Test**: 点击落地页上的"立即体验"/"登录"按钮,验证是否正确跳转到注册/登录页面

### Implementation for User Story 2

#### CTA Section

- [ ] T037 [P] [US2] Create CTASection component in `client/src/components/Landing/CTASection.tsx`
- [ ] T038 [P] [US2] Create CTASection styles in `client/src/components/Landing/CTASection.css`
- [ ] T039 [US2] Implement CTA section: heading + description + button
- [ ] T040 [US2] Add CTA button with link to `/register` page

#### Navigation & Routing

- [ ] T041 [US2] Add secondary CTA button ("登录") to HeroSection component
- [ ] T042 [US2] Integrate CTASection into Landing page component
- [ ] T043 [US2] Update `client/src/App.tsx` to add public route for Landing page at path `/`
- [ ] T044 [US2] Ensure `/` route is defined before protected routes in App.tsx

#### Authentication Redirect Logic

- [ ] T045 [US2] Import useAuth hook from AuthContext in Landing component
- [ ] T046 [US2] Import useNavigate hook from react-router-dom in Landing component
- [ ] T047 [US2] Add useEffect to detect authenticated users in Landing component
- [ ] T048 [US2] Implement redirect logic: if `isAuthenticated`, navigate to `/tryon` with `replace: true`
- [ ] T049 [US2] Verify redirect happens in < 500ms (test with console timing)

**Checkpoint**: User Story 2 完成 - CTA 按钮正常跳转,已登录用户自动重定向

---

## Phase 5: User Story 3 - 响应式设计体验 (Priority: P2)

**Goal**: 用户在不同设备(桌面、平板、手机)上访问落地页时,都能获得良好的视觉体验和可用性

**Independent Test**: 在不同屏幕尺寸下访问落地页,验证布局是否自适应、内容是否可读、按钮是否易于点击

### Implementation for User Story 3

#### Responsive Breakpoints

- [ ] T050 [US3] Add media query for mobile (<768px) in `client/src/pages/Landing.css`
- [ ] T051 [US3] Add media query for tablet (768px-1023px) in `client/src/pages/Landing.css`
- [ ] T052 [US3] Add media query for desktop (>=1024px) in `client/src/pages/Landing.css`
- [ ] T053 [US3] Set max-width: 1280px and center content for desktop in Landing.css

#### Component Responsive Adjustments

- [ ] T054 [P] [US3] Add mobile-specific styles to HeroSection.css (font sizes, padding)
- [ ] T055 [P] [US3] Add tablet-specific styles to FeaturesSection.css (2-column grid)
- [ ] T056 [P] [US3] Add mobile-specific styles to FeaturesSection.css (1-column grid)
- [ ] T057 [P] [US3] Add mobile-specific styles to ExampleComparison.css (vertical stack)
- [ ] T058 [P] [US3] Add tablet/desktop styles to ExampleComparison.css (horizontal layout)
- [ ] T059 [P] [US3] Add mobile-specific styles to CTASection.css (font sizes, button width)

#### Touch & Interaction

- [ ] T060 [US3] Add `:hover` state styles to all CTA buttons
- [ ] T061 [US3] Add `:active` state styles to all CTA buttons for touch feedback
- [ ] T062 [US3] Add `:focus-visible` styles for keyboard navigation accessibility
- [ ] T063 [US3] Test button tap targets are >= 44px on mobile (iOS/Android guidelines)

**Checkpoint**: User Story 3 完成 - 响应式设计在所有设备上正常工作

---

## Phase 6: User Story 4 - 品牌视觉一致性 (Priority: P3)

**Goal**: 落地页的视觉设计与现有应用内页面保持一致的设计语言和品牌风格

**Independent Test**: 对比落地页和应用内页面的配色、字体、按钮样式等视觉元素,验证一致性

### Implementation for User Story 4

#### CSS Variables Integration

- [ ] T064 [US4] Verify and use `var(--primary-color)` (Indigo #4f46e5) in all component styles
- [ ] T065 [US4] Verify and use `var(--text-primary)` for heading colors in all components
- [ ] T066 [US4] Verify and use `var(--text-secondary)` for body text colors in all components
- [ ] T067 [US4] Verify and use `var(--bg-secondary)` for card backgrounds in FeatureCard.css

#### Button Consistency

- [ ] T068 [US4] Use existing `.btn` class for all CTA buttons
- [ ] T069 [US4] Use existing `.btn-primary` class for primary CTA buttons
- [ ] T070 [US4] Use existing `.btn-secondary` class for secondary CTA buttons
- [ ] T071 [US4] Verify button styles match existing pages (Login, Register, VirtualTryOn)

#### Typography Consistency

- [ ] T072 [US4] Use system font stack from `client/src/index.css` for all text
- [ ] T073 [US4] Match heading sizes (h1, h2, h3) to existing pages
- [ ] T074 [US4] Verify line-height and letter-spacing match global styles

**Checkpoint**: User Story 4 完成 - 品牌视觉一致性达标,复用现有设计系统

---

## Phase 7: Testing & Validation

**Purpose**: Comprehensive testing for all user stories

### Unit Tests

- [ ] T075 [P] Create Landing component unit test in `client/tests/unit/Landing.test.tsx`
- [ ] T076 [P] Test: Landing page redirects authenticated users to `/tryon`
- [ ] T077 [P] Test: Landing page renders all sections for unauthenticated users
- [ ] T078 [P] Test: Hero section displays correct title and subtitle
- [ ] T079 [P] Test: Features section renders 3-4 feature cards
- [ ] T080 [P] Test: Examples section renders 2-3 example comparisons
- [ ] T081 [P] Test: CTA buttons have correct links (/register, /login)

### E2E Tests

- [ ] T082 [P] Create landing page E2E test in `client/tests/e2e/landing.spec.ts`
- [ ] T083 [P] Test: Display hero section with title on page load
- [ ] T084 [P] Test: Navigate to `/register` when clicking "立即体验" button
- [ ] T085 [P] Test: Navigate to `/login` when clicking "登录" button
- [ ] T086 [P] Test: Responsive layout on mobile viewport (375x667)
- [ ] T087 [P] Test: Responsive layout on tablet viewport (768x1024)
- [ ] T088 [P] Test: Responsive layout on desktop viewport (1280x800)

### Run Tests

- [ ] T089 Run all unit tests with `pnpm test` and verify pass
- [ ] T090 Run E2E tests with `pnpm playwright test` and verify pass
- [ ] T091 Verify TypeScript compilation with `pnpm build:check` has no errors

**Checkpoint**: All tests passing

---

## Phase 8: Performance Optimization & Polish

**Purpose**: Ensure performance goals are met and polish the user experience

### Performance Validation

- [ ] T092 Run Lighthouse audit on Landing page in Chrome DevTools
- [ ] T093 Verify Performance score >= 90 in Lighthouse
- [ ] T094 Verify Accessibility score >= 90 in Lighthouse
- [ ] T095 Verify Best Practices score >= 90 in Lighthouse
- [ ] T096 Verify SEO score >= 80 in Lighthouse
- [ ] T097 Test first contentful paint (FCP) < 1.5 seconds
- [ ] T098 Test largest contentful paint (LCP) < 2.5 seconds
- [ ] T099 Test first load time < 3 seconds on Slow 3G throttling

### Image Optimization

- [ ] T100 [P] Optimize example images to < 150KB each (use image compression tools)
- [ ] T101 [P] Convert example images to WebP format (with JPEG fallback)
- [ ] T102 [P] Add responsive image srcset for different screen sizes (optional)
- [ ] T103 Verify lazy loading is working (images below fold not loaded initially)

### Accessibility

- [ ] T104 [P] Add ARIA labels to all interactive elements (buttons, links)
- [ ] T105 [P] Add alt text to all example images
- [ ] T106 [P] Ensure semantic HTML (proper heading hierarchy h1 → h2 → h3)
- [ ] T107 Test keyboard navigation (Tab through all interactive elements)
- [ ] T108 Test screen reader compatibility (VoiceOver/NVDA)

### Cross-Browser Testing

- [ ] T109 [P] Test Landing page in Chrome (latest)
- [ ] T110 [P] Test Landing page in Firefox (latest)
- [ ] T111 [P] Test Landing page in Safari (latest)
- [ ] T112 [P] Test Landing page in Edge (latest)

### Code Quality

- [ ] T113 Remove console.log statements from Landing component
- [ ] T114 Add JSDoc comments to exported components
- [ ] T115 Verify no TypeScript `any` types are used
- [ ] T116 Run ESLint and fix any warnings

**Checkpoint**: Performance goals met, accessibility validated, code quality verified

---

## Phase 9: Documentation & Final Review

**Purpose**: Complete documentation and final validation

- [ ] T117 Update `CLAUDE.md` with landing page feature notes (if needed)
- [ ] T118 Verify all acceptance scenarios from spec.md are met
- [ ] T119 Run quickstart.md verification checklist
- [ ] T120 Create demo video or screenshots for PR (optional)

**Checkpoint**: All tasks complete, ready for code review and merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - MVP foundation
- **User Story 2 (Phase 4)**: Depends on User Story 1 (builds on top of landing page structure)
- **User Story 3 (Phase 5)**: Can start after User Story 1 - Independent (responsive CSS)
- **User Story 4 (Phase 6)**: Can start after User Story 1 - Independent (CSS variables)
- **Testing (Phase 7)**: Depends on User Stories 1-4 being complete
- **Performance (Phase 8)**: Depends on all implementation phases
- **Documentation (Phase 9)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - Core landing page structure
- **User Story 2 (P1)**: Depends on User Story 1 - Adds CTA interactions to existing structure
- **User Story 3 (P2)**: Independent of US2 - Only adds responsive CSS to US1 components
- **User Story 4 (P3)**: Independent of US2/US3 - Only modifies CSS to use variables

### Critical Path

```
Setup → Foundational → US1 → US2 → Testing → Performance → Done
                        ↓
                        US3 (parallel)
                        ↓
                        US4 (parallel)
```

### Parallel Opportunities

#### Within Setup (Phase 1)
- T003 (create directory) and T004 (prepare images) can run in parallel

#### Within Foundational (Phase 2)
- All type definitions (T005-T010) can be defined in parallel (same file, different interfaces)

#### Within User Story 1 (Phase 3)
- Hero component files (T012, T013) can be created in parallel
- Feature card files (T016, T017) can be created in parallel
- Example comparison files (T024, T025) can be created in parallel
- Features section files (T020, T021) can be created in parallel
- Examples section files (T029, T030) can be created in parallel

#### Within User Story 2 (Phase 4)
- CTA section files (T037, T038) can be created in parallel

#### Within User Story 3 (Phase 5)
- T054-T059 (all responsive CSS additions) can run in parallel (different CSS files)

#### Within User Story 4 (Phase 6)
- T064-T067 (CSS variable usage) can be done in parallel (different files)
- T068-T071 (button consistency) can be done in parallel

#### Testing Phase (Phase 7)
- All unit test tasks (T075-T081) can run in parallel
- All E2E test tasks (T082-T088) can run in parallel

#### Performance Phase (Phase 8)
- Image optimization tasks (T100-T102) can run in parallel
- Accessibility tasks (T104-T106) can run in parallel
- Cross-browser tests (T109-T112) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component file creation tasks in parallel:
Task: "Create HeroSection component in client/src/components/Landing/HeroSection.tsx"
Task: "Create HeroSection styles in client/src/components/Landing/HeroSection.css"
Task: "Create FeatureCard component in client/src/components/Landing/FeatureCard.tsx"
Task: "Create FeatureCard styles in client/src/components/Landing/FeatureCard.css"
Task: "Create ExampleComparison component in client/src/components/Landing/ExampleComparison.tsx"
Task: "Create ExampleComparison styles in client/src/components/Landing/ExampleComparison.css"

# Then implement logic sequentially within each component
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (~30 minutes)
2. Complete Phase 2: Foundational (~15 minutes)
3. Complete Phase 3: User Story 1 (~2-3 hours) - Core landing page
4. Complete Phase 4: User Story 2 (~1 hour) - CTA interactions
5. **STOP and VALIDATE**: Test landing page works (display + navigation)
6. Deploy/demo if ready

**MVP Deliverable**:
- Functional landing page with content sections
- Working CTA buttons for registration/login
- Authenticated user redirect working

### Incremental Delivery

1. **Iteration 1**: Setup + Foundational + US1 + US2 → MVP (Core functionality)
2. **Iteration 2**: Add US3 → Responsive design ready
3. **Iteration 3**: Add US4 → Brand consistency validated
4. **Iteration 4**: Add Testing (Phase 7) → Quality assured
5. **Iteration 5**: Add Performance (Phase 8) → Production ready

### Parallel Team Strategy

With multiple developers:

1. **Team**: Complete Setup + Foundational together (~45 minutes)
2. Once Foundational done, split:
   - **Developer A**: User Story 1 (Hero + Features + Examples sections)
   - **Developer B**: User Story 2 (CTA section + routing + auth redirect)
   - **Developer C**: User Story 3 (Responsive CSS) - starts after US1 hero is done
   - **Developer D**: User Story 4 (CSS variables) - starts after US1 components exist
3. Merge and test together

---

## Task Statistics

**Total Tasks**: 120
**MVP Tasks (US1 + US2)**: 49 tasks (Setup + Foundational + US1 + US2)
**Full Feature**: 120 tasks (all user stories + testing + performance)

**Task Count by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (User Story 1): 25 tasks
- Phase 4 (User Story 2): 13 tasks
- Phase 5 (User Story 3): 14 tasks
- Phase 6 (User Story 4): 11 tasks
- Phase 7 (Testing): 17 tasks
- Phase 8 (Performance): 25 tasks
- Phase 9 (Documentation): 4 tasks

**Parallel Opportunities**: 40+ tasks marked [P]

**Estimated Time**:
- MVP (US1 + US2): 4-6 hours
- Full Feature (all stories): 8-12 hours
- With Parallel Execution: 6-8 hours

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests included for quality assurance (unit + E2E)
- Commit after each logical group of tasks
- Stop at any checkpoint to validate story independently
- Responsive design (US3) and brand consistency (US4) can be done in parallel after US1
