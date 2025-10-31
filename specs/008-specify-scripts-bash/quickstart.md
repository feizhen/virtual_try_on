# Quick Start: TOS 图片云存储迁移

**Feature**: TOS 图片云存储迁移
**Branch**: `008-specify-scripts-bash`
**Date**: 2025-10-29

## 概述

本文档提供 TOS 图片云存储功能的快速配置和测试指南。

---

## 前置条件

### 1. 火山引擎 TOS 准备

**步骤**:

1. **注册火山引擎账号**: https://www.volcengine.com/
2. **开通 TOS 服务**: 在控制台启用对象存储 TOS
3. **创建存储桶**:
   - 名称: `virtual-try-on-prod` (生产) / `virtual-try-on-dev` (开发)
   - 区域: 选择离用户最近的区域(如 cn-beijing)
   - 访问权限: **私有读写** (重要: 不要设为公开)
   - 存储类型: 标准存储

4. **创建 IAM 用户**:
   - 用户名: `virtual-try-on-service`
   - 授予权限: 仅 TOS 操作权限(PutObject, GetObject, DeleteObject, ListObjects)
   - 生成 AccessKey: 保存 Access Key ID 和 Secret Access Key

5. **绑定 CDN 加速域名**:
   - 在 TOS 控制台绑定自定义域名(如 `cdn.virtual-try-on.com`)
   - 配置 DNS CNAME 记录指向火山引擎 CDN
   - 配置 CDN 回源鉴权(使用 TOS 私钥签名)
   - 启用 HTTPS(推荐使用免费 SSL 证书)

### 2. 本地开发环境

**必需软件**:
- Node.js 18+
- PostgreSQL 14+
- pnpm 或 npm

---

## 安装和配置

### 1. 安装依赖

```bash
cd server
npm install @volcengine/tos-sdk
```

### 2. 配置环境变量

**开发环境** (`.env` 文件):

```env
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/virtual_try_on_dev"

# 存储配置 - 开发环境使用本地存储
STORAGE_TYPE=local
UPLOAD_DIR=uploads

# TOS 配置 (可选,用于测试)
TOS_ACCESS_KEY_ID=your_access_key_id_here
TOS_SECRET_ACCESS_KEY=your_secret_access_key_here
TOS_REGION=cn-beijing
TOS_ENDPOINT=tos-cn-beijing.volces.com
TOS_BUCKET=virtual-try-on-dev
TOS_CDN_DOMAIN=https://cdn-dev.virtual-try-on.com
```

**生产环境** (Railway Secrets 或 K8s ConfigMap):

```env
# 数据库配置
DATABASE_URL="postgresql://user:password@prod-db:5432/virtual_try_on_prod"

# 存储配置 - 生产环境使用 TOS
STORAGE_TYPE=tos

# TOS 配置 (必需)
TOS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
TOS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
TOS_REGION=cn-beijing
TOS_ENDPOINT=tos-cn-beijing.volces.com
TOS_BUCKET=virtual-try-on-prod
TOS_CDN_DOMAIN=https://cdn.virtual-try-on.com
```

**重要提示**:
- ⚠️ 不要提交 `.env` 文件到 Git 仓库
- ⚠️ 生产环境密钥使用平台的 Secret 管理工具
- ⚠️ 定期轮换 AccessKey/SecretKey (建议 90 天)

### 3. 数据库迁移

```bash
cd server

# 生成 Prisma Client (基于新 schema)
npx prisma generate

# 创建数据库迁移文件
npx prisma migrate dev --name add_tos_storage_fields

# 应用迁移到数据库
npx prisma migrate deploy

# 验证迁移成功
npx prisma studio  # 打开 Prisma Studio,检查新字段
```

### 4. 验证配置

**测试 TOS 连接**:

```bash
# 创建测试脚本: server/scripts/test-tos-connection.ts
```

