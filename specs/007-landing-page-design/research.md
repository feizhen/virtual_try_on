# Research: 落地页设计最佳实践

**Feature**: 落地页设计 (Landing Page Design)
**Date**: 2025-10-29
**Purpose**: 研究落地页设计模式、性能优化策略、响应式布局和 React 最佳实践

## Research Questions

### 1. 落地页设计模式与布局结构

**Question**: 市场主流的虚拟试衣/AI 产品落地页采用什么设计模式和内容结构?

**Findings**:

主流落地页通常采用以下标准布局结构:

1. **Hero Section (英雄区)**
   - 大标题 + 简短副标题 (价值主张)
   - 主要 CTA 按钮(通常使用对比色,如 "立即体验"、"免费试用")
   - 可选:背景图片或动画演示

2. **Features Section (功能介绍)**
   - 3-4 个核心功能点
   - 每个功能使用图标 + 标题 + 1-2 句描述
   - 网格布局(桌面 3-4 列,平板 2 列,移动端 1 列)

3. **Examples/Demo Section (示例展示)**
   - Before/After 对比图(虚拟试衣类产品的标准做法)
   - 2-3 组真实案例
   - 图片懒加载优化性能

4. **CTA Section (行动号召)**
   - 重复主 CTA 按钮
   - 社会证明(可选,如用户数、评价)
   - 次级 CTA(如"了解更多"、"查看定价")

**Decision**: 采用上述标准四段式布局结构

**Rationale**:
- 符合用户浏览习惯(F 型扫描模式)
- 清晰的信息层次结构
- 经过市场验证的转化率优化模式

**Alternatives Considered**:
- 单页滚动式长页面:过于复杂,不符合"简单介绍"的需求
- 视频为主的落地页:需要额外的视频资源和加载优化,增加复杂度

---

### 2. React 落地页性能优化策略

**Question**: 如何在 React SPA 中实现首屏加载 < 3 秒(3G 网络)的性能目标?

**Findings**:

核心优化策略:

1. **图片优化**
   - 使用现代格式(WebP,降级到 JPEG)
   - 响应式图片(`<img srcset>`)
   - 懒加载非首屏图片(`loading="lazy"`)
   - 图片尺寸优化(800x1200px 已足够,质量 80-85%)

2. **代码分割**
   - 落地页作为独立路由,自动代码分割
   - 避免引入不必要的依赖(如虚拟试衣相关的重型组件)

3. **CSS 优化**
   - 避免使用大型 CSS 框架(已采用自定义 CSS)
   - 复用现有 CSS 变量和工具类
   - 关键 CSS 内联(Vite 自动处理)

4. **预加载关键资源**
   - Hero Section 的背景图片使用 `<link rel="preload">`
   - 字体预加载(如果使用自定义字体)

5. **Lighthouse 优化检查清单**
   - Performance: 图片优化、代码分割、缓存策略
   - Accessibility: 语义化 HTML、ARIA 标签、键盘导航
   - Best Practices: HTTPS、安全头、控制台无错误
   - SEO: Meta 标签、描述性链接文本

**Decision**: 采用图片懒加载 + 代码分割 + 响应式图片的组合策略

**Rationale**:
- 最小化首屏加载资源
- Vite 已提供自动代码分割
- 无需引入额外的性能优化库

**Alternatives Considered**:
- SSR(服务端渲染):过度设计,增加部署复杂度
- 预渲染(Prerendering):需要额外构建步骤,当前架构不支持

---

### 3. 响应式布局实现方案

**Question**: 如何在 React 中实现桌面、平板、手机三种设备的响应式布局?

**Findings**:

推荐方案:

1. **CSS Grid + Flexbox 组合**
   - 功能卡片区:CSS Grid 自动响应(`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`)
   - 按钮布局:Flexbox
   - Before/After 对比:Flexbox(移动端垂直堆叠)

2. **媒体查询断点**
   - 移动端: `max-width: 767px`
   - 平板: `768px - 1023px`
   - 桌面: `min-width: 1024px`

3. **容器最大宽度**
   - 桌面居中显示,最大宽度 1280px
   - 使用 `margin: 0 auto` 居中
   - 两侧留白 24px (移动端 16px)

4. **字体缩放**
   - 使用相对单位(rem)而非固定像素
   - 移动端标题字体缩小 20-30%

**Decision**: 采用 CSS Grid + Flexbox + 媒体查询的纯 CSS 方案

**Rationale**:
- 无需 JavaScript 检测屏幕尺寸
- 性能最优(浏览器原生支持)
- 符合现有项目的 CSS 风格

**Alternatives Considered**:
- CSS-in-JS 方案(styled-components):与现有 CSS 变量方案不一致
- Tailwind CSS:需要重构现有设计系统
- React 响应式 Hook(useMediaQuery):不必要的 JavaScript 开销

