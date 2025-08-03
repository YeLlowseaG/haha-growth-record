# Vercel 部署指南

## 🚀 部署到 Vercel

### 1. 准备工作

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号注册

2. **创建 GitHub 仓库**
   - 将代码推送到 GitHub
   - 确保仓库是公开的

### 2. 设置 Vercel Postgres 数据库

1. **在 Vercel Dashboard 中创建数据库**
   - 登录 Vercel Dashboard
   - 点击 "Storage" → "Create Database"
   - 选择 "Postgres"
   - 选择免费计划

2. **获取数据库连接信息**
   - 复制数据库 URL
   - 保存用户名和密码

### 3. 部署应用

1. **导入项目**
   - 在 Vercel Dashboard 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

2. **配置环境变量**
   - 在项目设置中添加以下环境变量：
   ```
   POSTGRES_URL=你的数据库URL
   POSTGRES_HOST=你的数据库主机
   POSTGRES_DATABASE=你的数据库名
   POSTGRES_USERNAME=你的用户名
   POSTGRES_PASSWORD=你的密码
   ```

3. **部署**
   - 点击 "Deploy"
   - 等待部署完成

### 4. 设置 Vercel Blob 存储

1. **创建 Blob 存储**
   - 在 Vercel Dashboard 中
   - 点击 "Storage" → "Create Store"
   - 选择 "Blob"
   - 选择免费计划

2. **配置 Blob 环境变量**
   ```
   BLOB_READ_WRITE_TOKEN=你的Blob令牌
   ```

### 5. 初始化数据库

部署完成后，访问你的应用，数据库表会自动创建。

## 📊 免费额度

### Vercel Postgres
- **存储**: 256MB
- **带宽**: 每月 10GB
- **连接**: 最多 100 个并发连接

### Vercel Blob
- **存储**: 1GB
- **带宽**: 每月 100GB
- **请求**: 每月 100,000 次

### Vercel 部署
- **带宽**: 每月 100GB
- **函数执行**: 每月 100,000 次
- **构建时间**: 每月 6,000 分钟

## 🔧 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **设置环境变量**
   - 复制 `.env.example` 为 `.env.local`
   - 填入你的数据库连接信息

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 🌐 访问应用

部署完成后，你会得到一个类似这样的 URL：
```
https://your-app-name.vercel.app
```

## 📈 监控和扩展

### 监控
- 在 Vercel Dashboard 查看应用性能
- 监控数据库使用情况
- 查看错误日志

### 扩展
- 如果超出免费额度，可以升级到付费计划
- 数据库可以升级到更大的存储空间
- Blob 存储可以扩展到更多空间

## 🔒 安全注意事项

1. **环境变量**
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 的环境变量功能

2. **数据库安全**
   - 定期备份数据
   - 监控数据库访问

3. **文件上传**
   - 限制文件大小和类型
   - 验证上传的文件

## 🆘 常见问题

### Q: 部署失败怎么办？
A: 检查环境变量是否正确设置，查看部署日志。

### Q: 数据库连接失败？
A: 确保数据库 URL 格式正确，检查网络连接。

### Q: 文件上传失败？
A: 检查 Blob 存储配置，确保令牌有效。

### Q: 如何备份数据？
A: 使用 Vercel Dashboard 中的数据库备份功能。

## 📞 支持

如果遇到问题：
1. 查看 Vercel 文档
2. 检查部署日志
3. 联系 Vercel 支持 