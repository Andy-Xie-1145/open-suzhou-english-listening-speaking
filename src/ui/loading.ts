/**
 * 加载页：三件事全部就绪才允许进考试。
 *
 * 1. 真机自检 —— 麦克风 → 采集 → 模型 → 转写链路跑通（用户点「开始自检」）
 * 2. 语音转写模型加载完成
 * 3. 本卷听力音频已全部预处理（静态 mp3，可直接播放）
 *
 * 自检未通过时展示补救建议；若用户坚持，可用「仍然进入」降级进入。
 * 其他两项未完成则进入按钮保持禁用。
 */

import { mountSelfCheck } from './selfcheck-ui.ts';
import type { RecorderPort, AsrPort } from '../suzhou/recorder-bridge.ts';
import { dealPaper, type PaperBank } from '../suzhou/paper.ts';
import { prefetchAudio, type PrefetchProgress, type AudioCache } from '../suzhou/listening-session.ts';
import { audioUrl } from '../suzhou/listening-audio.ts';
import type { SelfCheckReport } from '../suzhou/selfcheck.ts';

export interface LoadingDeps {
  bank: PaperBank;
  recorder: RecorderPort | null;
  asr: AsrPort | null;
  /** 与考试共用同一个 seed，保证预处理的是同一份卷 */
  seed: number;
  /** 全部就绪后放行，把已下完的听力音频缓存交给考试。考试中不得再加载任何内容 */
  onReady: (audioCache: AudioCache) => void;
}

type StepState = 'pending' | 'running' | 'done' | 'failed' | 'warn';

interface StepView {
  state: StepState;
  detail: string;
}

