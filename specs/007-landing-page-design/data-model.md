# Data Model: 落地页设计

**Feature**: 落地页设计 (Landing Page Design)
**Date**: 2025-10-29
**Purpose**: 定义落地页涉及的数据实体和类型定义

## Overview

落地页是纯展示型组件,主要涉及静态内容配置和路由状态。不需要复杂的数据持久化或状态管理。

## Entities

### 1. FeatureCard (功能卡片)

**Purpose**: 描述产品的核心功能特点

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | 唯一标识符(如 "ai-processing") |
| `icon` | `ReactNode` | Yes | 图标组件(来自 react-icons) |
| `title` | `string` | Yes | 功能标题(如 "AI 智能换装") |
| `description` | `string` | Yes | 功能描述(1-2 句话,≤50 字) |

**Example**:
```typescript
{
  id: "ai-processing",
  icon: <FaMagic />,
  title: "AI 智能换装",
  description: "先进的 AI 算法,自动识别人体轮廓,精准换装"
}
```

**Validation Rules**:
- `title` 长度:5-20 字
- `description` 长度:10-50 字
- `id` 必须唯一且使用 kebab-case

**Usage**: 在 `FeaturesSection` 组件中渲染 3-4 个卡片

---

### 2. ExampleImage (示例图片)

**Purpose**: 展示虚拟试衣的前后对比效果

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | 唯一标识符(如 "example-1") |
| `beforeImage` | `string` | Yes | 原始照片 URL(相对路径或绝对路径) |
| `afterImage` | `string` | Yes | 试衣结果 URL(相对路径或绝对路径) |
| `alt` | `string` | No | 图片替代文本(无障碍支持) |

**Example**:
```typescript
{
  id: "example-1",
  beforeImage: "/assets/examples/example-1-before.jpg",
  afterImage: "/assets/examples/example-1-after.jpg",
  alt: "夏季连衣裙试穿效果"
}
```

**Validation Rules**:
- 图片格式:JPEG、PNG 或 WebP
- 图片尺寸:建议 800x1200px(2:3 比例)
- 文件大小:< 150KB(优化后)

**Usage**: 在 `ExamplesSection` 组件中渲染 2-3 组对比图

---

### 3. LandingPageContent (落地页内容配置)

**Purpose**: 集中管理落地页的文案和配置

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hero` | `HeroContent` | Yes | 英雄区内容 |
| `features` | `FeatureCard[]` | Yes | 功能卡片列表(3-4 个) |
| `examples` | `ExampleImage[]` | Yes | 示例图片列表(2-3 组) |
| `cta` | `CTAContent` | Yes | 行动号召内容 |

**Sub-type: HeroContent**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | 主标题(如 "AI 虚拟试衣,随心换装") |
| `subtitle` | `string` | Yes | 副标题(价值主张,1-2 句话) |
| `primaryCTA` | `CTAButton` | Yes | 主要行动按钮 |
| `secondaryCTA` | `CTAButton` | No | 次要行动按钮 |

**Sub-type: CTAButton**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | `string` | Yes | 按钮文字(如 "立即体验") |
| `link` | `string` | Yes | 目标路径(如 "/register") |
| `variant` | `'primary' \| 'secondary'` | Yes | 按钮样式变体 |

**Sub-type: CTAContent**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `heading` | `string` | Yes | CTA 区标题 |
| `description` | `string` | No | 补充说明 |
| `button` | `CTAButton` | Yes | CTA 按钮 |

**Example**:
```typescript
const landingPageContent: LandingPageContent = {
  hero: {
    title: "AI 虚拟试衣,随心换装",
    subtitle: "无需实际试穿,一键体验千款服饰,找到最适合你的风格",
    primaryCTA: {
      text: "立即体验",
      link: "/register",
      variant: "primary"
    },
    secondaryCTA: {
      text: "了解更多",
      link: "#features",
      variant: "secondary"
    }
  },
  features: [
    {
      id: "ai-processing",
      icon: <FaMagic />,
      title: "AI 智能换装",
      description: "先进的 AI 算法,自动识别人体轮廓,精准换装"
    },
    // ... more features
  ],
  examples: [
    {
      id: "example-1",
      beforeImage: "/assets/examples/example-1-before.jpg",
      afterImage: "/assets/examples/example-1-after.jpg",
      alt: "夏季连衣裙试穿效果"
    },
    // ... more examples
  ],
  cta: {
    heading: "准备好开始你的虚拟试衣之旅了吗?",
    description: "注册即可获得 10 次免费试衣机会",
    button: {
      text: "免费注册",
      link: "/register",
      variant: "primary"
    }
  }
};
```

**Validation Rules**:
- `features` 数组长度:3-4 个
- `examples` 数组长度:2-3 个
- 所有文案字段不能为空字符串

**Usage**: 作为 Landing 组件的配置对象,可以轻松修改文案内容

---

## TypeScript Type Definitions

**Location**: `client/src/types/landing.ts` (新建文件)

```typescript
import { ReactNode } from 'react';

