# Data Model: 虚拟试衣模态与服装上传选择界面

**Feature**: 004-upload-modal-redesign
**Date**: 2025-10-22
**Source**: Extracted from [spec.md](./spec.md) Key Entities section

## Overview

本功能涉及4个核心实体,用于管理虚拟试衣的资源(模特/服装/场景)和会话状态。数据模型采用 Prisma ORM 定义,关系为:
- User (1) → (N) Garment/Scene
- Model (1) → (N) TryOnSession
- Garment (1) → (N) TryOnSession
- TryOnSession 记录每次试衣配置和结果

---

## Entities

### 1. Model (模特)

**用途**: 代表虚拟试衣的基础人物形象,系统预置模特供用户选择

**Attributes**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| `id` | String (UUID) | ✓ | 主键 | 自动生成 |
| `name` | String | ✓ | 模特名称 | 长度2-50字符 |
| `imageUrl` | String | ✓ | 全身照片URL | 有效URL格式 |
| `thumbnailUrl` | String | ✓ | 缩略图URL (200x200) | 有效URL格式 |
| `gender` | Enum | ✓ | 性别 | MALE / FEMALE / UNISEX |
| `bodyType` | String | ✗ | 身型描述 | 如"slim", "athletic", "plus-size" |
| `height` | Integer | ✗ | 身高(cm) | 150-220 |
| `isDefault` | Boolean | ✓ | 是否默认模特 | 默认false |
| `isActive` | Boolean | ✓ | 是否启用 | 默认true |
| `createdAt` | DateTime | ✓ | 创建时间 | 自动生成 |
| `updatedAt` | DateTime | ✓ | 更新时间 | 自动更新 |

**Relationships**:
- `tryOnSessions` → TryOnSession[] (一对多: 模特被多次使用)

**Business Rules**:
1. 系统启动时至少有2个 `isActive=true` 且 `isDefault=true` 的模特
2. `imageUrl` 必须是高质量全身照,建议尺寸 800x1200 以上
3. `thumbnailUrl` 由服务端自动生成,尺寸固定 200x200
4. 删除模特时,若有关联TryOnSession,采用软删除(`isActive=false`)

**State Transitions**:
```
[Initial] → [Active] (系统预置)
[Active] → [Inactive] (管理员停用)
[Inactive] → [Active] (管理员重新启用)
```

---

### 2. Garment (服装)

**用途**: 用户上传的服装图片资源,存储在个人服装库中

**Attributes**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| `id` | String (UUID) | ✓ | 主键 | 自动生成 |
| `userId` | String (UUID) | ✓ | 所属用户外键 | 引用User.id |
| `name` | String | ✓ | 服装名称 | 系统自动生成"Garment N",长度2-100 |
| `imageUrl` | String | ✓ | 原图URL | 有效URL,JPG/PNG/WEBP |
| `thumbnailUrl` | String | ✓ | 缩略图URL (200x200) | 自动生成 |
| `mimeType` | String | ✓ | 文件MIME类型 | image/jpeg, image/png, image/webp |
| `fileSize` | Integer | ✓ | 文件大小(bytes) | ≤10MB (10485760 bytes) |
| `width` | Integer | ✗ | 图片宽度(px) | Sharp提取 |
| `height` | Integer | ✗ | 图片高度(px) | Sharp提取 |
| `stockStatus` | Enum | ✓ | 库存状态 | IN_STOCK / OUT_OF_STOCK |
| `quantity` | Integer | ✓ | 数量 | 默认1,≥0 |
| `uploadedAt` | DateTime | ✓ | 上传时间 | 自动生成 |
| `createdAt` | DateTime | ✓ | 创建时间 | 自动生成 |
| `updatedAt` | DateTime | ✓ | 更新时间 | 自动更新 |

**Relationships**:
- `user` → User (多对一: 服装属于用户)
- `tryOnSessions` → TryOnSession[] (一对多: 服装被多次试衣)

**Business Rules**:
1. **文件验证**: 上传时验证MIME类型和大小,拒绝不合规文件
2. **自动命名**: 若用户未提供名称,按 "Garment {用户服装总数+1}" 命名
3. **缩略图生成**: Sharp自动生成 200x200 缩略图,保持宽高比
4. **存储路径**: `/uploads/garments/originals/{userId}/{uuid}.{ext}`
5. **默认状态**: 上传后 `stockStatus=IN_STOCK`, `quantity=1`
6. **级联删除**: 删除服装时,同步删除关联的TryOnSession记录

**Validation Logic**:
```typescript
// 上传时验证
class CreateGarmentDto {
  @IsEnum(['image/jpeg', 'image/png', 'image/webp'])
  mimeType: string;

  @Max(10485760)  // 10MB
  @Min(1)
  fileSize: number;

  @IsOptional()
  @Length(2, 100)
  name?: string;
}
```

---

### 3. Scene (场景)

**用途**: 用户上传的背景场景图片,用于更换虚拟试衣展示背景

