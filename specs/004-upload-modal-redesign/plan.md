# Implementation Plan: 虚拟试衣模态与服装上传选择界面

**Branch**: `004-upload-modal-redesign` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-upload-modal-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能为虚拟试衣应用构建完整的前端交互界面,包括模特选择、服装上传管理和虚拟试衣效果展示。核心需求包括:
- 底部模特选择器(红色边框高亮)
- 右侧可折叠的服装/场景上传区域(3列网格布局)
- 服装卡片选择和虚拟试衣效果预览
- 文件上传(JPG/PNG/WEBP,最大10MB)和进度显示

技术方案采用 React + TypeScript + CSS Grid,集成现有 NestJS 后端API,使用 Axios 处理文件上传和 AI 试衣请求。

## Technical Context

**Language/Version**: TypeScript 5.1+ / Node.js 18+
**Primary Dependencies**:
- Frontend: React 19.2, React Router 7, Axios 1.12, Vite 7
- Backend: NestJS 10, Prisma 5, Sharp (图片处理), Multer 2 (文件上传)

**Storage**:
- 图片文件: NEEDS CLARIFICATION (云存储 OSS/S3 或本地文件系统)
- 数据库: Prisma + PostgreSQL (已有 User 认证表)

**Testing**:
- Frontend: Vitest (Vite原生测试框架)
- Backend: Jest (NestJS默认)
- E2E: NEEDS CLARIFICATION (Playwright 或 Cypress)

**Target Platform**:
- 桌面端浏览器 (Chrome 90+, Safari 14+, Firefox 88+)
- 最小分辨率: 1280x720

**Project Type**: Web (前后端分离: client/ + server/)

**Performance Goals**:
- 文件上传: 2MB图片 < 5秒
- 服装选择响应: < 500ms
- AI试衣效果生成: < 2秒
- 折叠动画: < 300ms

**Constraints**:
- 单文件上传限制: 10MB
- 支持格式: JPG/PNG/WEBP
- 同时展示服装数: ≥20件无性能下降
- 网格布局: 固定3列

**Scale/Scope**:
- 预计用户量: 中小型应用
- 单用户存储: 50-100MB (服装+场景图片)
- 并发上传: 单用户单次≤5个文件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**检查状态**: ⚠️ Constitution 文件为模板状态,无具体原则可检查

由于 `.specify/memory/constitution.md` 当前为空模板,暂时跳过原则检查。建议在后续迭代中补充项目宪法原则,例如:
- 组件复用原则
- API契约规范
- 性能标准
- 测试覆盖要求

**临时默认原则**:
1. ✅ **组件独立性**: 每个UI组件应可独立测试
2. ✅ **API先行**: 后端API先于前端实现,使用契约测试
3. ⚠️ **测试覆盖**: NEEDS CLARIFICATION (TDD强制要求?)
4. ✅ **性能监控**: 关键指标(上传时间、响应时间)需可观测

## Project Structure

### Documentation (this feature)

