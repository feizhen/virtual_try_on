# Tasks: TOS 图片云存储迁移

**Input**: Design documents from `/specs/008-specify-scripts-bash/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 本功能规格未明确要求测试优先开发,因此不包含测试任务。测试将在 Polish 阶段添加。

**Organization**: 任务按用户故事分组,每个故事可独立实现和测试。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事 (US1, US2, US3, US4, US5)
- 包含确切的文件路径

## Path Conventions
本项目是 Web 应用,路径结构:
- 后端: `server/src/`, `server/prisma/`, `server/test/`
- 前端: `client/src/` (本功能无需修改)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和依赖安装

- [ ] T001 安装 TOS SDK 依赖: 在 server/package.json 添加 @volcengine/tos-sdk
- [ ] T002 [P] 更新环境变量示例: 在 server/.env.example 添加 TOS 配置项
- [ ] T003 [P] 创建 TOS 连接测试脚本: server/scripts/test-tos-connection.ts

**验证**: 运行 `npm install` 成功,`.env.example` 包含所有 TOS 配置项

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础设施,所有用户故事的前置依赖

**⚠️ CRITICAL**: 所有用户故事工作必须等此阶段完成后才能开始

- [ ] T004 创建存储类型枚举: server/src/common/enums/storage-type.enum.ts
- [ ] T005 [P] 创建存储配置接口: server/src/common/interfaces/storage-config.interface.ts
- [ ] T006 [P] 创建 TOS 配置文件: server/src/config/tos.config.ts
- [ ] T007 定义存储提供者接口: server/src/modules/outfit-change/storage/interfaces/storage-provider.interface.ts
- [ ] T008 实现本地存储提供者: server/src/modules/outfit-change/storage/providers/local-storage.provider.ts
- [ ] T009 扩展 Prisma schema 添加 TOS 字段: server/prisma/schema.prisma (ModelPhoto, ClothingItem, OutfitResult)
- [ ] T010 生成并应用数据库迁移: 运行 prisma migrate dev --name add_tos_storage_fields
- [ ] T011 更新 Prisma Client: 运行 prisma generate

**验证**:
- 所有接口和枚举文件编译通过
- 数据库迁移成功,新字段存在
- 本地存储提供者可实例化

**Checkpoint**: 基础设施就绪 - 用户故事实现可以开始

---

## Phase 3: User Story 1 - 用户上传图片至云端存储 (Priority: P1) 🎯 MVP

**Goal**: 实现图片上传到 TOS 云存储,用户可以上传模特照片和衣服照片,图片保存到 TOS 并通过 CDN 访问

**Independent Test**:
1. 设置 `STORAGE_TYPE=tos` 并配置 TOS 凭证
2. 通过前端上传一张模特照片
3. 验证: 数据库记录 `storageType='tos'`, `tosKey` 和 `cdnUrl` 非空
4. 访问返回的 CDN URL,图片正常加载

### Implementation for User Story 1

- [ ] T012 [P] [US1] 实现 TOS 存储提供者: server/src/modules/outfit-change/storage/providers/tos-storage.provider.ts
- [ ] T013 [US1] 修改存储服务使用接口抽象: server/src/modules/outfit-change/storage/storage.service.ts
- [ ] T014 [US1] 创建存储模块配置: server/src/modules/outfit-change/storage/storage.module.ts (动态选择存储实现)
- [ ] T015 [US1] 修改 OutfitChangeService 适配新存储接口: server/src/modules/outfit-change/outfit-change.service.ts (uploadModelPhoto, uploadClothingItem 方法)
- [ ] T016 [US1] 更新 OutfitChangeModule 导入 StorageModule: server/src/modules/outfit-change/outfit-change.module.ts
- [ ] T017 [US1] 添加 TOS 操作日志: 在 TosStorageProvider 中记录上传成功/失败日志
- [ ] T018 [US1] 验证 TOS 上传流程: 手动测试上传模特照片和衣服照片到 TOS

**Checkpoint**: 用户可以上传图片到 TOS,数据库正确记录 TOS 信息,图片可通过 CDN 访问

---

## Phase 4: User Story 2 - 访问已上传的图片 (Priority: P1)

**Goal**: 用户可以查看和使用之前上传的图片,图片列表正确显示 TOS 和本地存储的混合图片,图片加载速度快

**Independent Test**:
1. 上传多张图片到 TOS (通过 US1 功能)
2. 访问图片库 API: `GET /api/outfit-change/models`
3. 验证: 响应包含正确的 `url` 字段(TOS 图片显示 CDN URL,本地图片显示 /uploads/ 路径)
4. 在浏览器中打开返回的 URL,图片正常加载

### Implementation for User Story 2

- [ ] T019 [US2] 修改图片 URL 生成逻辑: 在 OutfitChangeService 的 getModelPhotos, getClothingItems, getOutfitResults 方法中添加动态 URL 生成
- [ ] T020 [US2] 确保响应包含计算后的 url 字段: 修改响应 DTO 或 serializer 添加 url 字段
- [ ] T021 [US2] 验证混合存储图片列表: 测试列表包含本地和 TOS 图片,URL 正确
- [ ] T022 [US2] 验证虚拟试衣结果图片访问: 测试试衣结果图片(保存到 TOS results/ 目录)可正常访问

**Checkpoint**: 图片库正确显示所有图片,TOS 图片通过 CDN 快速加载,本地图片仍可访问

---

## Phase 5: User Story 3 - 处理上传失败和重试 (Priority: P2)

**Goal**: 当 TOS 上传失败时,系统显示友好错误消息,用户可以重试

**Independent Test**:
1. 模拟 TOS 服务不可用(修改 TOS_ENDPOINT 或断网)
2. 尝试上传图片
3. 验证: 前端收到错误响应,显示友好消息 "云存储服务暂时不可用,请稍后重试"
4. 恢复网络,点击重试,上传成功

### Implementation for User Story 3

- [ ] T023 [P] [US3] 实现 TOS 错误分类和处理: 在 TosStorageProvider 中捕获并分类 TOS SDK 错误
- [ ] T024 [US3] 映射 TOS 错误到用户友好消息: 创建错误映射表,不暴露技术细节
- [ ] T025 [US3] 配置 TOS SDK 重试策略: 在 TosStorageProvider 初始化时配置 maxRetries, retryDelay, timeout
- [ ] T026 [US3] 添加详细错误日志: 记录完整错误堆栈但仅返回简化消息给前端
- [ ] T027 [US3] 测试各种错误场景: 网络错误、认证失败、超时、限流等

**Checkpoint**: 所有 TOS 错误都有友好提示,不泄露敏感信息,SDK 自动重试临时性错误

---

## Phase 6: User Story 4 - 删除云端图片 (Priority: P2)

**Goal**: 用户删除图片时,TOS 文件同步删除(如果未被引用),已引用的图片软删除

**Independent Test**:
1. 上传一张未使用的模特照片
2. 删除该照片: `DELETE /api/outfit-change/models/:id`
3. 验证: 数据库 `deletedAt` 有值, TOS 文件已删除(通过 URL 访问返回 404)
4. 上传并使用一张照片(用于虚拟试衣)
5. 删除该照片
6. 验证: 数据库软删除,TOS 文件保留,历史记录仍可访问

### Implementation for User Story 4

- [ ] T028 [US4] 实现 TOS 文件删除方法: 在 TosStorageProvider 中实现 delete(key) 方法
- [ ] T029 [US4] 修改删除逻辑检查引用: 在 OutfitChangeService 的 deleteModelPhoto, deleteClothingItem 方法中检查 outfitResults 引用
- [ ] T030 [US4] 实现条件删除: 如果未引用则调用 storageProvider.delete(),如果已引用则仅软删除
- [ ] T031 [P] [US4] 创建定期清理脚本: server/scripts/cleanup-deleted-tos-files.ts (扫描已软删除超过30天且无引用的记录)
- [ ] T032 [US4] 添加删除操作日志: 记录 TOS 文件删除成功/失败
- [ ] T033 [US4] 测试删除场景: 未引用删除、已引用软删除、清理脚本执行

**Checkpoint**: 删除功能正确处理引用关系,TOS 文件及时清理,历史记录完整

---

## Phase 7: User Story 5 - 替换已上传的图片 (Priority: P3)

**Goal**: 用户可以替换已上传的图片,旧文件根据引用情况归档或删除

**Independent Test**:
1. 上传一张未使用的模特照片
2. 替换该照片: `PUT /api/outfit-change/models/:id/replace`
3. 验证: 旧文件从 TOS 删除,新文件上传成功,数据库更新
4. 上传并使用一张照片(用于虚拟试衣)
5. 替换该照片
6. 验证: 旧文件归档到 `archived/models/`,新文件上传,version 递增

### Implementation for User Story 5

- [ ] T034 [US5] 实现 TOS 文件归档方法: 在 TosStorageProvider 中实现 archive(key) 方法(使用 copyObject + deleteObject)
- [ ] T035 [US5] 修改替换逻辑检查引用: 在 OutfitChangeService 的 replaceModelPhoto 方法中检查引用
- [ ] T036 [US5] 实现条件归档或删除: 如果已引用则归档,未引用则删除
- [ ] T037 [US5] 更新版本号和替换历史: 递增 version 字段,更新 replacementHistory JSON
- [ ] T038 [US5] 添加归档操作日志: 记录文件归档路径
- [ ] T039 [US5] 测试替换场景: 未引用替换、已引用归档、版本递增

**Checkpoint**: 替换功能完整,旧文件妥善处理,历史记录可追溯

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和测试

- [ ] T040 [P] 编写本地存储提供者单元测试: server/test/unit/storage/local-storage.provider.spec.ts
- [ ] T041 [P] 编写 TOS 存储提供者单元测试: server/test/unit/storage/tos-storage.provider.spec.ts (使用 mock TOS client)
- [ ] T042 [P] 编写存储服务集成测试: 测试本地和 TOS 模式切换
- [ ] T043 [P] 性能测试: 验证上传 5MB 图片 P95 延迟 ≤ 8秒
- [ ] T044 [P] CDN 访问测试: 验证 TTFB ≤ 200ms
- [ ] T045 [P] 并发上传测试: 验证支持 10+ 并发请求/秒
- [ ] T046 代码审查和重构: 优化 TOS 错误处理和日志记录
- [ ] T047 [P] 更新项目文档: 在 server/CLAUDE.md 添加 TOS 存储说明
- [ ] T048 [P] 创建 TOS 配置部署指南: 文档化生产环境 TOS 配置步骤
- [ ] T049 运行 quickstart.md 验证: 执行所有测试用例,确保通过
- [ ] T050 [P] 监控告警配置: 配置 TOS 上传成功率、延迟、错误率监控指标

**Checkpoint**: 所有测试通过,文档完善,生产就绪

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-7)**: 全部依赖 Foundational 完成
  - 可以并行实施(如果团队人数足够)
  - 或按优先级顺序: P1 → P1 → P2 → P2 → P3
- **Polish (Phase 8)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundation 后可开始 - 无其他故事依赖
- **User Story 2 (P1)**: Foundation 后可开始 - 无其他故事依赖 (与 US1 并行)
- **User Story 3 (P2)**: 依赖 US1 (需要上传功能存在才能测试错误处理)
- **User Story 4 (P2)**: 依赖 US1 (需要上传功能才能删除)
- **User Story 5 (P3)**: 依赖 US1 和 US4 (需要上传和删除逻辑)

### Within Each User Story

- US1: T012 → T013 → T014 → T015 → T016 → T017 → T018
- US2: T019 → T020 → T021 → T022
- US3: T023, T024 并行 → T025 → T026 → T027
- US4: T028 → T029 → T030, T031 并行 → T032 → T033
- US5: T034 → T035 → T036 → T037 → T038 → T039

### Parallel Opportunities

- **Setup**: T002, T003 可并行
- **Foundational**: T004, T005, T006 可并行; T009, T010, T011 顺序执行
- **US1**: T012 完成后,T013-T016 顺序执行
- **US2**: 全部顺序执行(修改同一个 Service)
- **US3**: T023, T024 可并行
- **US4**: T030, T031 可并行
- **US5**: 全部顺序执行
- **Polish**: T040, T041, T042, T043, T044, T045, T047, T048, T050 可并行

**跨故事并行**: US1 和 US2 可以并行开发(不同方法),US3-US5 依赖 US1

---

## Parallel Example: User Story 1

```bash
# 并行执行 US1 中的独立任务(实际上 US1 任务有依赖,示例仅说明格式):
# T012 完成后:
Task: "实现 TOS 存储提供者: server/src/modules/outfit-change/storage/providers/tos-storage.provider.ts"

