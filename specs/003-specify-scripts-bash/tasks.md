# Tasks: 登录页面设计系统优化

**Input**: Design documents from `/specs/003-specify-scripts-bash/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: 此功能为纯CSS样式优化，采用视觉验证而非自动化测试。验证通过浏览器开发工具和人工对照设计系统文档完成。

**Organization**: 任务按用户故事分组，确保每个故事可独立实现和验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（US1, US2, US3, US4）
- 包含准确的文件路径

## Path Conventions
- **Web app**: `client/src/` (前端单页应用)
- **Design docs**: `documents/design/` (设计系统规范)

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和开发环境验证

- [X] T001 验证开发环境配置：Node.js ≥18.0.0, pnpm已安装，client目录下依赖已安装
- [X] T002 启动开发服务器（pnpm dev）并在浏览器中打开登录页面 http://localhost:5173/login
- [X] T003 [P] 使用浏览器开发工具（Chrome DevTools）打开检查元素，准备验证CSS样式
- [X] T004 [P] 阅读设计系统文档 documents/design/virtual_design_system.md，熟悉颜色、排版、组件规范

**Checkpoint**: 开发环境就绪，设计系统文档已理解

---

## Phase 2: Foundational (全局CSS变量对齐)

**Purpose**: 更新全局CSS变量以匹配设计系统，这是所有用户故事的基础

**⚠️ CRITICAL**: 此阶段必须完成后，才能开始用户故事的样式调整

- [X] T005 备份当前的 client/src/index.css 文件（以便回滚）
- [X] T006 更新 client/src/index.css 中 :root 的主色变量：--primary-color 从 #4f46e5 改为 #1F2937
- [X] T007 [P] 更新 client/src/index.css 中 :root 的悬停色变量：--primary-hover 从 #4338ca 改为 #111827
- [X] T008 [P] 新增 client/src/index.css 中 :root 变量：--main-dark: #1F2937
- [X] T009 [P] 新增 client/src/index.css 中 :root 变量：--hover-dark: #111827
- [X] T010 [P] 新增 client/src/index.css 中 :root 变量：--text-tertiary: #9CA3AF
- [X] T011 [P] 更新 client/src/index.css 中 :root 的主要文本颜色：--text-primary 从 #111827 改为 #1F2937
- [X] T012 验证全局颜色变量更新后的视觉效果：刷新登录页面，观察颜色变化

**Checkpoint**: 全局CSS变量已对齐设计系统，用户故事样式调整可以开始

---

## Phase 3: User Story 1 - 现代化视觉体验登录 (Priority: P1) 🎯 MVP

**Goal**: 实现符合现代极简主义设计风格的登录页面布局，包括浅灰背景、白色卡片、正确的圆角和阴影

**Independent Test**:
- 打开 http://localhost:5173/login
- 验证背景色为 #F9FAFB（浅灰）
- 验证卡片背景为白色，圆角12px，有轻微阴影
- 验证表单垂直居中，元素间距符合8点网格

### Implementation for User Story 1

- [ ] T013 [P] [US1] 更新 client/src/pages/Auth.css 中 .auth-container 背景：移除渐变，改为 background: var(--background)
- [ ] T014 [P] [US1] 更新 client/src/pages/Auth.css 中 .auth-card 内边距：从 2.5rem 改为 24px
- [ ] T015 [P] [US1] 更新 client/src/pages/Auth.css 中 .auth-card 圆角：从 1rem 改为 12px
- [ ] T016 [P] [US1] 更新 client/src/pages/Auth.css 中 .auth-card 阴影：改为 box-shadow: 0 1px 3px rgba(0,0,0,0.1)
- [ ] T017 [P] [US1] 新增 client/src/pages/Auth.css 中 .auth-card 边框：border: 1px solid #F3F4F6
- [ ] T018 [US1] 使用浏览器开发工具验证卡片样式：背景 #FFFFFF，圆角 12px，阴影正确，边框 1px solid #F3F4F6
- [ ] T019 [US1] 使用浏览器开发工具验证容器背景：background-color 为 #F9FAFB（使用颜色选择器对比）
- [ ] T020 [US1] 测试响应式布局（桌面端 ≥1024px）：验证卡片最大宽度 450px，垂直居中
- [ ] T021 [US1] 测试响应式布局（移动端 <640px）：验证卡片宽度100%，保持可读性

**Checkpoint**: User Story 1 完成 - 页面布局和容器样式符合设计系统

---

## Phase 4: User Story 2 - 符合规范的表单输入体验 (Priority: P1)

**Goal**: 实现符合设计系统规范的输入框、标签和按钮样式，包括正确的尺寸、圆角和交互状态

**Independent Test**:
- 验证输入框高度 48px，圆角 6px，边框 1px solid #E5E7EB
- 点击输入框，验证聚焦边框变为 2px solid #1F2937
- 验证按钮高度 48px，背景 #1F2937，悬停时变为 #111827

### Implementation for User Story 2

- [ ] T022 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input 高度：新增 height: 48px
- [ ] T023 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input 圆角：从 0.5rem 改为 6px
- [ ] T024 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input 内边距：从 0.75rem 1rem 改为 12px 16px
- [ ] T025 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input 字号：从 1rem 改为 15px
- [ ] T026 [P] [US2] 新增 client/src/pages/Auth.css 中 .form-group input::placeholder 颜色：color: var(--text-tertiary)
- [ ] T027 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input 过渡：改为 transition: border-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1)
- [ ] T028 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input:focus 边框：改为 border: 2px solid var(--main-dark)
- [ ] T029 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input:focus 阴影：改为 box-shadow: none
- [ ] T030 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group input:disabled 不透明度：新增 opacity: 0.5
- [ ] T031 [P] [US2] 更新 client/src/pages/Auth.css 中 .form-group label 字号：新增 font-size: 14px
- [ ] T032 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary 背景：改为 background-color: var(--main-dark)
- [ ] T033 [P] [US2] 新增 client/src/pages/Auth.css 中 .btn-primary 高度：height: 48px
- [ ] T034 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary 内边距：从 0.75rem 1.5rem 改为 12px 24px
- [ ] T035 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary 圆角：从 0.5rem 改为 6px
- [ ] T036 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary 字号：从 1rem 改为 15px
- [ ] T037 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary 过渡：改为 transition: background-color 150ms cubic-bezier(0.4, 0.0, 0.2, 1)
- [ ] T038 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary:hover:not(:disabled) 背景：改为 background-color: var(--hover-dark)
- [ ] T039 [P] [US2] 移除 client/src/pages/Auth.css 中 .btn-primary:hover:not(:disabled) 的 transform 和 box-shadow 属性
- [ ] T040 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary:disabled 背景：改为 background-color: #9CA3AF
- [ ] T041 [P] [US2] 更新 client/src/pages/Auth.css 中 .btn-primary:disabled 不透明度：新增 opacity: 0.5
- [ ] T042 [US2] 使用浏览器开发工具验证输入框样式：高度 48px，圆角 6px，边框颜色正确
- [ ] T043 [US2] 测试输入框聚焦状态：点击输入框，验证边框变为 2px solid #1F2937
- [ ] T044 [US2] 测试输入框过渡动画：聚焦和失焦时观察过渡是否流畅（200ms）
- [ ] T045 [US2] 使用浏览器开发工具验证按钮样式：高度 48px，圆角 6px，背景 #1F2937
- [ ] T046 [US2] 测试按钮悬停状态：鼠标悬停，验证背景变为 #111827，过渡 150ms
- [ ] T047 [US2] 测试按钮禁用状态：模拟加载中状态，验证背景 #9CA3AF，不透明度 50%

**Checkpoint**: User Story 2 完成 - 表单输入组件样式符合设计系统

---

## Phase 5: User Story 3 - 清晰的错误提示和加载状态 (Priority: P2)

**Goal**: 实现符合设计系统的错误消息样式，使用正确的功能性颜色和圆角

**Independent Test**:
- 输入错误的登录凭据
- 验证错误消息文字颜色为 #EF4444，背景淡红色
- 验证错误消息圆角 6px，左侧有 4px 红色边框

### Implementation for User Story 3

- [ ] T048 [P] [US3] 更新 client/src/pages/Auth.css 中 .error-message 内边距：从 0.75rem 1rem 改为 12px 16px
- [ ] T049 [P] [US3] 更新 client/src/pages/Auth.css 中 .error-message 圆角：从 0.5rem 改为 6px
- [ ] T050 [P] [US3] 更新 client/src/pages/Auth.css 中 .error-message 字号：从 0.875rem 改为 14px
- [ ] T051 [P] [US3] 更新 client/src/pages/Auth.css 中 .error-message 下边距：从 1rem 改为 16px
- [ ] T052 [US3] 验证错误消息颜色：color 为 #EF4444（var(--error-color)），background-color 为 #fee2e2
- [ ] T053 [US3] 测试错误消息显示：输入错误凭据触发错误，验证样式正确、可读性良好
- [ ] T054 [US3] 测试错误消息长文本：验证长错误消息自动换行，不超出卡片边界

**Checkpoint**: User Story 3 完成 - 错误提示样式符合设计系统

---

## Phase 6: User Story 4 - 一致的排版和文本样式 (Priority: P2)

**Goal**: 实现符合设计系统的排版规范，包括标题、副标题、正文和链接的字体、字号、字重和颜色

**Independent Test**:
- 验证页面标题字号 32px，字重 700，行高 40px，颜色 #1F2937
- 验证副标题字号 14px，颜色 #6B7280
- 验证链接颜色 #3B82F6，悬停时变为 #2563EB 并显示下划线

### Implementation for User Story 4

- [ ] T055 [P] [US4] 更新 client/src/pages/Auth.css 中 .auth-title 字号：从 2rem 改为 32px
- [ ] T056 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-title 行高：line-height: 40px
- [ ] T057 [P] [US4] 更新 client/src/pages/Auth.css 中 .auth-title 下边距：从 0.5rem 改为 8px
- [ ] T058 [P] [US4] 更新 client/src/pages/Auth.css 中 .auth-subtitle 下边距：从 2rem 改为 24px
- [ ] T059 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-subtitle 字号：font-size: 14px
- [ ] T060 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-subtitle 行高：line-height: 20px
- [ ] T061 [P] [US4] 更新 client/src/pages/Auth.css 中 .auth-form 间距：gap 保持 24px（1.5rem = 24px，已符合）
- [ ] T062 [P] [US4] 更新 client/src/pages/Auth.css 中 .form-group 间距：gap 保持 8px（0.5rem = 8px，已符合）
- [ ] T063 [P] [US4] 更新 client/src/pages/Auth.css 中 .auth-footer 上边距：从 1.5rem 改为 24px
- [ ] T064 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-footer 字号：font-size: 14px
- [ ] T065 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-footer a 颜色：color: #3B82F6
- [ ] T066 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-footer a 过渡：transition: color 150ms ease-out
- [ ] T067 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-footer a:hover 颜色：color: #2563EB
- [ ] T068 [P] [US4] 新增 client/src/pages/Auth.css 中 .auth-footer a:hover 下划线：text-decoration: underline
- [ ] T069 [US4] 使用浏览器开发工具验证标题排版：字号 32px，字重 700，行高 40px，颜色 #1F2937
- [ ] T070 [US4] 使用浏览器开发工具验证副标题排版：字号 14px，颜色 #6B7280
- [ ] T071 [US4] 使用浏览器开发工具验证链接样式：颜色 #3B82F6
- [ ] T072 [US4] 测试链接悬停状态：鼠标悬停，验证颜色变为 #2563EB 并显示下划线

**Checkpoint**: User Story 4 完成 - 排版和文本样式符合设计系统

---

## Phase 7: 响应式设计优化 (移动端适配)

**Purpose**: 确保登录页面在移动端正确显示，符合设计系统的响应式断点规范

- [X] T073 [P] 更新 client/src/pages/Auth.css 中移动端媒体查询（@media (max-width: 640px)）的 .auth-card 内边距：从 2rem 改为 20px
- [X] T074 [P] 更新 client/src/pages/Auth.css 中移动端媒体查询的 .auth-title 字号：从 1.75rem 改为 28px
- [X] T075 [P] 新增 client/src/pages/Auth.css 中移动端媒体查询的 .auth-title 行高：line-height: 36px
- [X] T076 使用Chrome DevTools响应式设计模式测试移动端（375px宽度）：验证卡片内边距 20px，标题 28px
- [X] T077 使用Chrome DevTools响应式设计模式测试移动端（320px宽度）：验证无横向滚动，内容可读
- [X] T078 使用Chrome DevTools响应式设计模式测试平板端（768px宽度）：验证布局正常
- [X] T079 测试移动端表单交互：验证输入框、按钮的最小触摸区域 44px × 44px

**Checkpoint**: 响应式设计完成 - 移动端、平板端、桌面端均正确显示

---

## Phase 8: 跨浏览器验证和最终校验

**Purpose**: 在多个浏览器中验证样式一致性，确保100%符合设计系统规范

- [ ] T080 [P] 在Chrome浏览器中全面验证：颜色、尺寸、间距、交互状态
- [ ] T081 [P] 在Firefox浏览器中验证：对比Chrome，检查渲染差异
- [ ] T082 [P] 在Safari浏览器中验证（如果在macOS上）：对比Chrome，检查WebKit特定行为
- [ ] T083 [P] 在Edge浏览器中验证：对比Chrome，确认Chromium一致性
- [ ] T084 测试键盘导航：使用Tab键在表单元素间切换，验证聚焦指示器清晰可见
- [ ] T085 测试无JavaScript场景：禁用浏览器JavaScript，验证CSS样式仍然生效
- [ ] T086 对照设计系统文档逐项验证：颜色（9项）、排版（5项）、组件（3项）、间距（4项）、动效（2项）、阴影（1项）、响应式（3项）
- [ ] T087 使用浏览器颜色选择器精确对比：验证所有颜色与设计系统规范100%匹配
- [ ] T088 使用浏览器测量工具（或截图对比）：验证尺寸和间距精确匹配设计系统
- [ ] T089 创建前后对比截图：保存优化前和优化后的登录页面截图，用于设计团队审查

**Checkpoint**: 跨浏览器验证完成 - 样式在所有目标浏览器中一致

---

## Phase 9: Polish & 文档更新

**Purpose**: 完善文档，确保代码质量和可维护性

- [ ] T090 [P] 检查CSS代码格式：确保缩进一致、无多余空格、属性顺序规范
- [ ] T091 [P] 移除未使用的CSS规则：检查Auth.css中是否有未使用的样式（如.divider, .btn-google等）
- [ ] T092 [P] 添加CSS注释：为关键样式块添加注释（如响应式断点、设计系统对齐说明）
- [ ] T093 [P] 验证CSS变量使用一致性：确保所有颜色都使用CSS变量而非硬编码
- [ ] T094 更新 client/CLAUDE.md（如需要）：记录CSS架构变更、设计系统对齐策略
- [X] T095 提交代码到git：使用清晰的提交消息，如"feat: 对齐登录页面到设计系统规范"
- [ ] T096 运行 quickstart.md 中的验证清单：完成所有视觉验证项（颜色、尺寸、间距、交互）
- [ ] T097 请求设计团队审查：分享前后对比截图和实际页面链接，确认100%符合设计系统

**Checkpoint**: 所有工作完成 - 登录页面完全对齐设计系统规范

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-6)**: 所有依赖Foundational完成
  - US1、US2可并行（不同CSS规则）
  - US3、US4可并行（不同CSS规则）
  - 或按优先级顺序：US1 → US2 → US3 → US4
- **响应式设计 (Phase 7)**: 建议在US1-4完成后进行（确保桌面端样式正确）
- **跨浏览器验证 (Phase 8)**: 依赖Phase 3-7完成
- **Polish (Phase 9)**: 依赖所有前序阶段完成

### User Story Dependencies

- **User Story 1 (P1) - 现代化视觉体验**: 可在Foundational后开始 - 无其他故事依赖
- **User Story 2 (P1) - 表单输入体验**: 可在Foundational后开始 - 独立于US1（不同CSS规则）
- **User Story 3 (P2) - 错误提示和加载**: 可在Foundational后开始 - 独立于US1/US2
- **User Story 4 (P2) - 排版和文本**: 可在Foundational后开始 - 独立于US1/US2/US3

### Within Each User Story

由于是纯CSS变更，同一用户故事内的任务高度并行：
- 大部分任务标记为[P]，可同时修改不同的CSS规则
- 实现任务完成后，运行验证任务（依赖实现完成）
- 每个故事的最后一个任务是Checkpoint验证

### Parallel Opportunities

- **Setup Phase**: T003和T004可并行
- **Foundational Phase**: T007-T011（新增CSS变量）可并行
- **User Story 1**: T013-T017（不同CSS属性）可并行
- **User Story 2**: T022-T041（大量CSS属性更新）可并行
- **User Story 3**: T048-T051（错误消息CSS属性）可并行
- **User Story 4**: T055-T068（排版CSS属性）可并行
- **响应式Phase**: T073-T075可并行
- **跨浏览器验证**: T080-T083（不同浏览器）可并行
- **Polish**: T090-T094（文档和代码清理）可并行

**跨用户故事并行**: US1, US2, US3, US4 可由不同开发者同时进行（修改同一文件的不同CSS规则）

---

## Parallel Example: User Story 2 (表单输入体验)

由于修改不同的CSS属性，可大规模并行：

```bash
# 同时更新所有输入框CSS属性（T022-T030）:
Task: "更新 .form-group input 高度"
Task: "更新 .form-group input 圆角"
Task: "更新 .form-group input 内边距"
Task: "更新 .form-group input 字号"
Task: "新增 .form-group input::placeholder 颜色"
Task: "更新 .form-group input 过渡"
Task: "更新 .form-group input:focus 边框"
Task: "更新 .form-group input:focus 阴影"
Task: "更新 .form-group input:disabled 不透明度"

