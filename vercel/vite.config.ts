import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = path.resolve(__dirname, '..');

/**
 * Vercel 静态部署专用构建配置。
 *
 * 与平台构建（scripts/build.sh / vite.config.ts）完全独立：
 * - 只构建前端，产物输出到 dist-vercel/
 * - 通过 alias 把 @lark-apaas/client-toolkit 的平台运行时相关模块替换成本地垫片
 * - 通过 define 把 Supabase 凭据注入打包产物（Publishable key 本身即公开可暴露）
 */
export default defineConfig({
  root: __dirname,
  publicDir: path.resolve(repoRoot, 'client/public'),
  plugins: [react()],
  resolve: {
    alias: [
      // client-toolkit 的 tailwind-theme.css 里用 "@/inspector.dev.css" 引用同目录文件，
      // 平台构建自带 "@" 别名，这里补上精确映射，避免 postcss-import 解析失败。
      {
        find: /^@\/inspector\.dev\.css$/,
        replacement: path.resolve(
          repoRoot,
          'node_modules/@lark-apaas/client-toolkit/lib/inspector.dev.css',
        ),
      },
      { find: '@client', replacement: path.resolve(repoRoot, 'client') },
      { find: '@shared', replacement: path.resolve(repoRoot, 'shared') },
      {
        find: /^@lark-apaas\/client-toolkit\/utils\/getAxiosForBackend$/,
        replacement: path.resolve(__dirname, 'shims/backend.ts'),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/logger$/,
        replacement: path.resolve(__dirname, 'shims/logger.ts'),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/components\/AppContainer$/,
        replacement: path.resolve(__dirname, 'shims/AppContainer.tsx'),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/components\/ErrorRender$/,
        replacement: path.resolve(__dirname, 'shims/ErrorRender.tsx'),
      },
      {
        find: /^@lark-apaas\/client-toolkit\/components\/Welcome$/,
        replacement: path.resolve(__dirname, 'shims/Welcome.tsx'),
      },
    ],
  },
  define: {
    'process.env.CLIENT_BASE_PATH': JSON.stringify(process.env.CLIENT_BASE_PATH ?? '/'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL ?? ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
      process.env.SUPABASE_ANON_KEY ?? '',
    ),
  },
  css: {
    postcss: path.resolve(repoRoot, 'postcss.config.js'),
  },
  build: {
    outDir: path.resolve(repoRoot, 'dist-vercel'),
    emptyOutDir: true,
    sourcemap: false,
  },
});
