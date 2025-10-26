# Data Model: Credit System and History Enhancements

**Feature**: 005-credit-history-features
**Date**: 2025-10-25
**Status**: Design Complete

## Overview

本文档定义了 Credit 系统和历史记录功能的完整数据模型，包括新增的实体、扩展的现有实体、关系映射和验证规则。

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤      1
│ id              │◄─────────┐
│ email           │          │
│ password        │          │ N
│ name            │     ┌────┴──────────────┐
│ creditBalance ⚡│     │ CreditTransaction │
│ totalSpent ⚡   │     ├───────────────────┤
│ totalEarned ⚡  │     │ id                │
│ ...             │     │ userId            │
└─────────────────┘     │ type              │
        △               │ amount            │
        │ 1             │ balanceBefore     │
        │               │ balanceAfter      │
        │ N             │ sessionId         │
┌───────┴─────────┐     │ description       │
│ ProcessingSession│    │ createdAt         │
├─────────────────┤     └───────────────────┘
│ id              │              △
│ userId          │              │
│ modelPhotoId    │              │ 1
│ clothingItemId  │     ┌────────┴─────────┐
│ status          │     │                  │ 1
│ creditTxId ⚡   │────►│  (deduct)        │
│ refundTxId ⚡   │────►│  (refund)        │
│ ...             │     └──────────────────┘
└─────────────────┘
        │ 1
        │
        │ 0..1
        ▼
┌─────────────────┐
│  OutfitResult   │
├─────────────────┤
│ id              │
│ userId          │
│ modelPhotoId    │
│ clothingItemId  │
│ resultImageUrl  │
│ creditsUsed ⚡  │
│ isRetry ⚡      │
│ retryFromId ⚡  │
│ ...             │
└─────────────────┘
        │
        │ N
        ▼  1
┌─────────────────┐
│   ModelPhoto    │
├─────────────────┤
│ id              │
│ userId          │
│ imageUrl        │
│ version ⚡      │
│ replacementHistory ⚡ │
│ ...             │
└─────────────────┘
```

**Legend**:
- ⚡ = 新增字段
- 1, N = 关系基数

---

## New Entity: CreditTransaction

### Purpose
记录所有 credit 余额变更操作，提供完整的审计追踪。

### Prisma Schema

```prisma
model CreditTransaction {
  id              String   @id @default(uuid())
  userId          String
  type            TransactionType
  amount          Int                    // 正数=增加, 负数=扣除
  balanceBefore   Int
  balanceAfter    Int
  sessionId       String?                // 关联的试衣会话 (可选)
  description     String
  metadata        Json?    @db.JsonB     // 额外信息 (如错误详情、管理员备注)
  createdAt       DateTime @default(now())

  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  session         ProcessingSession? @relation("SessionDeduct", fields: [sessionId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt(sort: Desc)])
  @@index([sessionId])
  @@map("credit_transactions")
}

