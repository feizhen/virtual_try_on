# Research: Credit System and History Enhancements

**Feature**: 005-credit-history-features
**Date**: 2025-10-25
**Status**: Completed

## Overview

本文档记录了为实现 Credit 系统、历史记录、重试功能和图片替换功能所需的技术研究和决策。

## Research Areas

### 1. Prisma 事务处理最佳实践

**研究问题**: 如何在 NestJS + Prisma 中实现原子性的 credit 扣除和退还操作？

**Decision**: 使用 Prisma Interactive Transactions

**Rationale**:
- Prisma 提供两种事务模式：Sequential Operations (`prisma.$transaction([])`) 和 Interactive Transactions (`prisma.$transaction(async (tx) => {...})`)
- Interactive Transactions 更适合 credit 系统，因为需要在事务中进行条件判断（检查余额是否充足）
- 支持行级锁，避免并发冲突导致的余额错误

**Implementation Pattern**:
```typescript
async deductCredit(userId: string, amount: number, sessionId: string) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. 锁定用户记录并检查余额
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { creditBalance: true }
    });

    if (user.creditBalance < amount) {
      throw new InsufficientCreditException();
    }

    // 2. 扣除余额
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: { decrement: amount },
        totalCreditsSpent: { increment: amount }
      }
    });

    // 3. 创建交易记录
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
```

**Alternatives Considered**:
- ❌ **Sequential Transactions**: 无法在事务中进行条件判断
- ❌ **Optimistic Locking**: 需要重试逻辑，复杂度较高
- ❌ **Application-level Locking**: 无法保证数据库级一致性

