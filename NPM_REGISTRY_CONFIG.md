# NPM镜像源配置说明

本项目已配置npm镜像源,以加速依赖安装。

## 当前配置

### 默认配置(淘宝镜像)

所有构建环境已配置使用淘宝镜像:
- **镜像地址**: https://registry.npmmirror.com
- **适用范围**: Vercel、Railway、本地开发

### 配置位置

1. **Vercel构建** - `vercel.json`
   ```json
   "buildCommand": "cd client && pnpm config set registry https://registry.npmmirror.com && pnpm install && pnpm build"
   ```

2. **Railway构建** - `Dockerfile`
   ```dockerfile
   RUN npm config set registry https://registry.npmmirror.com && \
       npm install -g pnpm && \
       pnpm config set registry https://registry.npmmirror.com
   ```

3. **本地开发**
   - 根目录: `.npmrc`
   - 前端目录: `client/.npmrc`

## 切换镜像源

### 方法1: 修改.npmrc文件

**使用淘宝镜像**:
```ini
registry=https://registry.npmmirror.com/
```

**使用官方源**:
```ini
registry=https://registry.npmjs.org/
```

### 方法2: 使用pnpm命令

```bash
# 切换到淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 切换到官方源
pnpm config set registry https://registry.npmjs.org

# 查看当前配置
pnpm config get registry
```

### 方法3: 临时使用指定源

```bash
# 临时使用淘宝镜像安装
pnpm install --registry=https://registry.npmmirror.com

# 临时使用官方源安装
pnpm install --registry=https://registry.npmjs.org
```

## 常用npm镜像源

| 名称 | 地址 | 说明 |
|------|------|------|
| npm官方 | https://registry.npmjs.org | 国外速度快 |
| 淘宝镜像 | https://registry.npmmirror.com | 国内推荐 |
| 华为云 | https://repo.huaweicloud.com/repository/npm/ | 国内备选 |
| 腾讯云 | https://mirrors.cloud.tencent.com/npm/ | 国内备选 |

## 针对不同环境的建议

### Vercel部署
- ✅ **推荐**: 淘宝镜像
- **原因**: Vercel在新加坡有节点,访问淘宝镜像速度更快

### Railway部署
- ✅ **推荐**: 淘宝镜像
- **原因**: Railway可能在亚太地区,淘宝镜像更快

### 国内开发
- ✅ **推荐**: 淘宝镜像
- **原因**: 国内访问速度最快

### 国外开发
- ✅ **推荐**: npm官方源
- **原因**: 直接访问官方源速度最快

## 验证配置

### 检查当前源

```bash
# 检查npm源
npm config get registry

# 检查pnpm源
pnpm config get registry
```

### 测试安装速度

```bash
# 测试安装速度
time pnpm install

# 清除缓存后测试
pnpm store prune
time pnpm install
```

## 故障排查

### 问题1: 安装速度慢

**解决方案**:
1. 检查是否使用了正确的镜像源
2. 尝试切换到其他镜像源
3. 检查网络连接

### 问题2: 镜像源不可用

**解决方案**:
```bash
# 切换到其他镜像源
pnpm config set registry https://registry.npmjs.org
```

### 问题3: 某些包找不到

**解决方案**:
1. 淘宝镜像可能同步延迟,尝试使用官方源
2. 清除pnpm缓存:
   ```bash
   pnpm store prune
   ```

## 自动化脚本

### 快速切换镜像源

在 `package.json` 添加脚本:

```json
{
  "scripts": {
    "registry:taobao": "pnpm config set registry https://registry.npmmirror.com",
    "registry:npm": "pnpm config set registry https://registry.npmjs.org",
    "registry:check": "pnpm config get registry"
  }
}
```

使用:
```bash
pnpm run registry:taobao  # 切换到淘宝镜像
pnpm run registry:npm     # 切换到npm官方源
pnpm run registry:check   # 查看当前源
```

## 注意事项

1. **锁文件**: 更改镜像源后,建议删除 `pnpm-lock.yaml` 重新生成
2. **缓存**: 切换源后建议清除缓存: `pnpm store prune`
3. **私有包**: 如果使用私有npm包,需要配置相应的认证信息
4. **CI/CD**: 确保CI/CD环境使用正确的镜像源配置

## 推荐配置

### 根目录 .npmrc (已配置)

```ini
# 使用淘宝镜像
registry=https://registry.npmmirror.com/

# pnpm配置
shamefully-hoist=true
strict-peer-dependencies=false
```

### 前端 client/.npmrc (已配置)

```ini
# 使用淘宝镜像
registry=https://registry.npmmirror.com/

# pnpm配置
shamefully-hoist=true
```

---

✅ 所有构建环境已配置完成,使用淘宝镜像加速依赖安装!