# 同时更新所有按钮CSS属性（T032-T041）:
Task: "更新 .btn-primary 背景"
Task: "新增 .btn-primary 高度"
Task: "更新 .btn-primary 内边距"
Task: "更新 .btn-primary 圆角"
Task: "更新 .btn-primary 字号"
Task: "更新 .btn-primary 过渡"
Task: "更新 .btn-primary:hover:not(:disabled) 背景"
Task: "移除 .btn-primary:hover:not(:disabled) transform和box-shadow"
Task: "更新 .btn-primary:disabled 背景"
Task: "更新 .btn-primary:disabled 不透明度"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (全局CSS变量对齐)
3. Complete Phase 3: User Story 1 (现代化视觉体验)
4. Complete Phase 4: User Story 2 (表单输入体验)
5. **STOP and VALIDATE**: 测试US1和US2，验证核心视觉改进
6. 可选：部署到测试环境供设计团队审查

**MVP Rationale**: US1和US2都是P1优先级，涵盖了登录页面的核心视觉元素（布局、输入框、按钮），足以展示设计系统对齐效果。

### Incremental Delivery

1. Setup + Foundational → 全局颜色对齐完成
2. Add US1 → 布局和容器优化完成 → 验证
3. Add US2 → 表单组件优化完成 → 验证（MVP!）
4. Add US3 → 错误提示优化完成 → 验证
5. Add US4 → 排版优化完成 → 验证
6. Add 响应式 → 移动端适配完成 → 验证
7. Add 跨浏览器 → 全浏览器兼容完成 → 最终交付

