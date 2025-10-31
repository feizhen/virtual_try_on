# Data Model: TOS 图片云存储迁移

**Feature**: TOS 图片云存储迁移
**Branch**: `008-specify-scripts-bash`
**Date**: 2025-10-29

## 概述

本文档定义 TOS 图片云存储功能所需的数据模型变更。主要变更是在现有的图片实体(ModelPhoto, ClothingItem, OutfitResult)中添加存储类型和 TOS 路径字段,保持向后兼容。

---

## 数据库 Schema 变更

### 1. ModelPhoto (模特照片)

**现有字段**: 保持不变

**新增字段**:

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `storageType` | VARCHAR(10) | NOT NULL | 'local' | 存储类型: 'local' 或 'tos' |
| `tosKey` | VARCHAR(500) | NULL | NULL | TOS 文件路径,如: models/uuid.jpg |
| `cdnUrl` | VARCHAR(1000) | NULL | NULL | CDN 完整 URL,如: https://cdn.xxx.com/models/uuid.jpg |

**索引变更**:
- 新增索引: `idx_model_photos_storage_type` on `storageType`

**Prisma Schema**:
```prisma
model ModelPhoto {
  id                 String    @id @default(uuid())
  userId             String    @map("user_id")

  // 现有字段
  imageUrl           String    @map("image_url")
  originalFileName   String?   @map("original_file_name")
  fileSize           Int       @map("file_size")
  mimeType           String    @map("mime_type")
  width              Int
  height             Int
  uploadedAt         DateTime  @default(now()) @map("uploaded_at")
  deletedAt          DateTime? @map("deleted_at")
  version            Int       @default(1)
  replacementHistory Json?     @map("replacement_history") @db.JsonB
  isArchived         Boolean   @default(false) @map("is_archived")

  // 新增字段
  storageType        String    @default("local") @map("storage_type")
  tosKey             String?   @map("tos_key")
  cdnUrl             String?   @map("cdn_url")

  // Relations
  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitResults      OutfitResult[]
  processingSessions ProcessingSession[]

  @@index([userId])
  @@index([deletedAt])
  @@index([uploadedAt(sort: Desc)])
  @@index([storageType])  // 新增
  @@map("model_photos")
}
```

**SQL Migration**:
```sql
-- Add new columns
ALTER TABLE model_photos ADD COLUMN storage_type VARCHAR(10) NOT NULL DEFAULT 'local';
ALTER TABLE model_photos ADD COLUMN tos_key VARCHAR(500);
ALTER TABLE model_photos ADD COLUMN cdn_url VARCHAR(1000);

-- Add index
CREATE INDEX idx_model_photos_storage_type ON model_photos(storage_type);

-- Add check constraint
ALTER TABLE model_photos ADD CONSTRAINT chk_storage_type
  CHECK (storage_type IN ('local', 'tos'));
```

---

### 2. ClothingItem (衣服照片)

**与 ModelPhoto 相同的变更**:

**新增字段**:

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `storageType` | VARCHAR(10) | NOT NULL | 'local' | 存储类型: 'local' 或 'tos' |
| `tosKey` | VARCHAR(500) | NULL | NULL | TOS 文件路径 |
| `cdnUrl` | VARCHAR(1000) | NULL | NULL | CDN 完整 URL |

**Prisma Schema**:
```prisma
model ClothingItem {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")

  // 现有字段
  imageUrl         String    @map("image_url")
  originalFileName String?   @map("original_file_name")
  fileSize         Int       @map("file_size")
  mimeType         String    @map("mime_type")
  width            Int
  height           Int
  uploadedAt       DateTime  @default(now()) @map("uploaded_at")
  deletedAt        DateTime? @map("deleted_at")

  // 新增字段
  storageType      String    @default("local") @map("storage_type")
  tosKey           String?   @map("tos_key")
  cdnUrl           String?   @map("cdn_url")

  // Relations
  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitResults      OutfitResult[]
  processingSessions ProcessingSession[]

  @@index([userId])
  @@index([deletedAt])
  @@index([uploadedAt(sort: Desc)])
  @@index([storageType])  // 新增
  @@map("clothing_items")
}
```

