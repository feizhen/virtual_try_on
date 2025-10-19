# Quickstart Guide: AI-Powered Virtual Outfit Change

**Feature**: 001-ai-outfit-change
**Date**: 2025-10-18
**Audience**: Developers implementing this feature

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- AWS S3 bucket or Google Cloud Storage configured
- Google Gemini API key obtained
- Redis server running (for Bull queue)
- Existing virtual_try_on project cloned

---

## Environment Setup

### 1. Backend Configuration

Add to `server/.env`:

```env
# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# 阿里云 OSS Configuration (针对中国部署)
ALIYUN_OSS_REGION=oss-cn-beijing
ALIYUN_ACCESS_KEY_ID=your-aliyun-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-aliyun-access-key-secret
ALIYUN_OSS_BUCKET=your-oss-bucket-name
ALIYUN_OSS_ENDPOINT=oss-cn-beijing.aliyuncs.com

# Optional: 阿里云 CDN (可选,用于加速访问)
# ALIYUN_CDN_DOMAIN=your-cdn-domain.com

# Redis (for Bull queue) - 可使用阿里云Redis或自建
REDIS_HOST=localhost
REDIS_PORT=6379
# 阿里云Redis示例:
# REDIS_HOST=r-xxxxx.redis.rds.aliyuncs.com
# REDIS_PORT=6379
# REDIS_PASSWORD=your-redis-password
```

### 2. Install Dependencies

```bash
# Backend (针对中国云服务)
cd server
npm install @google/generative-ai ali-oss bull @nestjs/bull sharp multer @types/multer file-type

# Frontend (if new dependencies needed)
cd ../client
pnpm install
```

---

## Database Migration

### 1. Update Prisma Schema

Copy the schema from `data-model.md` and add to `server/prisma/schema.prisma`.

### 2. Generate Migration

