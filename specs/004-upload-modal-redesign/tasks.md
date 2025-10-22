# Tasks: 虚拟试衣模态与服装上传选择界面

**Input**: Design documents from `/specs/004-upload-modal-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: 测试为可选项,已在研究文档中明确为"推荐但不强制TDD"策略。本任务列表包含关键路径的测试任务。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `client/src/` (React + TypeScript)
- **Backend**: `server/src/` (NestJS - 已存在,仅需调整)
- **Tests**: `client/tests/` (Vitest), `server/test/` (Jest)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和基础结构(复用现有项目,仅添加新依赖)

- [ ] T001 [P] 安装前端测试依赖(Vitest, React Testing Library, Playwright)到 client/package.json
- [ ] T002 [P] 创建前端组件目录结构 client/src/components/VirtualTryOn/
- [ ] T003 [P] 创建API层文件 client/src/api/{garment.ts,model.ts,tryon.ts,scene.ts}
- [ ] T004 [P] 创建类型定义文件 client/src/types/{garment.ts,model.ts,tryon.ts,scene.ts}
- [ ] T005 [P] 创建工具函数文件 client/src/utils/{fileUpload.ts,imageValidation.ts}
- [ ] T006 创建TryOnContext上下文 client/src/contexts/TryOnContext.tsx
- [ ] T007 配置Vitest测试环境 client/vitest.config.ts
- [ ] T008 配置Playwright E2E测试 client/playwright.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础设施,必须在所有用户故事之前完成

**⚠️ CRITICAL**: 在此阶段完成之前,无法开始任何用户故事的工作

- [ ] T009 实现文件上传工具函数 client/src/utils/fileUpload.ts (包含进度追踪、错误处理)
- [ ] T010 [P] 实现图片验证工具 client/src/utils/imageValidation.ts (格式、大小验证)
- [ ] T011 [P] 封装 Garment API client/src/api/garment.ts (映射到现有 /outfit-change/clothing 接口)
- [ ] T012 [P] 封装 Model API client/src/api/model.ts (映射到现有 /outfit-change/models 接口)
- [ ] T013 [P] 封装 TryOn API client/src/api/tryon.ts (映射到现有 /outfit-change/tryon 接口)
- [ ] T014 [P] 封装 Scene API client/src/api/scene.ts (新增,需后端支持或临时使用garment接口)
- [ ] T015 定义 Garment 类型 client/src/types/garment.ts
- [ ] T016 [P] 定义 Model 类型 client/src/types/model.ts
- [ ] T017 [P] 定义 TryOn 类型 client/src/types/tryon.ts
- [ ] T018 [P] 定义 Scene 类型 client/src/types/scene.ts
- [ ] T019 实现TryOnContext状态管理 client/src/contexts/TryOnContext.tsx (选中模特、服装、场景状态)
- [ ] T020 创建共享样式文件 client/src/components/VirtualTryOn/styles.css (网格布局、红色边框选中等)

**Checkpoint**: 基础设施就绪 - 用户故事实现可以并行开始

---

## Phase 3: User Story 1 - 选择虚拟试衣模特 (Priority: P1) 🎯 MVP

**Goal**: 用户能够查看预设模特列表,点击选择模特,预览区域实时更新,选中模特显示红色边框高亮

**Independent Test**: 打开页面→查看模特选择器→点击模特缩略图→确认红色边框高亮→预览区域更新为大图

### Implementation for User Story 1

- [ ] T021 [P] [US1] 创建ModelSelector组件 client/src/components/VirtualTryOn/ModelSelector.tsx
- [ ] T022 [P] [US1] 创建PreviewArea组件 client/src/components/VirtualTryOn/PreviewArea.tsx
- [ ] T023 [US1] 实现ModelSelector:模特列表获取和渲染(调用modelApi.list())
- [ ] T024 [US1] 实现ModelSelector:点击模特缩略图选中逻辑(更新TryOnContext.selectedModel)
- [ ] T025 [US1] 实现ModelSelector:选中状态视觉反馈(红色边框 .selected class)
- [ ] T026 [US1] 实现PreviewArea:监听selectedModel变化并更新大图显示
- [ ] T027 [US1] 集成ModelSelector和PreviewArea到VirtualTryOnPage client/src/pages/VirtualTryOnPage.tsx
- [ ] T028 [US1] 添加路由配置 client/src/App.tsx (添加 /virtual-tryon 路由)
- [ ] T029 [US1] 添加样式:模特选择器布局和红色边框 client/src/components/VirtualTryOn/styles.css

### Tests for User Story 1 (Optional)

- [ ] T030 [P] [US1] 单元测试:ModelSelector组件渲染测试 client/tests/components/VirtualTryOn/ModelSelector.test.tsx
- [ ] T031 [P] [US1] 单元测试:点击模特切换状态测试 client/tests/components/VirtualTryOn/ModelSelector.test.tsx
- [ ] T032 [US1] E2E测试:完整模特选择流程 client/tests/e2e/model-selection.spec.ts

**Checkpoint**: 用户故事1完全可用 - 可以独立测试模特选择功能

---

## Phase 4: User Story 2 - 上传服装到资源库 (Priority: P1)

**Goal**: 用户能够点击虚线框上传区域,选择服装图片,显示上传进度,上传成功后服装以3列网格卡片展示

**Independent Test**: 展开"衣服"区域→点击上传区域→选择图片文件→查看上传进度→确认服装卡片出现在网格中

### Implementation for User Story 2

- [ ] T033 [P] [US2] 创建UploadZone组件 client/src/components/VirtualTryOn/UploadZone.tsx
- [ ] T034 [P] [US2] 创建GarmentCard组件 client/src/components/VirtualTryOn/GarmentCard.tsx
- [ ] T035 [P] [US2] 创建GarmentPanel组件 client/src/components/VirtualTryOn/GarmentPanel.tsx
- [ ] T036 [US2] 实现UploadZone:虚线框样式和点击触发文件选择
- [ ] T037 [US2] 实现UploadZone:文件验证(调用imageValidation工具,检查格式和大小)
- [ ] T038 [US2] 实现UploadZone:上传逻辑(调用fileUpload工具,显示进度条)
- [ ] T039 [US2] 实现GarmentCard:服装卡片展示(图片、名称、库存状态、数量)
- [ ] T040 [US2] 实现GarmentPanel:服装列表获取(调用garmentApi.list())
- [ ] T041 [US2] 实现GarmentPanel:3列网格布局(CSS Grid, grid-template-columns: repeat(3, 1fr))
- [ ] T042 [US2] 实现GarmentPanel:上传成功后更新服装列表
- [ ] T043 [US2] 集成GarmentPanel到VirtualTryOnPage
- [ ] T044 [US2] 添加样式:虚线框、网格布局、卡片样式 client/src/components/VirtualTryOn/styles.css
- [ ] T045 [US2] 错误处理:文件格式不支持提示
- [ ] T046 [US2] 错误处理:文件大小超限提示
- [ ] T047 [US2] 错误处理:网络中断重试提示

### Tests for User Story 2 (Optional)

- [ ] T048 [P] [US2] 单元测试:UploadZone文件验证逻辑 client/tests/components/VirtualTryOn/UploadZone.test.tsx
- [ ] T049 [P] [US2] 单元测试:GarmentPanel网格布局渲染 client/tests/components/VirtualTryOn/GarmentPanel.test.tsx
- [ ] T050 [US2] 集成测试:完整上传流程(mock API) client/tests/integration/garment-upload.test.tsx
- [ ] T051 [US2] E2E测试:上传服装并查看卡片 client/tests/e2e/garment-upload.spec.ts

**Checkpoint**: 用户故事2完全可用 - 可以独立测试服装上传和展示功能

---

## Phase 5: User Story 3 - 选择服装进行虚拟试衣 (Priority: P1)

**Goal**: 用户能够点击服装卡片选中(红色边框),系统调用AI试衣API,预览区域更新显示试衣效果

**Independent Test**: 选择模特→点击服装卡片→确认红色边框→等待AI生成→预览区域显示试衣效果

### Implementation for User Story 3

- [ ] T052 [US3] 实现GarmentCard:点击选中逻辑(更新TryOnContext.selectedGarment)
- [ ] T053 [US3] 实现GarmentCard:选中状态视觉反馈(红色边框 .selected class)
- [ ] T054 [US3] 实现TryOnContext:监听selectedModel和selectedGarment变化,触发试衣API调用
- [ ] T055 [US3] 实现TryOnContext:调用tryonApi.createSession()创建试衣会话
- [ ] T056 [US3] 实现TryOnContext:轮询tryonApi.getSession()查询试衣状态(PENDING→PROCESSING→COMPLETED)
- [ ] T057 [US3] 实现PreviewArea:显示试衣进度状态(加载动画、"生成中..."提示)
- [ ] T058 [US3] 实现PreviewArea:试衣完成后更新为结果图片
- [ ] T059 [US3] 优化:防抖处理(避免快速切换服装导致多次API调用)
- [ ] T060 [US3] 错误处理:试衣失败提示(FAILED状态显示errorMessage)
- [ ] T061 [US3] 错误处理:未选择模特时选服装的提示

### Tests for User Story 3 (Optional)

- [ ] T062 [P] [US3] 单元测试:GarmentCard选中状态测试 client/tests/components/VirtualTryOn/GarmentCard.test.tsx
- [ ] T063 [P] [US3] 单元测试:TryOnContext试衣逻辑测试(mock API) client/tests/contexts/TryOnContext.test.tsx
- [ ] T064 [US3] 集成测试:模特+服装→试衣效果流程 client/tests/integration/virtual-tryon.test.tsx
- [ ] T065 [US3] E2E测试:完整试衣流程(选择模特→上传服装→选择服装→查看效果) client/tests/e2e/virtual-tryon.spec.ts

**Checkpoint**: 用户故事3完全可用 - MVP核心功能(模特选择+服装上传+虚拟试衣)全部就绪

---

## Phase 6: User Story 4 - 折叠区域交互管理 (Priority: P2)

**Goal**: 用户能够点击"+"或"-"按钮控制"衣服"和"场景"区域的展开/收起,优化界面空间使用

**Independent Test**: 点击"衣服"区域的"-"按钮→确认内容展开→再次点击确认收起→按钮图标切换

### Implementation for User Story 4

- [ ] T066 [US4] 实现GarmentPanel:折叠状态管理(useState: isExpanded)
- [ ] T067 [US4] 实现GarmentPanel:点击标题栏切换展开/收起
- [ ] T068 [US4] 实现GarmentPanel:展开/收起动画(CSS transition, max-height)
- [ ] T069 [US4] 实现GarmentPanel:按钮图标切换("+"/"−"根据isExpanded状态)
- [ ] T070 [US4] 创建ScenePanel组件 client/src/components/VirtualTryOn/ScenePanel.tsx (复用GarmentPanel逻辑)
- [ ] T071 [US4] 实现ScenePanel:折叠功能(同GarmentPanel)
- [ ] T072 [US4] 集成ScenePanel到VirtualTryOnPage
- [ ] T073 [US4] 添加样式:折叠动画、按钮样式 client/src/components/VirtualTryOn/styles.css
- [ ] T074 [US4] 优化:折叠动画性能(<300ms, requestAnimationFrame)

### Tests for User Story 4 (Optional)

- [ ] T075 [P] [US4] 单元测试:GarmentPanel折叠交互测试 client/tests/components/VirtualTryOn/GarmentPanel.test.tsx
- [ ] T076 [US4] E2E测试:折叠区域交互流程 client/tests/e2e/panel-collapse.spec.ts

**Checkpoint**: 用户故事4完全可用 - UI交互优化完成

---

## Phase 7: User Story 5 - 管理场景背景库 (Priority: P3)

**Goal**: 用户能够上传场景图片,点击场景卡片更换预览区域的背景,增强试衣效果展示

**Independent Test**: 展开"场景"区域→上传场景图片→点击场景卡片→确认预览区域背景更新

### Implementation for User Story 5

- [ ] T077 [P] [US5] 创建SceneCard组件 client/src/components/VirtualTryOn/SceneCard.tsx
- [ ] T078 [US5] 实现ScenePanel:场景列表获取(调用sceneApi.list()或复用garment接口)
- [ ] T079 [US5] 实现ScenePanel:场景上传功能(复用UploadZone逻辑)
- [ ] T080 [US5] 实现SceneCard:点击选中逻辑(更新TryOnContext.selectedScene)
- [ ] T081 [US5] 实现SceneCard:选中状态视觉反馈(红色边框)
- [ ] T082 [US5] 实现PreviewArea:场景背景图叠加(CSS background-image或<img>层)
- [ ] T083 [US5] 实现TryOnContext:试衣API调用时传递sceneId参数
- [ ] T084 [US5] 优化:场景图预加载(避免切换时闪烁)

### Backend Support for User Story 5 (仅需少量调整)

- [ ] T085 [US5] (可选)后端:复用ClothingItem表存储场景(添加type字段区分)或创建Scene表
- [ ] T086 [US5] (可选)后端:outfit-change.controller添加场景上传路由(复用uploadClothing逻辑)

### Tests for User Story 5 (Optional)

- [ ] T087 [P] [US5] 单元测试:SceneCard选中状态测试 client/tests/components/VirtualTryOn/SceneCard.test.tsx
- [ ] T088 [US5] E2E测试:场景上传和切换流程 client/tests/e2e/scene-selection.spec.ts

**Checkpoint**: 用户故事5完全可用 - 所有功能完整实现

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 改进影响多个用户故事的跨功能需求

- [ ] T089 [P] 性能优化:服装/场景列表虚拟滚动(≥20件无性能下降)
- [ ] T090 [P] 性能优化:图片懒加载(Intersection Observer)
- [ ] T091 [P] 可访问性:键盘导航支持(Tab键、Enter选择)
- [ ] T092 [P] 可访问性:ARIA标签添加
- [ ] T093 代码清理:移除console.log和注释代码
- [ ] T094 代码重构:提取公共组件(如SelectableCard通用卡片组件)
- [ ] T095 [P] 文档:更新README.md添加功能说明
- [ ] T096 [P] 文档:添加组件使用示例到quickstart.md
- [ ] T097 运行E2E测试套件验证所有用户故事
- [ ] T098 验证quickstart.md中的开发工作流

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-7)**: 全部依赖Foundational完成
  - User Story 1-3 (P1): MVP核心功能,建议顺序执行
  - User Story 4 (P2): 可与P1并行开发(不同组件文件)
  - User Story 5 (P3): 可最后实现或并行开发
- **Polish (Phase 8)**: 依赖所需用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 在Foundational后可开始 - 无其他故事依赖
- **User Story 2 (P1)**: 在Foundational后可开始 - 独立于US1但通常顺序实现
- **User Story 3 (P1)**: 依赖US1(需要选中模特)和US2(需要服装库) - 集成点
- **User Story 4 (P2)**: 在Foundational后可开始 - 独立功能,可并行
- **User Story 5 (P3)**: 依赖US3(试衣功能)完成 - 增强功能

### Within Each User Story

- 组件创建(标记[P])可并行
- API集成依赖组件创建完成
- 样式和错误处理通常在功能实现后
- 测试(如包含)在实现完成后验证

### Parallel Opportunities

- **Setup阶段**: T001-T008全部可并行(不同文件)
- **Foundational阶段**: T010-T014(API层)、T015-T018(类型定义)可并行
- **User Story 1**: T021-T022(组件创建)可并行
- **User Story 2**: T033-T035(组件创建)、T048-T049(测试)可并行
- **User Story 3**: T062-T063(测试)可并行
- **User Story 4**: T075测试可独立并行
- **Polish阶段**: T089-T092、T095-T096可并行

---

## Parallel Example: User Story 2

```bash
# 并行创建所有组件:
Task: "创建UploadZone组件 client/src/components/VirtualTryOn/UploadZone.tsx"
Task: "创建GarmentCard组件 client/src/components/VirtualTryOn/GarmentCard.tsx"
Task: "创建GarmentPanel组件 client/src/components/VirtualTryOn/GarmentPanel.tsx"

