# Quickstart: 虚拟试衣模态与服装上传选择界面

**Feature**: 004-upload-modal-redesign
**Date**: 2025-10-22
**Audience**: 开发者

## 概述

本功能基于现有的 `outfit-change` 模块重新设计前端UI界面,实现符合设计图的模特选择、服装上传和虚拟试衣交互。

**核心变更**:
- ✅ **后端已存在**: ModelPhoto、ClothingItem、OutfitResult、ProcessingSession表和API
- 🆕 **新增前端**: 按设计图重构UI组件(3列网格、红色边框选中、折叠面板)
- 🔄 **调整**: 将用户上传的ModelPhoto转为系统预置的Model(或复用现有数据)

## 前置准备

### 1. 环境要求

- Node.js 18+
- PostgreSQL (已配置)
- pnpm
- Gemini API Key (环境变量 `GEMINI_API_KEY`)

### 2. 克隆并安装依赖

```bash
# 已存在的项目,跳过克隆

# 安装后端依赖
cd server
pnpm install

# 安装前端依赖
cd ../client
pnpm install
```

### 3. 数据库配置

```bash
cd server

# 生成 Prisma Client
pnpm prisma generate

# 运行已有迁移
pnpm prisma migrate deploy

# (可选) 查看数据库
pnpm prisma studio
```

**注意**: 现有schema已包含所需表(ModelPhoto/ClothingItem/OutfitResult/ProcessingSession),无需新增迁移。

### 4. 环境变量

```bash
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/virtual_tryon"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
GEMINI_API_KEY="your-gemini-api-key"  # 必需
PORT=3000

# client/.env
VITE_API_URL=http://localhost:3000
```

## 快速启动

### 启动后端

```bash
cd server
pnpm start:dev  # 开发模式(热重载)

# 或生产模式
pnpm build
pnpm start:prod
```

后端运行在: http://localhost:3000

### 启动前端

```bash
cd client
pnpm dev  # Vite开发服务器

# 构建生产版本
pnpm build
pnpm preview
```

前端运行在: http://localhost:5173

## 开发工作流

### Phase 1: 前端组件开发

#### 1. 创建虚拟试衣页面组件

```bash
cd client/src

# 创建组件目录
mkdir -p components/VirtualTryOn
touch components/VirtualTryOn/{index.tsx,ModelSelector.tsx,GarmentPanel.tsx,PreviewArea.tsx,UploadZone.tsx,GarmentCard.tsx,styles.css}

# 创建页面
touch pages/VirtualTryOnPage.tsx

# 创建API层
touch api/{garment.ts,model.ts,tryon.ts}

# 创建类型定义
touch types/{garment.ts,model.ts,tryon.ts}

# 创建工具函数
touch utils/{fileUpload.ts,imageValidation.ts}

# 创建Context
touch contexts/TryOnContext.tsx
```

#### 2. 映射现有API到新接口

**现有API** (outfit-change模块):
- `POST /api/outfit-change/models/upload` → 前端调用上传模特
- `GET /api/outfit-change/models` → 获取用户的模特列表
- `POST /api/outfit-change/clothing/upload` → 上传服装
- `GET /api/outfit-change/clothing` → 获取服装列表
- `POST /api/outfit-change/tryon` → 开始试衣
- `GET /api/outfit-change/sessions/:id` → 查询试衣状态

**前端API封装示例**:

```typescript
// client/src/api/garment.ts
import { apiClient } from './client';

export interface Garment {
  id: string;
  imageUrl: string;
  url: string;  // 完整URL
  originalFileName: string;
  fileSize: number;
  uploadedAt: string;
}

export const garmentApi = {
  async list(): Promise<Garment[]> {
    const response = await apiClient.get('/outfit-change/clothing');
    return response.data.data;
  },

  async upload(file: File, onProgress?: (percent: number) => void): Promise<Garment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('width', '0');
    formData.append('height', '0');

    const response = await apiClient.post('/outfit-change/clothing/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data.data;
  },
};
```

#### 3. 实现UI组件

**GarmentPanel.tsx** (3列网格+上传):

