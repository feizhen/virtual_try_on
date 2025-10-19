# API Contracts: AI-Powered Virtual Outfit Change

**Feature**: 001-ai-outfit-change
**Base URL**: `/api/outfit-change`
**Authentication**: Required (JWT Bearer token)

---

## Endpoints Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/models/upload-url` | Get signed URL for model photo upload |
| POST | `/models/confirm` | Confirm model photo upload |
| GET | `/models` | List user's model photos |
| DELETE | `/models/:id` | Delete a model photo |
| POST | `/clothing/upload-url` | Get signed URL for clothing upload |
| POST | `/clothing/confirm` | Confirm clothing upload |
| GET | `/clothing` | List user's clothing items |
| DELETE | `/clothing/:id` | Delete a clothing item |
| POST | `/process` | Start outfit change processing |
| GET | `/sessions/:id` | Get processing session status |
| GET | `/results` | List user's outfit results |
| GET | `/results/:id` | Get specific result with signed URL |
| DELETE | `/results/:id` | Delete an outfit result |

---

## 1. Upload Model Photo

### Step 1: Request Upload URL

**Request**:
```http
POST /api/outfit-change/models/upload-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "model.jpg",
  "fileSize": 2048000,
  "mimeType": "image/jpeg"
}
```

**Response** (200 OK):
```json
{
  "uploadUrl": "https://your-bucket.oss-cn-beijing.aliyuncs.com/users/xxx/models/uuid.jpg?Expires=xxx&OSSAccessKeyId=xxx&Signature=xxx",
  "photoId": "uuid-here",
  "expiresIn": 900
}
```

### Step 2: Upload to 阿里云OSS

```http
PUT <uploadUrl>
Content-Type: image/jpeg

<binary image data>
```

### Step 3: Confirm Upload

**Request**:
```http
POST /api/outfit-change/models/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "photoId": "uuid-here",
  "width": 2048,
  "height": 1536
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "imageUrl": "users/user-id/models/uuid.jpg",
  "fileSize": 2048000,
  "mimeType": "image/jpeg",
  "width": 2048,
  "height": 1536,
  "uploadedAt": "2025-10-18T10:30:00Z"
}
```

---

## 2. List Model Photos

**Request**:
```http
GET /api/outfit-change/models
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid-1",
      "imageUrl": "users/user-id/models/uuid-1.jpg",
      "thumbnailUrl": "https://s3.../signed-url",
      "fileSize": 2048000,
      "uploadedAt": "2025-10-18T10:30:00Z"
    }
  ],
  "total": 5
}
```

---

## 3. Upload Clothing Item

Same 3-step process as model photos, but using `/clothing/` endpoints.

---

## 4. Process Outfit Change

**Request**:
```http
POST /api/outfit-change/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "modelPhotoId": "model-uuid",
  "clothingItemId": "clothing-uuid"
}
```

**Response** (202 Accepted):
```json
{
  "sessionId": "session-uuid",
  "status": "pending",
  "modelPhotoId": "model-uuid",
  "clothingItemId": "clothing-uuid",
  "createdAt": "2025-10-18T10:35:00Z",
  "estimatedDuration": 30
}
```

---

## 5. Check Processing Status

**Request**:
```http
GET /api/outfit-change/sessions/session-uuid
Authorization: Bearer <token>
```

**Response** (200 OK - Pending):
```json
{
  "id": "session-uuid",
  "status": "processing",
  "startedAt": "2025-10-18T10:35:02Z",
  "createdAt": "2025-10-18T10:35:00Z"
}
```

**Response** (200 OK - Completed):
```json
{
  "id": "session-uuid",
  "status": "completed",
  "resultId": "result-uuid",
  "startedAt": "2025-10-18T10:35:02Z",
  "completedAt": "2025-10-18T10:35:28Z",
  "processingDuration": 26000,
  "result": {
    "id": "result-uuid",
    "resultImageUrl": "https://s3.../signed-url",
    "width": 2048,
    "height": 1536,
    "createdAt": "2025-10-18T10:35:28Z"
  }
}
```

**Response** (200 OK - Failed):
```json
{
  "id": "session-uuid",
  "status": "failed",
  "errorMessage": "AI service temporarily unavailable",
  "completedAt": "2025-10-18T10:35:15Z",
  "retryCount": 2
}
```

---

## 6. List Results