```typescript
import TOS from '@volcengine/tos-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function testTosConnection() {
  const client = new TOS({
    accessKeyId: process.env.TOS_ACCESS_KEY_ID,
    accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY,
    region: process.env.TOS_REGION,
    endpoint: process.env.TOS_ENDPOINT,
  });

  try {
    // 测试上传小文件
    console.log('Testing TOS upload...');
    await client.putObject({
      bucket: process.env.TOS_BUCKET,
      key: 'test/connection-test.txt',
      body: Buffer.from('TOS connection test successful'),
    });
    console.log('✅ Upload successful');

    // 测试删除
    console.log('Testing TOS delete...');
    await client.deleteObject({
      bucket: process.env.TOS_BUCKET,
      key: 'test/connection-test.txt',
    });
    console.log('✅ Delete successful');

    console.log('\n🎉 TOS connection test passed!');
  } catch (error) {
    console.error('❌ TOS connection test failed:', error.message);
    process.exit(1);
  }
}

testTosConnection();
```

```bash
# 运行测试
npx ts-node server/scripts/test-tos-connection.ts
```

---

## 启动应用

### 1. 启动后端(本地存储模式)

```bash
cd server
npm run start:dev
```

验证:
- 访问 http://localhost:3000/health 应返回 200 OK
- 日志显示 `Storage mode: local`

### 2. 启动后端(TOS 存储模式)

```bash
cd server

# 修改 .env
# STORAGE_TYPE=tos

npm run start:dev
```

验证:
- 日志显示 `Storage mode: tos`
- 日志显示 `TOS initialized: bucket=virtual-try-on-dev`

### 3. 启动前端

```bash
cd client
pnpm dev
```

访问 http://localhost:5173

---

## 功能测试

### Test Case 1: 上传模特照片到 TOS

**步骤**:
1. 登录应用
2. 进入虚拟试衣页面
3. 点击 "上传模特照片"
4. 选择一张 JPEG 图片(< 10MB)
5. 等待上传完成

**验证**:
```sql
-- 查询数据库
SELECT id, storage_type, tos_key, cdn_url, original_file_name
FROM model_photos
WHERE user_id = '{your_user_id}'
ORDER BY uploaded_at DESC
LIMIT 1;

-- 期望结果:
-- storage_type: 'tos'
-- tos_key: 'models/{uuid}.jpg'
-- cdn_url: 'https://cdn.xxx.com/models/{uuid}.jpg'
```

**浏览器验证**:
- 网络面板查看上传请求: POST /api/outfit-change/models/upload
- 响应包含 cdnUrl 字段
- 图片预览显示来自 CDN 的 URL

**TOS 控制台验证**:
- 登录火山引擎控制台
- 进入 TOS 存储桶
- 找到 `models/{uuid}.jpg` 文件

---

### Test Case 2: 访问 TOS 图片通过 CDN

**步骤**:
1. 复制上一步返回的 cdnUrl
2. 在浏览器新标签页打开该 URL
3. 图片应快速加载并显示

**性能验证**:
```bash
# 使用 curl 测试 TTFB (首字节时间)
curl -o /dev/null -s -w "Time to first byte: %{time_starttransfer}s\n" \
  https://cdn.virtual-try-on.com/models/{uuid}.jpg

# 期望: Time to first byte < 0.2s (200ms)
```

---

### Test Case 3: 删除 TOS 图片

**步骤**:
1. 在图片库中选择一张未使用的图片
2. 点击 "删除" 按钮
3. 确认删除

**验证**:
```sql
-- 查询数据库 (软删除)
SELECT id, deleted_at, tos_key
FROM model_photos
WHERE id = '{photo_id}';

-- 期望结果:
-- deleted_at: NOT NULL (有时间戳)
```

```bash
# 测试 TOS 文件是否删除
curl -I https://cdn.virtual-try-on.com/models/{uuid}.jpg

# 期望: HTTP 404 Not Found (异步删除可能延迟,等待 1-2 分钟)
```

---

### Test Case 4: 替换模特照片

**步骤**:
1. 选择一张已存在的模特照片
2. 点击 "替换" 按钮
3. 上传新图片
4. 等待上传完成

**验证**:
```sql
-- 查询数据库
SELECT id, version, tos_key, cdn_url, is_archived, replacement_history
FROM model_photos
WHERE user_id = '{user_id}'
ORDER BY uploaded_at DESC;

-- 如果照片未被使用:
-- - 旧记录: tos_key 已删除(或查询 TOS 返回 404)
-- - 新记录: 新的 tos_key 和 cdn_url

-- 如果照片已被历史引用:
-- - 旧记录: is_archived=true, tos_key 移动到 archived/models/
-- - 新记录: version 递增, 新的 tos_key
```