export function mountLoading(doc: Document, deps: LoadingDeps): HTMLElement {
  const root = doc.createElement('section');
  root.className = 'loading';

  const h = doc.createElement('h2');
  h.className = 'loading-title';
  h.textContent = '正在准备考试环境';
  root.appendChild(h);

  const steps: StepView[] = [
    { state: 'pending', detail: '等待自检…' },
    { state: 'pending', detail: '等待加载语音转写模型…' },
    { state: 'pending', detail: '等待预处理听力音频…' },
  ];
  const STEP_NAMES = ['真机自检（麦克风/采集/转写链路）', '加载语音转写模型', '预处理听力音频（本卷全部试题）'];

  const list = doc.createElement('ul');
  list.className = 'loading-steps';
  root.appendChild(list);

  const barWrap = doc.createElement('div');
  barWrap.className = 'sz-bar loading-bar';
  const barFill = doc.createElement('div');
  barFill.className = 'sz-bar-fill';
  barWrap.appendChild(barFill);
  root.appendChild(barWrap);

  const enterBtn = doc.createElement('button');
  enterBtn.type = 'button';
  enterBtn.className = 'sz-btn loading-enter';
  enterBtn.textContent = '进入考试';
  enterBtn.disabled = true;
  root.appendChild(enterBtn);

  const overrideBtn = doc.createElement('button');
  overrideBtn.type = 'button';
  overrideBtn.className = 'sz-btn sz-btn-sm loading-override';
  overrideBtn.textContent = '自检未通过，仍然进入';
  overrideBtn.style.display = 'none';
  let audioCache: AudioCache | null = null;

function enter(): void {
  // cache 不 release —— 它的所有权移交给考试界面，考试中只播放不下载
  deps.onReady(audioCache ?? emptyCache());
}

function emptyCache(): AudioCache {
  return { urlFor: function () { return null; }, releaseAll: function () { /* nothing */ } };
}

overrideBtn.addEventListener('click', enter);
  root.appendChild(overrideBtn);

  const scSlot = doc.createElement('div');
  scSlot.className = 'loading-selfcheck';
  root.appendChild(scSlot);

  let selfCheckPassed = false;
  let selfCheckDone = false;
  let asrDone = false;
  let audioDone = false;

  function stepDone(): number {
    let n = 0;
    if (selfCheckDone) n++;
    if (asrDone) n++;
    if (audioDone) n++;
    return n;
  }

  function refresh(): void {
    while (list.firstChild) list.removeChild(list.firstChild);
    for (let i = 0; i < STEP_NAMES.length; i++) {
      const li = doc.createElement('li');
      li.className = 'loading-step ' + steps[i].state;
      const mark = doc.createElement('span');
      mark.className = 'loading-mark';
      mark.textContent = steps[i].state === 'done' ? '✓'
        : steps[i].state === 'failed' ? '✕'
        : steps[i].state === 'warn' ? '!'
        : steps[i].state === 'running' ? '…'
        : '—';
      const name = doc.createElement('span');
      name.className = 'loading-name';
      name.textContent = STEP_NAMES[i];
      const det = doc.createElement('span');
      det.className = 'loading-detail';
      det.textContent = steps[i].detail;
      li.appendChild(mark);
      li.appendChild(name);
      li.appendChild(det);
      list.appendChild(li);
    }
    barFill.style.width = Math.round((stepDone() / 3) * 100) + '%';
    const allHardReady = selfCheckDone && selfCheckPassed && asrDone && audioDone;
    enterBtn.disabled = !allHardReady;
    overrideBtn.style.display = selfCheckDone && !selfCheckPassed && asrDone && audioDone
      ? '' : 'none';
  }

  enterBtn.addEventListener('click', enter);

  // 步骤 1：真机自检（用户点击其按钮后跑报告）
  scSlot.appendChild(mountSelfCheck(doc, { recorder: deps.recorder, asr: deps.asr }, function (report: SelfCheckReport) {
    selfCheckDone = true;
    selfCheckPassed = !!report.allPassed;
    steps[0] = selfCheckPassed
      ? { state: 'done', detail: '链路通过' }
      : { state: 'warn', detail: '未通过：' + (report.firstFailure ? '失败项见下方报告' : '详见报告') };
    refresh();
  }));

  // 步骤 2：ASR 模型
  if (!deps.asr) {
    asrDone = true;
    steps[1] = { state: 'warn', detail: '当前环境不支持自动转写，录音后将使用手动输入' };
  } else {
    steps[1] = { state: 'running', detail: deps.asr.status().message };
    refresh();
    void deps.asr.load().then(function (ok) {
      asrDone = true;
      steps[1] = ok
        ? { state: 'done', detail: '语音转写已就绪' }
        : { state: 'failed', detail: deps.asr!.status().message };
      refresh();
    });
    const tick = setInterval(function () {
      if (steps[1].state === 'running') {
        steps[1] = { state: 'running', detail: deps.asr!.status().message };
        refresh();
      } else {
        clearInterval(tick);
      }
    }, 500);
  }

  // 步骤 3：听力音频预处理（与考试同一份卷）
  try {
    const paper = dealPaper(deps.bank, { seed: deps.seed });
    const groups = paper.listening.dialogue.concat(paper.listening.passage);
    const urls: string[] = [];
    for (const g of groups) urls.push(audioUrl(g.material.id));
    steps[2] = { state: 'running', detail: '下载 0 / ' + urls.length };
    refresh();
    const doFetch = async function (u: string) {
      const r = await fetch(u);
      return { ok: r.ok, status: r.status, blob: async function () { return r.blob(); } };
    };
    void prefetchAudio(urls, doFetch, function (p: PrefetchProgress) {
      steps[2] = { state: 'running', detail: '下载 ' + p.done + ' / ' + p.total };
      refresh();
    }).then(function (c) {
      audioCache = c;
      audioDone = true;
      const missing = c.urlFor(urls[0]) === null;
      steps[2] = missing
        ? { state: 'warn', detail: '音频下载全部失败，仍可进入但听力无声' }
        : { state: 'done', detail: '全部音频已就绪，开考即可播放' };
      refresh();
    });
  } catch (e) {
    steps[2] = { state: 'failed', detail: '出题失败：' + (e instanceof Error ? e.message : String(e)) };
    refresh();
  }

  refresh();
  return root;
}
