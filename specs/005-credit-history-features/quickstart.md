# Quickstart Guide: Credit System and History Enhancements

**Feature**: 005-credit-history-features
**Date**: 2025-10-25
**Audience**: Developers implementing this feature

## Overview

本指南提供了实现 Credit 系统、历史记录、重试和模特图替换功能的快速上手说明。涵盖环境配置、开发工作流程和关键实现要点。

---

## Prerequisites

### Required Tools
- Node.js 18+ and pnpm
- PostgreSQL 14+
- Git
- Code editor (VS Code recommended)

### Existing Project Knowledge
- 熟悉 NestJS 模块化架构
- 理解 Prisma ORM 基本使用
- 了解 React Hooks 和 Context API
- 掌握 JWT 认证流程

---

## Quick Setup (5 minutes)

### 1. Checkout Feature Branch

```bash
git checkout 005-credit-history-features
```

### 2. Install New Dependencies

```bash
# Frontend: 安装 SWR (数据获取库)
cd client
pnpm add swr@^2.2.5

# Backend: 无需新依赖 (使用现有 Prisma, NestJS)
```

### 3. Database Migration

```bash
cd server

# 生成 Prisma migration
npx prisma migrate dev --name add-credit-system

# 查看迁移内容 (可选)
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql

# 生成 Prisma Client 类型
npx prisma generate
```

**Migration 包含**:
- 新表: `credit_transactions`
- 扩展表: `User`, `OutfitResult`, `ProcessingSession`, `ModelPhoto`
- 索引: 6个新索引优化查询性能
- 约束: CHECK 约束确保余额非负

### 4. 初始化现有用户 Credit

迁移会自动为现有用户设置初始 credit（通过 DEFAULT 100），但需要创建初始交易记录：

```bash
# 执行数据初始化脚本
npx prisma db execute --file ./scripts/init-user-credits.sql
```

**scripts/init-user-credits.sql**:
```sql
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
FROM "User"
WHERE NOT EXISTS (
  SELECT 1 FROM "credit_transactions"
  WHERE "userId" = "User"."id" AND "type" = 'INITIAL_GRANT'
);
```

### 5. Verify Setup

```bash
# 启动开发服务器
cd server && pnpm dev    # Terminal 1
cd client && pnpm dev    # Terminal 2

# 检查数据库
npx prisma studio        # 浏览器打开 http://localhost:5555
```

---

## Development Workflow

### Phase 1: Backend - Credit Service (Day 1-2)

#### 1.1 Create Credit Module

```bash
cd server/src
nest g module credit
nest g service credit
nest g controller credit
```

**关键实现**: `credit.service.ts`
```typescript
@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async deductCredit(userId: string, amount: number, sessionId?: string) {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { creditBalance: true }
      });

      if (user.creditBalance < amount) {
        throw new InsufficientCreditException();
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          creditBalance: { decrement: amount },
          totalCreditsSpent: { increment: amount }
        }
      });

      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: 'DEDUCT',
          amount: -amount,
          balanceBefore: user.creditBalance,
          balanceAfter: updatedUser.creditBalance,
          sessionId,
          description: 'Virtual try-on processing'
        }
      });

      return { user: updatedUser, transaction };
    });
  }

  async refundCredit(userId: string, amount: number, originalTxId: string, reason: string) {
    // 实现类似，但 type: 'REFUND', amount: 正数
  }

  async getBalance(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        creditBalance: true,
        totalCreditsSpent: true,
        totalCreditsEarned: true,
        creditUpdatedAt: true
      }
    });
  }
}
```

#### 1.2 Create DTOs

```bash
mkdir src/credit/dto
touch src/credit/dto/credit-balance.dto.ts
touch src/credit/dto/credit-transaction.dto.ts
```

#### 1.3 Add Tests

```bash
touch test/credit.service.spec.ts
touch test/credit.e2e-spec.ts
```

**运行测试**:
```bash
pnpm test credit.service.spec
pnpm test:e2e credit.e2e-spec
```

---

### Phase 2: Backend - Integrate Credit into Try-On Flow (Day 3)

#### 2.1 Update OutfitChangeService

```typescript
// outfit-change.service.ts

async processTryOn(userId: string, modelPhotoId: string, clothingItemId: string, retryFromId?: string) {
  let creditTransaction: CreditTransaction | null = null;

  try {
    // 1. 扣除 credit
    const deductResult = await this.creditService.deductCredit(userId, 10);
    creditTransaction = deductResult.transaction;

    // 2. 创建处理会话
    const session = await this.prisma.processingSession.create({
      data: {
        userId,
        modelPhotoId,
        clothingItemId,
        status: 'pending',
        creditTransactionId: creditTransaction.id
      }
    });

    // 3. 异步处理 (不 await)
    this.processInBackground(session.id).catch((error) => {
      this.handleProcessingFailure(session.id, error);
    });

    return { sessionId: session.id, status: 'pending' };

  } catch (error) {
    // 扣费或创建会话失败，立即回滚
    if (creditTransaction) {
      await this.creditService.refundCredit(
        userId,
        10,
        creditTransaction.id,
        'Processing initialization failed'
      );
    }
    throw error;
  }
}

private async handleProcessingFailure(sessionId: string, error: Error) {
  const session = await this.prisma.processingSession.findUnique({
    where: { id: sessionId },
    include: { creditTransaction: true }
  });

  // 退还 credit
  const refund = await this.creditService.refundCredit(
    session.userId,
    10,
    session.creditTransactionId,
    `Processing failed: ${error.message}`
  );

  // 更新会话状态
  await this.prisma.processingSession.update({
    where: { id: sessionId },
    data: {
      status: 'failed',
      errorMessage: error.message,
      creditRefundTransactionId: refund.id
    }
  });
}
```