enum TransactionType {
  INITIAL_GRANT    // 初始赠送
  DEDUCT           // 扣除 (试衣消费)
  REFUND           // 退还 (试衣失败)
  ADMIN_ADJUSTMENT // 管理员调整
}
```

### Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | String (UUID) | ✅ | 主键 | Auto-generated |
| userId | String (UUID) | ✅ | 用户 ID | Foreign key to User |
| type | Enum | ✅ | 交易类型 | One of: INITIAL_GRANT, DEDUCT, REFUND, ADMIN_ADJUSTMENT |
| amount | Int | ✅ | 交易金额 | 正数=增加, 负数=扣除 |
| balanceBefore | Int | ✅ | 交易前余额 | >= 0 |
| balanceAfter | Int | ✅ | 交易后余额 | >= 0 |
| sessionId | String (UUID) | ❌ | 关联的试衣会话 | Optional, foreign key |
| description | String | ✅ | 交易描述 | Max 500 chars |
| metadata | JSON | ❌ | 额外元数据 | Optional |
| createdAt | DateTime | ✅ | 创建时间 | Auto-generated |

### Business Rules

1. **不可变性**: 交易记录创建后不可修改或删除（只能查询）
2. **余额一致性**: `balanceAfter = balanceBefore + amount`
3. **退款关联**: 退款交易必须在 metadata 中记录原始交易 ID
4. **审计追踪**: 所有 credit 变更必须创建交易记录

### State Transitions

交易记录无状态转换（一旦创建即不可变）。

---

## Extended Entity: User

### New Fields

```prisma
model User {
  // ... 现有字段 (id, email, password, name, etc.)

  // ⚡ 新增字段
  creditBalance      Int      @default(100)    // 当前 credit 余额
  totalCreditsSpent  Int      @default(0)      // 累计消费的 credit
  totalCreditsEarned Int      @default(0)      // 累计获得的 credit
  creditUpdatedAt    DateTime @updatedAt       // credit 最后更新时间

  // ⚡ 新增关系
  creditTransactions CreditTransaction[]

  // ... 现有关系 (modelPhotos, clothingItems, etc.)
}
```

### Field Specifications

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| creditBalance | Int | 100 | 当前可用余额 | >= 0, not null |
| totalCreditsSpent | Int | 0 | 累计消费（统计用） | >= 0 |
| totalCreditsEarned | Int | 0 | 累计获得（统计用） | >= 0 |
| creditUpdatedAt | DateTime | now() | 最后更新时间 | Auto-updated |

### Business Rules

1. **初始化**: 新用户注册时自动设置 `creditBalance = 100`
2. **余额约束**: `creditBalance` 不能为负数（通过事务保证）
3. **统计字段**: `totalCreditsSpent` 和 `totalCreditsEarned` 只增不减

---

## Extended Entity: OutfitResult

### New Fields

```prisma
model OutfitResult {
  // ... 现有字段 (id, userId, modelPhotoId, clothingItemId, resultImageUrl, etc.)

  // ⚡ 新增字段
  creditsUsed  Int      @default(10)        // 该次试衣消耗的 credit
  isRetry      Boolean  @default(false)      // 是否为重试/重新生成
  retryFromId  String?                       // 重试来源 (原始 OutfitResult ID)

  // ⚡ 新增关系
  retryFrom    OutfitResult?  @relation("RetryChain", fields: [retryFromId], references: [id], onDelete: SetNull)
  retries      OutfitResult[] @relation("RetryChain")

  // ... 现有关系
}
```

### Field Specifications

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| creditsUsed | Int | 10 | 消耗的 credit 数量 | >= 0 |
| isRetry | Boolean | false | 标记是否为重试 | - |
| retryFromId | String (UUID) | null | 指向原始结果 ID | Optional, self-reference |

### Business Rules

1. **Credit 记录**: 每次虚拟试衣都记录实际消耗的 credit（可能未来有不同定价）
2. **重试链**: 通过 `retryFromId` 形成重试链，方便追溯
3. **统计**: 可通过 `isRetry` 字段统计重试率

---

## Extended Entity: ProcessingSession

### New Fields

```prisma
model ProcessingSession {
  // ... 现有字段 (id, userId, modelPhotoId, clothingItemId, status, etc.)

  // ⚡ 新增字段
  creditTransactionId       String?   // 扣除 credit 的交易记录 ID
  creditRefundTransactionId String?   // 退还 credit 的交易记录 ID (如果失败)

  // ⚡ 新增关系
  creditTransaction       CreditTransaction? @relation("SessionDeduct", fields: [creditTransactionId], references: [id], onDelete: SetNull)
  creditRefundTransaction CreditTransaction? @relation("SessionRefund", fields: [creditRefundTransactionId], references: [id], onDelete: SetNull)

  // ... 现有关系
}
```

### Field Specifications

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| creditTransactionId | String (UUID) | null | 扣费交易 ID | Optional, foreign key |
| creditRefundTransactionId | String (UUID) | null | 退款交易 ID | Optional, foreign key |

### Business Rules

1. **扣费记录**: 成功扣费后立即记录 `creditTransactionId`
2. **退款记录**: 失败退款后记录 `creditRefundTransactionId`
3. **幂等性**: 通过这两个字段避免重复扣费/退款

---

## Extended Entity: ModelPhoto

### New Fields

```prisma
model ModelPhoto {
  // ... 现有字段 (id, userId, imageUrl, originalFileName, etc.)

  // ⚡ 新增字段
  version            Int      @default(1)           // 版本号 (每次替换递增)
  replacementHistory Json?    @db.JsonB             // 替换历史记录
  isArchived         Boolean  @default(false)       // 是否归档 (被替换但仍被引用)

  // ... 现有关系
}
```

### Field Specifications

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| version | Int | 1 | 图片版本号 | >= 1 |
| replacementHistory | JSON | null | 历史版本记录 | Array of {version, oldUrl, replacedAt} |
| isArchived | Boolean | false | 是否归档状态 | - |

### Replacement History JSON Schema

```typescript
type ReplacementHistoryEntry = {
  version: number;           // 旧版本号
  oldUrl: string;            // 旧图片 URL
  replacedAt: string;        // 替换时间 (ISO 8601)
  fileSize?: number;         // 旧文件大小 (可选)
};