---

### 4. 已登录用户重定向策略

**Question**: 如何实现已登录用户访问落地页时自动重定向到 /tryon,且延迟 < 500ms?

**Findings**:

实现方案:

1. **在 Landing 组件中检测登录状态**
   ```typescript
   const { isAuthenticated } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
     if (isAuthenticated) {
       navigate('/tryon', { replace: true });
     }
   }, [isAuthenticated, navigate]);
   ```

2. **性能优化要点**
   - `useAuth()` 从内存中读取状态(无异步请求)
   - `replace: true` 避免历史记录堆积
   - 重定向在组件挂载时立即执行

3. **用户体验优化**
   - 不显示加载动画(重定向几乎瞬时完成)
   - 如果需要,可在 AuthContext 初始化期间显示全局 loading

**Decision**: 在 Landing 组件的 useEffect 中执行重定向

**Rationale**:
- 符合 React 最佳实践
- 延迟极低(< 100ms,远低于 500ms 目标)
- 代码简洁,易于测试

**Alternatives Considered**:
- 在路由层面处理:需要修改 App.tsx 的路由逻辑,增加复杂度
- 使用 Redirect 组件:React Router v7 推荐使用 navigate 而非 Redirect

---

### 5. 示例图片资源管理

**Question**: 如何管理和加载落地页的示例图片资源?

**Findings**:

推荐方案:

1. **图片存放位置**
   - 静态资源:`client/src/assets/examples/`
   - Vite 自动处理图片导入和优化

2. **图片命名规范**
   - `example-{number}-before.jpg` (原始照片)
   - `example-{number}-after.jpg` (试衣结果)
   - 编号从 1 开始

3. **图片规格建议**
   - 尺寸:800x1200px (2:3 比例,适合人像)
   - 格式:JPEG(质量 85)或 WebP
   - 单张大小:< 150KB

4. **懒加载实现**
   ```tsx
   <img
     src={exampleImage}
     alt="示例"
     loading="lazy"  // 浏览器原生懒加载
   />
   ```

5. **占位符处理**
   - 如果示例图片未提供,使用 SVG 占位符
   - 添加 `background-color` 避免布局抖动

**Decision**: 使用 Vite 静态资源导入 + 浏览器原生懒加载

**Rationale**:
- Vite 自动优化图片资源
- 原生懒加载性能最优
- 无需额外的图片加载库

**Alternatives Considered**:
- React 懒加载库(react-lazy-load-image-component):不必要的依赖
- CDN 托管图片:增加部署复杂度,当前资源量小

---

## Technology Stack Validation

基于研究结果,确认以下技术选型:

### 核心框架
- ✅ React 19.2.0: 最新稳定版,性能优化
- ✅ TypeScript 5.9.3: 类型安全
- ✅ Vite 5.4.21: 快速构建和开发体验

### 样式方案
- ✅ 纯 CSS + CSS 变量: 符合现有设计系统
- ✅ 媒体查询: 响应式布局
- ❌ 不使用 CSS-in-JS 或 Tailwind

### 性能优化
- ✅ 浏览器原生懒加载(`loading="lazy"`)
- ✅ Vite 自动代码分割
- ✅ 响应式图片(`srcset`)
- ❌ 不使用 SSR 或预渲染

### 测试工具
- ✅ Vitest: 单元测试(已集成)
- ✅ Playwright: E2E 测试(已集成)
- ✅ @testing-library/react: 组件测试

---

## Implementation Risks & Mitigation

### Risk 1: 示例图片资源缺失
**Impact**: 无法展示真实效果,影响转化率
**Mitigation**:
- 提供 SVG 占位符作为降级方案
- 文档中明确标注图片规格要求
- 在 quickstart.md 中提供图片准备清单

### Risk 2: 首屏加载超过 3 秒
**Impact**: 未达到性能目标,影响用户体验
**Mitigation**:
- 严格控制 Hero Section 图片大小(< 100KB)
- 使用 Lighthouse CI 自动化性能测试
- 预加载关键资源

### Risk 3: 移动端布局问题
**Impact**: 移动端用户体验差
**Mitigation**:
- 优先实现移动端布局(Mobile-First)
- 使用 Chrome DevTools 设备模拟器测试
- Playwright E2E 测试覆盖多种屏幕尺寸

---

## Next Steps

Phase 0 研究完成。所有技术决策已明确,无 NEEDS CLARIFICATION 项残留。

**Phase 1 准备就绪**:
- ✅ 设计模式已选定
- ✅ 性能优化策略已确认
- ✅ 响应式方案已明确
- ✅ 技术栈已验证

可以继续进行 Phase 1:数据模型和快速开始指南的生成。