**Attributes**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| `id` | String (UUID) | ✓ | 主键 | 自动生成 |
| `userId` | String (UUID) | ✓ | 所属用户外键 | 引用User.id |
| `name` | String | ✓ | 场景名称 | 系统自动生成"Scene N",长度2-100 |
| `imageUrl` | String | ✓ | 原图URL | 有效URL,JPG/PNG/WEBP |
| `thumbnailUrl` | String | ✓ | 缩略图URL (200x200) | 自动生成 |
| `sceneType` | Enum | ✗ | 场景类型 | INDOOR/OUTDOOR/STUDIO/CUSTOM |
| `mimeType` | String | ✓ | 文件MIME类型 | image/jpeg, image/png, image/webp |
| `fileSize` | Integer | ✓ | 文件大小(bytes) | ≤10MB |
| `uploadedAt` | DateTime | ✓ | 上传时间 | 自动生成 |
| `createdAt` | DateTime | ✓ | 创建时间 | 自动生成 |
| `updatedAt` | DateTime | ✓ | 更新时间 | 自动更新 |

**Relationships**:
- `user` → User (多对一: 场景属于用户)
- `tryOnSessions` → TryOnSession[] (一对多: 场景被多次使用)

**Business Rules**:
1. **存储路径**: `/uploads/scenes/originals/{userId}/{uuid}.{ext}`
2. **自动命名**: 按 "Scene {用户场景总数+1}" 命名
3. **类型推断**: 若未指定 `sceneType`,默认为 `CUSTOM`
4. **级联删除**: 删除场景时,TryOnSession中的 `sceneId` 设为NULL(场景可选)

---

### 4. TryOnSession (试衣会话)

**用途**: 记录一次完整的虚拟试衣操作,关联模特/服装/场景及生成结果

**Attributes**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| `id` | String (UUID) | ✓ | 主键 | 自动生成 |
| `userId` | String (UUID) | ✓ | 所属用户外键 | 引用User.id |
| `modelId` | String (UUID) | ✓ | 模特外键 | 引用Model.id |
| `garmentId` | String (UUID) | ✓ | 服装外键 | 引用Garment.id |
| `sceneId` | String (UUID) | ✗ | 场景外键(可选) | 引用Scene.id |
| `resultImageUrl` | String | ✗ | 试衣结果图URL | AI生成后填充 |
| `status` | Enum | ✓ | 会话状态 | PENDING/PROCESSING/COMPLETED/FAILED |
| `processingTimeMs` | Integer | ✗ | AI处理耗时(毫秒) | ≥0 |
| `errorMessage` | String | ✗ | 失败原因 | 仅status=FAILED时有值 |
| `createdAt` | DateTime | ✓ | 创建时间 | 自动生成 |
| `completedAt` | DateTime | ✗ | 完成时间 | status=COMPLETED时设置 |
| `updatedAt` | DateTime | ✓ | 更新时间 | 自动更新 |

**Relationships**:
- `user` → User (多对一: 会话属于用户)
- `model` → Model (多对一: 会话使用某个模特)
- `garment` → Garment (多对一: 会话使用某件服装)
- `scene` → Scene (多对一: 会话可选场景)

**Business Rules**:
1. **状态机**: 会话状态遵循严格的状态转移规则
2. **异步处理**: 创建会话时 `status=PENDING`,提交Bull队列处理
3. **超时机制**: 若处理超过30秒,自动标记为 `FAILED`
4. **结果存储**: `resultImageUrl` 存储在 `/uploads/tryon-results/{userId}/{sessionId}.jpg`
5. **历史记录**: 不删除已完成的会话,作为用户历史记录

**State Transitions**:
```
[PENDING] → [PROCESSING] (队列开始处理)
[PROCESSING] → [COMPLETED] (AI生成成功)
[PROCESSING] → [FAILED] (AI生成失败或超时)

不允许的转换:
[COMPLETED] → [PROCESSING] (已完成不可重新处理)
[FAILED] → [PENDING] (失败需重新创建会话)
```

