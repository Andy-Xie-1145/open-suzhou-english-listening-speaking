/**
 * 真机自检界面
 *
 * 许可：AGPL-3.0-only
 *
 * 用途：让任何人点一次就知道「麦克风 → 采集 → 录音 → 模型 → 转写」这条链
 * 在**他的真实浏览器**里通不通，不需要我们推测。
 *
 * ⚠️ 本页不做任何近似评分，不显示任何分数。它只回答「能不能用」。
 */

import {
  runSelfCheck,
  CHECK_LABELS,
  buildReport,
  type CheckResultItem,
  type SelfCheckReport,
  type SelfCheckDeps,
} from '../suzhou/selfcheck.ts';

export interface SelfCheckHost {
  recorder: SelfCheckDeps['recorder'];
  asr: SelfCheckDeps['asr'];
}

export function mountSelfCheck(doc: Document, host: SelfCheckHost): HTMLElement {
  const root = doc.createElement('section');
  root.className = 'sz-selfcheck';

  const h = doc.createElement('h2');
  h.textContent = '真机自检';
  root.appendChild(h);

  const lead = doc.createElement('p');
  lead.className = 'sz-sc-lead';
  lead.textContent = '逐环验证麦克风与浏览器端语音转写是否可用。点击后请对着麦克风说一句话。';
  root.appendChild(lead);

  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'sz-btn';
  btn.textContent = '开始自检';
  root.appendChild(btn);

  const out = doc.createElement('div');
  out.className = 'sz-sc-out';
  root.appendChild(out);
  let running = false;

  function renderItem(item: CheckResultItem): HTMLElement {
    const row = doc.createElement('div');
    row.className = 'sz-sc-item sz-sc-' + item.status;

    const head = doc.createElement('div');
    head.className = 'sz-sc-head';
    const mark = doc.createElement('span');
    mark.className = 'sz-sc-mark';
    mark.textContent = item.status === 'pass' ? '✓' : item.status === 'fail' ? '✕' : '—';
    const name = doc.createElement('span');
    name.className = 'sz-sc-name';
    name.textContent = item.label;
    const sum = doc.createElement('span');
    sum.className = 'sz-sc-sum';
    sum.textContent = item.summary;
    head.appendChild(mark);
    head.appendChild(name);
    head.appendChild(sum);
    row.appendChild(head);

    if (item.detail) {
      const d = doc.createElement('pre');
      d.className = 'sz-sc-detail';
      d.textContent = item.detail;
      row.appendChild(d);
    }

    if (item.remedies.length > 0) {
      const fix = doc.createElement('div');
      fix.className = 'sz-sc-fix';
      const t = doc.createElement('strong');
      t.textContent = '请照做：';
      fix.appendChild(t);
      const ul = doc.createElement('ul');
      for (const r2 of item.remedies) {
        const li = doc.createElement('li');
        li.textContent = r2;
        ul.appendChild(li);
      }
      fix.appendChild(ul);
      row.appendChild(fix);
    }

    return row;
  }

  function renderReport(report: SelfCheckReport): void {
    while (out.firstChild) out.removeChild(out.firstChild);
    const verdict = doc.createElement('p');
    verdict.className = report.allPassed ? 'sz-sc-verdict ok' : 'sz-sc-verdict bad';
    verdict.textContent = report.verdict;
    out.appendChild(verdict);
    for (const item of report.items) out.appendChild(renderItem(item));
    // 顺序提示：失败项排在前面，方便一眼看到
    if (report.firstFailure) {
      const hint = doc.createElement('p');
      hint.className = 'sz-sc-hint';
      hint.textContent = '首个需要处理的环节：' + CHECK_LABELS[report.firstFailure];
      out.appendChild(hint);
    }
  }
  btn.addEventListener('click', function () {
    if (running) return;
    running = true;
    btn.disabled = true;
    btn.textContent = '自检中…请对着麦克风说话';
    while (out.firstChild) out.removeChild(out.firstChild);

    void runSelfCheck(
      { recorder: host.recorder, asr: host.asr },
      function (item: CheckResultItem) {
        out.appendChild(renderItem(item));
      },
    ).then(function (report: SelfCheckReport) {
      renderReport(report);
    }).catch(function (e: unknown) {
      // 自检本身抛异常也不能让页面崩
      const err = doc.createElement('div');
      err.className = 'sz-sc-item sz-sc-fail';
      const t = doc.createElement('span');
      t.textContent = '自检意外中断：' + String(e);
      err.appendChild(t);
      out.appendChild(err);
      const fallback = buildReport([]);
      renderReport(fallback);
    }).finally(function () {
      running = false;
      btn.disabled = false;
      btn.textContent = '重新自检';
    });
  });

  return root;
}
