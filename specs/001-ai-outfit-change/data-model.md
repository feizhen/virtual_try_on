# Data Model: AI-Powered Virtual Outfit Change

**Feature**: 001-ai-outfit-change
**Date**: 2025-10-18
**Phase**: Phase 1 - Design

## Overview

This document defines the data entities, relationships, and validation rules for the outfit change feature.

---

## Entity Definitions

### 1. ModelPhoto

**Purpose**: Stores metadata for user-uploaded model photos (people to try outfits on)

**Attributes**:
- `id` (UUID, primary key): Unique identifier
- `userId` (UUID, foreign key → users.id): Owner of the photo
- `imageUrl` (string, required): S3 object key (e.g., `users/123/models/abc.jpg`)
- `originalFileName` (string, optional): Original file name from upload
- `fileSize` (integer, required): File size in bytes
- `mimeType` (string, required): Image MIME type (`image/jpeg`, `image/png`, `image/webp`)
- `width` (integer, required): Image width in pixels
- `height` (integer, required): Image height in pixels
- `uploadedAt` (timestamp, required): Upload timestamp
- `deletedAt` (timestamp, nullable): Soft delete timestamp

**Relationships**:
- Belongs to one `User`
- Has many `OutfitResults` (used as base image)
- Has many `ProcessingSessions`

**Validation Rules**:
- `fileSize` ≤ 10,485,760 bytes (10MB)
- `mimeType` ∈ {`image/jpeg`, `image/png`, `image/webp`}
- `width` and `height` > 0

**Indexes**:
- `userId` (frequent lookups by user)
- `deletedAt` (filter non-deleted photos)
- `uploadedAt DESC` (order by upload time)

---

### 2. ClothingItem

**Purpose**: Stores metadata for user-uploaded clothing images

**Attributes**:
- `id` (UUID, primary key): Unique identifier
- `userId` (UUID, foreign key → users.id): Owner of the clothing
- `imageUrl` (string, required): S3 object key
- `originalFileName` (string, optional): Original file name
- `fileSize` (integer, required): File size in bytes
- `mimeType` (string, required): Image MIME type
- `width` (integer, required): Image width in pixels
- `height` (integer, required): Image height in pixels
- `uploadedAt` (timestamp, required): Upload timestamp
- `deletedAt` (timestamp, nullable): Soft delete timestamp

**Relationships**:
- Belongs to one `User`
- Has many `OutfitResults` (used in combinations)
- Has many `ProcessingSessions`

**Validation Rules**:
- Same as `ModelPhoto` (10MB max, valid MIME types, positive dimensions)

**Indexes**:
- `userId` (frequent lookups by user)
- `deletedAt` (filter non-deleted items)
- `uploadedAt DESC` (order by upload time)

---

### 3. OutfitResult

**Purpose**: Stores AI-generated outfit change results

**Attributes**:
- `id` (UUID, primary key): Unique identifier
- `userId` (UUID, foreign key → users.id): Owner of the result
- `modelPhotoId` (UUID, foreign key → model_photos.id): Base model photo used
- `clothingItemId` (UUID, foreign key → clothing_items.id): Clothing applied
- `resultImageUrl` (string, required): S3 object key for generated image
- `fileSize` (integer, required): Generated image file size
- `mimeType` (string, required): Always `image/jpeg` (generated images)
- `width` (integer, required): Generated image width
- `height` (integer, required): Generated image height
- `createdAt` (timestamp, required): Generation timestamp
- `processingDuration` (integer, required): Processing time in milliseconds
- `deletedAt` (timestamp, nullable): Soft delete timestamp

**Relationships**:
- Belongs to one `User`
- References one `ModelPhoto`
- References one `ClothingItem`
- Referenced by one `ProcessingSession` (as final result)

**Validation Rules**:
- `processingDuration` ≥ 0
- `modelPhotoId` and `clothingItemId` must belong to same `userId`

