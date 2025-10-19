# 中国部署指南: AI虚拟换装功能

**Feature**: 001-ai-outfit-change
**Date**: 2025-10-18
**Target**: 中国大陆部署环境

---

## 概述

本文档专门针对中国大陆部署环境,说明云服务选型、配置和优化建议。

---

## 云服务选型

### 1. 对象存储 - 阿里云OSS

**选择理由**:
- ✅ 中国境内节点覆盖最广
- ✅ 国内访问速度最快
- ✅ 符合数据本地化要求
- ✅ 与CDN无缝集成
- ✅ 企业级SLA保障

**区域选择建议**:
- **华北**: `oss-cn-beijing` (北京)
- **华东**: `oss-cn-shanghai` (上海)
- **华南**: `oss-cn-shenzhen` (深圳)
- **多区域冗余**: 开启同城冗余存储(LRS)或跨区域复制(CRR)

**定价参考** (标准存储):
- 存储: ¥0.12/GB/月
- 下载流量: ¥0.50/GB (外网)
- PUT请求: ¥0.01/万次
- GET请求: ¥0.01/万次

### 2. CDN加速 - 阿里云CDN

**配置步骤**:
1. 在OSS控制台绑定自定义域名
2. 创建CDN加速域名
3. 配置CNAME解析
4. 开启HTTPS (免费SSL证书)

**优化建议**:
```
缓存策略:
- 图片文件 (jpg/png/webp): 缓存30天
- AI生成结果: 缓存7天
- 签名URL: 不缓存 (动态生成)

性能优化:
- 开启智能压缩 (WebP自动转换)
- 开启HTTP/2
- 配置防盗链 (Referer白名单)
```

### 3. Redis - 阿里云云数据库Redis版

**选择理由**:
- ✅ 托管服务,无需运维
- ✅ 高可用(主从复制)
- ✅ 数据持久化
- ✅ 性能稳定

**规格建议**:
- **开发/测试**: 标准版 1GB (约¥100/月)
- **生产环境**: 集群版 4GB (约¥600/月)
- **高并发**: 集群版 8GB+ (按需扩容)

**配置**:
```env
REDIS_HOST=r-xxxxx.redis.rds.aliyuncs.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
```

### 4. 数据库 - 阿里云RDS PostgreSQL

**选择理由**:
- ✅ 全托管PostgreSQL
- ✅ 自动备份和恢复
- ✅ 监控告警
- ✅ 读写分离(可选)

**规格建议**:
- **开发/测试**: 基础版 2核4GB (约¥300/月)
- **生产环境**: 高可用版 4核8GB (约¥1200/月)

### 5. 服务器 - 阿里云ECS

**规格建议**:
```
NestJS Backend:
- CPU: 4核 (计算优化型)
- 内存: 8GB
- 带宽: 5Mbps (按需调整)
- 磁盘: 100GB SSD

Bull Queue Worker (可选单独部署):
- CPU: 2核
- 内存: 4GB
- 专用于AI任务处理
```

---

## 网络架构

```
┌──────────────────────────────────────────────┐
│                   用户                        │
└────────────┬─────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────┐
│           阿里云CDN (全国加速节点)              │
└────────────┬───────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌─────────┐      ┌──────────────┐
│ 前端静态 │      │  阿里云OSS    │
│  资源    │      │  (图片存储)   │
│ (CDN)   │      └──────────────┘
└─────────┘
    │
    ↓
┌───────────────────────────────────┐
│   阿里云SLB (负载均衡 - 可选)      │
└────────────┬──────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌─────────┐      ┌─────────┐
│  ECS 1  │      │  ECS 2  │
│ NestJS  │      │ NestJS  │
│ Backend │      │ Backend │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ↓
     ┌────────────────┐
     │ 阿里云Redis     │
     │ (Bull Queue)   │
     └────────────────┘
              ↓
     ┌────────────────┐
     │ 阿里云RDS       │
     │ PostgreSQL     │
     └────────────────┘
```

---

## 配置示例

### 1. 阿里云OSS配置