```
specs/004-upload-modal-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-upload.yaml      # 文件上传API契约
│   ├── api-garment.yaml     # 服装管理API契约
│   ├── api-tryon.yaml       # 虚拟试衣API契约
│   └── api-model.yaml       # 模特管理API契约
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Web application structure (frontend + backend)
client/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx        # 已存在
│   │   ├── VirtualTryOn/             # 新增: 虚拟试衣主组件
│   │   │   ├── index.tsx
│   │   │   ├── ModelSelector.tsx     # 模特选择器
│   │   │   ├── GarmentPanel.tsx      # 服装面板(含上传)
│   │   │   ├── ScenePanel.tsx        # 场景面板
│   │   │   ├── PreviewArea.tsx       # 主预览区域
│   │   │   ├── UploadZone.tsx        # 虚线框上传区
│   │   │   ├── GarmentCard.tsx       # 服装卡片
│   │   │   └── styles.css            # 组件样式
│   │   ├── ClothingUpload.tsx        # 已存在(可能需重构)
│   │   └── ModelUpload.tsx           # 已存在(可能需重构)
│   ├── pages/
│   │   ├── Home.tsx                  # 已存在
│   │   ├── VirtualTryOnPage.tsx      # 新增: 虚拟试衣页面
│   │   ├── Login.tsx                 # 已存在
│   │   └── Register.tsx              # 已存在
│   ├── api/
│   │   ├── client.ts                 # 已存在: Axios实例
│   │   ├── auth.ts                   # 已存在: 认证API
│   │   ├── garment.ts                # 新增: 服装API
│   │   ├── model.ts                  # 新增: 模特API
│   │   ├── scene.ts                  # 新增: 场景API
│   │   └── tryon.ts                  # 新增: 虚拟试衣API
│   ├── types/
│   │   ├── auth.ts                   # 已存在
│   │   ├── garment.ts                # 新增
│   │   ├── model.ts                  # 新增
│   │   ├── scene.ts                  # 新增
│   │   └── tryon.ts                  # 新增
│   ├── contexts/
│   │   ├── AuthContext.tsx           # 已存在
│   │   └── TryOnContext.tsx          # 新增: 试衣会话状态
│   └── utils/
│       ├── token.ts                  # 已存在
│       ├── fileUpload.ts             # 新增: 文件上传工具
│       └── imageValidation.ts        # 新增: 图片验证
└── tests/
    └── components/
        └── VirtualTryOn/
            ├── ModelSelector.test.tsx
            ├── GarmentPanel.test.tsx
            └── UploadZone.test.tsx

server/
├── src/
│   ├── modules/
│   │   ├── auth/                     # 已存在
│   │   ├── garment/                  # 新增: 服装管理模块
│   │   │   ├── garment.controller.ts
│   │   │   ├── garment.service.ts
│   │   │   ├── garment.module.ts
│   │   │   └── dto/
│   │   │       ├── create-garment.dto.ts
│   │   │       └── update-garment.dto.ts
│   │   ├── model/                    # 新增: 模特管理模块
│   │   │   ├── model.controller.ts
│   │   │   ├── model.service.ts
│   │   │   └── model.module.ts
│   │   ├── scene/                    # 新增: 场景管理模块
│   │   │   ├── scene.controller.ts
│   │   │   ├── scene.service.ts
│   │   │   └── scene.module.ts
│   │   ├── tryon/                    # 新增: 虚拟试衣模块
│   │   │   ├── tryon.controller.ts
│   │   │   ├── tryon.service.ts
│   │   │   ├── tryon.module.ts
│   │   │   └── tryon-ai.service.ts   # AI引擎集成
│   │   └── upload/                   # 新增: 文件上传模块
│   │       ├── upload.controller.ts
│   │       ├── upload.service.ts
│   │       ├── upload.module.ts
│   │       └── pipes/
│   │           └── file-validation.pipe.ts
│   └── common/
│       ├── guards/                   # 已存在
│       ├── decorators/               # 已存在
│       └── filters/                  # 已存在
├── prisma/
│   ├── schema.prisma                 # 需更新: 添加Garment/Model/Scene表
│   └── migrations/                   # 新迁移文件
└── test/
    └── e2e/
        ├── garment.e2e-spec.ts       # 新增
        └── tryon.e2e-spec.ts         # 新增
```

**Structure Decision**:
采用Option 2 (Web application) 结构,因为项目已存在 `client/` 和 `server/` 分离架构。
- Frontend: React SPA with component-based architecture
- Backend: NestJS modular architecture with domain-driven structure
- 新增4个后端模块 (garment/model/scene/tryon) 和对应的前端API层

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | 当前设计未违反已知原则 | - |

**说明**: 由于Constitution为模板状态,暂无具体违规检查。当前设计遵循:
- 模块化原则 (按功能域划分模块)
- 组件复用 (共享UploadZone/GarmentCard等组件)
- API契约优先 (Phase 1将生成OpenAPI规范)