**SQL Migration**:
```sql
-- Add new columns
ALTER TABLE clothing_items ADD COLUMN storage_type VARCHAR(10) NOT NULL DEFAULT 'local';
ALTER TABLE clothing_items ADD COLUMN tos_key VARCHAR(500);
ALTER TABLE clothing_items ADD COLUMN cdn_url VARCHAR(1000);

-- Add index
CREATE INDEX idx_clothing_items_storage_type ON clothing_items(storage_type);

-- Add check constraint
ALTER TABLE clothing_items ADD CONSTRAINT chk_storage_type
  CHECK (storage_type IN ('local', 'tos'));
```

---

### 3. OutfitResult (试衣结果)

**与 ModelPhoto 类似的变更**:

**新增字段**:

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `storageType` | VARCHAR(10) | NOT NULL | 'local' | 存储类型: 'local' 或 'tos' |
| `tosKey` | VARCHAR(500) | NULL | NULL | TOS 文件路径 |
| `cdnUrl` | VARCHAR(1000) | NULL | NULL | CDN 完整 URL |

**Prisma Schema**:
```prisma
model OutfitResult {
  id                 String    @id @default(uuid())
  userId             String    @map("user_id")
  modelPhotoId       String    @map("model_photo_id")
  clothingItemId     String    @map("clothing_item_id")

  // 现有字段
  resultImageUrl     String    @map("result_image_url")
  fileSize           Int       @map("file_size")
  mimeType           String    @map("mime_type")
  width              Int
  height             Int
  processingDuration Int       @map("processing_duration")
  createdAt          DateTime  @default(now()) @map("created_at")
  deletedAt          DateTime? @map("deleted_at")
  creditsUsed        Int       @default(10) @map("credits_used")
  isRetry            Boolean   @default(false) @map("is_retry")
  retryFromId        String?   @map("retry_from_id")

  // 新增字段
  storageType        String    @default("local") @map("storage_type")
  tosKey             String?   @map("tos_key")
  cdnUrl             String?   @map("cdn_url")

  // Relations
  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  modelPhoto         ModelPhoto          @relation(fields: [modelPhotoId], references: [id])
  clothingItem       ClothingItem        @relation(fields: [clothingItemId], references: [id])
  processingSessions ProcessingSession[]
  retryFrom          OutfitResult?       @relation("RetryChain", fields: [retryFromId], references: [id], onDelete: SetNull)
  retries            OutfitResult[]      @relation("RetryChain")

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@index([deletedAt])
  @@index([storageType])  // 新增
  @@map("outfit_results")
}
```

**SQL Migration**:
```sql
-- Add new columns
ALTER TABLE outfit_results ADD COLUMN storage_type VARCHAR(10) NOT NULL DEFAULT 'local';
ALTER TABLE outfit_results ADD COLUMN tos_key VARCHAR(500);
ALTER TABLE outfit_results ADD COLUMN cdn_url VARCHAR(1000);

-- Add index
CREATE INDEX idx_outfit_results_storage_type ON outfit_results(storage_type);

-- Add check constraint
ALTER TABLE outfit_results ADD CONSTRAINT chk_storage_type
  CHECK (storage_type IN ('local', 'tos'));
```

---

## 实体关系图

```
User (用户)
  |
  ├── ModelPhoto (模特照片)
  │     ├── storageType: 'local' | 'tos'
  │     ├── imageUrl: 'uploads/models/uuid.jpg' (本地) 或 'models/uuid.jpg' (TOS)
  │     ├── tosKey: 'models/uuid.jpg' (仅 TOS)
  │     └── cdnUrl: 'https://cdn.xxx.com/models/uuid.jpg' (仅 TOS)
  │
  ├── ClothingItem (衣服照片)
  │     ├── storageType: 'local' | 'tos'
  │     ├── imageUrl: 'uploads/clothing/uuid.jpg' (本地) 或 'clothing/uuid.jpg' (TOS)
  │     ├── tosKey: 'clothing/uuid.jpg' (仅 TOS)
  │     └── cdnUrl: 'https://cdn.xxx.com/clothing/uuid.jpg' (仅 TOS)
  │
  └── OutfitResult (试衣结果)
        ├── modelPhotoId → ModelPhoto
        ├── clothingItemId → ClothingItem
        ├── storageType: 'local' | 'tos'
        ├── resultImageUrl: 'uploads/results/uuid.jpg' (本地) 或 'results/uuid.jpg' (TOS)
        ├── tosKey: 'results/uuid.jpg' (仅 TOS)
        └── cdnUrl: 'https://cdn.xxx.com/results/uuid.jpg' (仅 TOS)
```

---

## 数据字段说明

### storageType (存储类型)

**值**: `'local'` | `'tos'`

