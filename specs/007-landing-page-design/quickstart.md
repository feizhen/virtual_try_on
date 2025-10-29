# Quick Start: 落地页设计实施指南

**Feature**: 落地页设计 (Landing Page Design)
**Date**: 2025-10-29
**Estimated Time**: 4-6 小时

## Overview

本指南将帮助你快速实施落地页功能,包括组件开发、样式编写、路由配置和测试。

---

## Prerequisites

### 1. 开发环境

确保已安装以下工具:

- ✅ Node.js >= 18.0.0
- ✅ pnpm(项目包管理器)
- ✅ Git

### 2. 项目启动

```bash
# 克隆项目(如果尚未克隆)
git clone <repository-url>
cd virtual_try_on

# 切换到功能分支
git checkout 007-landing-page-design

# 安装依赖
cd client
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 验证项目正常运行。

### 3. 准备示例图片

在开始开发前,准备 2-3 组虚拟试衣示例图片:

**图片规格**:
- 尺寸:800x1200px(2:3 比例)
- 格式:JPEG(质量 85)或 WebP
- 单张大小:< 150KB
- 命名规范:
  - `example-1-before.jpg` (原始照片)
  - `example-1-after.jpg` (试衣结果)
  - `example-2-before.jpg`
  - `example-2-after.jpg`
  - ...

**存放位置**:
```bash
mkdir -p client/src/assets/examples
# 将图片文件复制到该目录
```

**临时占位符**(如果图片尚未准备):
可以使用占位图片服务,如 `https://via.placeholder.com/800x1200`

---

## Implementation Steps

### Step 1: 创建类型定义 (5 分钟)

**文件**: `client/src/types/landing.ts`

```typescript
import { ReactNode } from 'react';

export interface FeatureCard {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export interface ExampleImage {
  id: string;
  beforeImage: string;
  afterImage: string;
  alt?: string;
}

export interface CTAButton {
  text: string;
  link: string;
  variant: 'primary' | 'secondary';
}

export interface HeroContent {
  title: string;
  subtitle: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
}

export interface CTAContent {
  heading: string;
  description?: string;
  button: CTAButton;
}

export interface LandingPageContent {
  hero: HeroContent;
  features: FeatureCard[];
  examples: ExampleImage[];
  cta: CTAContent;
}
```

**验证**:
```bash
# TypeScript 编译检查
pnpm build:check
```

---

### Step 2: 创建子组件 (60-90 分钟)

#### 2.1 FeatureCard 组件

**文件**: `client/src/components/Landing/FeatureCard.tsx`

```typescript
import React from 'react';
import type { FeatureCard as FeatureCardType } from '@/types/landing';
import './FeatureCard.css';

interface FeatureCardProps extends FeatureCardType {}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};
```

**文件**: `client/src/components/Landing/FeatureCard.css`

```css
.feature-card {
  padding: 24px;
  border-radius: 12px;
  background: var(--bg-secondary, #f9fafb);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  color: var(--primary-color, #4f46e5);
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary, #111827);
}

.feature-description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary, #6b7280);
}

/* 响应式 */
@media (max-width: 767px) {
  .feature-card {
    padding: 20px;
  }

  .feature-icon {
    font-size: 40px;
  }

  .feature-title {
    font-size: 18px;
  }
}
```

#### 2.2 ExampleComparison 组件

**文件**: `client/src/components/Landing/ExampleComparison.tsx`

```typescript
import React from 'react';
import type { ExampleImage } from '@/types/landing';
import './ExampleComparison.css';

interface ExampleComparisonProps extends ExampleImage {}

export const ExampleComparison: React.FC<ExampleComparisonProps> = ({
  beforeImage,
  afterImage,
  alt = '虚拟试衣示例',
}) => {
  return (
    <div className="example-comparison">
      <div className="example-item">
        <img src={beforeImage} alt={`${alt} - 原始照片`} loading="lazy" />
        <span className="example-label">原始照片</span>
      </div>
      <div className="example-divider">→</div>
      <div className="example-item">
        <img src={afterImage} alt={`${alt} - 试衣效果`} loading="lazy" />
        <span className="example-label">试衣效果</span>
      </div>
    </div>
  );
};
```

**文件**: `client/src/components/Landing/ExampleComparison.css`