**创建Bucket**:
```bash
# 阿里云CLI
aliyun oss mb oss://your-bucket-name --region cn-beijing --storage-class Standard
```

**CORS配置** (OSS控制台):
```xml
<CORSRule>
  <AllowedOrigin>http://localhost:5175</AllowedOrigin>
  <AllowedOrigin>https://yourdomain.com</AllowedOrigin>
  <AllowedMethod>GET</AllowedMethod>
  <AllowedMethod>POST</AllowedMethod>
  <AllowedMethod>PUT</AllowedMethod>
  <AllowedMethod>DELETE</AllowedMethod>
  <AllowedMethod>HEAD</AllowedMethod>
  <AllowedHeader>*</AllowedHeader>
  <ExposeHeader>ETag</ExposeHeader>
  <ExposeHeader>x-oss-request-id</ExposeHeader>
  <MaxAgeSeconds>3600</MaxAgeSeconds>
</CORSRule>
```

**Bucket Policy** (读写权限):
```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:GetObject"
      ],
      "Resource": [
        "acs:oss:*:*:your-bucket-name/*"
      ]
    }
  ]
}
```

### 2. NestJS Storage Service 实现

```typescript
import { Injectable } from '@nestjs/common';
import OSS from 'ali-oss';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private client: OSS;

  constructor(private configService: ConfigService) {
    this.client = new OSS({
      region: this.configService.get('ALIYUN_OSS_REGION'),
      accessKeyId: this.configService.get('ALIYUN_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get('ALIYUN_ACCESS_KEY_SECRET'),
      bucket: this.configService.get('ALIYUN_OSS_BUCKET'),
      endpoint: this.configService.get('ALIYUN_OSS_ENDPOINT'),
    });
  }

  /**
   * 生成上传签名URL
   */
  async getUploadUrl(
    objectKey: string,
    contentType: string,
  ): Promise<string> {
    const url = this.client.signatureUrl(objectKey, {
      method: 'PUT',
      expires: 900, // 15分钟
      'Content-Type': contentType,
    });
    return url;
  }

  /**
   * 生成下载签名URL
   */
  async getDownloadUrl(objectKey: string): Promise<string> {
    // 如果配置了CDN,使用CDN域名
    const cdnDomain = this.configService.get('ALIYUN_CDN_DOMAIN');
    if (cdnDomain) {
      return `https://${cdnDomain}/${objectKey}`;
    }

    // 否则使用OSS签名URL
    const url = this.client.signatureUrl(objectKey, {
      expires: 3600, // 1小时
    });
    return url;
  }

  /**
   * 直接上传文件 (后端上传,用于AI生成的结果图)
   */
  async uploadFile(
    buffer: Buffer,
    objectKey: string,
    contentType: string,
  ): Promise<void> {
    await this.client.put(objectKey, buffer, {
      headers: {
        'Content-Type': contentType,
      },
    });
  }

  /**
   * 删除文件
   */
  async deleteFile(objectKey: string): Promise<void> {
    await this.client.delete(objectKey);
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(objectKeys: string[]): Promise<void> {
    await this.client.deleteMulti(objectKeys);
  }
}
```

---

## 性能优化建议

### 1. OSS图片处理

阿里云OSS支持实时图片处理,可节省带宽和加速加载:

```typescript
// 生成缩略图URL
function getThumbnailUrl(objectKey: string): string {
  return `https://your-bucket.oss-cn-beijing.aliyuncs.com/${objectKey}?x-oss-process=image/resize,w_200,h_200`;
}

