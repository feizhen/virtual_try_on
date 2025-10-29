# Implementation Plan: 落地页设计 (Landing Page Design)

**Branch**: `007-landing-page-design` | **Date**: 2025-10-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-landing-page-design/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

设计并实现一个专业的落地页来替换当前的根路径(/)首页。落地页将参考市场主流设计,包含英雄区、功能介绍、示例展示和行动号召(CTA)按钮,帮助未登录用户快速理解 AI 虚拟试衣平台的核心价值并引导注册。技术方案采用 React + TypeScript + CSS,复用现有设计系统,支持响应式布局,优化首屏加载性能。

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0, ES2022
**Primary Dependencies**: React Router 7.9.4, Vite 5.4.21, Axios 1.12.2, SWR 2.3.6
**Storage**: N/A (纯前端页面,无数据持久化需求)
**Testing**: Vitest 4.0.0, @testing-library/react 16.3.0, Playwright 1.56.1
**Target Platform**: 现代浏览器(Chrome、Firefox、Safari、Edge 最新版本)
**Project Type**: Web 前端应用(单页应用 SPA)
**Performance Goals**:
  - 首屏加载时间 < 3 秒(3G 网络)
  - Lighthouse Performance 评分 > 90
  - 首屏内容绘制(FCP) < 1.5 秒
  - 最大内容绘制(LCP) < 2.5 秒
**Constraints**:
  - 必须复用现有 CSS 变量和设计系统(Indigo #4f46e5 主色调)
  - 图片资源需懒加载或渐进式加载
  - 响应式设计支持移动端(<768px)、平板(768-1024px)、桌面(>1024px)
  - 已登录用户重定向延迟 < 500ms
**Scale/Scope**:
  - 1 个新页面组件(Landing.tsx)
  - 3-4 个功能卡片组件
  - 2-3 组示例图片
  - 预计新增代码 ~500 行(含 CSS)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (项目未定义正式宪章,采用通用最佳实践)

由于 `.specify/memory/constitution.md` 为空模板,本项目未强制执行特定架构约束。落地页设计遵循以下通用原则:

- ✅ **组件化设计**: 功能卡片、示例展示等可复用组件
- ✅ **测试优先**: 编写组件单元测试和端到端测试
- ✅ **性能优化**: 图片懒加载、代码分割、首屏优化
- ✅ **可访问性**: 语义化 HTML、键盘导航、ARIA 属性
- ✅ **一致性**: 复用现有设计系统和 CSS 变量

无需额外审批门槛,可直接进入 Phase 0 研究阶段。

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
client/                           # React 前端应用
├── src/
│   ├── pages/
│   │   ├── Landing.tsx          # 新增:落地页主组件 ✨
│   │   ├── Landing.css          # 新增:落地页样式 ✨
│   │   ├── Home.tsx             # 现有:已登录用户首页
│   │   ├── Login.tsx            # 现有:登录页
│   │   ├── Register.tsx         # 现有:注册页
│   │   ├── VirtualTryOn.tsx     # 现有:虚拟试衣页
│   │   └── History.tsx          # 现有:历史记录页
│   ├── components/
│   │   ├── Landing/             # 新增:落地页专用组件目录 ✨
│   │   │   ├── HeroSection.tsx         # 英雄区组件
│   │   │   ├── FeaturesSection.tsx     # 功能介绍区组件
│   │   │   ├── FeatureCard.tsx         # 单个功能卡片
│   │   │   ├── ExamplesSection.tsx     # 示例展示区组件
│   │   │   ├── ExampleComparison.tsx   # 前后对比组件
│   │   │   └── CTASection.tsx          # 行动号召区组件
│   │   ├── ProtectedRoute.tsx   # 现有:路由保护
│   │   └── Layout.tsx           # 现有:布局组件
│   ├── contexts/
│   │   └── AuthContext.tsx      # 现有:认证上下文(用于检测登录状态)
│   ├── assets/
│   │   └── examples/            # 新增:示例图片目录 ✨
│   │       ├── example-1-before.jpg
│   │       ├── example-1-after.jpg
│   │       ├── example-2-before.jpg
│   │       └── example-2-after.jpg
│   ├── App.tsx                  # 需修改:添加落地页路由
│   └── index.css                # 现有:全局样式(含 CSS 变量)
└── tests/
    ├── unit/
    │   └── Landing.test.tsx     # 新增:落地页单元测试 ✨
    └── e2e/
        └── landing.spec.ts      # 新增:落地页端到端测试 ✨
```

**Structure Decision**:

采用 **Web 前端应用结构**(Option 2 的 frontend 部分)。本功能仅涉及前端开发,无需后端修改。

**关键目录说明**:
- `client/src/pages/`: 新增 `Landing.tsx` 作为落地页主组件
- `client/src/components/Landing/`: 新建子目录存放落地页专用组件,保持代码组织清晰
- `client/src/assets/examples/`: 存放示例图片资源
- `client/tests/`: 新增单元测试和 E2E 测试

**路由修改策略**:
- 当前 `/` 路径被 `<ProtectedRoute>` 包裹,重定向已登录用户到 `Home.tsx`
- 修改后 `/` 路径显示 `Landing.tsx`(公开访问)
- 已登录用户访问 `/` 时自动重定向到 `/tryon`

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**无复杂度违规**: 本功能设计简洁,无架构约束违规项。

