# Research: TOS 图片云存储迁移

**Feature**: TOS 图片云存储迁移
**Branch**: `008-specify-scripts-bash`
**Date**: 2025-10-29

## Research Tasks

本文档记录技术选型、最佳实践调研和设计决策。

---

## 1. TOS SDK 选型和集成方式

### Decision: 使用火山引擎官方 TOS SDK for Node.js

**选择的SDK**: `@volcengine/tos-sdk` (官方 NPM 包)

**Rationale**:
1. **官方支持**: 火山引擎提供的官方 SDK,有完整文档和技术支持
2. **TypeScript 支持**: 包含完整的 TypeScript 类型定义,与 NestJS 项目无缝集成
3. **功能完整**: 支持所有 TOS 对象存储操作(上传、下载、删除、列表、签名URL等)
4. **持续维护**: 官方团队持续更新,支持最新 TOS 特性
5. **生产验证**: 已在多个生产环境中验证,稳定性高

**Alternatives Considered**:
1. **AWS S3 SDK + TOS S3 兼容层**: 火山引擎 TOS 兼容 S3 协议,可使用 AWS SDK
   - 拒绝原因: 兼容层可能不支持所有 TOS 特性,官方 SDK 更原生
2. **直接 HTTP API 调用**: 使用 axios 直接调用 TOS REST API
   - 拒绝原因: 需要手动处理签名、重试、错误处理,复杂度高,易出错
3. **第三方社区 SDK**: 社区开发的非官方 SDK
   - 拒绝原因: 缺乏官方支持和持续维护,稳定性未知

### 集成方式

**安装**:
```bash
cd server
npm install @volcengine/tos-sdk
npm install @types/node --save-dev  # 如果缺少 Node.js 类型定义
```

**基本用法示例**:
```typescript
import TOS from '@volcengine/tos-sdk';

// 初始化客户端
const client = new TOS({
  accessKeyId: process.env.TOS_ACCESS_KEY_ID,
  accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY,
  region: process.env.TOS_REGION,  // e.g., 'cn-beijing'
  endpoint: process.env.TOS_ENDPOINT,  // e.g., 'tos-cn-beijing.volces.com'
});

// 上传文件
const uploadResult = await client.putObject({
  bucket: process.env.TOS_BUCKET,
  key: 'models/uuid.jpg',
  body: buffer,
  contentType: 'image/jpeg',
});

// 删除文件
await client.deleteObject({
  bucket: process.env.TOS_BUCKET,
  key: 'models/uuid.jpg',
});

// 生成签名 URL (CDN 场景可能不需要)
const signedUrl = await client.getPreSignedUrl({
  bucket: process.env.TOS_BUCKET,
  key: 'models/uuid.jpg',
  expires: 3600,  // 1小时有效期
});
```

---

## 2. 存储路径设计和文件命名策略

### Decision: 保持现有目录结构,使用 UUID 文件名

**路径结构**:
```
TOS Bucket: virtual-try-on-prod (示例)
├── models/          # 模特照片
│   ├── 550e8400-e29b-41d4-a716-446655440000.jpg
│   ├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8.png
│   └── ...
├── clothing/        # 衣服照片
│   ├── 7c9e6679-7425-40de-944b-e07fc1f90ae7.webp
│   └── ...
├── results/         # 试衣结果
│   ├── 9f4aa2d1-6f5e-4f0e-a8e5-6d1f8c5e3b4a.png
│   └── ...
└── archived/        # 归档文件 (被替换但被历史引用)
    ├── models/
    ├── clothing/
    └── results/
```

**文件命名**:
- 格式: `{UUID}.{extension}`
- 示例: `550e8400-e29b-41d4-a716-446655440000.jpg`
- UUID 生成: 使用 Node.js `crypto.randomUUID()` 或 Prisma 的 `@default(uuid())`