// 常用图片处理参数
const imageProcessing = {
  thumbnail: '?x-oss-process=image/resize,w_200,h_200',
  medium: '?x-oss-process=image/resize,w_800',
  webp: '?x-oss-process=image/format,webp', // 转WebP格式
  quality: '?x-oss-process=image/quality,q_85', // 压缩质量
  watermark: '?x-oss-process=image/watermark,text_xxx', // 水印
};
```

### 2. CDN缓存配置

```
静态资源:
- /models/* → 缓存30天
- /clothing/* → 缓存30天
- /results/* → 缓存7天

动态内容:
- /api/* → 不缓存
```

### 3. 数据库连接池

```typescript
// Prisma连接池配置 (适合中国网络环境)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DATABASE_URL示例
DATABASE_URL="postgresql://user:password@rm-xxxxx.pg.rds.aliyuncs.com:5432/dbname?connection_limit=20&pool_timeout=10"
```

---

## 安全配置

### 1. RAM访问控制

创建专用AccessKey,最小权限原则:

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:PutObject",
        "oss:GetObject",
        "oss:DeleteObject"
      ],
      "Resource": [
        "acs:oss:*:*:your-bucket-name/users/*"
      ]
    }
  ]
}
```

### 2. 防盗链配置

OSS控制台 → Bucket → 权限管理 → 防盗链:
- 允许空Referer: 否
- Referer白名单: `https://yourdomain.com`

### 3. HTTPS配置

所有OSS/CDN域名强制HTTPS:
- OSS: 传输加密
- CDN: 免费SSL证书
- Backend API: Nginx反向代理 + Let's Encrypt

---

## 监控和告警

### 1. 阿里云云监控

监控指标:
- OSS: 流量、请求数、成功率
- ECS: CPU、内存、网络
- RDS: 连接数、慢查询
- Redis: 内存使用、命中率

### 2. 日志服务(SLS)

收集日志:
- NestJS应用日志
- Nginx访问日志
- OSS访问日志
- 慢查询日志

### 3. 告警配置

```
告警规则:
- OSS 4xx错误率 > 5%
- ECS CPU使用率 > 80%
- RDS连接数 > 80%
- Redis内存使用 > 90%
- API响应时间 > 3s
```

---

## 成本估算

### 月度成本参考 (中小规模)

| 服务 | 规格 | 月费用 |
|------|------|--------|
| ECS (Backend) | 4核8GB | ¥400 |
| RDS PostgreSQL | 4核8GB 高可用 | ¥1200 |
| Redis | 标准版 4GB | ¥300 |
| OSS存储 | 100GB | ¥12 |
| OSS流量 | 500GB/月 | ¥250 |
| CDN流量 | 1TB/月 | ¥180 |
| **总计** | | **约¥2350/月** |

**优化建议**:
- 使用预付费(包年)可享7折优惠
- 合理设置CDN缓存降低OSS流量
- 定期清理过期图片
- 开启OSS生命周期管理

---

## 部署检查清单

- [ ] 阿里云账号已开通
- [ ] OSS Bucket已创建并配置CORS
- [ ] CDN已绑定并配置缓存策略
- [ ] Redis实例已创建并配置密码
- [ ] RDS PostgreSQL已创建
- [ ] ECS已购买并配置安全组
- [ ] AccessKey已创建并配置最小权限
- [ ] 环境变量已配置 (.env)
- [ ] 域名已备案(ICP备案)
- [ ] SSL证书已配置
- [ ] 监控告警已设置
- [ ] 日志收集已配置

---

## 常见问题

**Q: 是否需要备案?**
A: 如果使用自定义域名,必须完成ICP备案。使用OSS默认域名无需备案但有访问限制。

**Q: 如何选择OSS区域?**
A: 选择离主要用户最近的区域。全国用户分布均匀可选华东(上海)。

**Q: CDN加速是否必须?**
A: 强烈建议使用。CDN可显著提升图片加载速度,减少OSS流量成本。

**Q: Redis可以自建吗?**
A: 可以,但推荐使用云Redis。自建需要考虑高可用、备份、监控等问题。

**Q: 如何处理Gemini API访问?**
A: Gemini API需要科学上网或使用代理。建议在ECS上配置HTTP代理。

---

## 参考链接

- [阿里云OSS文档](https://help.aliyun.com/product/31815.html)
- [阿里云CDN文档](https://help.aliyun.com/product/27099.html)
- [ali-oss SDK](https://github.com/ali-sdk/ali-oss)
- [阿里云最佳实践](https://www.aliyun.com/best-practice)
