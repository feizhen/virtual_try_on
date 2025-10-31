# API Contracts: TOS 图片云存储迁移

**Feature**: TOS 图片云存储迁移
**Branch**: `008-specify-scripts-bash`
**Date**: 2025-10-29

## 概述

本功能**不新增 API 端点**,复用现有的图片上传和管理 API。前端无需修改,API 契约保持不变。

---

## 现有 API 端点(保持不变)

### 1. 上传模特照片

**Endpoint**: `POST /api/outfit-change/models/upload`

**Request**:
```http
POST /api/outfit-change/models/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="model.jpg"
Content-Type: image/jpeg

[Binary image data]
--boundary
Content-Disposition: form-data; name="originalFileName"

model.jpg
--boundary--
```

**Response** (未改变,仅内部字段值变化):
```json
{
  "success": true,
  "data": {
    "id": "cuid_abc123",
    "userId": "user_id",
    "imageUrl": "models/550e8400-e29b-41d4-a716-446655440000.jpg",  // TOS 模式: TOS key; 本地模式: uploads/models/...
    "url": "https://cdn.virtual-try-on.com/models/550e8400-e29b-41d4-a716-446655440000.jpg",  // TOS 模式: CDN URL; 本地模式: /uploads/...
    "originalFileName": "model.jpg",
    "fileSize": 5242880,
    "mimeType": "image/jpeg",
    "width": 1920,
    "height": 1080,
    "uploadedAt": "2025-10-29T12:00:00Z",
    "deletedAt": null
  }
}
```

**变化说明**:
- `imageUrl` 字段: TOS 模式下为 TOS key (`models/uuid.jpg`),本地模式下为本地路径 (`uploads/models/uuid.jpg`)
- `url` 字段: TOS 模式下为 CDN URL,本地模式下为静态文件路径
- 前端只需使用 `url` 字段,无需关心存储方式

---

### 2. 获取用户模特照片列表

**Endpoint**: `GET /api/outfit-change/models`

**Request**:
```http
GET /api/outfit-change/models
Authorization: Bearer {access_token}
```

**Response** (未改变):
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_abc123",
      "imageUrl": "models/550e8400-e29b-41d4-a716-446655440000.jpg",
      "url": "https://cdn.virtual-try-on.com/models/550e8400-e29b-41d4-a716-446655440000.jpg",
      "originalFileName": "model.jpg",
      "fileSize": 5242880,
      "uploadedAt": "2025-10-29T12:00:00Z"
    },
    {
      "id": "cuid_def456",
      "imageUrl": "uploads/models/old-local-photo.jpg",  // 旧的本地存储图片
      "url": "/uploads/models/old-local-photo.jpg",
      "originalFileName": "old-photo.jpg",
      "fileSize": 3145728,
      "uploadedAt": "2025-10-20T10:00:00Z"
    }
  ]
}
```

**变化说明**:
- 同一列表可能包含 TOS 和本地存储的混合图片
- 前端只需使用 `url` 字段,自动适配不同存储方式

---

### 3. 删除模特照片

**Endpoint**: `DELETE /api/outfit-change/models/:id`

**Request**:
```http
DELETE /api/outfit-change/models/cuid_abc123
Authorization: Bearer {access_token}
```

**Response** (未改变):
```json
{
  "success": true,
  "message": "Model photo deleted successfully"
}
```

**变化说明**:
- 后端根据 `storageType` 决定是删除本地文件还是 TOS 文件
- 前端调用方式完全一致

---

### 4. 替换模特照片

**Endpoint**: `PUT /api/outfit-change/models/:id/replace`

**Request**:
```http
PUT /api/outfit-change/models/cuid_abc123/replace
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="new-model.jpg"
Content-Type: image/jpeg