**Rationale**:
1. **一致性**: 与现有本地存储路径结构一致,便于迁移和兼容
2. **唯一性**: UUID 保证文件名全局唯一,避免冲突
3. **安全性**: 随机 UUID 避免文件名猜测和遍历攻击
4. **可扩展性**: 目录分类便于未来添加新类型(如视频、缩略图)
5. **归档支持**: archived/ 目录存储被替换但仍被引用的文件

**Alternatives Considered**:
1. **用户ID + 时间戳**: `{userId}/{timestamp}.jpg`
   - 拒绝原因: 可能泄露用户信息和上传时间,安全性较低
2. **内容哈希 (SHA256)**: `{sha256}.jpg`
   - 拒绝原因: 相同内容产生相同哈希,不支持用户上传相同图片多次的场景
3. **递增ID**: `{category}/{id}.jpg`
   - 拒绝原因: 分布式环境下生成递增ID复杂,且可被遍历

---

## 3. CDN 配置和访问策略

### Decision: TOS 绑定 CDN 域名,使用 CDN URL 访问

**CDN 架构**:
```
用户浏览器
    ↓
CDN 边缘节点 (cdn.virtual-try-on.com)
    ↓ (缓存未命中时)
TOS 源站 (tos-cn-beijing.volces.com/bucket-name)
```

**访问 URL 格式**:
- **CDN URL** (推荐): `https://cdn.virtual-try-on.com/models/uuid.jpg`
- **TOS 直接URL**: `https://bucket-name.tos-cn-beijing.volces.com/models/uuid.jpg`

**配置要点**:
1. **TOS 存储桶**: 配置为私有读写,不允许公开访问
2. **CDN 回源鉴权**: CDN 访问 TOS 时使用私钥签名,TOS 验证签名后返回文件
3. **CDN 域名绑定**: 在火山引擎控制台绑定自定义域名,配置 CNAME 记录
4. **缓存策略**: 图片文件设置长期缓存(如 1 年),减少回源请求
5. **HTTPS**: 强制使用 HTTPS,保证传输安全

**Rationale**:
1. **性能**: CDN 边缘节点就近分发,显著降低加载延迟
2. **成本**: 减少 TOS 流量费用,CDN 流量费用更低
3. **可用性**: CDN 多节点冗余,提高服务可用性
4. **安全性**: 私有存储桶 + CDN 回源鉴权,防止直接访问 TOS

**环境变量配置**:
```env
TOS_CDN_DOMAIN=https://cdn.virtual-try-on.com
TOS_BUCKET=virtual-try-on-prod
TOS_REGION=cn-beijing
TOS_ENDPOINT=tos-cn-beijing.volces.com
```

**返回给前端的 URL**:
```typescript
// 示例:存储时保存 TOS key,返回时拼接 CDN 域名
const tosKey = 'models/550e8400-e29b-41d4-a716-446655440000.jpg';
const cdnUrl = `${process.env.TOS_CDN_DOMAIN}/${tosKey}`;
// 返回: https://cdn.virtual-try-on.com/models/550e8400-e29b-41d4-a716-446655440000.jpg
```

**Alternatives Considered**:
1. **公开存储桶 + 直接访问**: TOS 桶设为公开读,直接返回 TOS URL
   - 拒绝原因: 安全风险高,无法控制访问权限,易被爬虫抓取
2. **签名 URL**: 每次访问生成临时签名 URL
   - 拒绝原因: URL 包含复杂参数,不便缓存,且有时效性限制
3. **自建 CDN 代理**: 在应用服务器层实现图片代理
   - 拒绝原因: 增加服务器负载,无法利用 CDN 的全球节点优势

---

## 4. 认证和权限管理

### Decision: AccessKey/SecretKey 认证,后端服务端认证

**认证方式**: 使用火山引擎 IAM 账号的 AccessKey/SecretKey

**权限设计**:
```
IAM 用户: virtual-try-on-service
    ↓ (授予权限)
TOS 存储桶: virtual-try-on-prod
    ↓ (允许操作)
- PutObject (上传)
- DeleteObject (删除)
- GetObject (读取,用于内部校验)
- ListObjects (可选,用于清理任务)
```