---

### Test Case 5: 存储模式切换

**步骤**:
1. 停止应用
2. 修改 `.env`: `STORAGE_TYPE=local`
3. 重启应用
4. 上传新图片

**验证**:
```sql
-- 查询数据库
SELECT id, storage_type, image_url, tos_key, cdn_url
FROM model_photos
ORDER BY uploaded_at DESC
LIMIT 1;

-- 期望结果:
-- storage_type: 'local'
-- image_url: 'uploads/models/{uuid}.jpg'
-- tos_key: NULL
-- cdn_url: NULL
```

```bash
# 验证本地文件存在
ls -lh server/uploads/models/{uuid}.jpg
```

---

### Test Case 6: 虚拟试衣结果保存到 TOS

**步骤**:
1. 上传模特照片和衣服照片(TOS 模式)
2. 执行虚拟试衣
3. 等待结果生成

**验证**:
```sql
-- 查询结果
SELECT id, storage_type, tos_key, cdn_url
FROM outfit_results
WHERE user_id = '{user_id}'
ORDER BY created_at DESC
LIMIT 1;

-- 期望结果:
-- storage_type: 'tos'
-- tos_key: 'results/{uuid}.png'
-- cdn_url: 'https://cdn.xxx.com/results/{uuid}.png'
```

**浏览器验证**:
- 结果图片通过 CDN URL 加载
- 图片清晰完整显示

---

## 性能测试

### 1. 上传延迟测试

```bash
# 使用 curl 测试上传 5MB 图片
time curl -X POST http://localhost:3000/api/outfit-change/models/upload \
  -H "Authorization: Bearer {your_token}" \
  -F "file=@test-5mb.jpg" \
  -F "originalFileName=test.jpg"

# 期望: 总耗时 < 10秒
```

### 2. 并发上传测试

```bash
# 使用 Apache Bench 测试并发上传
ab -n 50 -c 10 \
  -H "Authorization: Bearer {token}" \
  -p upload-payload.txt \
  -T "multipart/form-data; boundary=----Boundary" \
  http://localhost:3000/api/outfit-change/models/upload

# 期望: 所有请求成功,P95 延迟 < 10秒
```

### 3. CDN 访问延迟测试

```bash
# 测试全球多个地区的 CDN 延迟
for region in us-east us-west eu-west asia-southeast; do
  echo "Testing from $region..."
  curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s, Total: %{time_total}s\n" \
    --resolve cdn.virtual-try-on.com:443:{cdn_ip_for_region} \
    https://cdn.virtual-try-on.com/models/test.jpg
done

# 期望: 所有地区 TTFB < 500ms
```

---

## 故障排查

### 问题 1: TOS 上传失败,错误 "AccessDenied"

**原因**: IAM 用户权限不足或 AccessKey 错误

**解决**:
1. 检查环境变量 `TOS_ACCESS_KEY_ID` 和 `TOS_SECRET_ACCESS_KEY` 是否正确
2. 在火山引擎控制台检查 IAM 用户权限:
   - 必须包含 `tos:PutObject` 权限
   - 确认 AccessKey 状态为 "已启用"
3. 测试 AccessKey 有效性:
   ```bash
   npx ts-node server/scripts/test-tos-connection.ts
   ```

---

### 问题 2: CDN URL 无法访问,返回 403 Forbidden

**原因**: CDN 回源鉴权配置错误或存储桶权限问题

**解决**:
1. 检查 TOS 存储桶权限:
   - 确保存储桶为 "私有读写"
   - CDN 回源使用密钥签名
2. 检查 CDN 配置:
   - 登录火山引擎 CDN 控制台
   - 确认回源鉴权配置正确
   - 测试 CDN CNAME 解析:
     ```bash
     nslookup cdn.virtual-try-on.com
     # 应返回火山引擎 CDN 地址
     ```
