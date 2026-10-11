/**
 * 首页：标题 + 开始按钮。点击开始后才进入加载页。
 */

import { renderByokPanel } from './byok.ts';

export interface HomeDeps {
  onStart: () => void;
  onByokChange?: (cfg: { providerId: string; apiKey: string; model: string }, usable: boolean) => void;
}

export function mountHome(doc: Document, deps: HomeDeps): HTMLElement {
  const root = doc.createElement('section');
  root.className = 'home';

  const h = doc.createElement('h1');
  h.className = 'home-title';
  h.textContent = '苏州英语听说 · 开源自托管练习';
  root.appendChild(h);

  const sub = doc.createElement('p');
  sub.className = 'home-sub';
  sub.textContent = '零服务端、BYOK、浏览器端运行。所有评分仅为近似模拟，不是考场分数。';
  root.appendChild(sub);

  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'sz-btn home-start';
  btn.textContent = '开始练习';
  btn.addEventListener('click', function () { deps.onStart(); });
  root.appendChild(btn);

  const det = doc.createElement('details');
  det.className = 'home-byok';
  const sum = doc.createElement('summary');
  sum.textContent = 'AI 教练设置（BYOK，可选）';
  det.appendChild(sum);
  const panel = doc.createElement('div');
  panel.className = 'home-byok-panel';
  det.appendChild(panel);
  renderByokPanel(panel, { onChange: function (cfg, usable) { if (deps.onByokChange) deps.onByokChange(cfg, usable); } });
  root.appendChild(det);

  return root;
}