[Binary image data]
--boundary--
```

**Response** (未改变):
```json
{
  "success": true,
  "data": {
    "id": "cuid_abc123",
    "imageUrl": "models/new-uuid.jpg",
    "url": "https://cdn.virtual-try-on.com/models/new-uuid.jpg",
    "version": 2,  // 版本递增
    "uploadedAt": "2025-10-29T14:00:00Z"
  }
}
```

**变化说明**:
- 旧文件根据引用情况归档到 TOS `archived/` 目录或直接删除
- 前端无需关心归档逻辑

---

### 5. 上传衣服照片

**Endpoint**: `POST /api/outfit-change/clothing/upload`

**与上传模特照片相同,仅路径不同** (`clothing/` 而非 `models/`)

---

### 6. 获取用户衣服照片列表

**Endpoint**: `GET /api/outfit-change/clothing`

**与获取模特照片列表相同**

---

### 7. 删除衣服照片

**Endpoint**: `DELETE /api/outfit-change/clothing/:id`

**与删除模特照片相同**

---

### 8. 虚拟试衣 (生成结果图片)

**Endpoint**: `POST /api/outfit-change/generate`

**Request**:
```http
POST /api/outfit-change/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "modelPhotoId": "cuid_abc123",
  "clothingItemId": "cuid_def456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "result_xyz789",
    "modelPhotoId": "cuid_abc123",
    "clothingItemId": "cuid_def456",
    "resultImageUrl": "results/result-uuid.png",  // TOS key
    "url": "https://cdn.virtual-try-on.com/results/result-uuid.png",  // CDN URL
    "fileSize": 8388608,
    "mimeType": "image/png",
    "processingDuration": 15234,  // 毫秒
    "createdAt": "2025-10-29T15:00:00Z"
  }
}
```

**变化说明**:
- 结果图片同样保存到 TOS (如果 `STORAGE_TYPE=tos`)
- 前端使用 `url` 字段加载结果图片

---

## 后端内部变化(前端无感知)

### 1. 响应字段 `url` 的生成逻辑

**旧逻辑** (本地存储):
```typescript
function buildImageUrl(imageUrl: string): string {
  return `/uploads/${imageUrl}`;  // 静态文件路径
}
```

**新逻辑** (支持 TOS):
```typescript
function buildImageUrl(photo: ModelPhoto): string {
  if (photo.storageType === 'tos' && photo.cdnUrl) {
    return photo.cdnUrl;  // CDN URL
  } else {
    return `/uploads/${photo.imageUrl}`;  // 本地路径
  }
}
```

### 2. 上传流程内部变化

**旧流程**:
1. 接收文件 → 验证 → 保存到本地文件系统 → 创建数据库记录

**新流程**:
1. 接收文件 → 验证
2. 根据 `STORAGE_TYPE` 选择存储方式:
   - `local`: 保存到本地文件系统
   - `tos`: 上传到 TOS
3. 创建数据库记录(包含 `storageType`, `tosKey`, `cdnUrl`)

**代码示例**:
```typescript
async uploadModelPhoto(userId: string, file: Express.Multer.File): Promise<ModelPhoto> {
  // 验证文件
  await this.validateFile(file.buffer);

  // 生成文件名
  const filename = `${crypto.randomUUID()}.${getExtension(file.originalname)}`;

  // 上传文件(自动选择存储方式)
  const url = await this.storageProvider.upload(file.buffer, 'models', filename);

  // 创建数据库记录
  const photo = await this.prisma.modelPhoto.create({
    data: {
      userId: userId,
      imageUrl: this.storageProvider.type === 'tos' ? `models/${filename}` : `uploads/models/${filename}`,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      // ...其他字段
      storageType: this.storageProvider.type,
      tosKey: this.storageProvider.type === 'tos' ? `models/${filename}` : null,
      cdnUrl: this.storageProvider.type === 'tos' ? url : null,
    },
  });

  return {
    ...photo,
    url: url,  // 动态生成的访问 URL
  };
}
```

---

## TypeScript 类型定义(内部使用)

```typescript
// src/modules/outfit-change/types/api-responses.ts

export interface ModelPhotoResponse {
  id: string;
  userId: string;
  imageUrl: string;  // TOS key 或本地路径
  url: string;  // 访问 URL (CDN 或静态文件)
  originalFileName?: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  uploadedAt: string;  // ISO 8601
  deletedAt?: string | null;
  version?: number;
}

export interface UploadResponse {
  success: boolean;
  data: ModelPhotoResponse;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
```

---

## 前端适配说明

### 不需要修改的部分

1. **API 调用**: 所有 API 端点路径和参数保持不变
2. **响应处理**: 响应结构不变,继续使用 `data.url` 显示图片
3. **上传组件**: `ModelUpload.tsx` 和 `ClothingUpload.tsx` 无需修改
4. **图片展示**: 直接使用 `<img src={photo.url} />`,无需判断存储类型

### 可选优化(非必需)

1. **CDN 预加载**: 对于 TOS 图片,可添加 `<link rel="preload">` 优化加载
   ```tsx
   {photos.map(photo => (
     <link key={photo.id} rel="preload" as="image" href={photo.url} />
   ))}
   ```

2. **图片懒加载**: 使用 `loading="lazy"` 属性
   ```tsx
   <img src={photo.url} loading="lazy" alt={photo.originalFileName} />
   ```

---

## 错误响应(未改变)

**文件类型不支持**:
```json
{
  "success": false,
  "error": "Unsupported file type. Please upload JPEG, PNG, or WebP images."
}
```

**文件过大**:
```json
{
  "success": false,
  "error": "File size exceeds 10MB limit."
}
```

**TOS 上传失败** (新):
```json
{
  "success": false,
  "error": "云存储服务暂时不可用,请稍后重试"
}
```
(注意: 不暴露 TOS 技术细节)

---

## 总结

**API 契约变化**: 无

**前端修改需求**: 无

**后端内部变化**:
- ✅ 存储层抽象 (IStorageProvider 接口)
- ✅ 动态 URL 生成 (根据 storageType)
- ✅ 数据库记录扩展 (新增 TOS 字段)

**向后兼容性**: 完全兼容,旧图片和新图片可共存

**下一步**: 运行 `/speckit.tasks` 生成实现任务清单