---

### Phase 3: Backend - History & Retry (Day 4)

#### 3.1 Create History Endpoints

```typescript
// outfit-change.controller.ts

@Get('history')
@UseGuards(JwtAuthGuard)
async getHistory(
  @CurrentUser() user: User,
  @Query('cursor') cursor?: string,
  @Query('limit') limit: number = 20
) {
  return await this.outfitChangeService.getHistory(user.id, limit, cursor);
}

@Post('retry/:resultId')
@UseGuards(JwtAuthGuard)
async retry(@CurrentUser() user: User, @Param('resultId') resultId: string) {
  const original = await this.prisma.outfitResult.findUniqueOrThrow({
    where: { id: resultId, userId: user.id }
  });

  return await this.processTryOn(
    user.id,
    original.modelPhotoId,
    original.clothingItemId,
    resultId  // retryFromId
  );
}
```

#### 3.2 Implement Cursor Pagination

```typescript
async getHistory(userId: string, pageSize: number, cursor?: string) {
  const results = await this.prisma.outfitResult.findMany({
    where: { userId, deletedAt: null },
    take: pageSize + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      modelPhoto: true,
      clothingItem: true,
      session: { include: { creditTransaction: true, creditRefundTransaction: true } }
    }
  });

  const hasMore = results.length > pageSize;
  const items = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor, hasMore };
}
```

---

### Phase 4: Frontend - Credit Display (Day 5)

#### 4.1 Create Credit Context

```bash
cd client/src/contexts
touch CreditContext.tsx
```

```typescript
// CreditContext.tsx
import useSWR, { mutate } from 'swr';
import { createContext, useContext, ReactNode } from 'react';
import { api } from '../api/client';

interface CreditContextValue {
  balance: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => void;
  optimisticDeduct: (amount: number) => void;
}

const CreditContext = createContext<CreditContextValue | null>(null);

export function CreditProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading } = useSWR('/credit/balance', async () => {
    const response = await api.get('/credit/balance');
    return response.data.data;
  }, {
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  const optimisticDeduct = (amount: number) => {
    mutate('/credit/balance',
      (current: any) => ({ ...current, creditBalance: current.creditBalance - amount }),
      false
    );
  };

  return (
    <CreditContext.Provider value={{
      balance: data?.creditBalance,
      isLoading,
      error,
      refresh: () => mutate('/credit/balance'),
      optimisticDeduct
    }}>
      {children}
    </CreditContext.Provider>
  );
}

export const useCredit = () => {
  const context = useContext(CreditContext);
  if (!context) throw new Error('useCredit must be used within CreditProvider');
  return context;
};
```

#### 4.2 Create Credit Badge Component

```bash
cd client/src/components
mkdir Credit
touch Credit/CreditBadge.tsx
```

```typescript
// CreditBadge.tsx
import { useCredit } from '../../contexts/CreditContext';

export function CreditBadge() {
  const { balance, isLoading } = useCredit();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="credit-badge">
      <span className="credit-icon">💎</span>
      <span className="credit-amount">{balance ?? 0}</span>
      <span className="credit-label">Credits</span>
    </div>
  );
}
```

#### 4.3 Integrate into App

```typescript
// App.tsx
import { CreditProvider } from './contexts/CreditContext';
import { SWRConfig } from 'swr';

function App() {
  return (
    <SWRConfig value={{
      fetcher: (url) => api.get(url).then(r => r.data.data),
      onError: (error) => console.error('SWR Error:', error)
    }}>
      <AuthProvider>
        <CreditProvider>
          <Router>
            {/* routes */}
          </Router>
        </CreditProvider>
      </AuthProvider>
    </SWRConfig>
  );
}
```

---

### Phase 5: Frontend - History Page (Day 6-7)

#### 5.1 Create History Page

```bash
cd client/src/pages
touch History.tsx
```