### Parallel Team Strategy

由于是纯CSS更新，单个开发者可高效完成。如果有多人：

1. Team完成Setup + Foundational一起
2. 一旦Foundational完成：
   - Developer A: User Story 1 + User Story 3
   - Developer B: User Story 2 + User Story 4
3. 合并后一起完成响应式、跨浏览器验证和Polish

---

## Task Summary

**Total Tasks**: 97个任务

**Task Breakdown by Phase**:
- Phase 1 (Setup): 4个任务
- Phase 2 (Foundational): 8个任务
- Phase 3 (US1 - 现代化视觉体验): 9个任务
- Phase 4 (US2 - 表单输入体验): 26个任务
- Phase 5 (US3 - 错误提示和加载): 7个任务
- Phase 6 (US4 - 排版和文本): 18个任务
- Phase 7 (响应式设计): 7个任务
- Phase 8 (跨浏览器验证): 10个任务
- Phase 9 (Polish): 8个任务

**Parallel Opportunities**: 约60%的任务标记为[P]，可并行执行

**Estimated Effort**:
- MVP (Phase 1-4): 1-2小时
- 完整实现 (Phase 1-9): 2-4小时

**Independent Test Criteria**:
- US1: 打开登录页面，验证布局、背景、卡片样式
- US2: 与表单交互，验证输入框和按钮样式及状态
- US3: 触发错误，验证错误消息样式
- US4: 检查文本元素，验证排版规范

---

## Notes

- [P] 任务 = 不同CSS规则，无依赖，可并行
- [Story] 标签映射任务到用户故事，便于追溯
- 每个用户故事可独立完成和验证
- 所有验证通过浏览器开发工具和人工对照设计系统文档
- 无自动化测试，采用视觉验证
- 提交代码前确保通过所有Checkpoint验证
- 避免：模糊任务、同一CSS规则冲突、跨故事依赖破坏独立性
- 参考 quickstart.md 获取详细的实现步骤和代码示例
