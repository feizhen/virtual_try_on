# Research & Technical Decisions: AI-Powered Virtual Outfit Change

**Feature**: 001-ai-outfit-change
**Date**: 2025-10-18
**Phase**: Phase 0 - Research & Discovery

## Overview

This document captures research findings and technical decisions for implementing the AI-powered virtual outfit change feature.

---

## R1: AI Model Selection

### Decision
Use **Google Gemini 2.5 Flash Preview** via `@google/generative-ai` SDK

### Rationale
- **Requirement**: Feature specification explicitly requires Gemini 2.5 Flash Preview
- **Multimodal Capabilities**: Gemini supports vision and can process/generate images
- **Performance**: Flash variant optimized for speed (critical for <30s processing target)
- **API Simplicity**: Official SDK provides straightforward Node.js integration
- **Cost-Effective**: Preview/Flash models typically more affordable than Pro versions

### Alternatives Considered
- **Gemini Pro Vision**: More capable but slower and more expensive; flash variant sufficient for outfit changes
- **OpenAI DALL-E/GPT-4 Vision**: Not specified in requirements; would require architectural changes
- **Stable Diffusion (self-hosted)**: Complex infrastructure; privacy concerns; not specified

### Implementation Notes
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview' });

// Use multimodal prompts with model photo + clothing image
```

---

## R2: Image Storage Strategy

### Decision
Use **阿里云 OSS** (Alibaba Cloud Object Storage Service) with signed URLs

### Rationale
- **中国优化**: 阿里云在中国大陆有广泛的节点分布,访问速度快
- **合规性**: 符合中国数据安全和隐私法规要求
- **Scalability**: 对象存储可处理数百万张图片,无需基础设施管理
- **Cost**: 按使用付费模式;中国地区定价优惠
- **Durability**: 99.9999999999% (12个9) 数据持久性
- **CDN Integration**: 与阿里云CDN无缝集成,加速全国访问
- **Security**: 签名URL提供临时访问,不暴露存储凭证
- **SDK支持**: 官方Node.js SDK完善,支持presigned URL

### Alternatives Considered (中国环境)
- **腾讯云 COS (Cloud Object Storage)**:
  - 优点: 性能类似,价格竞争力强
  - 选择阿里云原因: 市场占有率更高,文档更完善
- **七牛云 Kodo**:
  - 优点: 针对图片处理优化
  - 缺点: 企业级支持不如阿里云/腾讯云
- **又拍云 USS**:
  - 优点: CDN性能好
  - 缺点: 规模较小,长期稳定性考虑
- **Local File System**: 不可扩展;服务器磁盘空间有限;无冗余
- **Database BLOB Storage**: PostgreSQL存图片慢,数据库膨胀,成本高

### Architecture
```
Upload Flow:
1. Frontend → Backend: Request signed upload URL
2. Backend → Aliyun OSS: Generate pre-signed PUT URL (expires in 15min)
3. Backend → Frontend: Return signed URL
4. Frontend → Aliyun OSS: Direct upload to OSS (bypasses backend for large files)
5. Frontend → Backend: Confirm upload with OSS object key
6. Backend: Save metadata to PostgreSQL

Download Flow:
1. User requests image
2. Backend generates signed GET URL (expires in 1hr)
3. Frontend displays image from signed URL (via CDN if configured)
```

### Implementation Notes
```typescript
import OSS from 'ali-oss';

// Initialize OSS client
const client = new OSS({
  region: process.env.ALIYUN_OSS_REGION, // e.g., 'oss-cn-beijing'
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_OSS_BUCKET,
});

// Generate upload URL (presigned PUT)
async function getUploadUrl(userId: string, filename: string): Promise<string> {
  const objectKey = `users/${userId}/models/${filename}`;
  const url = client.signatureUrl(objectKey, {
    method: 'PUT',
    expires: 900, // 15 minutes
    'Content-Type': 'image/jpeg',
  });
  return url;
}

// Generate download URL (presigned GET)
async function getDownloadUrl(objectKey: string): Promise<string> {
  const url = client.signatureUrl(objectKey, {
    expires: 3600, // 1 hour
  });
  return url;
}