```typescript
// History.tsx
import useSWRInfinite from 'swr/infinite';
import { HistoryList } from '../components/History/HistoryList';

export function History() {
  const { data, error, size, setSize } = useSWRInfinite(
    (index, previousData) => {
      if (previousData && !previousData.hasMore) return null;
      const cursor = previousData?.nextCursor;
      return `/history?cursor=${cursor || ''}&limit=20`;
    }
  );

  const items = data ? data.flatMap(page => page.items) : [];
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const hasMore = data?.[data.length - 1]?.hasMore;

  return (
    <div className="history-page">
      <h1>Trial History</h1>
      <HistoryList items={items} />
      {hasMore && (
        <button onClick={() => setSize(size + 1)} disabled={isLoadingMore}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Key Implementation Points

### 1. Transaction Handling

**✅ DO**:
```typescript
return await this.prisma.$transaction(async (tx) => {
  // 所有操作在事务中
  const user = await tx.user.update(...);
  const transaction = await tx.creditTransaction.create(...);
  return { user, transaction };
});
```

**❌ DON'T**:
```typescript
// 不要分开执行，会导致不一致
const user = await this.prisma.user.update(...);
const transaction = await this.prisma.creditTransaction.create(...);
```

### 2. Error Handling

**✅ DO**:
```typescript
try {
  const deductResult = await this.creditService.deductCredit(...);
  // ... 继续处理
} catch (error) {
  if (error instanceof InsufficientCreditException) {
    throw new BadRequestException('Credit balance is insufficient');
  }
  throw error;
}
```

### 3. Cursor Pagination

**✅ DO**:
```typescript
take: pageSize + 1,  // 多取一条判断 hasMore
const hasMore = results.length > pageSize;
const items = hasMore ? results.slice(0, -1) : results;
```

### 4. Optimistic UI Updates

**✅ DO**:
```typescript
const handleTryOn = async () => {
  optimisticDeduct(10);  // 立即更新 UI
  try {
    await api.post('/outfit-change/tryon', data);
  } catch (error) {
    refresh();  // 失败时刷新真实数据
  }
};
```

---

## Testing Strategy

### Unit Tests

```bash
# Backend
pnpm test credit.service.spec.ts
pnpm test history.service.spec.ts

# Frontend
pnpm test CreditBadge.test.tsx
pnpm test History.test.tsx
```

### E2E Tests

```bash
cd server
pnpm test:e2e credit.e2e-spec.ts
pnpm test:e2e history.e2e-spec.ts
```

**E2E Test Example**:
```typescript
describe('Credit System (e2e)', () => {
  it('should deduct credit on try-on', async () => {
    const user = await createTestUser();
    const balance Before = await getBalance(user.id);

    await request(app.getHttpServer())
      .post('/api/outfit-change/tryon')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ modelPhotoId: '...', clothingItemId: '...' })
      .expect(201);

    const balanceAfter = await getBalance(user.id);
    expect(balanceAfter).toBe(balanceBefore - 10);
  });
});
```

---

## Common Issues & Solutions

### Issue 1: Migration Fails

**Error**: `relation "credit_transactions" already exists`

**Solution**:
```bash
# 重置数据库 (开发环境)
npx prisma migrate reset

# 或者删除失败的迁移
rm -rf prisma/migrations/[migration-name]
npx prisma migrate dev
```

### Issue 2: Credit 余额为负

**Error**: `Check constraint "check_credit_balance_non_negative" is violated`

**Cause**: 并发请求未正确处理

**Solution**: 确保使用事务并检查余额
```typescript
const user = await tx.user.findUniqueOrThrow(...);
if (user.creditBalance < amount) {
  throw new InsufficientCreditException();
}
```

### Issue 3: SWR 缓存不更新

**Solution**: 使用 `mutate` 手动刷新
```typescript
import { mutate } from 'swr';

// 刷新特定 key
mutate('/credit/balance');

// 刷新所有 keys
mutate(() => true);
```

---

## Performance Checklist

- [ ] 数据库索引已创建 (6个索引)
- [ ] Prisma Client 已生成 (`npx prisma generate`)
- [ ] SWR 缓存配置正确 (60秒过期)
- [ ] 分页使用 cursor 而非 offset
- [ ] 图片使用浏览器缓存 (Cache-Control header)

---

## Next Steps

1. **实施任务**: 运行 `/speckit.tasks` 生成详细任务清单
2. **代码审查**: 使用 OpenAPI contracts 进行前后端协作
3. **部署**: 参考 data-model.md 中的迁移策略

---

## Resources

- **规格文档**: [spec.md](spec.md)
- **数据模型**: [data-model.md](data-model.md)
- **研究文档**: [research.md](research.md)
- **API 契约**: [contracts/credit-api.yaml](contracts/credit-api.yaml), [contracts/history-api.yaml](contracts/history-api.yaml)
- **Prisma Docs**: https://www.prisma.io/docs
- **SWR Docs**: https://swr.vercel.app
- **NestJS Docs**: https://docs.nestjs.com

---

**总预估时间**: 7-10 天 (1-2 位全栈开发者)

**关键里程碑**:
- Day 2: Credit Service 完成 + 测试
- Day 4: Try-on 集成完成
- Day 7: 前端 UI 完成
- Day 10: 完整 E2E 测试通过