**语义**:
- `'local'`: 文件存储在本地文件系统 (`uploads/` 目录)
- `'tos'`: 文件存储在火山引擎 TOS 对象存储

**默认值**: `'local'`

**用途**:
- 区分文件的存储位置
- 决定如何解析 `imageUrl` 字段
- 便于统计和管理不同存储方式的文件

### tosKey (TOS 文件路径)

**类型**: `VARCHAR(500)`, nullable

**格式**: `{category}/{uuid}.{ext}`

**示例**:
- `models/550e8400-e29b-41d4-a716-446655440000.jpg`
- `clothing/7c9e6679-7425-40de-944b-e07fc1f90ae7.webp`
- `results/9f4aa2d1-6f5e-4f0e-a8e5-6d1f8c5e3b4a.png`

**用途**:
- 唯一标识 TOS 存储桶中的文件
- 用于 TOS SDK 操作(删除、复制、归档)
- 仅当 `storageType='tos'` 时填写

**约束**:
- 当 `storageType='tos'` 时,`tosKey` 不能为空
- 当 `storageType='local'` 时,`tosKey` 应为空

### cdnUrl (CDN 访问 URL)

**类型**: `VARCHAR(1000)`, nullable

**格式**: `https://{cdn-domain}/{tosKey}`

**示例**:
- `https://cdn.virtual-try-on.com/models/550e8400-e29b-41d4-a716-446655440000.jpg`

**用途**:
- 提供给前端的图片访问 URL
- 通过 CDN 加速图片加载
- 仅当 `storageType='tos'` 时填写

**构建逻辑**:
```typescript
const cdnUrl = `${process.env.TOS_CDN_DOMAIN}/${tosKey}`;
```

### imageUrl (原有字段,语义变更)

**现有语义**: 本地文件路径 (`uploads/models/uuid.jpg`)

**新语义**:
- 当 `storageType='local'` 时: 本地文件路径 (`uploads/models/uuid.jpg`)
- 当 `storageType='tos'` 时: TOS Key (`models/uuid.jpg`,与 `tosKey` 相同)

**保留原因**: 保持向后兼容,避免破坏现有查询和逻辑

---

## 数据迁移策略

### 1. 现有数据处理

**现有记录**: 全部为本地存储,`storageType` 默认为 `'local'`

**迁移脚本**:
```sql
-- 所有现有记录自动标记为 local 存储
-- (通过 DEFAULT 'local' 自动完成,无需额外操作)

-- 验证现有记录
SELECT COUNT(*) FROM model_photos WHERE storage_type = 'local';  -- 应返回所有记录
SELECT COUNT(*) FROM model_photos WHERE tos_key IS NOT NULL;     -- 应返回 0
```

### 2. 新上传文件

**逻辑**:
- 根据环境变量 `STORAGE_TYPE` 决定存储方式
- 如果 `STORAGE_TYPE='tos'`:
  - `storageType = 'tos'`
  - `imageUrl = '{category}/{uuid}.{ext}'` (TOS Key)
  - `tosKey = '{category}/{uuid}.{ext}'`
  - `cdnUrl = 'https://{cdn-domain}/{tosKey}'`
- 如果 `STORAGE_TYPE='local'`:
  - `storageType = 'local'`
  - `imageUrl = 'uploads/{category}/{uuid}.{ext}'`
  - `tosKey = null`
  - `cdnUrl = null`

### 3. 历史数据迁移(可选,暂不实施)

**场景**: 如果需要将现有本地存储的图片迁移到 TOS

**步骤**:
1. 编写迁移脚本,遍历 `storageType='local'` 的记录
2. 读取本地文件,上传到 TOS
3. 更新数据库记录:
   ```sql
   UPDATE model_photos SET
     storage_type = 'tos',
     tos_key = 'models/{uuid}.{ext}',
     cdn_url = 'https://cdn.xxx.com/models/{uuid}.{ext}',
     image_url = 'models/{uuid}.{ext}'
   WHERE id = '{photo_id}';
   ```
4. 可选: 删除本地文件(建议保留备份一段时间)

**注意**: 本次实施范围不包括历史数据迁移,仅新上传文件使用 TOS

---

## 数据一致性约束

### 1. 业务规则约束

**规则 1**: 当 `storageType='tos'` 时,`tosKey` 和 `cdnUrl` 必须非空