```typescript
import React, { useState } from 'react';
import { garmentApi } from '../../api/garment';
import UploadZone from './UploadZone';
import GarmentCard from './GarmentCard';
import './styles.css';

export const GarmentPanel: React.FC = () => {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleUpload = async (file: File) => {
    const garment = await garmentApi.upload(file);
    setGarments([garment, ...garments]);
  };

  return (
    <div className="garment-panel">
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span>衣服</span>
        <button className="toggle-btn">{isExpanded ? '-' : '+'}</button>
      </div>

      {isExpanded && (
        <div className="panel-content">
          <UploadZone onUpload={handleUpload} />

          <div className="garment-grid">
            {garments.map((g) => (
              <GarmentCard
                key={g.id}
                garment={g}
                isSelected={g.id === selectedId}
                onClick={() => setSelectedId(g.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

**styles.css** (关键样式):

```css
.garment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.garment-card {
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.garment-card.selected {
  border-color: #ef4444; /* 红色边框 */
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
}
```

### Phase 2: 测试

#### 单元测试

```bash
cd client
pnpm add -D vitest @testing-library/react @testing-library/user-event

# 运行测试
pnpm vitest
```

**测试示例** (GarmentPanel.test.tsx):

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GarmentPanel } from './GarmentPanel';

test('应显示上传区域', () => {
  render(<GarmentPanel />);
  expect(screen.getByText(/upload from files/i)).toBeInTheDocument();
});

test('点击服装卡片应高亮', async () => {
  const { container } = render(<GarmentPanel />);
  const card = container.querySelector('.garment-card');

  fireEvent.click(card!);
  expect(card).toHaveClass('selected');
});
```

#### E2E测试

```bash
cd client
pnpm add -D @playwright/test
npx playwright install

# 运行E2E测试
npx playwright test
```

### Phase 3: 后端扩展(如需)

#### 添加系统预置模特

如果需要将现有 `ModelPhoto`(用户上传) 改为系统预置 `Model`:

1. **创建迁移**:

```bash
cd server
pnpm prisma migrate dev --name add-system-models
```

2. **Seed 默认模特**:

```typescript
// prisma/seed.ts
await prisma.modelPhoto.createMany({
  data: [
    {
      userId: 'system',  // 特殊用户ID
      imageUrl: '/assets/models/default-male.jpg',
      originalFileName: 'default-male.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      width: 800,
      height: 1200,
    },
    {
      userId: 'system',
      imageUrl: '/assets/models/default-female.jpg',
      originalFileName: 'default-female.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      width: 800,
      height: 1200,
    },
  ],
});
```

3. **修改API返回**:

```typescript
// outfit-change.service.ts
async getSystemModels() {
  return this.prisma.modelPhoto.findMany({
    where: { userId: 'system', deletedAt: null },
    orderBy: { uploadedAt: 'asc' },
  });
}
```

## 常见问题

### 1. Gemini API超时

**问题**: 试衣生成超过30秒失败

**解决**:
- 在 `gemini.service.ts` 增加超时配置
- 或使用Bull队列异步处理(已实现)

### 2. 图片URL 404

**问题**: 前端显示图片404

**解决**:
- 确认后端 `storage.service.ts` 正确配置静态文件路由
- 检查 `main.ts` 中是否添加:

```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads',
});
```

### 3. 跨域问题

**问题**: 本地开发前端无法访问后端

**解决**:
- 前端使用Vite proxy (已配置在 `vite.config.ts`)
- 或后端启用CORS:

```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

## 相关文档

- [Feature Spec](./spec.md) - 完整功能规格说明
- [Data Model](./data-model.md) - 数据模型和Prisma schema
- [API Contracts](./contracts/) - OpenAPI规范
- [Research](./research.md) - 技术决策和研究

## 下一步

1. 运行 `/speckit.tasks` 生成详细的实现任务列表
2. 按任务优先级(P1→P2→P3)依次实现
3. 每完成一个User Story运行对应测试验证

---

**提示**: 优先实现P1用户故事,完成MVP后再添加P2/P3功能。