**Indexes**:
- `userId` (user's results)
- `modelPhotoId` (find results for a model)
- `clothingItemId` (find results for clothing)
- `createdAt DESC` (order by creation time)
- Composite: `(userId, modelPhotoId, clothingItemId)` (find existing combinations)

---

### 4. ProcessingSession

**Purpose**: Tracks AI processing requests and their status

**Attributes**:
- `id` (UUID, primary key): Unique identifier (session ID)
- `userId` (UUID, foreign key → users.id): Requester
- `modelPhotoId` (UUID, foreign key → model_photos.id): Input model photo
- `clothingItemId` (UUID, foreign key → clothing_items.id): Input clothing
- `status` (enum, required): Processing status
  - Values: `pending`, `processing`, `completed`, `failed`
  - Default: `pending`
- `resultId` (UUID, nullable, foreign key → outfit_results.id): Generated result (if completed)
- `errorMessage` (string, nullable): Error details (if failed)
- `createdAt` (timestamp, required): Request timestamp
- `startedAt` (timestamp, nullable): When processing began
- `completedAt` (timestamp, nullable): When processing finished
- `retryCount` (integer, required): Number of retry attempts
  - Default: 0

**Relationships**:
- Belongs to one `User`
- References one `ModelPhoto`
- References one `ClothingItem`
- References one `OutfitResult` (when completed)

**State Transitions**:
```
pending → processing → completed
             ↓
           failed (with retry → pending)
```

**Validation Rules**:
- `status` ∈ {`pending`, `processing`, `completed`, `failed`}
- If `status = completed`, `resultId` must be set
- If `status = failed`, `errorMessage` should be set
- `retryCount` ≥ 0 and ≤ 3 (max 3 retries)

**Indexes**:
- `userId` (user's sessions)
- `status` (find active/pending sessions)
- `createdAt DESC` (order by request time)
- Composite: `(userId, status)` (user's active sessions)

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│  (existing) │
└──────┬──────┘
       │
       │ 1:N
       ├──────────────────────────────────┐
       │                                  │
       ↓                                  ↓
┌─────────────────┐              ┌──────────────────┐
│   ModelPhoto    │              │  ClothingItem    │
├─────────────────┤              ├──────────────────┤
│ id (PK)         │              │ id (PK)          │
│ userId (FK)     │              │ userId (FK)      │
│ imageUrl        │              │ imageUrl         │
│ fileSize        │              │ fileSize         │
│ uploadedAt      │              │ uploadedAt       │
└────────┬────────┘              └────────┬─────────┘
         │                                │
         │ N:M (through OutfitResult)     │
         │                                │
         └────────────┬───────────────────┘
                      │
                      ↓
              ┌───────────────┐
              │ OutfitResult  │
              ├───────────────┤
              │ id (PK)       │
              │ userId (FK)   │
              │ modelPhotoId  │
              │ clothingItemId│
              │ resultImageUrl│
              │ createdAt     │
              └───────┬───────┘
                      ↑
                      │
              ┌───────────────────┐
              │ ProcessingSession │
              ├───────────────────┤
              │ id (PK)           │
              │ userId (FK)       │
              │ modelPhotoId (FK) │
              │ clothingItemId(FK)│
              │ status            │
              │ resultId (FK)     │
              │ createdAt         │
              └───────────────────┘
```

---

## Prisma Schema

```prisma
// Add to server/prisma/schema.prisma

model ModelPhoto {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  imageUrl         String    @map("image_url")
  originalFileName String?   @map("original_file_name")
  fileSize         Int       @map("file_size")
  mimeType         String    @map("mime_type")
  width            Int
  height           Int
  uploadedAt       DateTime  @default(now()) @map("uploaded_at")
  deletedAt        DateTime? @map("deleted_at")

  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitResults     OutfitResult[]
  processingSessions ProcessingSession[]

  @@index([userId])
  @@index([deletedAt])
  @@index([uploadedAt(sort: Desc)])
  @@map("model_photos")
}

model ClothingItem {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  imageUrl         String    @map("image_url")
  originalFileName String?   @map("original_file_name")
  fileSize         Int       @map("file_size")
  mimeType         String    @map("mime_type")
  width            Int
  height           Int
  uploadedAt       DateTime  @default(now()) @map("uploaded_at")
  deletedAt        DateTime? @map("deleted_at")

  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  outfitResults     OutfitResult[]
  processingSessions ProcessingSession[]

  @@index([userId])
  @@index([deletedAt])
  @@index([uploadedAt(sort: Desc)])
  @@map("clothing_items")
}

model OutfitResult {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  modelPhotoId      String    @map("model_photo_id")
  clothingItemId    String    @map("clothing_item_id")
  resultImageUrl    String    @map("result_image_url")
  fileSize          Int       @map("file_size")
  mimeType          String    @map("mime_type")
  width             Int
  height            Int
  processingDuration Int      @map("processing_duration")
  createdAt         DateTime  @default(now()) @map("created_at")
  deletedAt         DateTime? @map("deleted_at")

  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  modelPhoto        ModelPhoto          @relation(fields: [modelPhotoId], references: [id])
  clothingItem      ClothingItem        @relation(fields: [clothingItemId], references: [id])
  processingSessions ProcessingSession[]

  @@index([userId])
  @@index([modelPhotoId])
  @@index([clothingItemId])
  @@index([createdAt(sort: Desc)])
  @@index([userId, modelPhotoId, clothingItemId])
  @@map("outfit_results")
}

model ProcessingSession {
  id             String    @id @default(uuid())
  userId         String    @map("user_id")
  modelPhotoId   String    @map("model_photo_id")
  clothingItemId String    @map("clothing_item_id")
  status         String    @default("pending")
  resultId       String?   @map("result_id")
  errorMessage   String?   @map("error_message")
  retryCount     Int       @default(0) @map("retry_count")
  createdAt      DateTime  @default(now()) @map("created_at")
  startedAt      DateTime? @map("started_at")
  completedAt    DateTime? @map("completed_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  modelPhoto   ModelPhoto    @relation(fields: [modelPhotoId], references: [id])
  clothingItem ClothingItem  @relation(fields: [clothingItemId], references: [id])
  result       OutfitResult? @relation(fields: [resultId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([userId, status])
  @@map("processing_sessions")
}

// Update existing User model to add relations
model User {
  // ... existing fields ...

  modelPhotos        ModelPhoto[]
  clothingItems      ClothingItem[]
  outfitResults      OutfitResult[]
  processingSessions ProcessingSession[]
}
```

---

## Migration Strategy

1. Create migration file: `prisma migrate dev --name add_outfit_change_tables`
2. Review generated SQL
3. Apply migration: auto-applied by above command
4. Generate Prisma Client: `prisma generate`
5. Verify schema: `prisma studio` (visual inspection)

---

## Data Access Patterns

### High-Frequency Queries
1. **Get user's model photos**: `WHERE userId = ? AND deletedAt IS NULL ORDER BY uploadedAt DESC`
2. **Get user's clothing items**: `WHERE userId = ? AND deletedAt IS NULL ORDER BY uploadedAt DESC`
3. **Check processing status**: `WHERE id = ? AND userId = ?`
4. **Get user's results**: `WHERE userId = ? AND deletedAt IS NULL ORDER BY createdAt DESC`

### Optimization
- All high-frequency queries use indexed columns
- Soft deletes prevent accidental data loss while excluding deleted items from queries
- Composite indexes for common multi-column filters
- Foreign key cascades ensure referential integrity

---

## Data Retention

- **ModelPhotos/ClothingItems**: Soft delete; permanently purge after 90 days (optional cleanup job)
- **OutfitResults**: Soft delete; keep indefinitely unless user explicitly deletes
- **ProcessingSessions**: Keep for 30 days for debugging; hard delete after

---

## Security Considerations

- All queries must filter by `userId` to prevent unauthorized access
- Signed URLs for S3 prevent direct URL guessing
- Soft deletes allow recovery from accidental deletions
- No sensitive data in image metadata (PII in User table only)

---

## Summary

- **4 new tables** with clear relationships
- **Normalized design** prevents data duplication
- **Indexes** on all frequently queried columns
- **Soft deletes** for user-facing data
- **State tracking** via ProcessingSession entity
- **Foreign key cascades** maintain referential integrity