// Alternative: Upload directly through backend (for smaller files)
async function uploadToOSS(buffer: Buffer, objectKey: string): Promise<void> {
  await client.put(objectKey, buffer);
}
```

### China-Specific Optimizations
- **CDN加速**: 配置阿里云CDN,自动就近分发,提升访问速度
- **智能压缩**: OSS支持图片处理,可实时压缩/裁剪/加水印
- **HTTPS**: 强制HTTPS访问,符合安全规范
- **访问控制**: 支持RAM(Resource Access Management)精细权限控制

---

## R3: File Upload Handling

### Decision
Use **Multer** with **memory storage** for small files, **stream processing** for large files

### Rationale
- **NestJS Integration**: Official NestJS file upload module uses Multer
- **Flexible Storage**: Supports memory, disk, and custom storage engines
- **Validation**: Built-in file type and size validation
- **Multi-file Support**: Handles multiple file uploads in single request
- **Stream Processing**: Efficient for large files (up to 10MB)

### Configuration
```typescript
@Post('upload/model')
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Invalid file type'), false);
      }
      cb(null, true);
    },
  })
)
async uploadModel(@UploadedFile() file: Express.Multer.File) {
  // Process file
}
```

### Alternatives Considered
- **FormData Parsing**: Manual parsing complex; Multer handles edge cases
- **Direct S3 Upload from Frontend**: Chosen! Used for actual file storage
- **Base64 Encoding**: Inefficient; increases payload size by ~33%

---

## R4: AI Processing Queue

### Decision
Use **Bull Queue** (Redis-backed) for asynchronous AI processing

### Rationale
- **Async Processing**: AI processing (potentially 30s) must not block API requests
- **Reliability**: Redis persistence prevents job loss on server restart
- **Retries**: Automatic retry on failure (network issues, API rate limits)
- **Concurrency Control**: Limit concurrent Gemini API calls to avoid rate limits
- **Progress Tracking**: Job status updates for frontend loading indicators
- **Priority Queue**: Prioritize certain users if needed

### Architecture
```
1. User clicks clothing item
2. Controller creates job in Bull queue
3. Controller returns immediately with processingSessionId
4. Worker picks up job from queue
5. Worker calls Gemini API with model + clothing images
6. Worker saves result to DB + S3
7. Worker updates processing session status to 'completed'
8. Frontend polls for status or uses WebSocket for updates
```

### Implementation
```typescript
import { Queue } from 'bull';

@Injectable()
export class OutfitChangeService {
  private outfitQueue: Queue;

  constructor() {
    this.outfitQueue = new Queue('outfit-processing', {
      redis: { host: 'localhost', port: 6379 },
    });
  }

  async queueOutfitChange(sessionId: string, modelUrl: string, clothingUrl: string) {
    await this.outfitQueue.add('process-outfit', {
      sessionId,
      modelUrl,
      clothingUrl,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}

// Worker
@Processor('outfit-processing')
export class OutfitProcessor {
  @Process('process-outfit')
  async handleOutfitChange(job: Job) {
    const { sessionId, modelUrl, clothingUrl } = job.data;
    // Call Gemini API...
  }
}
```

### Alternatives Considered
- **Synchronous Processing**: 30s blocking = terrible UX; ties up server threads
- **Simple setTimeout**: Job lost on server restart; no retry logic
- **Kafka/RabbitMQ**: Overkill for simple queue; higher operational complexity

---

## R5: Processing Status Tracking

### Decision
Use **Database-backed session status** with **short-polling** from frontend

### Rationale
- **Simplicity**: Polling every 2-3 seconds simple to implement; adequate for 30s jobs
- **Compatibility**: Works with all browsers; no WebSocket infrastructure needed
- **Reliability**: Database persists state; survives server restarts
- **Scale**: 100 concurrent users × 0.5 req/s = 50 req/s easily handled by PostgreSQL

### Flow
```
1. User triggers processing
2. Backend creates ProcessingSession (status: 'pending')
3. Frontend polls GET /outfit-change/sessions/:id every 2s
4. Backend worker updates status to 'processing' → 'completed'/'failed'
5. Frontend detects completion, fetches result
```

### Alternatives Considered
- **WebSockets**: Better UX but adds complexity; overkill for 30s updates
- **Server-Sent Events (SSE)**: One-way updates sufficient but adds infra
- **Long Polling**: Holds connections open; harder to scale than short polling

---

## R6: Image Format & Optimization

### Decision
- **Accept**: JPEG, PNG, WebP
- **Store**: Convert all to **JPEG (85% quality)** for models/results, **PNG** for clothing (transparency)
- **Optimize**: Use **sharp** library for server-side image processing

### Rationale
- **JPEG**: Best compression for photos; 85% quality balances size/quality
- **PNG**: Preserves transparency in clothing cutouts (if needed)
- **WebP**: Modern format with better compression (25-35% smaller) but browser compatibility
- **sharp**: Fast, production-ready, supports all formats, auto-orientation

### Processing Pipeline
```typescript
import sharp from 'sharp';

async processImage(buffer: Buffer, type: 'model' | 'clothing'): Promise<Buffer> {
  const processor = sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true });

  if (type === 'model' || type === 'result') {
    return processor.jpeg({ quality: 85 }).toBuffer();
  } else {
    return processor.png({ compressionLevel: 9 }).toBuffer();
  }
}
```

### Size Reduction Example
- Original: 10MB (4000×3000 PNG)
- After processing: ~800KB (2048×1536 JPEG 85%)
- **12x smaller** while maintaining visual quality

---

## R7: Database Schema Design

### Decision
Create 4 new tables: `model_photos`, `clothing_items`, `outfit_results`, `processing_sessions`

### Rationale
- **Normalization**: Separate concerns; each entity has single responsibility
- **Relationships**: Clear foreign keys to `users` table
- **Scalability**: Can query/index each entity independently
- **Audit Trail**: `processing_sessions` tracks all AI requests for debugging/billing

### Schema (See data-model.md for full details)
```prisma
model ModelPhoto {
  id         String @id @default(uuid())
  userId     String
  imageUrl   String  // S3 object key
  uploadedAt DateTime @default(now())
  user       User @relation(fields: [userId], references: [id])
}

model ClothingItem {
  id         String @id @default(uuid())
  userId     String
  imageUrl   String
  uploadedAt DateTime @default(now())
  user       User @relation(fields: [userId], references: [id])
}

model OutfitResult {
  id             String @id @default(uuid())
  userId         String
  modelPhotoId   String
  clothingItemId String
  resultImageUrl String
  createdAt      DateTime @default(now())
  user           User @relation(fields: [userId], references: [id])
}

model ProcessingSession {
  id             String @id @default(uuid())
  userId         String
  modelPhotoId   String
  clothingItemId String
  status         String  // 'pending' | 'processing' | 'completed' | 'failed'
  resultId       String?
  errorMessage   String?
  createdAt      DateTime @default(now())
  completedAt    DateTime?
  user           User @relation(fields: [userId], references: [id])
}
```

---

## R8: Frontend State Management

### Decision
Use **React Hooks** (`useState`, `useEffect`) + **Custom Hooks** for outfit change logic

### Rationale
- **Simplicity**: No additional libraries (Redux, Zustand) needed for feature-scoped state
- **Existing Pattern**: Project already uses hooks-based architecture
- **Performance**: Sufficient for local component state + API calls
- **Testability**: Hooks easy to test with React Testing Library

### Custom Hooks
```typescript
// useImageUpload.ts
export function useImageUpload(type: 'model' | 'clothing') {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      // Get signed URL, upload to S3, confirm with backend
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}

// useOutfitProcessing.ts
export function useOutfitProcessing() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OutfitResult | null>(null);