# 并行运行测试(如包含):
Task: "单元测试:UploadZone文件验证逻辑"
Task: "单元测试:GarmentPanel网格布局渲染"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. 完成 Phase 1: Setup (T001-T008)
2. 完成 Phase 2: Foundational (T009-T020) **关键阻塞点**
3. 完成 Phase 3: User Story 1 (T021-T032)
4. **STOP and VALIDATE**: 独立测试模特选择功能
5. 完成 Phase 4: User Story 2 (T033-T051)
6. **STOP and VALIDATE**: 独立测试服装上传功能
7. 完成 Phase 5: User Story 3 (T052-T065)
8. **STOP and VALIDATE**: 测试完整试衣流程(模特→服装→试衣)
9. **MVP就绪**: 部署/演示核心虚拟试衣功能

### Incremental Delivery

1. **基础设施** → Setup + Foundational (T001-T020) → 基础就绪
2. **MVP v1.0** → + User Story 1-3 (T021-T065) → 可用产品
3. **v1.1增强** → + User Story 4 (T066-T076) → UI优化
4. **v1.2完整** → + User Story 5 (T077-T088) → 功能完整
5. **v1.3打磨** → + Polish (T089-T098) → 生产就绪

每个版本都可独立部署,逐步增加价值。

### Parallel Team Strategy