type ReplacementHistory = ReplacementHistoryEntry[];
```

**Example**:
```json
[
  {
    "version": 1,
    "oldUrl": "uploads/models/abc-123.jpg",
    "replacedAt": "2025-10-20T10:30:00Z",
    "fileSize": 2048576
  },
  {
    "version": 2,
    "oldUrl": "uploads/models/def-456.jpg",
    "replacedAt": "2025-10-22T14:15:00Z",
    "fileSize": 3145728
  }
]
```

### Business Rules

1. **版本递增**: 每次替换 `version++`
2. **历史保留**: 如果图片被历史记录引用，保留旧文件并记录在 `replacementHistory`
3. **文件清理**: 如果无引用，直接删除旧文件，不记录历史

---

## Indexes

为优化查询性能，需要添加以下索引：

```prisma
// CreditTransaction
@@index([userId, createdAt(sort: Desc)])  // 用户交易历史查询
@@index([sessionId])                       // 会话关联查询

// OutfitResult (新增)
@@index([userId, createdAt(sort: Desc)])  // 用户历史记录查询
@@index([userId, deletedAt])              // 软删除过滤
@@index([retryFromId])                    // 重试链查询

// User (新增)
@@index([creditBalance])                  // 按余额排序/筛选 (管理用)
```

---

## Database Constraints

### Unique Constraints
- `CreditTransaction.id` - 主键唯一
- `User.email` - 邮箱唯一（现有）

### Foreign Key Constraints
- `CreditTransaction.userId` → `User.id` (CASCADE)
- `CreditTransaction.sessionId` → `ProcessingSession.id` (SET NULL)
- `ProcessingSession.creditTransactionId` → `CreditTransaction.id` (SET NULL)
- `ProcessingSession.creditRefundTransactionId` → `CreditTransaction.id` (SET NULL)
- `OutfitResult.retryFromId` → `OutfitResult.id` (SET NULL)

### Check Constraints

```sql
-- User credit balance 不能为负
ALTER TABLE "User" ADD CONSTRAINT "check_credit_balance_non_negative"
  CHECK ("creditBalance" >= 0);

-- CreditTransaction 交易后余额不能为负
ALTER TABLE "credit_transactions" ADD CONSTRAINT "check_balance_after_non_negative"
  CHECK ("balanceAfter" >= 0);

-- OutfitResult creditsUsed 不能为负
ALTER TABLE "OutfitResult" ADD CONSTRAINT "check_credits_used_non_negative"
  CHECK ("creditsUsed" >= 0);
```

---

## Migration Strategy

### Step 1: Create New Table

```sql
-- 创建 TransactionType 枚举
CREATE TYPE "TransactionType" AS ENUM (
  'INITIAL_GRANT',
  'DEDUCT',
  'REFUND',
  'ADMIN_ADJUSTMENT'
);

-- 创建 CreditTransaction 表
CREATE TABLE "credit_transactions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "balanceBefore" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL CHECK ("balanceAfter" >= 0),
  "sessionId" TEXT,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_session" FOREIGN KEY ("sessionId") REFERENCES "ProcessingSession"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_credit_tx_user_created" ON "credit_transactions"("userId", "createdAt" DESC);
CREATE INDEX "idx_credit_tx_session" ON "credit_transactions"("sessionId");
```

### Step 2: Extend Existing Tables

```sql
-- 扩展 User 表
ALTER TABLE "User"
  ADD COLUMN "creditBalance" INTEGER NOT NULL DEFAULT 100 CHECK ("creditBalance" >= 0),
  ADD COLUMN "totalCreditsSpent" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "totalCreditsEarned" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "creditUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "idx_user_credit_balance" ON "User"("creditBalance");

