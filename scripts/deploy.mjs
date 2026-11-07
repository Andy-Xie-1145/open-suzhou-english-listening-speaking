/**
 * 部署包装：把老账号的 API Token 注入 wrangler 环境。
 *
 * 许可：AGPL-3.0-only
 *
 * ## 为什么有这个文件
 *
 * 2026-11 起，本机 wrangler OAuth 登录的是新账号（andyxie.2025.08@gmail.com），
 * 而 openels 项目在老账号（Andyxie_2025@163.com，c706f13fcaa580b6a7c9593db2f8d060）下，
 * 新账号的 token 对它没有权限（实测 Authentication error 10000）。
 *
 * 本脚本从**仓库外**的 token 文件读凭据（不进 git），
 * 用环境变量 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID 驱动 wrangler，
 * 与 OAuth 登录状态无关。
 *
 * 用法：npm run deploy（等价于 build + 本脚本）
 * 换 token 位置：$env:CLOUDFLARE_TOKEN_FILE = 'D:\ somewhere\token'
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const TOKEN_FILE = process.env.CLOUDFLARE_TOKEN_FILE
  || 'D:/Projects/one-api/.cf-old-token';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
  || 'c706f13fcaa580b6a7c9593db2f8d060'; // Andyxie_2025@163.com's Account（非机密）

const token = readFileSync(TOKEN_FILE, 'utf8').trim();
if (!token) {
  console.error('token 文件是空的：' + TOKEN_FILE);
  process.exit(1);
}

const r = spawnSync('npx', [
  'wrangler', 'pages', 'deploy', 'dist',
  '--project-name', 'openels',
  '--branch', 'master',
  '--commit-dirty=true',
], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    CLOUDFLARE_API_TOKEN: token,
    CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
  },
});
process.exit(r.status ?? 1);