**安全最佳实践**:
1. **最小权限原则**: IAM 用户只授予必要的 TOS 操作权限,不授予其他服务权限
2. **密钥管理**: AccessKey/SecretKey 存储在环境变量,不提交到代码仓库
3. **密钥轮换**: 定期(如每 90 天)更换 AccessKey/SecretKey
4. **日志审计**: 启用 TOS 访问日志,记录所有操作便于审计
5. **网络隔离**: 生产环境服务器使用 VPC 内网访问 TOS,降低安全风险

**环境变量**:
```env
# TOS 认证
TOS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # 示例格式
TOS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # 示例格式

# 重要:生产环境使用 Railway Secrets 或 K8s ConfigMap 管理
```

**Rationale**:
1. **简单可靠**: AccessKey/SecretKey 是成熟的云服务认证方案
2. **服务端控制**: 前端不接触密钥,安全性高
3. **权限隔离**: IAM 用户独立管理,不影响其他服务
4. **便于自动化**: 适合 CI/CD 和脚本化操作

**Alternatives Considered**:
1. **临时凭证 (STS)**: 使用 STS 服务生成短期令牌
   - 拒绝原因: 增加复杂度,需要额外的 STS 服务,当前场景下收益不明显
2. **签名 URL 上传**: 前端直传时使用后端生成的签名 URL
   - 拒绝原因: 前端直传需要暴露 TOS 地址,且无法进行业务逻辑校验(如积分扣除)
3. **OAuth 2.0**: 使用 OAuth 流程授权
   - 拒绝原因: 过度设计,TOS 不支持 OAuth,且服务端认证更直接

---

## 5. 错误处理和重试策略

### Decision: SDK 内置重试 + 应用层自定义错误处理

**TOS SDK 内置重试**:
```typescript
const client = new TOS({
  accessKeyId: process.env.TOS_ACCESS_KEY_ID,
  accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY,
  region: process.env.TOS_REGION,
  endpoint: process.env.TOS_ENDPOINT,
  // 重试配置
  maxRetries: 3,  // 最大重试次数
  retryDelay: 1000,  // 重试延迟(毫秒)
  timeout: 60000,  // 请求超时(60秒,适合大文件上传)
});
```

**应用层错误分类和处理**:

| 错误类型 | HTTP 状态码 | 处理策略 | 返回给前端的消息 |
|---------|------------|---------|----------------|
| 网络错误 | - | SDK 自动重试 3 次 | "网络连接失败,请检查网络后重试" |
| 认证失败 | 403 | 记录错误日志,不重试 | "云存储服务暂时不可用,请稍后重试" |
| 存储桶不存在 | 404 | 记录严重错误,不重试 | "云存储服务配置错误,请联系管理员" |
| 权限不足 | 403 | 记录错误日志,不重试 | "云存储服务暂时不可用,请稍后重试" |
| 文件已存在 | 409 | 生成新 UUID,重试上传 | 自动处理,用户无感知 |
| 超时 | 408/504 | SDK 自动重试,超过次数返回错误 | "上传超时,请检查网络后重试" |
| 限流 | 429 | SDK 自动重试(指数退避) | "请求过于频繁,请稍后重试" |
| 服务端错误 | 500/502/503 | SDK 自动重试 | "云存储服务暂时不可用,请稍后重试" |

**错误处理代码示例**:
```typescript
async uploadToTOS(buffer: Buffer, key: string): Promise<string> {
  try {
    const result = await this.tosClient.putObject({
      bucket: this.bucket,
      key: key,
      body: buffer,
      contentType: this.getContentType(key),
    });

    this.logger.log(`TOS upload success: ${key}`);
    return this.buildCdnUrl(key);

  } catch (error) {
    this.logger.error(`TOS upload failed: ${key}`, error.stack);

    // 错误分类
    if (error.code === 'NetworkError') {
      throw new BadGatewayException('网络连接失败,请检查网络后重试');
    } else if (error.statusCode === 403) {
      // 敏感错误不暴露详情
      throw new ServiceUnavailableException('云存储服务暂时不可用,请稍后重试');
    } else if (error.statusCode === 408 || error.statusCode === 504) {
      throw new RequestTimeoutException('上传超时,请检查网络后重试');
    } else {
      // 通用错误
      throw new InternalServerErrorException('文件上传失败,请稍后重试');
    }
  }
}
```

