# Research: 虚拟试衣模态与服装上传选择界面

**Feature**: 004-upload-modal-redesign
**Date**: 2025-10-22
**Purpose**: 解决 Technical Context 中的 NEEDS CLARIFICATION 项,并研究技术实现的最佳实践

## Research Questions

本研究解决以下未明确的技术决策:

1. **图片存储方案**: 云存储 (OSS/S3) vs 本地文件系统
2. **E2E测试框架**: Playwright vs Cypress
3. **TDD要求**: 是否强制测试先行
4. **文件上传最佳实践**: React + NestJS + Multer
5. **AI虚拟试衣引擎集成方案**

---

## 1. 图片存储方案

### Decision: **本地文件系统 (Phase 1) → 云存储 (Phase 2)**

### Rationale:

**选择本地文件系统作为MVP方案**:
- ✅ **快速实现**: 无需额外配置云服务,立即可用
- ✅ **开发简单**: NestJS内置 `@nestjs/platform-express` + `multer` 支持本地存储
- ✅ **成本控制**: 开发阶段无额外云服务费用
- ✅ **符合MVP原则**: 规格说明中假设的中小型应用规模

**Phase 2 迁移到云存储的触发条件**:
- 单服务器存储超过 10GB
- 需要CDN加速图片加载
- 多服务器部署需要共享存储

### Implementation Approach:

```typescript
// NestJS 配置示例
// server/src/modules/upload/upload.module.ts
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

MulterModule.register({
  storage: diskStorage({
    destination: './uploads',  // 本地存储路径
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB limit
  },
});
```

**存储结构**:
```
uploads/
├── garments/          # 服装图片
│   ├── thumbnails/    # 缩略图 (200x200)
│   └── originals/     # 原图
├── models/            # 模特图片
├── scenes/            # 场景图片
└── tryon-results/     # 试衣效果图
```

### Alternatives Considered:

| 方案 | 优点 | 缺点 | 为何不选 |
|------|------|------|----------|
| **AWS S3** | 高可用、CDN集成、无限扩展 | 需配置IAM、有成本、增加复杂度 | MVP阶段过度设计 |
| **阿里云OSS** | 国内速度快、价格合理 | 需账号配置、增加依赖 | 同上 |
| **MinIO** | 自托管、S3兼容、无外部依赖 | 需额外部署、维护成本 | MVP阶段资源有限 |

### Future Migration Path:

```typescript
// Phase 2: 云存储适配器模式
interface StorageAdapter {
  upload(file: Express.Multer.File): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

class LocalStorageAdapter implements StorageAdapter { /* ... */ }
class S3StorageAdapter implements StorageAdapter { /* ... */ }

// 通过配置切换
const storage = config.get('STORAGE_TYPE') === 's3'
  ? new S3StorageAdapter()
  : new LocalStorageAdapter();
```

---

## 2. E2E测试框架

### Decision: **Playwright**

### Rationale:

**选择 Playwright 的原因**:
- ✅ **现代化**: 由 Microsoft 维护,专为现代Web应用设计
- ✅ **多浏览器支持**: 原生支持 Chromium/Firefox/WebKit (规格要求Chrome/Safari/Firefox)
- ✅ **并行执行**: 内置并行测试,速度快
- ✅ **文件上传测试**: `page.setInputFiles()` API 简洁易用
- ✅ **自动等待**: 智能等待元素可交互,减少flaky tests
- ✅ **Trace Viewer**: 强大的调试工具,可回放测试过程

**关键测试场景适配性**:
```typescript
// 测试文件上传 (Playwright API)
test('上传服装图片', async ({ page }) => {
  await page.goto('/virtual-tryon');
  await page.click('[data-testid="garment-upload-zone"]');

  // 模拟文件选择
  await page.setInputFiles('input[type="file"]', {
    name: 'test-garment.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(testImageData),
  });

  // 验证上传进度和结果
  await expect(page.locator('.upload-progress')).toBeVisible();
  await expect(page.locator('[data-testid="garment-card"]')).toContainText('test-garment');
});
```

### Alternatives Considered:

| 方案 | 优点 | 缺点 | 为何不选 |
|------|------|------|----------|
| **Cypress** | 成熟生态、丰富插件、时间旅行调试 | 仅Chromium系,文件上传复杂,运行较慢 | 不满足多浏览器要求 |
| **Puppeteer** | 轻量、仅Chromium | 无多浏览器支持,需手动处理等待 | 功能不足 |
| **Selenium** | 老牌工具、语言多样 | 配置复杂、速度慢、API笨重 | 过时技术 |

### Implementation Notes:

```bash
# 安装 Playwright
pnpm add -D @playwright/test
npx playwright install  # 安装浏览器

# playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 3. TDD (测试驱动开发) 要求

### Decision: **推荐但不强制**

### Rationale:

**采用灵活的测试策略**:
- ✅ **关键路径强制TDD**: 文件上传、AI试衣调用、数据持久化等核心功能必须先写测试
- ✅ **UI组件建议TDD**: 使用 Vitest + React Testing Library,先定义组件行为
- ⚠️ **样式调整不强制**: CSS调整、视觉效果微调可后补测试
- ✅ **API契约先行**: 后端API必须先定义OpenAPI规范,再实现 (类似TDD思想)

**必须TDD的模块**:
1. **文件上传服务** (`upload.service.ts`): 涉及文件系统操作,易出错
2. **图片验证管道** (`file-validation.pipe.ts`): 安全关键
3. **AI试衣服务** (`tryon-ai.service.ts`): 外部API集成,需mock测试
4. **Garment CRUD** (`garment.service.ts`): 数据一致性保证

**测试覆盖率目标**:
- 后端服务层: ≥80%
- 前端工具函数: ≥80%
- UI组件: ≥60% (重点测试交互逻辑)
- E2E: 覆盖5个核心用户故事 (Spec中的P1+P2)

### Test-First Example:

```typescript
// 先写测试: garment.service.spec.ts
describe('GarmentService', () => {
  it('应拒绝超过10MB的文件', async () => {
    const largeFile = createMockFile(11 * 1024 * 1024);
    await expect(service.uploadGarment(largeFile))
      .rejects.toThrow('File size exceeds 10MB');
  });

  it('应生成缩略图', async () => {
    const file = createMockFile(2 * 1024 * 1024);
    const result = await service.uploadGarment(file);
    expect(result.thumbnailUrl).toBeDefined();
    expect(await fs.pathExists(result.thumbnailUrl)).toBe(true);
  });
});

// 然后实现: garment.service.ts
@Injectable()
export class GarmentService {
  async uploadGarment(file: Express.Multer.File) {
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB');
    }
    const thumbnail = await this.generateThumbnail(file);
    return { originalUrl: file.path, thumbnailUrl: thumbnail.path };
  }
}
```

---

## 4. 文件上传最佳实践 (React + NestJS)

### Decision: **FormData + Axios + Multer + Progress Tracking**

### Rationale:

**前端实现** (React + Axios):
```typescript
// client/src/utils/fileUpload.ts
export async function uploadGarmentImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<GarmentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<GarmentUploadResponse>(
    '/garments/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percent);
        }
      },
    }
  );

  return response.data;
}
```

**后端实现** (NestJS + Multer):
```typescript
// server/src/modules/upload/upload.controller.ts
@Controller('garments')
export class GarmentController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadGarment(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Req() req,
  ) {
    return this.garmentService.uploadGarment(file, req.user.id);
  }
}

// FileValidationPipe: 验证文件类型和大小
export class FileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
    if (value.size > 10 * 1024 * 1024) {
      throw new PayloadTooLargeException('File size exceeds 10MB');
    }
    return value;
  }
}
```

**关键实践**:
1. ✅ **客户端验证**: 在上传前检查文件类型和大小,提早反馈
2. ✅ **服务端验证**: 使用Pipe进行二次验证,防止恶意绕过
3. ✅ **进度追踪**: Axios的 `onUploadProgress` 提供实时进度
4. ✅ **缩略图生成**: 使用Sharp库在服务端生成缩略图
5. ✅ **错误处理**: 统一错误格式,前端显示友好提示

---

## 5. AI虚拟试衣引擎集成方案

### Decision: **Google Gemini Vision API (Phase 1) + 可扩展架构**

### Rationale:

**选择 Google Gemini Vision 的原因**:
- ✅ **多模态能力**: 支持图像输入和生成 (模特图 + 服装图 → 试衣效果图)
- ✅ **已有依赖**: 项目中已安装 `@google/generative-ai: ^0.24.1`
- ✅ **成本合理**: 免费额度足够开发测试,按需付费
- ✅ **快速原型**: API简单,可快速验证MVP
- ⚠️ **性能限制**: 生成时间可能超过2秒目标,需优化或缓存

**架构设计** (适配器模式,便于切换AI引擎):

```typescript
// server/src/modules/tryon/tryon-ai.interface.ts
export interface TryOnAIProvider {
  generateTryOnImage(
    modelImageUrl: string,
    garmentImageUrl: string,
    sceneImageUrl?: string,
  ): Promise<TryOnResult>;
}

export interface TryOnResult {
  resultImageUrl: string;
  processingTimeMs: number;
  confidence?: number;
}

// server/src/modules/tryon/gemini-tryon.service.ts
@Injectable()
export class GeminiTryOnService implements TryOnAIProvider {
  private readonly genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      configService.get('GEMINI_API_KEY')
    );
  }

  async generateTryOnImage(
    modelImageUrl: string,
    garmentImageUrl: string,
    sceneImageUrl?: string,
  ): Promise<TryOnResult> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `
      Generate a photorealistic image of the person wearing the clothing item.
      Person image: ${modelImageUrl}
      Clothing image: ${garmentImageUrl}
      ${sceneImageUrl ? `Background scene: ${sceneImageUrl}` : ''}

      Requirements:
      - Maintain the person's pose and body structure
      - Naturally fit the clothing onto the person
      - Preserve lighting and shadows
      - High quality, realistic rendering
    `;

    const startTime = Date.now();
    const result = await model.generateContent([prompt, /* image data */]);
    const processingTime = Date.now() - startTime;

    // 保存生成的图片到本地存储
    const resultImageUrl = await this.saveGeneratedImage(result);

    return {
      resultImageUrl,
      processingTimeMs: processingTime,
    };
  }
}