# T012 完成后顺序执行:
Task: "修改存储服务使用接口抽象: server/src/modules/outfit-change/storage/storage.service.ts"
Task: "创建存储模块配置: server/src/modules/outfit-change/storage/storage.module.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. **Complete Phase 1: Setup** (T001-T003)
2. **Complete Phase 2: Foundational** (T004-T011) - **CRITICAL**
3. **Complete Phase 3: User Story 1** (T012-T018) - 上传到 TOS
4. **Complete Phase 4: User Story 2** (T019-T022) - 访问 TOS 图片
5. **STOP and VALIDATE**: 测试上传和访问功能,验证数据库和 TOS 一致性
6. 如果就绪,部署/演示 MVP

**MVP 范围**: US1 + US2 是最小可行产品,提供完整的上传和访问流程

### Incremental Delivery

1. **Foundation**: Setup + Foundational → 基础设施就绪
2. **MVP**: US1 + US2 → 测试独立 → 部署/演示 (核心价值!)
3. **Enhancement 1**: US3 → 测试独立 → 部署/演示 (更好的错误处理)
4. **Enhancement 2**: US4 → 测试独立 → 部署/演示 (存储管理)
5. **Enhancement 3**: US5 → 测试独立 → 部署/演示 (高级功能)
6. **Polish**: Phase 8 → 测试、文档、监控完善