**Rationale**:
1. **用户友好**: 错误消息简洁明了,不暴露技术细节
2. **自动恢复**: SDK 自动重试临时性错误,提高成功率
3. **安全性**: 认证错误不返回详细信息,防止信息泄露
4. **可调试性**: 详细错误日志便于开发和运维排查问题

---

## 6. 性能优化策略

### Decision: 流式上传 + 并发控制 + CDN 缓存

**优化措施**:

1. **流式上传(对于大文件)**:
   ```typescript
   // 如果未来支持视频等大文件,使用流式上传
   import { createReadStream } from 'fs';

   const stream = createReadStream(filePath);
   await client.putObject({
     bucket: this.bucket,
     key: key,
     body: stream,  // 使用流而非 Buffer
   });
   ```

2. **并发上传限制**:
   ```typescript
   // 使用 NestJS Bull 队列控制并发
   import { Queue } from 'bull';

   @Processor('tos-upload')
   export class TosUploadProcessor {
     // 限制并发为 10,避免过载
     @Process({ concurrency: 10 })
     async handleUpload(job: Job) {
       await this.tosStorageProvider.upload(job.data.buffer, job.data.key);
     }
   }
   ```

3. **CDN 缓存配置**:
   - 图片文件: `Cache-Control: public, max-age=31536000, immutable` (1年)
   - 文件不会修改(UUID 唯一),可永久缓存
   - 如果文件被替换,UUID 会变化,自动失效旧缓存

4. **压缩传输**:
   ```typescript
   // TOS SDK 自动支持 gzip 压缩
   await client.putObject({
     bucket: this.bucket,
     key: key,
     body: buffer,
     contentEncoding: 'gzip',  // 启用 gzip 压缩
   });
   ```

5. **连接池复用**:
   ```typescript
   // TOS Client 实例全局单例,复用连接池
   @Injectable()
   export class TosStorageProvider {
     private readonly tosClient: TOS;

     constructor() {
       this.tosClient = new TOS({
         // ... 配置
         maxConnections: 100,  // 连接池大小
         keepAlive: true,  // 保持连接
       });
     }
   }
   ```

**性能目标验证**:
- 上传 5MB 图片 P95 延迟 ≤ 8秒
- CDN 访问 TTFB ≤ 200ms
- 支持 10+ 并发上传/秒

---

## 7. 本地存储和 TOS 的兼容性设计

### Decision: 抽象存储接口,通过环境变量切换

**存储接口定义**:
```typescript
// storage-provider.interface.ts
export interface IStorageProvider {
  /**
   * 上传文件
   * @param buffer 文件内容
   * @param category 分类 (models/clothing/results)
   * @param filename 文件名 (UUID.ext)
   * @returns 访问 URL
   */
  upload(buffer: Buffer, category: string, filename: string): Promise<string>;

  /**
   * 删除文件
   * @param key 文件路径 (category/filename)
   */
  delete(key: string): Promise<void>;

  /**
   * 归档文件 (移动到 archived/ 目录)
   * @param key 原文件路径
   * @returns 归档后的路径
   */
  archive(key: string): Promise<string>;

  /**
   * 检查文件是否存在
   * @param key 文件路径
   */
  exists(key: string): Promise<boolean>;
}
```