// server/src/modules/tryon/tryon.service.ts (门面模式)
@Injectable()
export class TryOnService {
  constructor(
    @Inject('AI_PROVIDER') private aiProvider: TryOnAIProvider,
    private garmentService: GarmentService,
    private modelService: ModelService,
  ) {}

  async createTryOnSession(dto: CreateTryOnDto, userId: string) {
    const model = await this.modelService.findOne(dto.modelId);
    const garment = await this.garmentService.findOne(dto.garmentId);

    // 调用AI引擎
    const result = await this.aiProvider.generateTryOnImage(
      model.imageUrl,
      garment.imageUrl,
      dto.sceneId ? (await this.sceneService.findOne(dto.sceneId)).imageUrl : undefined,
    );

    // 保存试衣会话记录
    return this.prisma.tryOnSession.create({
      data: {
        userId,
        modelId: dto.modelId,
        garmentId: dto.garmentId,
        sceneId: dto.sceneId,
        resultImageUrl: result.resultImageUrl,
        processingTimeMs: result.processingTimeMs,
      },
    });
  }
}
```

**Provider配置** (便于切换):
```typescript
// server/src/modules/tryon/tryon.module.ts
@Module({
  providers: [
    {
      provide: 'AI_PROVIDER',
      useClass: GeminiTryOnService,  // 可切换为其他Provider
    },
    TryOnService,
  ],
})
export class TryOnModule {}
```

### Alternative AI Providers (Future):

| 提供商 | 优点 | 缺点 | 使用场景 |
|--------|------|------|----------|
| **Gemini Vision** | 多模态、已集成 | 生成质量未知 | MVP快速验证 |
| **Stable Diffusion** | 开源、可自托管、高质量 | 需GPU资源、部署复杂 | 自主可控、定制化 |
| **Replicate API** | 预训练模型多、即开即用 | 按次计费较贵 | 快速试验不同模型 |
| **专业试衣AI** (如VITON) | 专门优化、效果最佳 | 可能需商业授权 | 生产环境最终方案 |

### Performance Optimization:

为满足 "2秒内生成试衣效果" 的成功标准:

1. **异步处理 + Bull Queue**:
   ```typescript
   // 用户提交试衣请求 → 立即返回 sessionId
   // 后台队列处理 AI 生成 → WebSocket 推送结果
   @Processor('tryon-queue')
   export class TryOnProcessor {
     @Process('generate')
     async handleGeneration(job: Job<TryOnJobData>) {
       const result = await this.aiProvider.generateTryOnImage(...);
       // 通过WebSocket推送给前端
       this.socketGateway.emit(job.data.userId, 'tryon-complete', result);
     }
   }
   ```

2. **结果缓存**:
   ```typescript
   // 相同模特+服装组合,直接返回缓存结果
   const cacheKey = `tryon:${modelId}:${garmentId}:${sceneId}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

3. **预生成**: 用户上传服装后,后台预生成与默认模特的试衣效果

---

## Summary

### Final Technology Stack:

```yaml
Storage:
  - Phase 1: Local filesystem (./uploads)
  - Phase 2: Cloud storage (S3/OSS) with adapter pattern

Testing:
  - E2E: Playwright (multi-browser, modern API)
  - Unit: Vitest (frontend), Jest (backend)
  - Strategy: TDD for critical paths, flexible for UI

File Upload:
  - Frontend: React + FormData + Axios (progress tracking)
  - Backend: NestJS + Multer + Sharp (thumbnail generation)
  - Validation: Client-side + Server-side double check

AI Integration:
  - Provider: Google Gemini Vision API
  - Architecture: Provider interface (easy to swap)
  - Optimization: Bull Queue + Redis caching + WebSocket
```

### Resolved Clarifications:

| Original Question | Resolution |
|-------------------|------------|
| 图片存储: OSS/S3 or 本地? | **本地文件系统** (MVP), 预留云存储迁移路径 |
| E2E框架: Playwright or Cypress? | **Playwright** (多浏览器支持,文件上传友好) |
| TDD强制要求? | **关键路径强制,UI组件推荐**, 覆盖率目标: 服务≥80%, UI≥60% |

### Dependencies to Add:

**Frontend**:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^1.0.0"
  }
}
```

**Backend**:
```json
{
  "dependencies": {
    "sharp": "^0.34.4",  // 已安装
    "@nestjs/bull": "^11.0.4",  // 已安装
    "bull": "^4.16.5"  // 已安装
  }
}
```

### Next Steps:

1. ✅ Phase 0 完成: 所有技术决策已明确
2. ➡️ Phase 1: 生成 data-model.md (定义Garment/Model/Scene/TryOnSession实体)
3. ➡️ Phase 1: 生成 API contracts (OpenAPI规范)
4. ➡️ Phase 1: 生成 quickstart.md (开发者快速上手指南)
