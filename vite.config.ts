import { defineConfig } from 'vite';

// 纯静态构建：无后端、无 SSR、无 API 代理。
// 所有 AI 能力由浏览器端模型 + 用户自带 key 提供。
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    // 模型权重从 HF Hub 运行时拉取，不打进产物
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers', 'onnxruntime-web'],
  },
  server: { port: 5173 },
});