**实现类**:
```typescript
// local-storage.provider.ts
@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  async upload(buffer: Buffer, category: string, filename: string): Promise<string> {
    const filePath = `uploads/${category}/${filename}`;
    await fs.writeFile(filePath, buffer);
    return `/uploads/${category}/${filename}`;  // 返回静态文件 URL
  }

  async delete(key: string): Promise<void> {
    await fs.unlink(`uploads/${key}`);
  }

  async archive(key: string): Promise<string> {
    const archivedKey = `archived/${key}`;
    await fs.rename(`uploads/${key}`, `uploads/${archivedKey}`);
    return archivedKey;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(`uploads/${key}`);
      return true;
    } catch {
      return false;
    }
  }
}

// tos-storage.provider.ts
@Injectable()
export class TosStorageProvider implements IStorageProvider {
  private readonly tosClient: TOS;
  private readonly bucket: string;
  private readonly cdnDomain: string;

  constructor(private configService: ConfigService) {
    this.tosClient = new TOS({
      accessKeyId: configService.get('TOS_ACCESS_KEY_ID'),
      accessKeySecret: configService.get('TOS_SECRET_ACCESS_KEY'),
      region: configService.get('TOS_REGION'),
      endpoint: configService.get('TOS_ENDPOINT'),
    });
    this.bucket = configService.get('TOS_BUCKET');
    this.cdnDomain = configService.get('TOS_CDN_DOMAIN');
  }

  async upload(buffer: Buffer, category: string, filename: string): Promise<string> {
    const key = `${category}/${filename}`;
    await this.tosClient.putObject({
      bucket: this.bucket,
      key: key,
      body: buffer,
    });
    return `${this.cdnDomain}/${key}`;  // 返回 CDN URL
  }

  async delete(key: string): Promise<void> {
    await this.tosClient.deleteObject({
      bucket: this.bucket,
      key: key,
    });
  }

  async archive(key: string): Promise<string> {
    const archivedKey = `archived/${key}`;
    await this.tosClient.copyObject({
      srcBucket: this.bucket,
      srcKey: key,
      destBucket: this.bucket,
      destKey: archivedKey,
    });
    await this.delete(key);
    return archivedKey;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.tosClient.headObject({
        bucket: this.bucket,
        key: key,
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

**动态选择存储实现**:
```typescript
// storage.module.ts
@Module({
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local');
        if (storageType === 'tos') {
          return new TosStorageProvider(configService);
        } else {
          return new LocalStorageProvider();
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['STORAGE_PROVIDER'],
})
export class StorageModule {}
```

**环境变量配置**:
```env
# 开发环境: 使用本地存储
STORAGE_TYPE=local

# 生产环境: 使用 TOS
STORAGE_TYPE=tos
TOS_ACCESS_KEY_ID=xxx
TOS_SECRET_ACCESS_KEY=xxx
TOS_REGION=cn-beijing
TOS_ENDPOINT=tos-cn-beijing.volces.com
TOS_BUCKET=virtual-try-on-prod
TOS_CDN_DOMAIN=https://cdn.virtual-try-on.com
```

**Rationale**:
1. **平滑迁移**: 开发环境使用本地存储,生产环境使用 TOS,无需修改代码
2. **测试友好**: 单元测试可以 mock IStorageProvider,无需依赖真实 TOS
3. **可扩展性**: 未来支持其他云存储(S3, OSS)只需实现接口,无需修改业务逻辑
4. **回滚容易**: 如果 TOS 出现问题,修改环境变量即可回滚到本地存储

---

## 8. 数据库 Schema 变更策略

### Decision: 添加可选字段,保持向后兼容

**Prisma Schema 变更**:
```prisma
model ModelPhoto {
  id                 String    @id @default(uuid())
  userId             String    @map("user_id")

  // 现有字段 (保持不变)
  imageUrl           String    @map("image_url")  // 本地: uploads/models/uuid.jpg, TOS: models/uuid.jpg
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

  // 新增字段 (可选,用于 TOS)
  storageType        String    @default("local") @map("storage_type")  // 'local' | 'tos'
  tosKey             String?   @map("tos_key")  // TOS 文件路径,如: models/uuid.jpg
  cdnUrl             String?   @map("cdn_url")  // CDN 完整 URL,如: https://cdn.xxx.com/models/uuid.jpg

  // Relations (保持不变)
  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitResults      OutfitResult[]
  processingSessions ProcessingSession[]

  @@index([userId])
  @@index([deletedAt])
  @@index([uploadedAt(sort: Desc)])
  @@index([storageType])  // 新增索引,便于查询不同存储类型
  @@map("model_photos")
}

// ClothingItem 和 OutfitResult 同样添加这三个字段
```

**迁移策略**:
```typescript
// 数据库迁移脚本
// 1. 添加新字段(可选,默认值 local)
ALTER TABLE model_photos ADD COLUMN storage_type VARCHAR(10) DEFAULT 'local';
ALTER TABLE model_photos ADD COLUMN tos_key VARCHAR(500);
ALTER TABLE model_photos ADD COLUMN cdn_url VARCHAR(1000);

// 2. 创建索引
CREATE INDEX idx_model_photos_storage_type ON model_photos(storage_type);

// 同样应用到 clothing_items 和 outfit_results 表
```

**向后兼容性保证**:
1. **默认值**: storageType 默认为 'local',现有记录自动兼容
2. **可选字段**: tosKey 和 cdnUrl 为可选,现有记录无需填写
3. **渐进迁移**: 新上传文件使用 TOS,现有文件继续使用本地路径
4. **URL 兼容**: imageUrl 字段保留,根据 storageType 动态解析

**查询逻辑**:
```typescript
// 获取图片 URL
function getImageUrl(photo: ModelPhoto): string {
  if (photo.storageType === 'tos' && photo.cdnUrl) {
    return photo.cdnUrl;  // TOS: 返回 CDN URL
  } else {
    return `/uploads/${photo.imageUrl}`;  // Local: 返回静态文件路径
  }
}
```

**Rationale**:
1. **非破坏性**: 不删除或重命名现有字段,避免破坏现有逻辑
2. **渐进式**: 允许本地和 TOS 存储并存,逐步迁移
3. **可回滚**: 如果 TOS 迁移失败,可以继续使用本地存储
4. **清晰标识**: storageType 字段明确标识存储方式,便于管理

---

## 9. 测试策略

### Decision: 单元测试 + 集成测试 + 手动回归测试

**测试层次**:

1. **单元测试** (Jest):
   ```typescript
   // local-storage.provider.spec.ts
   describe('LocalStorageProvider', () => {
     it('should upload file to local filesystem', async () => {
       const provider = new LocalStorageProvider();
       const buffer = Buffer.from('test image');
       const url = await provider.upload(buffer, 'models', 'test.jpg');
       expect(url).toBe('/uploads/models/test.jpg');
       // 验证文件实际存在
     });

     it('should delete file from local filesystem', async () => {
       // ... 测试删除逻辑
     });
   });

   // tos-storage.provider.spec.ts
   describe('TosStorageProvider', () => {
     let provider: TosStorageProvider;
     let mockTosClient: jest.Mocked<TOS>;

     beforeEach(() => {
       mockTosClient = {
         putObject: jest.fn(),
         deleteObject: jest.fn(),
       } as any;
       provider = new TosStorageProvider(mockTosClient, 'bucket', 'cdn');
     });

     it('should upload file to TOS', async () => {
       mockTosClient.putObject.mockResolvedValue({ statusCode: 200 });
       const url = await provider.upload(Buffer.from('test'), 'models', 'test.jpg');
       expect(url).toBe('https://cdn/models/test.jpg');
       expect(mockTosClient.putObject).toHaveBeenCalledWith({
         bucket: 'bucket',
         key: 'models/test.jpg',
         body: expect.any(Buffer),
       });
     });
   });
   ```

2. **集成测试** (手动或 E2E):
   - 测试完整上传流程: 前端 → API → Storage → TOS
   - 测试图片访问: 前端请求 CDN URL → 图片正常显示
   - 测试删除流程: 软删除 → TOS 文件删除
   - 测试替换流程: 归档旧文件 → 上传新文件

3. **手动回归测试清单**:
   - [ ] 上传新模特照片(JPEG) → 验证 TOS 存储 + CDN 访问
   - [ ] 上传新衣服照片(PNG) → 验证 TOS 存储 + CDN 访问
   - [ ] 虚拟试衣生成结果 → 验证结果图片保存到 TOS
   - [ ] 删除未使用的照片 → 验证 TOS 文件删除
   - [ ] 删除已使用的照片 → 验证软删除,TOS 文件保留
   - [ ] 替换照片 → 验证归档和新文件上传
   - [ ] 查看历史记录 → 验证归档文件仍可访问
   - [ ] 切换 STORAGE_TYPE=local → 验证回退到本地存储

**Rationale**:
1. **快速反馈**: 单元测试快速验证核心逻辑
2. **真实环境**: 集成测试验证与 TOS 的实际交互
3. **用户视角**: 手动测试确保端到端功能正常

---

## 10. 部署和运维考虑

### Decision: 环境变量配置 + 监控告警 + 日志审计

**部署步骤**:
1. **TOS 准备**:
   - 在火山引擎控制台创建 TOS 存储桶
   - 配置 IAM 用户和访问密钥
   - 绑定 CDN 加速域名
   - 配置 CDN 回源鉴权

2. **应用部署**:
   ```bash
   # 1. 安装依赖
   npm install @volcengine/tos-sdk

   # 2. 数据库迁移
   npx prisma migrate deploy

   # 3. 配置环境变量 (Railway Secrets)
   STORAGE_TYPE=tos
   TOS_ACCESS_KEY_ID=xxx
   TOS_SECRET_ACCESS_KEY=xxx
   TOS_REGION=cn-beijing
   TOS_ENDPOINT=tos-cn-beijing.volces.com
   TOS_BUCKET=virtual-try-on-prod
   TOS_CDN_DOMAIN=https://cdn.virtual-try-on.com

   # 4. 部署应用
   npm run build
   npm run start:prod
   ```

3. **验证清单**:
   - [ ] TOS 连接成功(测试上传)
   - [ ] CDN 域名解析正确
   - [ ] 环境变量正确加载
   - [ ] 数据库迁移完成
   - [ ] 日志正常输出

**监控和告警**:
```typescript
// 监控指标
- TOS 上传成功率 (目标: ≥99.5%)
- TOS 上传延迟 P95 (目标: ≤8秒)
- TOS API 错误率 (告警阈值: >1%)
- CDN 访问 TTFB (目标: ≤200ms)
- 存储空间使用量 (告警阈值: >80%)

// 告警规则
if (tosUploadErrorRate > 0.01) {
  alert('TOS 上传错误率过高,请检查服务状态');
}
if (tosStorageUsage > 0.8) {
  alert('TOS 存储空间使用超过 80%,请扩容');
}
```

**日志审计**:
```typescript
// 记录所有 TOS 操作
logger.log({
  action: 'TOS_UPLOAD',
  userId: user.id,
  key: tosKey,
  fileSize: buffer.length,
  duration: Date.now() - startTime,
  success: true,
});

logger.error({
  action: 'TOS_UPLOAD_FAILED',
  userId: user.id,
  key: tosKey,
  error: error.message,
  errorCode: error.code,
});
```

**Rationale**:
1. **可观测性**: 监控和日志便于快速定位问题
2. **可靠性**: 告警机制确保及时发现和处理故障
3. **安全审计**: 日志记录所有操作,满足合规要求

---

## 总结

所有技术决策已完成:

1. ✅ TOS SDK 选型: `@volcengine/tos-sdk`
2. ✅ 文件路径设计: `{category}/{uuid}.{ext}`
3. ✅ CDN 配置: TOS 绑定 CDN 域名,使用 CDN URL 访问
4. ✅ 认证方式: AccessKey/SecretKey,环境变量管理
5. ✅ 错误处理: SDK 重试 + 应用层分类处理
6. ✅ 性能优化: 流式上传 + 并发控制 + CDN 缓存
7. ✅ 存储兼容性: 抽象接口,环境变量切换
8. ✅ Schema 变更: 添加可选字段,保持向后兼容
9. ✅ 测试策略: 单元 + 集成 + 手动回归
10. ✅ 部署运维: 环境变量 + 监控告警 + 日志审计

**下一步**: 进入 Phase 1,生成数据模型和 API 契约文档。