/**
 * 功能卡片数据结构
 */
export interface FeatureCard {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

/**
 * 示例图片数据结构
 */
export interface ExampleImage {
  id: string;
  beforeImage: string;
  afterImage: string;
  alt?: string;
}

/**
 * CTA 按钮数据结构
 */
export interface CTAButton {
  text: string;
  link: string;
  variant: 'primary' | 'secondary';
}

/**
 * 英雄区内容
 */
export interface HeroContent {
  title: string;
  subtitle: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
}

/**
 * CTA 区域内容
 */
export interface CTAContent {
  heading: string;
  description?: string;
  button: CTAButton;
}

/**
 * 落地页完整内容配置
 */
export interface LandingPageContent {
  hero: HeroContent;
  features: FeatureCard[];
  examples: ExampleImage[];
  cta: CTAContent;
}
```

---

## State Management

### Component State (Local)

落地页不需要全局状态管理,所有数据通过 props 传递或本地定义:

```typescript
// Landing.tsx
const Landing: React.FC = () => {
  // 内容配置(可以提取到单独的配置文件)
  const content: LandingPageContent = { /* ... */ };

  // 重定向逻辑(使用现有 AuthContext)
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tryon', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

**Rationale**:
- 内容配置是静态的,不需要 Redux/Zustand
- 登录状态已由 `AuthContext` 管理
- 简化架构,避免过度设计

---

## API Contracts

### N/A - 无 API 交互

落地页是纯前端组件,不涉及任何 API 调用:

- ❌ 不调用后端 API
- ❌ 不持久化数据
- ✅ 仅读取 `AuthContext` 的内存状态
- ✅ 使用静态资源(图片、图标)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│          Landing Page Component              │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │  LandingPageContent (Static Config)    │  │
│  │  - hero                                │  │
│  │  - features[]                          │  │
│  │  - examples[]                          │  │
│  │  - cta                                 │  │
│  └────────────────────────────────────────┘  │
│                    │                          │
│                    ▼                          │
│  ┌────────────────────────────────────────┐  │
│  │  Component Tree Rendering              │  │
│  │  - HeroSection                         │  │
│  │  - FeaturesSection                     │  │
│  │  - ExamplesSection                     │  │
│  │  - CTASection                          │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │  AuthContext (Global State)            │  │
│  │  - isAuthenticated                     │  │
│  │    ↓                                   │  │
│  │  Redirect Logic                        │  │
│  │  if (isAuthenticated) → /tryon         │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Relationships

### Landing ← AuthContext
- **Type**: Dependency (Read-only)
- **Purpose**: 检测用户登录状态以决定是否重定向
- **Cardinality**: 1:1

### Landing → FeatureCard[]
- **Type**: Composition
- **Purpose**: 展示功能介绍
- **Cardinality**: 1:N (3-4 个 features)

### Landing → ExampleImage[]
- **Type**: Composition
- **Purpose**: 展示示例图片
- **Cardinality**: 1:N (2-3 个 examples)

---

## Migration & Versioning

### Initial Version (v1.0.0)

无需数据迁移。这是新功能,不涉及现有数据结构的修改。

### Future Considerations

如果需要支持以下功能,可能需要扩展数据模型:

1. **多语言支持**: 添加 `locale` 字段和国际化内容对象
2. **A/B 测试**: 添加 `variant` 字段支持不同版本的文案
3. **动态内容**: 从 CMS 或后端 API 获取内容配置
4. **用户个性化**: 根据用户来源展示不同的 Hero 文案

---

## Testing Strategy

### Unit Tests

测试数据验证和组件渲染:

```typescript
// FeatureCard.test.tsx
describe('FeatureCard', () => {
  it('renders feature data correctly', () => {
    const feature: FeatureCard = {
      id: 'test-feature',
      icon: <FaMagic />,
      title: 'Test Feature',
      description: 'Test description'
    };

    render(<FeatureCard {...feature} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});
```

### Integration Tests

测试数据流和重定向逻辑:

```typescript
// Landing.test.tsx
describe('Landing Page', () => {
  it('redirects authenticated users to /tryon', () => {
    mockAuthContext({ isAuthenticated: true });

    render(<Landing />);

    expect(mockNavigate).toHaveBeenCalledWith('/tryon', { replace: true });
  });

  it('renders all sections for unauthenticated users', () => {
    mockAuthContext({ isAuthenticated: false });

    render(<Landing />);

    expect(screen.getByRole('heading', { name: /AI 虚拟试衣/ })).toBeInTheDocument();
    expect(screen.getByText(/立即体验/)).toBeInTheDocument();
  });
});
```

---

## Summary

落地页的数据模型简洁明了:

- ✅ 所有数据通过 TypeScript 接口定义
- ✅ 静态内容配置(可轻松修改文案)
- ✅ 无复杂状态管理(复用 AuthContext)
- ✅ 无 API 调用(纯前端组件)
- ✅ 清晰的类型定义和验证规则

**Phase 1 数据模型设计完成**,可以继续进行快速开始指南的编写。
