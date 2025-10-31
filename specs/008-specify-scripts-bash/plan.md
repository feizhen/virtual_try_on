# Implementation Plan: TOS 图片云存储迁移

**Branch**: `008-specify-scripts-bash` | **Date**: 2025-10-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-specify-scripts-bash/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将虚拟试衣应用的图片存储从本地文件系统迁移到火山引擎 TOS 对象存储服务,实现云端存储和 CDN 加速访问。保持与现有本地存储方案的兼容性,通过配置开关控制存储方式,支持平滑迁移。核心功能包括:图片上传到 TOS、通过 CDN 访问图片、删除 TOS 文件、替换图片时的归档管理。

**技术方案**:
1. 集成火山引擎官方 TOS SDK (@volcengine/tos-sdk) 到 NestJS 后端
2. 创建抽象存储接口(IStorageProvider),支持本地存储和 TOS 两种实现
3. 扩展现有 Prisma 数据模型,添加 storageType、tosKey、cdnUrl 字段
4. 通过环境变量 STORAGE_TYPE 控制使用本地存储或 TOS
5. 前端无需修改,继续使用现有上传 API 和展示逻辑

## Technical Context

**Language/Version**: TypeScript 5.1+ (Node.js 18+)
**Primary Dependencies**:
  - Backend: NestJS 10.x, Prisma 5.x, @volcengine/tos-sdk (最新版本), file-type 16.5.4, multer 2.0.2
  - Frontend: React 19.x, Vite 5.x, Axios 1.12.2 (无需修改)
**Storage**:
  - Database: PostgreSQL (通过 Prisma ORM)
  - Object Storage: 火山引擎 TOS + CDN
  - Existing: Local filesystem (uploads/ 目录)
**Testing**: Jest (backend unit tests), Vitest (frontend - 无需修改)
**Target Platform**: Linux server (Railway deployment), Modern browsers
**Project Type**: Web application (NestJS backend + React frontend)
**Performance Goals**:
  - 上传 5MB 图片到 TOS 的 P95 延迟 ≤ 8秒
  - CDN 访问图片的 TTFB ≤ 200ms
  - 支持 ≥10 并发上传请求/秒
**Constraints**:
  - 单文件大小限制: 10MB
  - 上传成功率: ≥99.5% (排除用户网络问题)
  - 支持三种图片格式: JPEG, PNG, WebP
  - 必须保持向后兼容: 现有本地存储图片仍可访问
**Scale/Scope**:
  - 预期用户: 50+ 并发用户
  - 三种图片类型: models/, clothing/, results/
  - 现有代码影响: 主要修改 server/src/modules/outfit-change/ 模块

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**状态**: ✅ PASS (宪法文档为模板,无具体约束)

当前项目的 constitution.md 是模板文件,未定义具体的架构原则和约束。基于 NestJS 和现有代码结构的最佳实践,本实现计划遵循以下原则:

1. **模块化设计**: 新增 TOS 存储功能封装在 storage/ 目录,保持模块独立性
2. **接口抽象**: 定义 IStorageProvider 接口,支持多种存储实现(本地/TOS/未来的 S3)
3. **配置驱动**: 通过环境变量控制存储方式,便于不同环境使用不同配置
4. **向后兼容**: 保持现有 API 契约不变,前端无需修改
5. **测试覆盖**: 为新增的 TOS 存储服务编写单元测试

无违规项,无需复杂度豁免。

## Project Structure

### Documentation (this feature)

```
specs/008-specify-scripts-bash/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (TOS SDK 选型和最佳实践)
├── data-model.md        # Phase 1 output (数据库 schema 变更)
├── quickstart.md        # Phase 1 output (TOS 配置和测试指南)
├── contracts/           # Phase 1 output (无需新增 API,使用现有端点)
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

本项目是 Web 应用(NestJS backend + React frontend),主要修改在后端:

```
server/                                    # NestJS Backend
├── src/
│   ├── modules/
│   │   └── outfit-change/                # 主要修改区域
│   │       ├── storage/                  # 新增:存储抽象层
│   │       │   ├── interfaces/
│   │       │   │   └── storage-provider.interface.ts    # IStorageProvider 接口
│   │       │   ├── providers/
│   │       │   │   ├── local-storage.provider.ts        # 本地存储实现
│   │       │   │   └── tos-storage.provider.ts          # TOS 存储实现(新增)
│   │       │   ├── storage.service.ts                   # 修改:使用接口抽象
│   │       │   └── storage.module.ts                    # 存储模块配置
│   │       ├── outfit-change.service.ts  # 修改:适配新存储接口
│   │       ├── outfit-change.controller.ts              # 无需修改
│   │       └── dto/                      # 无需修改
│   ├── config/
│   │   └── tos.config.ts                 # 新增:TOS 配置
│   └── common/
│       ├── interfaces/
│       │   └── storage-config.interface.ts              # 存储配置接口
│       └── enums/
│           └── storage-type.enum.ts      # 存储类型枚举
├── prisma/
│   └── schema.prisma                     # 修改:添加 TOS 相关字段
├── .env.example                          # 更新:添加 TOS 配置示例
└── test/
    └── unit/
        └── storage/                      # 新增:存储服务单元测试
            ├── local-storage.provider.spec.ts
            └── tos-storage.provider.spec.ts

client/                                    # React Frontend
├── src/
│   ├── api/
│   │   └── outfit-change.ts              # 无需修改(API 契约不变)
│   └── components/
│       ├── ModelUpload.tsx               # 无需修改
│       └── ClothingUpload.tsx            # 无需修改
└── [其他前端文件无需修改]
```

**Structure Decision**:

选择 **Web application** 结构,因为项目包含独立的 backend(NestJS) 和 frontend(React) 目录。

**设计决策**:
1. **存储抽象层**: 在 `server/src/modules/outfit-change/storage/` 下创建接口和多实现模式
   - 接口层(`interfaces/`): 定义 `IStorageProvider` 统一接口
   - 实现层(`providers/`): 本地存储和 TOS 存储的具体实现
   - 服务层(`storage.service.ts`): 根据环境变量动态选择存储实现

2. **配置管理**: 新增 `tos.config.ts` 集中管理 TOS 配置,使用 NestJS ConfigModule

3. **数据库变更**: 扩展现有 Prisma models (ModelPhoto, ClothingItem, OutfitResult),添加可选字段而非破坏性修改

4. **前端零修改**: 保持现有 API 契约,前端继续使用相同的上传和访问接口

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

无违规项,无需填写此表。