多开发者并行工作:

1. **Foundation团队** (全员): 完成Setup + Foundational
2. **并行开发** (Foundation完成后):
   - 开发者A: User Story 1 (模特选择)
   - 开发者B: User Story 2 (服装上传)
   - 开发者C: User Story 4 (折叠交互,独立功能)
3. **集成阶段**:
   - 开发者A+B: User Story 3 (虚拟试衣,集成US1和US2)
   - 开发者C: User Story 5 (场景功能)
4. **Polish团队** (全员): 性能优化和测试

---

## Task Summary

- **Total Tasks**: 98
- **Setup**: 8 tasks (T001-T008)
- **Foundational**: 12 tasks (T009-T020)
- **User Story 1**: 12 tasks (T021-T032) - MVP核心
- **User Story 2**: 19 tasks (T033-T051) - MVP核心
- **User Story 3**: 14 tasks (T052-T065) - MVP核心
- **User Story 4**: 11 tasks (T066-T076) - 增强功能
- **User Story 5**: 12 tasks (T077-T088) - 增强功能
- **Polish**: 10 tasks (T089-T098)

**Parallel Opportunities**: 约35个任务标记[P],可并行执行

**MVP Scope**: Setup + Foundational + User Story 1-3 = 51个任务

**Independent Test Criteria**:
- US1: 可独立测试模特选择和预览更新
- US2: 可独立测试服装上传和网格展示
- US3: 需US1+US2但可作为完整流程独立验证
- US4: 可独立测试折叠交互
- US5: 可独立测试场景上传和背景切换

---

## Notes

- **[P]标记**: 不同文件,无依赖,可并行
- **[Story]标签**: 任务到用户故事的映射,便于追踪
- **测试策略**: 关键路径(文件上传、试衣API)采用TDD,UI组件测试灵活
- **后端现状**: 大部分API已存在(/outfit-change模块),前端主要为UI重构
- **渐进式交付**: 每个用户故事完成后即可独立验证和部署
- **检查点验证**: 在每个故事的Checkpoint停下来独立测试
- **避免陷阱**: 避免跨故事依赖破坏独立性,避免同一文件多任务冲突

**关键风险**:
1. AI试衣API响应时间可能超过2秒目标 → 需异步处理+进度提示
2. 20+服装卡片性能 → 需虚拟滚动或分页
3. 图片加载闪烁 → 需预加载和占位图

**建议执行顺序**: Setup → Foundational → US1 → US2 → US3 (MVP演示) → US4 → US5 → Polish