```css
.example-comparison {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.example-item {
  flex: 1;
  position: relative;
}

.example-item img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.example-label {
  display: block;
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.example-divider {
  font-size: 32px;
  color: var(--primary-color, #4f46e5);
  font-weight: bold;
}

/* 响应式:移动端垂直堆叠 */
@media (max-width: 767px) {
  .example-comparison {
    flex-direction: column;
    gap: 16px;
  }

  .example-divider {
    transform: rotate(90deg);
  }
}
```

#### 2.3 Section 组件

创建 `HeroSection.tsx`, `FeaturesSection.tsx`, `ExamplesSection.tsx`, `CTASection.tsx`。

**提示**: 详细代码见 Phase 2 任务清单,这里展示结构:

```typescript
// HeroSection.tsx
export const HeroSection: React.FC<HeroContent> = ({ title, subtitle, primaryCTA, secondaryCTA }) => {
  return (
    <section className="hero-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="hero-cta">
        <Link to={primaryCTA.link} className="btn btn-primary">{primaryCTA.text}</Link>
        {secondaryCTA && <Link to={secondaryCTA.link} className="btn btn-secondary">{secondaryCTA.text}</Link>}
      </div>
    </section>
  );
};
```

---

### Step 3: 创建主页面组件 (30 分钟)

**文件**: `client/src/pages/Landing.tsx`

```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { HeroSection } from '@/components/Landing/HeroSection';
import { FeaturesSection } from '@/components/Landing/FeaturesSection';
import { ExamplesSection } from '@/components/Landing/ExamplesSection';
import { CTASection } from '@/components/Landing/CTASection';
import { FaMagic, FaBolt, FaImage } from 'react-icons/fa';
import type { LandingPageContent } from '@/types/landing';
import './Landing.css';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 已登录用户重定向到虚拟试衣页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tryon', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 内容配置
  const content: LandingPageContent = {
    hero: {
      title: 'AI 虚拟试衣,随心换装',
      subtitle: '无需实际试穿,一键体验千款服饰,找到最适合你的风格',
      primaryCTA: { text: '立即体验', link: '/register', variant: 'primary' },
      secondaryCTA: { text: '登录', link: '/login', variant: 'secondary' },
    },
    features: [
      {
        id: 'ai-processing',
        icon: <FaMagic />,
        title: 'AI 智能换装',
        description: '先进的 AI 算法,自动识别人体轮廓,精准换装',
      },
      {
        id: 'fast-process',
        icon: <FaBolt />,
        title: '快速处理',
        description: '秒级生成试衣效果,无需漫长等待',
      },
      {
        id: 'hd-output',
        icon: <FaImage />,
        title: '高清输出',
        description: '保持原图清晰度,细节完美呈现',
      },
    ],
    examples: [
      {
        id: 'example-1',
        beforeImage: '/src/assets/examples/example-1-before.jpg',
        afterImage: '/src/assets/examples/example-1-after.jpg',
        alt: '夏季连衣裙试穿效果',
      },
      {
        id: 'example-2',
        beforeImage: '/src/assets/examples/example-2-before.jpg',
        afterImage: '/src/assets/examples/example-2-after.jpg',
        alt: '商务正装试穿效果',
      },
    ],
    cta: {
      heading: '准备好开始你的虚拟试衣之旅了吗?',
      description: '注册即可获得 10 次免费试衣机会',
      button: { text: '免费注册', link: '/register', variant: 'primary' },
    },
  };

  return (
    <div className="landing-page">
      <HeroSection {...content.hero} />
      <FeaturesSection features={content.features} />
      <ExamplesSection examples={content.examples} />
      <CTASection {...content.cta} />
    </div>
  );
};
```

**文件**: `client/src/pages/Landing.css`

```css
.landing-page {
  min-height: 100vh;
}

/* 全局容器样式 */
.landing-page section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 24px;
}

@media (max-width: 767px) {
  .landing-page section {
    padding: 48px 16px;
  }
}
```

---

### Step 4: 修改路由配置 (10 分钟)

**文件**: `client/src/App.tsx`

找到路由配置部分,修改为:

```typescript
<Routes>
  {/* 公开路由 */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/" element={<Landing />} />  {/* 新增:落地页 */}

  {/* 受保护路由 */}
  <Route
    path="/*"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Routes>
            <Route path="/home" element={<Home />} />  {/* 原首页改为 /home */}
            <Route path="/tryon" element={<VirtualTryOn />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </ProtectedRoute>
    }
  />
</Routes>
```

**注意**: 确保 `/` 路径在受保护路由之前定义,否则会被拦截。

---

### Step 5: 编写测试 (30 分钟)

#### 5.1 单元测试

