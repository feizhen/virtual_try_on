# Implementation Plan: Credit System and History Enhancements

**Branch**: `005-credit-history-features` | **Date**: 2025-10-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-credit-history-features/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能为虚拟试衣应用添加完整的 Credit 积分系统、试衣历史记录管理、失败重试功能和模特图替换功能。技术实现基于现有的 NestJS + Prisma + React 架构，扩展数据模型、添加新的服务层逻辑和前端界面组件。

## Technical Context

**Language/Version**:
- 后端: TypeScript 5.x + Node.js 18+ (NestJS 10.x)
- 前端: TypeScript 5.x + React 18

**Primary Dependencies**:
- 后端: NestJS, Prisma ORM, PostgreSQL, bcryptjs, axios
- 前端: React 18, Vite, React Router v7, shadcn/ui

**Storage**:
- 数据库: PostgreSQL (通过 Prisma ORM)
- 文件存储: 本地文件系统 (uploads/ 目录)

**Testing**:
- 后端: Jest (NestJS 默认测试框架)
- 前端: Vitest + React Testing Library

**Target Platform**:
- 后端: Linux/macOS server (Node.js runtime)
- 前端: Modern browsers (Chrome, Firefox, Safari)

**Project Type**: Web application (前后端分离架构)

**Performance Goals**:
- Credit 操作响应时间 < 500ms
- 历史记录列表加载 < 3s (20条记录)
- 支持 1000+ 条历史记录的流畅浏览
- 并发虚拟试衣请求: 10+ 用户无 credit 计算错误

**Constraints**:
- Credit 操作必须原子性（数据库事务）
- 历史记录软删除（不物理删除）
- 图片替换时保护历史记录引用完整性
- 所有 API 需要 JWT 认证

**Scale/Scope**:
- 新增数据模型: 1个 (CreditTransaction)
- 扩展现有模型: 4个 (User, OutfitResult, ProcessingSession, ModelPhoto)
- 新增 API 端点: 约 10个
- 新增前端页面: 2-3个 (历史记录页、Credit 管理页)
- 新增前端组件: 5-8个

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

由于项目 constitution.md 为空模板，基于现有项目架构推断以下原则：

### 推断的项目原则

1. **模块化架构**: 使用 NestJS 模块系统，清晰的关注点分离（Service/Controller/Module）
2. **类型安全**: 全栈 TypeScript，利用 Prisma 自动生成类型
3. **数据完整性**: 软删除策略，保留审计追踪
4. **安全优先**: JWT 认证，Guard 保护，密码哈希
5. **RESTful API**: 遵循 REST 最佳实践

### 本功能的合规性

- ✅ **模块化**: 新增 CreditModule, HistoryModule（可选，也可扩展现有 OutfitChangeModule）
- ✅ **类型安全**: 所有新实体使用 Prisma schema 定义，自动生成 TypeScript 类型
- ✅ **数据完整性**: Credit 交易使用事务，历史记录软删除
- ✅ **安全**: 所有新端点使用 JwtAuthGuard
- ✅ **RESTful**: 遵循现有 API 风格

**无违规项** - 不需要复杂性证明表

## Project Structure

### Documentation (this feature)

```
specs/005-credit-history-features/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── credit-api.yaml  # Credit system API contracts (OpenAPI)
│   └── history-api.yaml # History API contracts (OpenAPI)
├── checklists/
│   └── requirements.md  # Spec quality checklist (已完成)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

本功能基于现有 Web 应用结构，扩展后端和前端代码：

```
server/                          # NestJS 后端
├── prisma/
│   └── schema.prisma           # ⚡ 扩展: 添加 CreditTransaction 模型，扩展 User/OutfitResult/ProcessingSession/ModelPhoto
├── src/
│   ├── credit/                 # 🆕 新模块: Credit 系统
│   │   ├── credit.module.ts
│   │   ├── credit.service.ts   # Credit 业务逻辑（扣除、退还、查询）
│   │   ├── credit.controller.ts
│   │   ├── dto/
│   │   │   └── credit.dto.ts   # DTO: 交易记录、余额查询
│   │   └── entities/
│   │       └── credit-transaction.entity.ts
│   ├── history/                # 🆕 新模块: 历史记录 (或扩展到 outfit-change/)
│   │   ├── history.module.ts
│   │   ├── history.service.ts  # 历史记录查询、分页、软删除
│   │   ├── history.controller.ts
│   │   └── dto/
│   │       └── history.dto.ts  # DTO: 分页请求、历史记录响应
│   ├── outfit-change/
│   │   ├── outfit-change.service.ts  # ⚡ 扩展: 集成 credit 扣除/退还逻辑
│   │   ├── outfit-change.controller.ts  # ⚡ 扩展: 添加重试端点、图片替换端点
│   │   └── dto/
│   │       └── tryon.dto.ts    # ⚡ 扩展: 添加 retryFromId 字段
│   └── users/
│       ├── users.service.ts    # ⚡ 扩展: 用户注册时初始化 credit
│       └── entities/
│           └── user.entity.ts  # ⚡ 扩展: 添加 credit 字段
└── test/
    ├── credit.service.spec.ts   # 🆕 单元测试: Credit 服务
    ├── history.service.spec.ts  # 🆕 单元测试: 历史记录服务
    └── credit.e2e-spec.ts       # 🆕 E2E测试: Credit 端点

client/                          # React 前端
├── src/
│   ├── api/
│   │   ├── credit.ts           # 🆕 Credit API 客户端
│   │   ├── history.ts          # 🆕 History API 客户端
│   │   ├── outfit-change.ts    # ⚡ 扩展: 添加 retry、replaceModel 方法
│   │   └── types.ts            # ⚡ 扩展: 添加 CreditTransaction, HistoryRecord 类型
│   ├── pages/
│   │   ├── History.tsx         # 🆕 历史记录页面
│   │   ├── CreditManagement.tsx  # 🆕 Credit 管理页面 (可选)
│   │   └── VirtualTryOn.tsx    # ⚡ 扩展: 显示 credit 余额，集成重试按钮
│   ├── components/
│   │   ├── History/
│   │   │   ├── HistoryList.tsx      # 🆕 历史记录列表组件
│   │   │   ├── HistoryItem.tsx      # 🆕 单条历史记录组件
│   │   │   └── HistoryDetail.tsx    # 🆕 历史记录详情模态框
│   │   ├── Credit/
│   │   │   ├── CreditBadge.tsx      # 🆕 Credit 余额显示徽章
│   │   │   └── CreditHistory.tsx    # 🆕 Credit 交易历史组件
│   │   └── VirtualTryOn/
│   │       ├── ModelSelector.tsx    # ⚡ 扩展: 添加图片替换按钮
│   │       └── TryOnButton.tsx      # ⚡ 扩展: 检查 credit 余额
│   └── contexts/
│       ├── AuthContext.tsx     # ⚡ 扩展: 在 user 对象中包含 credit 信息
│       └── CreditContext.tsx   # 🆕 Credit 全局状态管理
└── tests/
    ├── History.test.tsx         # 🆕 组件测试
    └── CreditBadge.test.tsx     # 🆕 组件测试
```

**图标说明**:
- 🆕 = 新增文件/目录
- ⚡ = 扩展现有文件

**Structure Decision**: 采用 Web 应用结构（Option 2），遵循现有项目的前后端分离架构。后端使用 NestJS 模块化设计，新增 Credit 和 History 模块；前端使用 React 组件化，新增历史记录和 Credit 管理相关页面和组件。

## Complexity Tracking

*无违规项 - 本表为空*

