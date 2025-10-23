# Quick Start: 登录页面设计系统优化

**Feature**: 登录页面设计系统优化
**Date**: 2025-10-22

## 概述

本指南帮助开发者快速开始实现登录页面的设计系统对齐优化。此功能仅涉及CSS样式变更，无需修改JavaScript/TypeScript代码。

---

## 前置条件

- Node.js ≥ 18.0.0
- pnpm包管理器
- 熟悉CSS3、Flexbox、媒体查询
- 了解CSS变量（Custom Properties）
- 阅读设计系统文档：`documents/design/virtual_design_system.md`

---

## 开发环境设置

### 1. 克隆仓库并安装依赖

```bash
cd /path/to/virtual_try_on/client
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

开发服务器将在 `http://localhost:5173` 启动。

### 3. 在浏览器中打开登录页面

访问: `http://localhost:5173/login`

---

## 实现步骤

### Step 1: 更新全局CSS变量

**文件**: `client/src/index.css`

**目标**: 将颜色变量对齐到设计系统规范

**变更**:
```css
:root {
  /* 主色从靛蓝改为深石板灰 */
  --primary-color: #1F2937;           /* 原: #4f46e5 */
  --primary-hover: #111827;           /* 原: #4338ca */

  /* 新增设计系统颜色 */
  --main-dark: #1F2937;               /* 新增 */
  --hover-dark: #111827;              /* 新增 */

  /* 文本颜色调整 */
  --text-primary: #1F2937;            /* 原: #111827 */
  --text-secondary: #6B7280;          /* 保持不变 */
  --text-tertiary: #9CA3AF;           /* 新增 */

  /* 其他颜色保持或微调 */
  --success-color: #10b981;           /* 保持不变 */
  --error-color: #ef4444;             /* 保持不变 */
  --background: #f9fafb;              /* 保持不变 */
  --card-background: #ffffff;         /* 保持不变 */
  --border-color: #e5e7eb;            /* 保持不变 */

  /* 阴影保持不变 */
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

**验证**: 刷新页面，观察全局颜色变化。

---

### Step 2: 更新登录页面样式

**文件**: `client/src/pages/Auth.css`

#### 2.1 更新容器背景

移除紫色渐变背景，改为纯浅灰色：

```css
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--background); /* 移除渐变 */
}
```

#### 2.2 更新卡片样式

调整圆角、阴影和内边距：

```css
.auth-card {
  background-color: var(--card-background);
  padding: 24px;                              /* 原: 2.5rem (40px) */
  border-radius: 12px;                        /* 原: 1rem (16px) */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);     /* 原: var(--shadow-lg) */
  border: 1px solid #F3F4F6;                 /* 新增 */
  width: 100%;
  max-width: 450px;
}
```

#### 2.3 更新标题排版

对齐字号、字重和行高：

```css
.auth-title {
  font-size: 32px;          /* 原: 2rem */
  line-height: 40px;        /* 新增 */
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;       /* 原: 0.5rem */
  color: var(--text-primary);
}

.auth-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 24px;      /* 原: 2rem (32px) */
  font-size: 14px;          /* 新增 */
  line-height: 20px;        /* 新增 */
}
```

#### 2.4 更新表单样式

调整间距系统：

```css
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;                /* 原: 1.5rem (24px) - 保持 */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;                 /* 原: 0.5rem (8px) - 保持 */
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;          /* 新增 */
}
```

#### 2.5 更新输入框样式

对齐高度、圆角和聚焦状态：

```css
.form-group input {
  padding: 12px 16px;                        /* 原: 0.75rem 1rem */
  height: 48px;                              /* 新增 */
  border: 1px solid var(--border-color);
  border-radius: 6px;                        /* 原: 0.5rem (8px) */
  font-size: 15px;                           /* 原: 1rem (16px) */
  transition: border-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1),
              box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.form-group input::placeholder {
  color: var(--text-tertiary);              /* 新增 */
}

.form-group input:focus {
  outline: none;
  border: 2px solid var(--main-dark);       /* 原: border-color */
  box-shadow: none;                          /* 移除聚焦时的box-shadow */
}

.form-group input:disabled {
  background-color: var(--background);
  cursor: not-allowed;
  opacity: 0.5;                              /* 新增 */
}
```

#### 2.6 更新按钮样式

对齐高度、圆角和悬停状态：

```css
.btn-primary {
  background-color: var(--main-dark);
  color: white;
  height: 48px;                                        /* 新增 */
  padding: 12px 24px;                                  /* 原: 0.75rem 1.5rem */
  border-radius: 6px;                                  /* 原: 0.5rem (8px) */
  font-size: 15px;                                     /* 原: 1rem (16px) */
  font-weight: 500;
  transition: background-color 150ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--hover-dark);
  transform: none;                                     /* 移除translateY */
  box-shadow: none;                                    /* 移除悬停阴影 */
}

