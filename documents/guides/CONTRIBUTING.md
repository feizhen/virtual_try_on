# 贡献指南

感谢你考虑为这个项目做出贡献!

## 如何贡献

### 报告 Bug

如果你发现 Bug,请创建一个 Issue 并包含:

- Bug 的详细描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息 (操作系统、Node.js 版本等)
- 相关的错误日志

### 建议新功能

如果你有新功能的想法:

1. 先检查 Issues 中是否已有类似建议
2. 创建新 Issue 描述你的建议
3. 说明为什么这个功能有用
4. 如果可能,提供实现思路

### 提交代码

#### 开发流程

1. **Fork 这个仓库**

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/your-username/vibe_coding_template_nestjs.git
   cd vibe_coding_template_nestjs
   ```

3. **创建新分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **安装依赖**
   ```bash
   pnpm install
   ```

5. **进行修改**

6. **运行测试**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

7. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # 或
   git commit -m "fix: resolve bug in authentication"
   ```

8. **推送到你的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **创建 Pull Request**

## 代码规范

### Commit 消息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式 (不影响代码运行)
- `refactor`: 重构 (既不是新功能也不是 Bug 修复)
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

**示例**:
```
feat(auth): add email verification

- Add email verification endpoint
- Send verification email after registration
- Add email template

Closes #123
```

### TypeScript 代码规范

- 使用 TypeScript 严格模式
- 避免使用 `any` 类型
- 为所有公共 API 添加 JSDoc 注释
- 使用有意义的变量名
- 保持函数简短和单一职责

### 文件命名

- 使用 kebab-case: `user.service.ts`
- 测试文件: `user.service.spec.ts`
- E2E 测试: `auth.e2e-spec.ts`
- DTO: `create-user.dto.ts`
- Entity: `user.entity.ts`

### 代码格式化

使用 Prettier 和 ESLint:

```bash
pnpm lint      # 检查代码规范
pnpm format    # 格式化代码
```

## 测试要求

### 单元测试

为所有新功能添加单元测试:

```typescript
describe('UsersService', () => {
  describe('create', () => {
    it('should create a new user', async () => {
      // 测试代码
    });

    it('should throw error if email exists', async () => {
      // 测试代码
    });
  });
});
```

### E2E 测试

为重要的用户流程添加 E2E 测试:

```typescript
describe('Auth (e2e)', () => {
  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name })
      .expect(201);
  });
});
```

### 测试覆盖率

尽量保持高测试覆盖率:
- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 80%

运行测试覆盖率:
```bash
pnpm test:cov
```

## Pull Request 指南

### PR 标题

使用清晰的标题,遵循 Conventional Commits:

```
feat: add user profile picture upload
fix: resolve JWT token expiration issue
docs: update API documentation
```

### PR 描述

包含以下内容:

```markdown
## 变更内容

简要描述这个 PR 做了什么。

## 变更类型

- [ ] Bug fix (不破坏现有功能的修复)
- [ ] New feature (不破坏现有功能的新功能)
- [ ] Breaking change (会导致现有功能失效的修改)
- [ ] Documentation update

## 测试

描述你如何测试这些变更:

- [ ] 单元测试已通过
- [ ] E2E 测试已通过
- [ ] 手动测试场景 1
- [ ] 手动测试场景 2

## Checklist

- [ ] 代码遵循项目的代码规范
- [ ] 已进行自我代码审查
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 无新的警告
- [ ] 已添加测试证明修复有效或功能正常
- [ ] 新的和现有的单元测试都通过
- [ ] 依赖变更已在 PR 中说明

## 相关 Issue

Closes #(issue number)
```

### PR 审查流程

1. 提交 PR 后,等待维护者审查
2. 根据反馈进行修改
3. 所有检查通过后会被合并
4. 合并后可以删除你的分支

## 项目结构约定

### 添加新模块

创建新功能模块时:

```bash
src/modules/
├── your-module/
│   ├── dto/
│   │   ├── create-your-entity.dto.ts
│   │   └── update-your-entity.dto.ts
│   ├── entities/
│   │   └── your-entity.entity.ts
│   ├── your-module.controller.ts
│   ├── your-module.service.ts
│   ├── your-module.module.ts
│   └── your-module.service.spec.ts
```

### 添加公共工具

在 `src/common/` 下:

```bash
src/common/
├── decorators/
├── filters/
├── guards/
├── interceptors/
├── pipes/
└── interfaces/
```

## 数据库变更

### 创建迁移

1. 修改 `prisma/schema.prisma`
2. 创建迁移:
   ```bash
   pnpm prisma:migrate
   ```
3. 检查生成的迁移文件
4. 提交迁移文件到 Git

### 迁移命名

使用描述性名称:
```
add_user_email_verification
create_posts_table
add_user_role_column
```

## 文档

### API 文档

更新 `API.md`:
- 添加新端点
- 更新请求/响应示例
- 说明新的查询参数或请求体字段

### README

更新 `README.md`:
- 新功能说明
- 新的环境变量
- 新的依赖说明

### 代码注释

为复杂逻辑添加注释:

```typescript
/**
 * Validates user password against stored hash
 * @param password - Plain text password
 * @param hashedPassword - Bcrypt hashed password
 * @returns Promise<boolean> - True if password matches
 */
async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

## 依赖管理

### 添加新依赖

1. 仅添加必要的依赖
2. 优先选择维护良好的包
3. 检查许可证兼容性
4. 更新 `package.json` 中的依赖说明

```bash
# 生产依赖
pnpm add package-name

# 开发依赖
pnpm add -D package-name
```

### 更新依赖

```bash
# 检查过时的包
pnpm outdated

# 更新所有依赖
pnpm update

# 更新特定包
pnpm update package-name
```

## 安全

### 报告安全漏洞

**请勿**在公开 Issue 中报告安全漏洞。

请通过私密方式联系维护者。

### 安全检查

提交前运行:

```bash
pnpm audit
```

## 性能

### 性能测试

对性能关键的代码添加基准测试。

### 数据库查询

- 使用 Prisma 的 `select` 仅查询需要的字段
- 为频繁查询的字段添加索引
- 避免 N+1 查询问题

## 问题解决

### 遇到问题?

1. 查看现有 Issues
2. 查看项目文档
3. 在 Discussion 中提问
4. 创建新 Issue (如果确实是 Bug)

### 开发环境问题

**依赖安装失败**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**数据库问题**:
```bash
pnpm prisma:migrate reset
pnpm prisma:generate
```

**TypeScript 错误**:
```bash
pnpm build
```

## 社区准则

### 行为准则

- 尊重所有贡献者
- 建设性的反馈
- 欢迎新手
- 专注于问题,而非个人

### 沟通

- Issue 中保持专业和友好
- PR 评论要具体和建设性
- 及时回复反馈

## 版本发布

由维护者负责:

1. 更新版本号 (遵循 [Semantic Versioning](https://semver.org/))
2. 更新 CHANGELOG
3. 创建 Git tag
4. 发布 Release

版本号格式: `MAJOR.MINOR.PATCH`

- MAJOR: 破坏性变更
- MINOR: 新功能 (向后兼容)
- PATCH: Bug 修复 (向后兼容)

## 许可证

提交代码即表示你同意将你的贡献以 MIT 许可证发布。

---

再次感谢你的贡献! 🎉
