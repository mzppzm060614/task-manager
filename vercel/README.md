# Vercel 静态部署说明

该目录是「智能任务管理系统」的 Vercel 静态部署配置：不启动常驻 Node 服务，前端直接通过 Supabase REST API 读写 `tasks` 表。

## Vercel 项目构建设置

| 项目 | 值 |
| --- | --- |
| Framework Preset | Other |
| Install Command | `npm install --ignore-scripts` |
| Build Command | `npm run build:vercel` |
| Output Directory | `dist-vercel` |

`--ignore-scripts` 用于跳过仓库里平台专用 CLI 的 postinstall 脚本（Vercel 环境没有该二进制，会报 127）。

## 环境变量

| Key | 说明 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | Supabase Publishable key（可公开，切勿使用 secret key） |

## 本地预览

```bash
npm install --ignore-scripts
npx vite build --config vercel/vite.config.ts
```

## 变更记录

- 2026-11-12：环境变量改为在项目 Settings → Environment Variables 中配置 `SUPABASE_URL` / `SUPABASE_ANON_KEY`（名称照旧，值用 Publishable key）。