**Request**:
```http
GET /api/outfit-change/results?limit=20&offset=0
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "result-uuid",
      "modelPhotoId": "model-uuid",
      "clothingItemId": "clothing-uuid",
      "resultImageUrl": "https://s3.../signed-url",
      "thumbnailUrl": "https://s3.../signed-url-thumb",
      "width": 2048,
      "height": 1536,
      "processingDuration": 26000,
      "createdAt": "2025-10-18T10:35:28Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

## 7. Delete Resources

**Delete Model Photo**:
```http
DELETE /api/outfit-change/models/uuid
Authorization: Bearer <token>
```

**Response** (204 No Content)

**Delete Clothing Item**:
```http
DELETE /api/outfit-change/clothing/uuid
Authorization: Bearer <token>
```

**Response** (204 No Content)

**Delete Result**:
```http
DELETE /api/outfit-change/results/uuid
Authorization: Bearer <token>
```

**Response** (204 No Content)

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "File size exceeds 10MB limit",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Model photo not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Processing already in progress for this combination",
  "error": "Conflict"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "error": "Too Many Requests"
}
```

### 503 Service Unavailable
```json
{
  "statusCode": 503,
  "message": "AI service temporarily unavailable",
  "error": "Service Unavailable"
}
```

---

## Rate Limits

- **Upload endpoints**: 10 requests per minute per user
- **Processing endpoint**: 5 requests per minute per user
- **List/Get endpoints**: 60 requests per minute per user
- **Delete endpoints**: 20 requests per minute per user

---

## Webhooks (Optional Future Enhancement)

Instead of polling, clients could register webhooks to receive processing completion notifications:

```http
POST /api/outfit-change/webhooks
{
  "url": "https://client.com/webhooks/outfit-complete",
  "events": ["processing.completed", "processing.failed"]
}
```

---

## Data Flow Diagram

```
┌─────────┐                          ┌─────────┐
│ Client  │                          │ Backend │
└────┬────┘                          └────┬────┘
     │                                    │
     │  1. POST /models/upload-url        │
     ├───────────────────────────────────>│
     │  2. {uploadUrl, photoId}           │
     │<───────────────────────────────────┤
     │                                    │
     │  3. PUT uploadUrl (direct to 阿里云OSS)
     ├───────────────────────────────────>│ OSS
     │  4. 200 OK                         │
     │<───────────────────────────────────┤
     │                                    │
     │  5. POST /models/confirm           │
     ├───────────────────────────────────>│
     │  6. {id, imageUrl, ...}            │
     │<───────────────────────────────────┤
     │                                    │
     │  ... (repeat for clothing)         │
     │                                    │
     │  7. POST /process                  │
     ├───────────────────────────────────>│
     │  8. {sessionId, status:pending}    │
     │<───────────────────────────────────┤
     │                                    │
     │  9. GET /sessions/:id (poll every 2s)
     ├───────────────────────────────────>│
     │  10. {status:processing}           │
     │<───────────────────────────────────┤
     │                                    │
     │  11. GET /sessions/:id             │
     ├───────────────────────────────────>│
     │  12. {status:completed, result}    │
     │<───────────────────────────────────┤
     │                                    │
     │  13. Display result image          │
     │                                    │
```

---

## Frontend Integration Example

```typescript
// Upload model photo
async function uploadModelPhoto(file: File) {
  // Step 1: Get upload URL
  const { uploadUrl, photoId } = await fetch('/api/outfit-change/models/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
  }).then(r => r.json());

  // Step 2: Upload to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  // Step 3: Get image dimensions
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  // Step 4: Confirm upload
  const photo = await fetch('/api/outfit-change/models/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      photoId,
      width: img.width,
      height: img.height,
    }),
  }).then(r => r.json());

  return photo;
}

// Process outfit change
async function processOutfit(modelId: string, clothingId: string) {
  const { sessionId } = await fetch('/api/outfit-change/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ modelPhotoId: modelId, clothingItemId: clothingId }),
  }).then(r => r.json());

  // Poll for completion
  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      const session = await fetch(`/api/outfit-change/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(r => r.json());

      if (session.status === 'completed') {
        clearInterval(pollInterval);
        resolve(session.result);
      } else if (session.status === 'failed') {
        clearInterval(pollInterval);
        reject(new Error(session.errorMessage));
      }
    }, 2000); // Poll every 2 seconds
  });
}
```

---

## Security Notes

- All endpoints require JWT authentication
- Users can only access their own resources (userId filtered in all queries)
- S3 signed URLs expire after 15 minutes (upload) or 1 hour (download)
- File type validation enforced on both client and server
- Rate limiting prevents abuse
- Input sanitization prevents injection attacks

---

## Performance Considerations

- Direct S3 uploads bypass backend for large file transfers
- Signed URLs reduce backend load for image serving
- Polling interval (2s) balances UX and server load
- Indexes on all frequently queried columns
- Async processing via Bull queue prevents request timeouts