每个阶段增加价值而不破坏已有功能

### Parallel Team Strategy

如果有多个开发者:

1. **团队共同完成** Setup + Foundational
2. **Foundational 完成后分工**:
   - Developer A: User Story 1 (上传到 TOS)
   - Developer B: User Story 2 (访问 TOS 图片)
   - 等 A 和 B 完成后:
   - Developer A: User Story 3 (错误处理)
   - Developer B: User Story 4 (删除功能)
   - Developer C (可选): User Story 5 (替换功能)
3. 故事独立完成并集成

---

## Task Count Summary

| Phase | Task Range | Count | Parallelizable |
|-------|------------|-------|----------------|
| Phase 1: Setup | T001-T003 | 3 | 2 |
| Phase 2: Foundational | T004-T011 | 8 | 3 |
| Phase 3: User Story 1 (P1) | T012-T018 | 7 | 1 |
| Phase 4: User Story 2 (P1) | T019-T022 | 4 | 0 |
| Phase 5: User Story 3 (P2) | T023-T027 | 5 | 2 |
| Phase 6: User Story 4 (P2) | T028-T033 | 6 | 2 |
| Phase 7: User Story 5 (P3) | T034-T039 | 6 | 0 |
| Phase 8: Polish | T040-T050 | 11 | 9 |
| **Total** | **T001-T050** | **50** | **19** |

---

## Notes

- **[P] 任务**: 不同文件,无依赖,可并行
- **[Story] 标签**: 追溯任务到用户故事
- **每个用户故事独立可完成和测试**
- **提交建议**: 每完成一个任务或逻辑组提交一次
- **检查点**: 在每个检查点停下来独立验证故事
- **避免**: 模糊任务、同文件冲突、破坏独立性的跨故事依赖

**MVP 建议**: 优先完成 US1 + US2 (T001-T022),然后验证部署

**测试策略**: 单元测试在 Polish 阶段集中编写,功能测试在每个故事完成时手动验证

**回滚计划**: 任何阶段遇到问题,修改环境变量 `STORAGE_TYPE=local` 立即回退到本地存储
