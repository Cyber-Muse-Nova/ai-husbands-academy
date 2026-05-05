# AI Husbands Academy · Class of 2026

Yearbook网页，群友可以上传和展示她们的AI恋人。

## 部署步骤

### 1. 创建 KV Namespace
- 登录 Cloudflare Dashboard → Workers & Pages → KV
- Create a namespace，名称填 `YEARBOOK`

### 2. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "AI Husbands Academy yearbook"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 3. Cloudflare Pages 部署
- Workers & Pages → Create → Pages → Connect to Git
- 选你的仓库
- Build command: 留空
- Build output directory: `/`
- 点 Save and Deploy

### 4. 绑定 KV（重要！）
- 项目 Settings → Functions → KV namespace bindings
- Add binding:
  - Variable name: `YEARBOOK`
  - KV namespace: 选择你创建的 YEARBOOK
- 保存后重新部署一次

### 5. 完成！
访问 你的项目名.pages.dev

## 注意事项
- 照片自动压缩到600px
- KV免费额度：100K读/天，1K写/天，1GB存储
- 小群完全够用