3. 临时测试: 使用 TOS 直接 URL(跳过 CDN)
   ```
   https://{bucket}.{endpoint}/{key}
   ```

---

### 问题 3: 图片上传成功但数据库记录缺少 cdnUrl

**原因**: 代码逻辑错误或环境变量 `TOS_CDN_DOMAIN` 未配置

**解决**:
1. 检查环境变量:
   ```bash
   echo $TOS_CDN_DOMAIN
   # 应输出: https://cdn.virtual-try-on.com
   ```
2. 检查代码逻辑:
   ```typescript
   // tos-storage.provider.ts
   const cdnUrl = `${this.cdnDomain}/${key}`;
   // 确保 this.cdnDomain 正确加载
   ```
3. 查看应用日志:
   ```bash
   grep "CDN URL" server/logs/app.log
   ```

---

### 问题 4: 数据库迁移失败

**错误**: `column "storage_type" already exists`

**原因**: 迁移已执行,重复运行

**解决**:
```bash
# 检查迁移状态
npx prisma migrate status

# 如果迁移未记录,手动标记为已完成
npx prisma migrate resolve --applied add_tos_storage_fields
```

---

### 问题 5: 本地存储切换到 TOS 后,旧图片无法访问

**原因**: 旧图片 URL 仍指向本地路径 `/uploads/...`

**解决**: 这是预期行为,旧图片继续使用本地存储

**验证**:
```sql
-- 检查旧图片的 storage_type
SELECT storage_type, image_url, tos_key
FROM model_photos
WHERE uploaded_at < '{切换时间}';

-- 应显示: storage_type='local', tos_key=NULL
```

如需迁移旧图片到 TOS,运行迁移脚本(暂不提供,需单独开发)

---

## 监控和日志

### 关键日志

**TOS 上传成功**:
```
[TosStorageProvider] Upload success: models/550e8400-e29b-41d4-a716-446655440000.jpg, size: 5242880 bytes, duration: 3421ms
```

**TOS 上传失败**:
```
[TosStorageProvider] Upload failed: models/xxx.jpg, error: NetworkError, code: ECONNRESET, retries: 3
```

**存储模式切换**:
```
[StorageModule] Storage mode: tos, bucket: virtual-try-on-prod, CDN: https://cdn.virtual-try-on.com
```

### 监控指标

**建议监控**:
1. TOS 上传成功率: `tos_upload_success_rate` (目标: ≥99.5%)
2. TOS 上传延迟 P95: `tos_upload_latency_p95` (目标: ≤8秒)
3. CDN 访问 TTFB: `cdn_ttfb_p50` (目标: ≤200ms)
4. TOS 存储空间使用率: `tos_storage_usage_percent` (告警阈值: >80%)
5. TOS API 错误率: `tos_api_error_rate` (告警阈值: >1%)

**Prometheus 示例**:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'virtual-try-on'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

---

## 回滚计划

### 场景 1: TOS 服务故障

**症状**: TOS API 返回 500 错误,上传全部失败

**回滚步骤**:
```bash
# 1. 修改环境变量
STORAGE_TYPE=local

# 2. 重启应用
pm2 restart virtual-try-on-server

# 3. 验证
curl -I http://localhost:3000/health
```

**影响**: 新上传使用本地存储,已上传到 TOS 的图片仍可访问(如果 CDN 正常)

---

### 场景 2: CDN 故障

**症状**: CDN URL 无法访问,但 TOS 直接 URL 正常

**临时方案**: 使用 TOS 直接 URL(需修改代码)
```typescript
// 临时修改: 返回 TOS 直接 URL 而非 CDN URL
const url = `https://${this.bucket}.${this.endpoint}/${key}`;
```

**重新部署**

---

## 下一步

完成测试后,准备进入 `/speckit.tasks` 阶段,生成详细的实现任务清单。

---

## 参考资料

- [火山引擎 TOS 官方文档](https://www.volcengine.com/docs/6349)
- [TOS Node.js SDK 文档](https://www.volcengine.com/docs/6349/74847)
- [火山引擎 CDN 配置指南](https://www.volcengine.com/docs/6454)
- [Prisma 数据库迁移指南](https://www.prisma.io/docs/concepts/components/prisma-migrate)