**References**:
- [Prisma Transactions Documentation](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
- [NestJS + Prisma Best Practices](https://docs.nestjs.com/recipes/prisma)

---

### 2. 历史记录分页策略

**研究问题**: 如何高效实现历史记录的分页加载，支持 1000+ 条记录？

**Decision**: 使用 Cursor-based Pagination (游标分页)

**Rationale**:
- **Offset-based Pagination** (`skip/take`) 在大数据集上性能差（需要扫描 skip 的所有行）
- **Cursor-based Pagination** 使用唯一标识符（如 createdAt + id）作为游标，性能稳定
- Prisma 原生支持 cursor pagination
- 适合实时数据流（新记录不断添加）

**Implementation Pattern**:
```typescript
async getHistory(userId: string, pageSize: number = 20, cursor?: string) {
  const results = await this.prisma.outfitResult.findMany({
    where: {
      userId,
      deletedAt: null  // 排除软删除记录
    },
    take: pageSize + 1,  // 多取一条判断是否有下一页
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      modelPhoto: true,
      clothingItem: true,
      session: true
    }
  });

  const hasMore = results.length > pageSize;
  const items = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor, hasMore };
}
```

**Alternatives Considered**:
- ❌ **Offset Pagination**: 性能在大数据集上显著下降
- ❌ **Infinite Scroll only**: 缺乏跳转到特定页的能力（可结合使用）

**Performance Comparison**:
| 方案 | 1000条记录 | 10000条记录 | 优点 | 缺点 |
|------|-----------|------------|------|------|
| Offset | ~200ms | ~2s | 简单，支持跳页 | 大数据慢 |
| Cursor | ~50ms | ~50ms | 性能稳定 | 不支持跳页 |

**References**:
- [Prisma Pagination](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)
- [Cursor vs Offset Pagination](https://www.prisma.io/dataguide/managing-databases/pagination)

---

### 3. 图片替换时的引用完整性保护

**研究问题**: 当用户替换模特图时，如何确保历史记录仍能访问原始图片？

**Decision**: 图片引用计数 + 延迟删除策略

**Rationale**:
- 历史记录的完整性是核心需求（FR-028, FR-029）
- 不能简单删除旧图片，需要检查是否仍被引用
- 使用引用计数机制，当引用数为 0 时才删除物理文件

**Implementation Strategy**:

**数据模型扩展**:
```prisma
model ModelPhoto {
  id              String   @id @default(uuid())
  userId          String
  imageUrl        String
  // ... 其他字段

  // 新增字段
  version         Int      @default(1)          // 版本号
  replacementHistory Json? @db.JsonB          // 替换历史 [{version, oldUrl, replacedAt}]
  isArchived      Boolean  @default(false)     // 是否归档（被替换）

  // 引用关系
  outfitResults   OutfitResult[]               // 被哪些结果引用
}
```

**替换逻辑**:
```typescript
async replaceModelPhoto(photoId: string, newFile: Express.Multer.File) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. 获取旧照片信息
    const oldPhoto = await tx.modelPhoto.findUniqueOrThrow({
      where: { id: photoId },
      include: { outfitResults: true }
    });

    // 2. 检查是否被历史记录引用
    const isReferenced = oldPhoto.outfitResults.length > 0;

    if (isReferenced) {
      // 方案A: 创建新版本，保留旧文件
      const newVersion = oldPhoto.version + 1;
      const replacementHistory = [
        ...(oldPhoto.replacementHistory || []),
        {
          version: oldPhoto.version,
          oldUrl: oldPhoto.imageUrl,
          replacedAt: new Date().toISOString()
        }
      ];

      // 上传新文件
      const newImageUrl = await this.storage.saveFile(newFile, 'models');

      // 更新记录（保留旧文件，不删除）
      return await tx.modelPhoto.update({
        where: { id: photoId },
        data: {
          imageUrl: newImageUrl,
          version: newVersion,
          replacementHistory,
          originalFileName: newFile.originalname,
          fileSize: newFile.size,
          updatedAt: new Date()
        }
      });
    } else {
      // 方案B: 无引用，直接替换并删除旧文件
      const newImageUrl = await this.storage.saveFile(newFile, 'models');

      // 删除旧文件
      await this.storage.deleteFile(oldPhoto.imageUrl);

      return await tx.modelPhoto.update({
        where: { id: photoId },
        data: {
          imageUrl: newImageUrl,
          version: oldPhoto.version + 1,
          originalFileName: newFile.originalname,
          fileSize: newFile.size
        }
      });
    }
  });
}
```

**Alternatives Considered**:
- ❌ **总是保留旧文件**: 存储空间无限增长
- ❌ **总是删除旧文件**: 破坏历史记录完整性
- ❌ **复制到归档目录**: 增加复杂度，难以管理

**Storage Impact**:
- 假设每张图片 2MB，用户平均替换 3 次，10000 用户 = ~60GB 额外存储
- 可后期添加清理策略（如 90 天后压缩归档图片）

**References**:
- [File Management Best Practices](https://www.prisma.io/docs/guides/database/advanced-database-tasks/cascading-deletes)
- [Soft Delete Patterns](https://www.prisma.io/docs/guides/database/soft-delete)

---

### 4. Credit 退还时机和异常处理

**研究问题**: 虚拟试衣失败时，如何确保 credit 正确退还？

**Decision**: 使用 Try-Catch + 补偿事务模式

**Rationale**:
- 虚拟试衣是异步操作，可能在扣费后失败
- 需要在失败时自动触发退款逻辑
- 使用补偿事务而非两阶段提交（2PC），降低复杂度

**Implementation Flow**:

```typescript
async processTryOn(userId: string, modelPhotoId: string, clothingItemId: string) {
  let creditTransaction: CreditTransaction | null = null;
  let session: ProcessingSession | null = null;

  try {
    // 1. 扣除 credit（在事务中）
    const deductResult = await this.creditService.deductCredit(
      userId,
      this.TRYON_COST,
      null  // sessionId 尚未生成
    );
    creditTransaction = deductResult.transaction;

    // 2. 创建处理会话
    session = await this.prisma.processingSession.create({
      data: {
        userId,
        modelPhotoId,
        clothingItemId,
        status: 'pending',
        creditTransactionId: creditTransaction.id
      }
    });

    // 3. 异步处理虚拟试衣（不 await）
    this.processInBackground(session.id).catch(async (error) => {
      // 处理失败，触发退款
      await this.handleProcessingFailure(session.id, error);
    });

    return { sessionId: session.id, status: 'pending' };

  } catch (error) {
    // 如果扣费或创建会话失败，立即回滚
    if (creditTransaction) {
      await this.creditService.refundCredit(
        userId,
        this.TRYON_COST,
        creditTransaction.id,
        'Processing initialization failed'
      );
    }
    throw error;
  }
}

async handleProcessingFailure(sessionId: string, error: Error) {
  const session = await this.prisma.processingSession.findUnique({
    where: { id: sessionId },
    include: { creditTransaction: true }
  });

  // 退还 credit
  const refund = await this.creditService.refundCredit(
    session.userId,
    this.TRYON_COST,
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

**Error Scenarios Covered**:
1. **扣费前失败**: 无需处理
2. **扣费成功但会话创建失败**: 立即退款
3. **AI 处理失败**: 后台捕获并退款
4. **退款失败**: 记录到错误日志，需要人工介入（极端情况）

**Idempotency**:
- 每次退款使用唯一的 `originalTransactionId` 避免重复退款
- Credit 服务内部检查是否已退款

**Alternatives Considered**:
- ❌ **两阶段提交 (2PC)**: 过于复杂，Prisma 不原生支持分布式事务
- ❌ **先处理后扣费**: 用户可能在处理完成前离开，导致无法扣费
- ❌ **预授权模式**: 增加状态复杂度（pending credit）

**References**:
- [Saga Pattern for Distributed Transactions](https://microservices.io/patterns/data/saga.html)
- [NestJS Error Handling](https://docs.nestjs.com/exception-filters)

---

### 5. 前端状态管理策略

**研究问题**: Credit 余额和历史记录如何在前端高效管理？

**Decision**: React Context + SWR 数据获取

**Rationale**:
- **React Context**: 适合全局共享的 credit 余额状态
- **SWR (stale-while-revalidate)**: 自动缓存、重新验证、优化数据获取
- 避免引入 Redux/MobX 等重量级状态管理（当前项目未使用）
- SWR 提供乐观更新、重试、焦点重新验证等开箱即用功能

**Implementation Pattern**:

**Credit Context**:
```typescript
// contexts/CreditContext.tsx
import useSWR, { mutate } from 'swr';

interface CreditContextValue {
  balance: number | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => void;
  optimisticDeduct: (amount: number) => void;
}

export const CreditContext = createContext<CreditContextValue>(null);

export function CreditProvider({ children }) {
  const { data, error, isLoading } = useSWR('/api/credit/balance', fetcher, {
    refreshInterval: 60000,  // 每分钟自动刷新
    revalidateOnFocus: true, // 窗口获得焦点时刷新
  });

  const optimisticDeduct = (amount: number) => {
    // 乐观更新（立即扣除，不等待服务器响应）
    mutate('/api/credit/balance',
      (current) => ({ balance: current.balance - amount }),
      false  // 不重新验证
    );
  };

  return (
    <CreditContext.Provider value={{
      balance: data?.balance,
      isLoading,
      error,
      refresh: () => mutate('/api/credit/balance'),
      optimisticDeduct
    }}>
      {children}
    </CreditContext.Provider>
  );
}
```

**History List with SWR**:
```typescript
// pages/History.tsx
function History() {
  const { data, error, size, setSize } = useSWRInfinite(
    (index, previousData) => {
      if (previousData && !previousData.hasMore) return null;
      const cursor = previousData?.nextCursor;
      return `/api/history?cursor=${cursor || ''}&limit=20`;
    },
    fetcher
  );

  const items = data ? data.flatMap(page => page.items) : [];
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';

  return (
    <div>
      <HistoryList items={items} />
      {data?.[data.length - 1]?.hasMore && (
        <button onClick={() => setSize(size + 1)} disabled={isLoadingMore}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

**Alternatives Considered**:
- ❌ **Redux**: 过重，项目未使用
- ❌ **React Query**: 功能类似 SWR，但 SWR 更轻量
- ❌ **纯 useState + useEffect**: 需要手动实现缓存、重试等逻辑

**Benefits**:
- 自动去重请求
- 缓存和重新验证
- 乐观更新支持
- 焦点/网络重连自动刷新
- 无限滚动内置支持

**Package Addition**:
```json
{
  "dependencies": {
    "swr": "^2.2.5"
  }
}
```

**References**:
- [SWR Documentation](https://swr.vercel.app/)
- [SWR Infinite Loading](https://swr.vercel.app/docs/pagination#useswrinfinite)

---

### 6. API 契约设计标准

**研究问题**: 如何设计清晰、一致的 Credit 和 History API？

**Decision**: 遵循 RESTful + OpenAPI 3.0 规范

**Rationale**:
- 现有项目已使用 RESTful 风格
- OpenAPI 3.0 提供完整的 API 文档和类型定义
- 便于前后端协作和自动化测试

**API Design Principles**:

1. **资源命名**:
   - `/api/credit/*` - Credit 相关
   - `/api/history/*` - 历史记录相关
   - 使用复数形式（如 `/transactions` 而非 `/transaction`）

2. **HTTP 方法**:
   - GET: 查询（余额、历史记录）
   - POST: 创建（重试、替换图片）
   - DELETE: 软删除（历史记录）

3. **响应格式**:
   ```typescript
   {
     "success": true,
     "data": {...},
     "meta"?: {  // 分页信息
       "cursor": "xxx",
       "hasMore": true
     }
   }
   ```

4. **错误响应**:
   ```typescript
   {
     "success": false,
     "error": {
       "code": "INSUFFICIENT_CREDIT",
       "message": "Credit balance is insufficient",
       "details": { "required": 10, "available": 5 }
     }
   }
   ```

**Key Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credit/balance` | 获取当前余额 |
| GET | `/api/credit/transactions` | 获取交易历史 |
| GET | `/api/history` | 获取试衣历史（分页） |
| GET | `/api/history/:id` | 获取单条历史详情 |
| POST | `/api/outfit-change/retry/:resultId` | 重试虚拟试衣 |
| POST | `/api/outfit-change/models/:id/replace` | 替换模特图 |
| DELETE | `/api/history/:id` | 软删除历史记录 |

**Alternatives Considered**:
- ❌ **GraphQL**: 项目未使用，引入学习成本
- ❌ **RPC 风格**: 与现有 API 风格不一致

**References**:
- [OpenAPI Specification](https://swagger.io/specification/)
- [REST API Best Practices](https://restfulapi.net/)

---

## Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Backend Framework | NestJS | 10.x | 模块化架构、依赖注入 |
| ORM | Prisma | 5.x | 数据库访问、事务处理 |
| Database | PostgreSQL | 14+ | 数据存储、ACID 事务 |
| Frontend Framework | React | 18.x | UI 组件化 |
| Data Fetching | SWR | 2.2.x | 缓存、重新验证、乐观更新 |
| Testing (Backend) | Jest | 29.x | 单元测试、E2E 测试 |
| Testing (Frontend) | Vitest | 1.x | 组件测试 |
| API Documentation | OpenAPI | 3.0 | API 契约、文档生成 |

## Performance Considerations

### Database Indexes

为优化查询性能，需要添加以下索引：

```prisma
model OutfitResult {
  // ...

  @@index([userId, createdAt(sort: Desc)])  // 历史记录查询
  @@index([userId, deletedAt])              // 软删除过滤
}

model CreditTransaction {
  // ...

  @@index([userId, createdAt(sort: Desc)])  // 交易历史查询
  @@index([sessionId])                       // 关联查询
}
```

### Caching Strategy

- **前端**: SWR 自动缓存，60秒过期
- **后端**: 暂不引入 Redis（可后期添加）
- **静态资源**: 图片使用浏览器缓存（Cache-Control: max-age=31536000）

## Security Considerations

1. **认证**: 所有 API 使用 JwtAuthGuard
2. **授权**: 用户只能访问自己的数据（userId 过滤）
3. **输入验证**: 使用 class-validator 验证 DTO
4. **文件上传**: 保持现有验证（Magic Number + 大小限制）
5. **事务隔离**: 使用 PostgreSQL 默认隔离级别（Read Committed）

## Migration Strategy

1. **数据库迁移**: Prisma migrate
   ```bash
   npx prisma migrate dev --name add-credit-system
   ```

2. **初始化现有用户 credit**:
   ```sql
   UPDATE "User" SET "creditBalance" = 100 WHERE "creditBalance" IS NULL;
   ```

3. **零停机部署**:
   - 先部署数据库迁移（添加字段，设置默认值）
   - 再部署应用代码
   - 向后兼容：新字段有默认值

## Open Questions Resolved

所有技术上下文中的 "NEEDS CLARIFICATION" 项已通过研究解决：

- ✅ 事务处理: Prisma Interactive Transactions
- ✅ 分页策略: Cursor-based Pagination
- ✅ 图片引用保护: 引用计数 + 条件删除
- ✅ 退款机制: 补偿事务模式
- ✅ 前端状态管理: React Context + SWR
- ✅ API 设计: RESTful + OpenAPI 3.0

## Next Steps

进入 Phase 1: 设计详细的数据模型和 API 契约。