```sql
-- 数据库约束(可选)
ALTER TABLE model_photos ADD CONSTRAINT chk_tos_fields
  CHECK (
    (storage_type = 'local') OR
    (storage_type = 'tos' AND tos_key IS NOT NULL AND cdn_url IS NOT NULL)
  );
```

**规则 2**: 当 `storageType='local'` 时,`tosKey` 和 `cdnUrl` 应为空

```sql
ALTER TABLE model_photos ADD CONSTRAINT chk_local_fields
  CHECK (
    (storage_type = 'tos') OR
    (storage_type = 'local' AND tos_key IS NULL AND cdn_url IS NULL)
  );
```

**规则 3**: `storageType` 只能是 'local' 或 'tos'

```sql
ALTER TABLE model_photos ADD CONSTRAINT chk_storage_type
  CHECK (storage_type IN ('local', 'tos'));
```

### 2. 应用层校验

```typescript
// Prisma 模型验证
function validateStorageFields(photo: ModelPhoto) {
  if (photo.storageType === 'tos') {
    if (!photo.tosKey || !photo.cdnUrl) {
      throw new Error('TOS 存储必须提供 tosKey 和 cdnUrl');
    }
  } else if (photo.storageType === 'local') {
    if (photo.tosKey || photo.cdnUrl) {
      throw new Error('本地存储不应有 tosKey 或 cdnUrl');
    }
  } else {
    throw new Error('无效的存储类型');
  }
}
```

---

## 查询示例

### 1. 获取用户的所有模特照片(包含 URL)

```typescript
const photos = await prisma.modelPhoto.findMany({
  where: {
    userId: userId,
    deletedAt: null,
  },
  select: {
    id: true,
    storageType: true,
    imageUrl: true,
    tosKey: true,
    cdnUrl: true,
    originalFileName: true,
    uploadedAt: true,
  },
});

// 转换为前端需要的格式
const photosWithUrl = photos.map(photo => ({
  ...photo,
  url: photo.storageType === 'tos' && photo.cdnUrl
    ? photo.cdnUrl
    : `/uploads/${photo.imageUrl}`,
}));
```

### 2. 统计不同存储类型的文件数量

```sql
SELECT
  storage_type,
  COUNT(*) as count,
  SUM(file_size) as total_size
FROM model_photos
WHERE deleted_at IS NULL
GROUP BY storage_type;
```

### 3. 查找所有 TOS 存储的图片

```sql
SELECT id, tos_key, cdn_url, file_size
FROM model_photos
WHERE storage_type = 'tos' AND deleted_at IS NULL;
```

### 4. 清理已删除超过 30 天的 TOS 文件

```typescript
// 查询需要清理的记录
const recordsToClean = await prisma.modelPhoto.findMany({
  where: {
    storageType: 'tos',
    deletedAt: {
      lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),  // 30 天前
    },
    // 确保没有被历史记录引用
    outfitResults: {
      none: {},
    },
  },
  select: {
    id: true,
    tosKey: true,
  },
});

// 删除 TOS 文件并更新数据库
for (const record of recordsToClean) {
  await tosClient.deleteObject({
    bucket: bucket,
    key: record.tosKey,
  });
  // 可选: 硬删除数据库记录
  await prisma.modelPhoto.delete({ where: { id: record.id } });
}
```

---

## TypeScript 类型定义

```typescript
// src/modules/outfit-change/types/storage.types.ts

export enum StorageType {
  LOCAL = 'local',
  TOS = 'tos',
}

export interface StorageMetadata {
  storageType: StorageType;
  imageUrl: string;  // 本地: uploads/models/uuid.jpg, TOS: models/uuid.jpg
  tosKey?: string;   // 仅 TOS: models/uuid.jpg
  cdnUrl?: string;   // 仅 TOS: https://cdn.xxx.com/models/uuid.jpg
}

export interface PhotoWithUrl extends ModelPhoto {
  url: string;  // 计算属性: 根据 storageType 返回正确的访问 URL
}
```

---

## 总结

**变更点**:
1. ✅ ModelPhoto 添加 3 个字段 + 1 个索引
2. ✅ ClothingItem 添加 3 个字段 + 1 个索引
3. ✅ OutfitResult 添加 3 个字段 + 1 个索引
4. ✅ 添加数据一致性约束
5. ✅ 保持向后兼容(默认值 'local')

**影响范围**:
- 数据库 Schema 变更(非破坏性)
- Prisma Client 类型更新
- 查询逻辑适配新字段

**下一步**: 进入 contracts/ 和 quickstart.md 生成