**Validation Logic**:
```typescript
class CreateTryOnSessionDto {
  @IsUUID()
  modelId: string;

  @IsUUID()
  garmentId: string;

  @IsOptional()
  @IsUUID()
  sceneId?: string;
}
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  garments      Garment[]
  scenes        Scene[]
  tryOnSessions TryOnSession[]

  @@map("users")
}

model Model {
  id            String   @id @default(uuid())
  name          String
  imageUrl      String   @map("image_url")
  thumbnailUrl  String   @map("thumbnail_url")
  gender        Gender
  bodyType      String?  @map("body_type")
  height        Int?
  isDefault     Boolean  @default(false) @map("is_default")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  tryOnSessions TryOnSession[]

  @@map("models")
}

enum Gender {
  MALE
  FEMALE
  UNISEX
}

model Garment {
  id            String      @id @default(uuid())
  userId        String      @map("user_id")
  name          String
  imageUrl      String      @map("image_url")
  thumbnailUrl  String      @map("thumbnail_url")
  mimeType      String      @map("mime_type")
  fileSize      Int         @map("file_size")
  width         Int?
  height        Int?
  stockStatus   StockStatus @default(IN_STOCK) @map("stock_status")
  quantity      Int         @default(1)
  uploadedAt    DateTime    @default(now()) @map("uploaded_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  tryOnSessions TryOnSession[]

  @@index([userId])
  @@map("garments")
}

enum StockStatus {
  IN_STOCK
  OUT_OF_STOCK
}

model Scene {
  id            String      @id @default(uuid())
  userId        String      @map("user_id")
  name          String
  imageUrl      String      @map("image_url")
  thumbnailUrl  String      @map("thumbnail_url")
  sceneType     SceneType?  @map("scene_type")
  mimeType      String      @map("mime_type")
  fileSize      Int         @map("file_size")
  uploadedAt    DateTime    @default(now()) @map("uploaded_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  tryOnSessions TryOnSession[]

  @@index([userId])
  @@map("scenes")
}

enum SceneType {
  INDOOR
  OUTDOOR
  STUDIO
  CUSTOM
}

model TryOnSession {
  id               String         @id @default(uuid())
  userId           String         @map("user_id")
  modelId          String         @map("model_id")
  garmentId        String         @map("garment_id")
  sceneId          String?        @map("scene_id")
  resultImageUrl   String?        @map("result_image_url")
  status           SessionStatus  @default(PENDING)
  processingTimeMs Int?           @map("processing_time_ms")
  errorMessage     String?        @map("error_message")
  createdAt        DateTime       @default(now()) @map("created_at")
  completedAt      DateTime?      @map("completed_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  model   Model   @relation(fields: [modelId], references: [id], onDelete: Restrict)
  garment Garment @relation(fields: [garmentId], references: [id], onDelete: Cascade)
  scene   Scene?  @relation(fields: [sceneId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("tryon_sessions")
}

enum SessionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## Database Migrations

### Migration Strategy:

1. **初始迁移**: 创建Model/Garment/Scene/TryOnSession表
2. **Seed数据**: 插入2个默认模特(一男一女)
3. **索引优化**: 为高频查询字段添加索引

**Seed Script** (prisma/seed.ts):
```typescript
import { PrismaClient, Gender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建默认模特
  await prisma.model.createMany({
    data: [
      {
        name: 'Default Male Model',
        imageUrl: '/assets/models/default-male.jpg',
        thumbnailUrl: '/assets/models/thumbnails/default-male-thumb.jpg',
        gender: Gender.MALE,
        bodyType: 'athletic',
        height: 180,
        isDefault: true,
        isActive: true,
      },
      {
        name: 'Default Female Model',
        imageUrl: '/assets/models/default-female.jpg',
        thumbnailUrl: '/assets/models/thumbnails/default-female-thumb.jpg',
        gender: Gender.FEMALE,
        bodyType: 'slim',
        height: 170,
        isDefault: true,
        isActive: true,
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Query Patterns

### Common Queries:

1. **获取用户的所有服装** (带分页):
   ```typescript
   const garments = await prisma.garment.findMany({
     where: { userId },
     orderBy: { uploadedAt: 'desc' },
     take: 20,
     skip: page * 20,
   });
   ```

2. **获取活跃的默认模特**:
   ```typescript
   const models = await prisma.model.findMany({
     where: { isDefault: true, isActive: true },
     orderBy: { createdAt: 'asc' },
   });
   ```

3. **创建试衣会话**(含外键验证):
   ```typescript
   const session = await prisma.tryOnSession.create({
     data: {
       userId,
       modelId,
       garmentId,
       sceneId: sceneId || null,
       status: 'PENDING',
     },
     include: {
       model: { select: { imageUrl: true } },
       garment: { select: { imageUrl: true } },
       scene: { select: { imageUrl: true } },
     },
   });
   ```

4. **更新会话状态** (状态机):
   ```typescript
   await prisma.tryOnSession.update({
     where: { id: sessionId, status: 'PROCESSING' },  // 条件更新
     data: {
       status: 'COMPLETED',
       resultImageUrl,
       processingTimeMs,
       completedAt: new Date(),
     },
   });
   ```

---

## Performance Considerations

1. **索引策略**:
   - `garments.userId` + `uploadedAt` (用户服装列表排序)
   - `tryOnSessions.status` + `createdAt` (队列处理查询)

2. **级联删除**:
   - 删除User时级联删除Garment/Scene/TryOnSession
   - 删除Model时限制(`onDelete: Restrict`),需先解除关联

3. **缩略图生成**:
   - 异步生成,不阻塞上传响应
   - 使用Sharp库优化性能

4. **存储估算**:
   - 单个服装: 原图2MB + 缩略图50KB = 2.05MB
   - 100个用户,每人20件服装: 100 * 20 * 2.05MB ≈ 4.1GB