```bash
cd server
npx prisma migrate dev --name add_outfit_change_tables
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Verify Schema

```bash
npx prisma studio
# Opens browser UI to inspect database schema
```

---

## Implementation Steps

### Phase 1: Backend Core (Days 1-3)

#### Day 1: Database & Storage

1. **Apply migrations** (done above)

2. **Create storage service**:
   ```bash
   cd server/src/modules
   nest g module outfit-change
   nest g service outfit-change/storage
   ```

3. **Implement 阿里云OSS client** in `storage.service.ts`:
   - Initialize OSS client with region/credentials
   - Generate signed upload URLs (presigned PUT)
   - Generate signed download URLs (presigned GET)
   - Upload processed images to OSS

#### Day 2: File Upload

1. **Create DTOs**:
   ```bash
   mkdir server/src/modules/outfit-change/dto
   # Create upload-model.dto.ts, upload-clothing.dto.ts
   ```

2. **Create controller endpoints**:
   ```bash
   nest g controller outfit-change
   ```

3. **Implement upload flow**:
   - POST `/models/upload-url`
   - POST `/models/confirm`
   - Same for `/clothing/*`

4. **Add Multer file validation**

#### Day 3: AI Integration

1. **Create Gemini service**:
   ```bash
   nest g service outfit-change/gemini
   ```

2. **Implement Gemini API calls**:
   - Initialize Google Generative AI client
   - Create multimodal prompts
   - Process model + clothing images
   - Generate outfit change

3. **Create Bull queue**:
   - Setup queue module
   - Create processor
   - Implement retry logic

### Phase 2: Backend API (Days 4-5)

#### Day 4: Processing Endpoints

1. **Implement POST `/process`**:
   - Validate inputs
   - Create processing session
   - Enqueue job
   - Return session ID

2. **Implement GET `/sessions/:id`**:
   - Query session status
   - Return result if completed

3. **Create worker processor**:
   - Download images from S3
   - Call Gemini API
   - Upload result to S3
   - Update session status

#### Day 5: Resource Management

1. **Implement list endpoints**:
   - GET `/models`
   - GET `/clothing`
   - GET `/results`

2. **Implement delete endpoints**:
   - DELETE `/models/:id`
   - DELETE `/clothing/:id`
   - DELETE `/results/:id`

3. **Add pagination & filtering**

### Phase 3: Frontend (Days 6-8)

#### Day 6: UI Components

1. **Create component directory**:
   ```bash
   mkdir -p client/src/components/OutfitChange
   ```

2. **Implement components**:
   - `ModelUpload.tsx` - Upload area for model photo
   - `ClothingGallery.tsx` - Grid of clothing items
   - `ClothingUpload.tsx` - Upload clothing button
   - `ResultDisplay.tsx` - Show generated image
   - `LoadingOverlay.tsx` - Processing indicator

3. **Create page**:
   - `client/src/pages/OutfitChange/index.tsx`

#### Day 7: API Integration

1. **Create API client**:
   ```typescript
   // client/src/api/outfit-change.ts
   export const outfitChangeApi = {
     uploadModel,
     uploadClothing,
     processOutfit,
     getSessionStatus,
     listModels,
     listClothing,
     deleteModel,
     // ...
   };
   ```

2. **Implement custom hooks**:
   ```typescript
   // client/src/hooks/useImageUpload.ts
   // client/src/hooks/useOutfitProcessing.ts
   // client/src/hooks/useImageManager.ts
   ```

#### Day 8: UX Polish

1. **Add loading states**:
   - Spinner during uploads
   - Progress indication
   - Disable interactions during processing

2. **Error handling**:
   - User-friendly error messages
   - Retry mechanisms
   - File validation feedback

3. **Responsive design**:
   - Mobile layout
   - Touch gestures
   - Image optimization

### Phase 4: Testing & Polish (Days 9-10)

#### Day 9: Testing

1. **Backend unit tests**:
   ```bash
   cd server
   npm test -- outfit-change
   ```

2. **Backend E2E tests**:
   ```bash
   npm run test:e2e -- outfit-change
   ```

3. **Frontend component tests**:
   ```bash
   cd client
   pnpm test OutfitChange
   ```

#### Day 10: Integration & Deployment

1. **Integration testing**:
   - End-to-end user flow
   - Performance testing
   - Error scenario testing

2. **Code review & refactoring**

3. **Documentation updates**

4. **Deploy to staging**

---

## Quick Test Flow

### 1. Start Services

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend
cd server
npm run start:dev

# Terminal 3: Frontend
cd client
pnpm dev

# Terminal 4: Queue Worker (if separate process)
cd server
npm run queue:dev
```

### 2. Test Upload

```bash
# Get upload URL
curl -X POST http://localhost:3000/api/outfit-change/models/upload-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"model.jpg","fileSize":2048000,"mimeType":"image/jpeg"}'

# Upload to S3 (use returned uploadUrl)
curl -X PUT "SIGNED_URL" \
  --upload-file /path/to/model.jpg \
  -H "Content-Type: image/jpeg"

# Confirm upload
curl -X POST http://localhost:3000/api/outfit-change/models/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"photoId":"UUID","width":2048,"height":1536}'
```

### 3. Test Processing

```bash
# Start processing
curl -X POST http://localhost:3000/api/outfit-change/process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"modelPhotoId":"MODEL_UUID","clothingItemId":"CLOTHING_UUID"}'

# Check status (repeat every 2s)
curl http://localhost:3000/api/outfit-change/sessions/SESSION_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Gemini API Errors

```
Error: PERMISSION_DENIED
→ Check GEMINI_API_KEY is valid
→ Ensure API is enabled in Google Cloud Console

Error: RATE_LIMIT_EXCEEDED
→ Reduce concurrent requests
→ Implement exponential backoff
→ Upgrade API quota
```

### 阿里云OSS Upload Failures

```
Error: InvalidAccessKeyId
→ Check ALIYUN_ACCESS_KEY_ID is correct
→ Verify AccessKey is activated

Error: SignatureDoesNotMatch
→ Check ALIYUN_ACCESS_KEY_SECRET is correct
→ Verify system clock is synchronized (NTP)
→ Ensure region and endpoint match

Error: 403 Forbidden / AccessDenied
→ Check bucket permissions (Bucket Policy)
→ Verify CORS configuration in OSS console
→ Ensure bucket is not read-only

Error: NoSuchBucket
→ Check ALIYUN_OSS_BUCKET name is correct
→ Verify bucket exists in specified region

CORS Configuration (阿里云OSS控制台):
- 允许的来源: http://localhost:5175, https://yourdomain.com
- 允许的方法: GET, POST, PUT, DELETE, HEAD
- 允许的Headers: *
- 暴露的Headers: ETag, x-oss-request-id
```

### Queue Issues

```
Error: ECONNREFUSED (Redis)
→ Start Redis server
→ Check REDIS_HOST and REDIS_PORT

Jobs stuck in "processing"
→ Check worker is running
→ View Bull dashboard: npm install --save-dev bull-board
```

---

## Performance Optimization

### 1. Image Optimization

- Resize images to max 2048px before upload
- Use JPEG quality 85% for good size/quality balance
- Generate thumbnails for list views

### 2. Caching

- Cache signed URLs (client-side, 30min)
- Cache user's images list (invalidate on upload/delete)
- Redis cache for frequently accessed results

### 3. Monitoring

- Track processing duration (target <30s)
- Monitor Gemini API quota usage
- Alert on high error rates

---

## Next Steps

After completing the quickstart implementation:

1. **Run `/speckit.tasks`** to generate detailed implementation tasks
2. **Set up CI/CD** for automated testing and deployment
3. **Configure monitoring** (Sentry, CloudWatch, etc.)
4. **Plan scaling** (horizontal scaling, CDN, etc.)

---

## Reference Links

- [Gemini API Documentation](https://ai.google.dev/docs)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [Bull Queue Guide](https://docs.bullmq.io/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

---

## Support

For questions or issues during implementation:

1. Check `research.md` for technology decisions
2. Review `data-model.md` for schema questions
3. See `contracts/README.md` for API details
4. Consult team lead or architecture review board