-- 扩展 OutfitResult 表
ALTER TABLE "OutfitResult"
  ADD COLUMN "creditsUsed" INTEGER NOT NULL DEFAULT 10 CHECK ("creditsUsed" >= 0),
  ADD COLUMN "isRetry" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "retryFromId" TEXT;

ALTER TABLE "OutfitResult"
  ADD CONSTRAINT "fk_retry_from" FOREIGN KEY ("retryFromId") REFERENCES "OutfitResult"("id") ON DELETE SET NULL;

CREATE INDEX "idx_outfit_result_user_created" ON "OutfitResult"("userId", "createdAt" DESC);
CREATE INDEX "idx_outfit_result_user_deleted" ON "OutfitResult"("userId", "deletedAt");
CREATE INDEX "idx_outfit_result_retry_from" ON "OutfitResult"("retryFromId");

-- 扩展 ProcessingSession 表
ALTER TABLE "ProcessingSession"
  ADD COLUMN "creditTransactionId" TEXT,
  ADD COLUMN "creditRefundTransactionId" TEXT;

ALTER TABLE "ProcessingSession"
  ADD CONSTRAINT "fk_credit_transaction" FOREIGN KEY ("creditTransactionId") REFERENCES "credit_transactions"("id") ON DELETE SET NULL,
  ADD CONSTRAINT "fk_credit_refund_transaction" FOREIGN KEY ("creditRefundTransactionId") REFERENCES "credit_transactions"("id") ON DELETE SET NULL;

-- 扩展 ModelPhoto 表
ALTER TABLE "ModelPhoto"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "replacementHistory" JSONB,
  ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
```

### Step 3: Data Initialization

```sql
-- 为现有用户初始化 credit (已在 ALTER TABLE 中通过 DEFAULT 100 完成)

-- 为现有用户创建初始 credit 交易记录
INSERT INTO "credit_transactions" ("id", "userId", "type", "amount", "balanceBefore", "balanceAfter", "description", "createdAt")
SELECT
  gen_random_uuid(),
  "id",
  'INITIAL_GRANT',
  100,
  0,
  100,
  'Initial credit grant for existing user',
  NOW()
FROM "User";
```

---

## Data Validation Rules

### Service Layer Validation

使用 class-validator 验证 DTO 输入：

```typescript
// CreateTryOnDto (扩展)
export class CreateTryOnDto {
  @IsUUID()
  modelPhotoId: string;

  @IsUUID()
  clothingItemId: string;

  @IsOptional()
  @IsUUID()
  retryFromId?: string;  // ⚡ 新增: 重试来源
}

// GetHistoryDto
export class GetHistoryDto {
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ReplaceModelPhotoDto
export class ReplaceModelPhotoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  originalFileName: string;

  // File validation handled by MulterModule
}
```

---

## Example Queries

### Get User Credit Balance and History

```typescript
const userWithCredit = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    creditBalance: true,
    totalCreditsSpent: true,
    totalCreditsEarned: true,
    creditTransactions: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

### Get Try-On History with Pagination

```typescript
const history = await prisma.outfitResult.findMany({
  where: {
    userId,
    deletedAt: null
  },
  take: pageSize + 1,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
  include: {
    modelPhoto: true,
    clothingItem: true,
    session: {
      include: {
        creditTransaction: true,
        creditRefundTransaction: true
      }
    }
  }
});
```

### Check if Model Photo is Referenced

```typescript
const photo = await prisma.modelPhoto.findUnique({
  where: { id: photoId },
  include: {
    outfitResults: {
      where: { deletedAt: null },
      select: { id: true }
    }
  }
});

const isReferenced = photo.outfitResults.length > 0;
```

---

## Summary

### New Models
- ✅ `CreditTransaction` - 完整定义

### Extended Models
- ✅ `User` - 添加 4 个 credit 相关字段
- ✅ `OutfitResult` - 添加 3 个重试和 credit 相关字段
- ✅ `ProcessingSession` - 添加 2 个交易关联字段
- ✅ `ModelPhoto` - 添加 3 个版本和替换历史字段

### Indexes Added
- 6 个新索引用于优化查询性能

### Constraints Added
- 3 个 CHECK 约束确保数据完整性
- 多个外键约束维护关系一致性

### Migration Complexity
- **风险级别**: 中等
- **停机时间**: 无需停机（向后兼容）
- **回滚策略**: 保留旧列，新列有默认值

下一步: 生成 API 契约 (OpenAPI 规范)