  const processOutfit = async (modelId: string, clothingId: string) => {
    setProcessing(true);
    const sessionId = await startProcessing(modelId, clothingId);

    // Poll for completion
    const pollInterval = setInterval(async () => {
      const session = await getSessionStatus(sessionId);
      if (session.status === 'completed') {
        setResult(session.result);
        setProcessing(false);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  return { processOutfit, processing, result };
}
```

### Alternatives Considered
- **Redux**: Overkill; adds boilerplate for simple state
- **Zustand/Jotai**: Not needed; hooks sufficient
- **React Query**: Could be beneficial for caching but not required

---

## R9: Error Handling Strategy

### Decision
Implement **multi-layer error handling** with user-friendly messages

### Layers
1. **Client-side Validation**: File type/size checks before upload
2. **Server-side Validation**: Re-validate in Multer interceptor
3. **Business Logic Errors**: Custom exceptions (ImageTooLargeException, InvalidFormatException)
4. **External API Errors**: Retry logic for Gemini API failures
5. **User Feedback**: Convert technical errors to friendly messages

### Error Messages
```typescript
// Technical error
throw new BadRequestException('File size exceeds 10MB limit');

// User-friendly message (frontend)
"Image is too large. Please upload an image smaller than 10MB."

// Gemini API failure
try {
  await geminiService.processOutfit(...);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    throw new ServiceUnavailableException('AI service is busy. Please try again in a moment.');
  }
  throw new InternalServerErrorException('Failed to process outfit change. Please try again.');
}
```

---

## R10: Security Considerations

### Decisions

1. **Authentication**: All endpoints require JWT authentication
2. **File Validation**: Strict MIME type checking + magic number verification
3. **Access Control**: Users can only access their own images
4. **Signed URLs**: Temporary access (1hr expiry) prevents URL sharing
5. **Rate Limiting**: Throttle API calls to prevent abuse
6. **Input Sanitization**: Validate all user inputs (file names, metadata)

### Implementation
```typescript
// File validation
import fileType from 'file-type';

async validateImage(buffer: Buffer) {
  const type = await fileType.fromBuffer(buffer);
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type?.mime)) {
    throw new BadRequestException('Invalid image format');
  }
}

// Access control
async getModelPhoto(photoId: string, userId: string) {
  const photo = await this.prisma.modelPhoto.findFirst({
    where: { id: photoId, userId },
  });
  if (!photo) {
    throw new NotFoundException('Photo not found');
  }
  return photo;
}

// Rate limiting (NestJS throttler)
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
@Post('process')
async processOutfit(...) { }
```

---

## Summary

All technical unknowns have been researched and resolved:

| Area | Decision | Status |
|------|----------|--------|
| AI Model | Gemini 2.5 Flash Preview | ✅ Resolved |
| Image Storage | AWS S3 with signed URLs | ✅ Resolved |
| File Upload | Multer + Direct S3 upload | ✅ Resolved |
| Processing Queue | Bull (Redis-backed) | ✅ Resolved |
| Status Tracking | DB-backed polling | ✅ Resolved |
| Image Format | JPEG/PNG with sharp | ✅ Resolved |
| Database Schema | 4 normalized tables | ✅ Resolved |
| Frontend State | React Hooks + Custom Hooks | ✅ Resolved |
| Error Handling | Multi-layer with friendly messages | ✅ Resolved |
| Security | JWT + File validation + Access control | ✅ Resolved |

**Next Phase**: Proceed to Phase 1 (Design & Contracts) to generate data models and API specifications.