**文件**: `client/tests/unit/Landing.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { AuthContext } from '@/contexts/AuthContext';

describe('Landing Page', () => {
  it('redirects authenticated users to /tryon', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => ({
      ...(await vi.importActual('react-router-dom')),
      useNavigate: () => mockNavigate,
    }));

    const authValue = { isAuthenticated: true, user: { name: 'Test User' } };

    render(
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/tryon', { replace: true });
  });

  it('renders all sections for unauthenticated users', () => {
    const authValue = { isAuthenticated: false, user: null };

    render(
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/AI 虚拟试衣/)).toBeInTheDocument();
    expect(screen.getByText(/立即体验/)).toBeInTheDocument();
  });
});
```

**运行测试**:
```bash
pnpm test
```

#### 5.2 E2E 测试

**文件**: `client/tests/e2e/landing.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /AI 虚拟试衣/ })).toBeVisible();
  });

  test('should navigate to register page on CTA click', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /立即体验/ }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /AI 虚拟试衣/ })).toBeVisible();
  });
});
```

**运行 E2E 测试**:
```bash
pnpm playwright test
```

---

### Step 6: 性能优化验证 (15 分钟)

#### 6.1 Lighthouse 审计

1. 启动开发服务器:`pnpm dev`
2. 打开 Chrome DevTools → Lighthouse 标签
3. 运行审计(Mobile + Desktop)
4. 验证指标:
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 80

#### 6.2 网络性能检查

1. Chrome DevTools → Network 标签
2. 节流设置:Slow 3G
3. 硬刷新页面(Cmd+Shift+R / Ctrl+Shift+R)
4. 验证:
   - 首屏加载时间 < 3 秒
   - 图片使用懒加载(`loading="lazy"`)
   - 资源大小合理

---

## Verification Checklist

完成后逐项验证:

### 功能验证

- [ ] 未登录用户访问 `/` 显示落地页
- [ ] 已登录用户访问 `/` 自动重定向到 `/tryon`
- [ ] 点击"立即体验"跳转到 `/register`
- [ ] 点击"登录"跳转到 `/login`
- [ ] 功能介绍区展示 3-4 个功能卡片
- [ ] 示例展示区展示 2-3 组前后对比图

### 响应式验证

- [ ] 桌面(>1024px):内容居中,最大宽度 1280px
- [ ] 平板(768-1024px):功能卡片 2 列网格
- [ ] 移动端(<768px):单列布局,字体适配

### 性能验证

- [ ] Lighthouse Performance > 90
- [ ] 首屏加载时间 < 3 秒(3G 网络)
- [ ] 图片懒加载生效
- [ ] 无控制台错误

### 测试验证

- [ ] 单元测试全部通过:`pnpm test`
- [ ] E2E 测试全部通过:`pnpm playwright test`
- [ ] TypeScript 编译无错误:`pnpm build:check`

---

## Troubleshooting

### 问题 1: 图片加载失败

**症状**: 示例图片显示损坏图标

**解决方案**:
1. 检查图片路径是否正确(Vite 使用 `/src/assets/` 需要在导入时处理)
2. 使用导入而非字符串路径:
   ```typescript
   import example1Before from '@/assets/examples/example-1-before.jpg';
   ```

### 问题 2: 已登录用户未重定向

**症状**: 已登录用户仍能看到落地页

**解决方案**:
1. 检查 `AuthContext` 是否正确提供
2. 验证 `isAuthenticated` 状态是否正确
3. 检查 `useEffect` 依赖数组

### 问题 3: 路由冲突

**症状**: 访问 `/` 显示 404 或受保护页面

**解决方案**:
1. 确保 `<Route path="/" element={<Landing />} />` 在受保护路由之前
2. 检查 `<Routes>` 嵌套结构

---

## Next Steps

完成快速开始指南后:

1. **运行 `/speckit.tasks`**: 生成详细的任务清单
2. **提交代码**: 遵循 Git 提交规范
3. **创建 PR**: 使用 `gh pr create` 命令
4. **代码审查**: 邀请团队成员审查

---

## Additional Resources

- [React Router v7 文档](https://reactrouter.com)
- [Vite 性能优化指南](https://vitejs.dev/guide/performance.html)
- [Lighthouse 优化建议](https://web.dev/lighthouse-performance/)
- [Web Vitals 最佳实践](https://web.dev/vitals/)

---

**预计总时长**: 4-6 小时(包括测试和优化)

祝开发顺利! 🚀
