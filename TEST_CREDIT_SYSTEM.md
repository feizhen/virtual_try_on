# Credit System 测试指南

## 前置条件

### 1. 启动 PostgreSQL 数据库

您需要在端口 5433 上运行 PostgreSQL 数据库。选择以下方式之一：

#### 方式 A: 使用 Docker（推荐）

```bash
# 启动 PostgreSQL 容器
docker run --name vibe-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vibe_db \
  -p 5433:5432 \
  -d postgres:14

# 检查容器是否运行
docker ps | grep vibe-postgres
```

#### 方式 B: 使用本地 PostgreSQL

如果已安装 PostgreSQL，确保它在端口 5433 运行，或修改 `server/.env` 中的 `DATABASE_URL`。

### 2. 运行数据库迁移

```bash
cd /Users/bytedance/Claude/virtual_try_on/server

# 应用迁移（创建表和字段）
npx prisma migrate deploy

# 或者如果在开发环境
npx prisma migrate dev

# 生成 Prisma Client
npx prisma generate

# 初始化现有用户的 credits
npx prisma db execute --file ./scripts/init-user-credits.sql
```

### 3. 启动后端服务

```bash
cd /Users/bytedance/Claude/virtual_try_on/server

# 安装依赖（如果需要）
pnpm install

# 启动开发服务器
pnpm dev

# 服务应该运行在 http://localhost:3000
```

### 4. 启动前端服务

在新的终端窗口：

```bash
cd /Users/bytedance/Claude/virtual_try_on/client

# 安装依赖（如果需要）
pnpm install

# 启动开发服务器
pnpm dev

# 前端应该运行在 http://localhost:5173
```

---

## 🧪 测试场景

### 测试 1: 新用户注册获得初始 100 Credits

**步骤**:
1. 打开浏览器访问 http://localhost:5173
2. 点击"注册"
3. 填写用户信息并提交
4. 注册成功后，检查页面右上角的 CreditBadge
5. **预期结果**: 显示 "💳 100 Credits"

**验证点**:
- ✅ CreditBadge 显示 100 credits
- ✅ 悬停 CreditBadge 显示详细信息：
  - 可用余额: 100
  - 总消费: 0
  - 总获得: 100

**后端验证**（可选）:
```bash
# 在 server 目录执行
npx prisma studio

# 打开浏览器，查看：
# 1. User 表 -> 找到新用户 -> 检查 creditBalance = 100
# 2. CreditTransaction 表 -> 找到 INITIAL_GRANT 类型的记录
```

---

### 测试 2: 虚拟试衣扣除 10 Credits

**前置条件**:
- 已登录用户
- 已上传至少一张模特照片
- 已上传至少一件服装
- **重要**: 需要配置 Gemini API Key（否则会失败）

**步骤**:
1. 在首页或虚拟试衣页面
2. 选择一张模特照片
3. 选择一件服装
4. 点击"开始试衣"按钮
5. 观察 CreditBadge 的变化

**预期结果**:

**4a. 如果 Gemini API 配置成功**:
- ✅ 按钮文本变为"试衣中..."
- ✅ CreditBadge 显示 "💳 90 Credits"（扣除 10）
- ✅ 试衣完成后显示结果图片
- ✅ CreditBadge 保持 90 credits

**4b. 如果 Gemini API 未配置**:
- ❌ 试衣会失败
- ✅ **自动退款**: CreditBadge 应该恢复到 "💳 100 Credits"
- ✅ 显示错误消息

**验证点**:
- ✅ 成功扣除 10 credits
- ✅ 或失败时自动退款 10 credits

---

### 测试 3: Credit 余额不足时禁止试衣

**步骤**:
1. 重复"测试 2"共 10 次，消耗完所有 100 credits
2. 当余额为 0 时，再次尝试试衣