.btn-primary:disabled {
  background-color: #9CA3AF;
  opacity: 0.5;
}
```

#### 2.7 更新错误消息样式

调整圆角和间距：

```css
.error-message {
  background-color: #fee2e2;
  color: var(--error-color);
  padding: 12px 16px;                     /* 原: 0.75rem 1rem */
  border-radius: 6px;                     /* 原: 0.5rem (8px) */
  font-size: 14px;                        /* 原: 0.875rem */
  margin-bottom: 16px;                    /* 原: 1rem */
  border-left: 4px solid var(--error-color);
}
```

#### 2.8 更新链接样式

对齐颜色和悬停状态：

```css
.auth-footer {
  text-align: center;
  margin-top: 24px;                       /* 原: 1.5rem */
  color: var(--text-secondary);
  font-size: 14px;                        /* 新增 */
}

.auth-footer a {
  color: #3B82F6;                         /* 设计系统链接蓝色 */
  font-weight: 500;
  transition: color 150ms ease-out;
}

.auth-footer a:hover {
  color: #2563EB;                         /* 悬停时深蓝色 */
  text-decoration: underline;
}
```

#### 2.9 更新响应式样式

调整移动端断点：

```css
@media (max-width: 640px) {
  .auth-card {
    padding: 20px;                        /* 原: 2rem (32px) */
  }

  .auth-title {
    font-size: 28px;                      /* 原: 1.75rem */
    line-height: 36px;                    /* 新增 */
  }
}
```

---

### Step 3: 验证变更

#### 3.1 视觉验证

在浏览器中打开登录页面，对照设计系统文档逐项验证：

**颜色验证**:
- [ ] 背景色为 #F9FAFB（浅灰）
- [ ] 卡片背景为 #FFFFFF（白色）
- [ ] 主标题颜色为 #1F2937（深石板灰）
- [ ] 副标题颜色为 #6B7280（灰色）
- [ ] 按钮背景为 #1F2937
- [ ] 按钮悬停背景为 #111827
- [ ] 输入框边框为 #E5E7EB
- [ ] 输入框聚焦边框为 #1F2937
- [ ] 错误消息文字为 #EF4444

**尺寸验证**:
- [ ] 卡片圆角 12px
- [ ] 输入框高度 48px，圆角 6px
- [ ] 按钮高度 48px，圆角 6px
- [ ] 标题字号 32px，行高 40px

**间距验证**:
- [ ] 卡片内边距 24px
- [ ] 表单元素间距 24px
- [ ] 标签与输入框间距 8px

**交互验证**:
- [ ] 输入框聚焦时显示2px深色边框
- [ ] 按钮悬停时背景变暗
- [ ] 过渡动画流畅（150ms-200ms）

#### 3.2 响应式验证

使用Chrome DevTools测试不同屏幕尺寸：

1. **桌面端（1024px+）**:
   - [ ] 卡片最大宽度450px
   - [ ] 卡片内边距24px
   - [ ] 标题32px

2. **平板端（640-1023px）**:
   - [ ] 布局保持正常
   - [ ] 间距一致

3. **移动端（<640px）**:
   - [ ] 卡片内边距20px
   - [ ] 标题28px
   - [ ] 无横向滚动

#### 3.3 跨浏览器验证

在以下浏览器中测试：
- [ ] Chrome（主要）
- [ ] Firefox
- [ ] Safari（macOS）
- [ ] Edge

---

## 开发工具

### 浏览器开发者工具

**Chrome DevTools**:
```
右键 -> 检查元素 -> Elements面板
- 查看computed styles
- 使用颜色选择器对比颜色
- 使用响应式设计模式测试不同屏幕
```

**测量工具**:
- Chrome DevTools中的ruler（标尺）
- 截图对比工具（如Pixel Perfect扩展）

### 热重载

Vite开发服务器支持HMR（热模块替换），CSS更改会即时反映在浏览器中，无需手动刷新。

---

## 常见问题

### Q1: 更改CSS变量后，其他页面也变了怎么办？
**A**: 这是预期行为。CSS变量是全局的，用于确保全站一致性。如果其他页面不符合设计系统，需要在后续任务中单独对齐。

### Q2: 输入框聚焦时边框变粗，导致布局抖动
**A**: 使用`box-sizing: border-box`（已在全局设置）和固定的padding值可以避免此问题。或者在默认状态也使用2px边框，聚焦时仅改变颜色。

### Q3: 移动端测试时，样式不生效
**A**: 确保使用实际设备或DevTools的响应式模式。检查媒体查询断点是否正确。

### Q4: 按钮悬停动画在触摸设备上不流畅
**A**: 触摸设备没有真正的"悬停"状态。考虑使用`:active`伪类或添加触摸反馈。

---

## 下一步

完成样式更新后：

1. **提交代码**:
   ```bash
   git add client/src/index.css client/src/pages/Auth.css
   git commit -m "feat: 对齐登录页面到设计系统规范"
   ```

2. **创建Pull Request**

3. **请求设计团队审查**: 确保100%符合设计系统

4. **运行回归测试**: 确保登录功能仍正常工作

5. **部署到测试环境**: 在真实设备上验证

---

## 参考资料

- **设计系统文档**: `documents/design/virtual_design_system.md`
- **功能规范**: `specs/003-specify-scripts-bash/spec.md`
- **研究文档**: `specs/003-specify-scripts-bash/research.md`
- **CSS变量MDN文档**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Flexbox指南**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- **媒体查询MDN文档**: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries

---

## 支持

如有问题，请参考：
- 功能规范中的边界情况章节
- 研究文档中的风险评估和缓解策略
- 项目的`client/CLAUDE.md`了解前端架构
