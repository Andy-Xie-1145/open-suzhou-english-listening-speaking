import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/**
 * 纯静态构建：无后端、无 SSR、无 API 代理。
 * 所有 AI 能力由浏览器端模型 + 用户自带 key 提供。
 *
 * ⚠️ 关于 onnxruntime-web 的 wasm 变体选择：
 *
 * onnxruntime-web 1.31.0-dev 自带四个 wasm，体积差别很大：
 *   ort-wasm-simd-threaded.wasm          13.60 MiB  ← 纯 WASM 后端，够用
 *   ort-wasm-simd-threaded.jspi.wasm      16.03 MiB
 *   ort-wasm-simd-threaded.asyncify.wasm  25.62 MiB  ← 超 Cloudflare Pages 25MiB 上限
 *   ort-wasm-simd-threaded.jsep.wasm      27.04 MiB  ← 超限更多
 *
 * 默认打包会选中 asyncify（25.62 MiB = 26,861,777 字节），
 * 超过 Cloudflare Pages 单文件 26,214,400 字节（25 MiB）上限 **647,377 字节**，
 * 部署会直接失败。
 *
 * asyncify 是给 WebGPU/JSEP 代理用的。本项目基线是 WASM，
 * 把它显式指向 13.60 MiB 的基础变体即可从根上解决，不必借 R2 绕。
 */
const ortWasmDir = fileURLToPath(
  new URL('./node_modules/onnxruntime-web/dist', import.meta.url),
);

export default defineConfig({
  base: './',
  resolve: {
    alias: [
      // 把 asyncify 换成基础变体：从 25.62 MiB 降到 13.60 MiB
      {
        find: /ort-wasm-simd-threaded\.asyncify\.wasm$/,
        replacement: ortWasmDir + '/ort-wasm-simd-threaded.wasm',
      },
    ],
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    // 模型权重从 HF Hub / ModelScope 运行时拉取，不打进产物
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers', 'onnxruntime-web'],
  },
  server: { port: 5173 },
});