**预期结果**:
- ✅ CreditBadge 显示 "💳 0 Credits"
- ✅ CreditBadge 变为红色（低余额警告）
- ✅ "开始试衣"按钮被禁用
- ✅ 按钮文本显示"Credits 不足 (需要 10)"
- ✅ 悬停按钮显示提示："Credits 不足，需要 10 credits"

---

### 测试 4: 查看交易历史

**步骤**:
1. 在代码中找到一个合适的地方渲染 CreditHistory 组件
   - 可以临时添加到 Home 页面底部
   - 或创建一个新的 /credits 路由

**临时测试方式**（修改 Home.tsx）:
```tsx
import { CreditHistory } from '../components/Credit/CreditHistory';

// 在 Home 组件的 return 中，在底部添加：
<div style={{ marginTop: '40px', padding: '20px' }}>
  <CreditHistory />
</div>
```

**预期结果**:
- ✅ 显示所有交易记录，按时间倒序
- ✅ 初始赠送记录：🎁 初始赠送 +100
- ✅ 扣除记录：💸 扣除 -10（每次试衣）
- ✅ 退款记录：💰 退还 +10（如果有失败的试衣）
- ✅ 每条记录显示：
  - 交易类型和金额
  - 描述信息
  - 时间戳
  - 余额变化（before → after）

---

### 测试 5: Credit 自动刷新

**步骤**:
1. 打开两个浏览器标签，都登录同一个账号
2. 在标签 A 执行虚拟试衣
3. 观察标签 B 的 CreditBadge

**预期结果**:
- ✅ 标签 B 的 CreditBadge 在 30 秒内自动更新（SWR 自动刷新间隔）
- ✅ 或当标签 B 获得焦点时立即更新（revalidateOnFocus）

---

## 🐛 常见问题排查

### 问题 1: CreditBadge 显示 "--"
**原因**: API 调用失败
**检查**:
- 后端服务是否运行？
- 浏览器控制台是否有错误？
- 网络请求是否成功？（F12 -> Network 标签）

### 问题 2: 试衣失败但没有退款
**原因**: 退款逻辑未触发
**检查**:
- 后端日志是否显示退款操作？
- 查看 `server/src/modules/outfit-change/outfit-change.service.ts` 的 catch 块
- 检查 CreditTransaction 表是否有 REFUND 类型的记录

### 问题 3: 余额为负数
**原因**: 并发问题或事务失败
**检查**:
- 数据库约束是否生效？（应该有 CHECK 约束）
- 是否有多个并发请求？
- 查看后端日志的错误信息

---

## 📊 数据库验证

使用 Prisma Studio 可视化查看数据：

```bash
cd /Users/bytedance/Claude/virtual_try_on/server
npx prisma studio
```

**检查项**:
1. **User 表**
   - `creditBalance` 字段是否正确
   - `totalCreditsSpent` 是否累加
   - `totalCreditsEarned` 是否正确

2. **CreditTransaction 表**
   - 每次试衣是否有对应的 DEDUCT 记录
   - 失败试衣是否有 REFUND 记录
   - `balanceBefore` 和 `balanceAfter` 是否一致

3. **ProcessingSession 表**
   - `creditTransactionId` 是否关联到交易记录
   - `creditRefundTransactionId` 是否在失败时填充

---

## ✅ 测试检查清单

- [ ] 新用户注册获得 100 credits
- [ ] CreditBadge 正确显示余额
- [ ] 虚拟试衣成功扣除 10 credits
- [ ] 虚拟试衣失败自动退款
- [ ] 余额不足时禁止试衣
- [ ] 交易历史正确显示
- [ ] Credit 数据自动刷新
- [ ] 低余额警告显示（< 20 credits）
- [ ] 数据库记录完整性

---

## 🎯 下一步

测试完成后，您可以：
1. 继续实施 Phase 4: 历史记录查看功能
2. 实施 Phase 5: 重试功能
3. 实施 Phase 6: 模特图替换功能
4. 或者根据测试结果修复发现的问题

---

**测试愉快！** 🚀
