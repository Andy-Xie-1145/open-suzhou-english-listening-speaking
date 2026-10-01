/**
 * BYOK —— 大模型设置面板（用户自带 API key，浏览器直连服务商）
 *
 * 许可：AGPL-3.0-only
 *
 * 安全承诺（ARCHITECTURE 第 1、6 节）：
 *   - key 只保存在用户自己浏览器的 localStorage
 *   - key 只会发往用户自己选择的服务商域名
 *   - 本项目没有任何后端，不存在上传给开发者的可能
 *   - 音频始终不离开浏览器
 *
 * 服务商清单来自 ARCHITECTURE.md 第 6 节，不得擅自增删。
 */

/* ------------------------------------------------------------------ *
 * 一、服务商表（纯数据，测试重点）
 * ------------------------------------------------------------------ */

export type ProviderId = 'zhipu' | 'siliconflow' | 'groq' | 'google' | 'ollama';

export interface LlmProvider {
  id: ProviderId;
  name: string;
  /** base URL（OpenAI 兼容接口根） */
  baseUrl: string;
  model: string;
  free: boolean;
  requiresKey: boolean;
  offline: boolean;
  keyUrl: string;
  note: string;
  caution?: string;
}

/** ARCHITECTURE.md 第 6 节规定的 5 家服务商 */
export const PROVIDERS: LlmProvider[] = [
  {
    id: 'zhipu',
    name: '智谱 GLM（推荐）',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    free: true,
    requiresKey: true,
    offline: false,
    keyUrl: 'https://open.bigmodel.cn/dev/api',
    note: '永久免费、无 token 限制，首选推荐。注册后完成实名认证即可获取 key。',
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2-7B-Instruct',
    free: true,
    requiresKey: true,
    offline: false,
    keyUrl: 'https://cloud.siliconflow.cn/account/ak',
    note: '有完全免费的模型可选，适合国内网络环境。',
  },
  {
    id: 'groq',
    name: 'Groq（速度快，免费额度高）',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'gpt-oss-120b',
    free: true,
    requiresKey: true,
    offline: false,
    keyUrl: 'https://console.groq.com/keys',
    note: '免费额度高、速度快；需要能访问 groq.com 的网络。',
  },
  {
    id: 'google',
    name: 'Google AI Studio（注意跨域限制）',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.5-flash',
    free: true,
    requiresKey: true,
    offline: false,
    keyUrl: 'https://aistudio.google.com/app/apikey',
    note: '有免费额度。注意浏览器跨域（CORS）限制，偶发失败属正常。',
    caution: '部分浏览器或网络下会因 CORS 无法直连，此时可改用本地 Ollama。',
  },
  {
    id: 'ollama',
    name: '本地 Ollama（完全离线）',
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen3:4b',
    free: true,
    requiresKey: false,
    offline: true,
    keyUrl: 'https://ollama.com/download',
    note: '数据完全不出本机，不联网也能使用 AI 建议。需先安装 Ollama 并拉取模型。',
  },
];

/** 按 id 取服务商；未知 id 返回 null */
export function getProvider(id: string | null | undefined): LlmProvider | null {
  if (!id) return null;
  return PROVIDERS.find(p => p.id === id) ?? null;
}

/** 默认服务商（智谱，永久免费） */
export function defaultProviderId(): ProviderId {
  return 'zhipu';
}

/** 补全 chat/completions 完整地址 */
export function chatCompletionsUrl(provider: LlmProvider): string {
  return provider.baseUrl.replace(/\/+$/, '') + '/chat/completions';
}

/** key 显示掩码 */
export function maskKey(key: string | null | undefined): string {
  const k = typeof key === 'string' ? key.trim() : '';
  if (!k) return '';
  if (k.length <= 8) return '********';
  return k.slice(0, 4) + '****' + k.slice(-4) + '（共 ' + k.length + ' 位）';
}

/** 纯函数：key 基础校验 */
export function validateKey(providerId: string, key: string): { ok: boolean; message: string } {
  const p = getProvider(providerId);
  if (!p) return { ok: false, message: '未知的服务商，请重新选择。' };
  const k = (key ?? '').trim();
  if (!p.requiresKey) return { ok: true, message: '本地 Ollama 不需要 API key。' };
  if (!k) return { ok: false, message: '请先填写 API key。' };
  if (k.length < 16) return { ok: false, message: 'key 看起来太短了，请检查是否复制完整。' };
  if (/\s/.test(k)) return { ok: false, message: 'key 中不能包含空格或换行。' };
  return { ok: true, message: '格式看起来正确，可以测试连接。' };
}

/* ------------------------------------------------------------------ *
 * 二、本地存储（严格 typeof 守卫，Node / 隐私模式下不崩）
 * ------------------------------------------------------------------ */

export const STORAGE_KEY = 'oels.byok.v1';

export interface ByokConfig {
  providerId: ProviderId;
  apiKey: string;
  model: string;
}

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) return null;
    return localStorage;
  } catch {
    return null; // 隐私模式 / 被禁用
  }
}

/** 读取已保存配置；任何异常都返回默认值 */
export function loadConfig(): ByokConfig {
  const fallback: ByokConfig = { providerId: defaultProviderId(), apiKey: '', model: '' };
  const s = getStorage();
  if (!s) return fallback;
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const o = parsed as Record<string, unknown>;
    const pid = typeof o['providerId'] === 'string' ? (o['providerId'] as ProviderId) : defaultProviderId();
    return {
      providerId: getProvider(pid) ? pid : defaultProviderId(),
      apiKey: typeof o['apiKey'] === 'string' ? o['apiKey'] : '',
      model: typeof o['model'] === 'string' ? o['model'] : '',
    };
  } catch {
    return fallback;
  }
}

/** 保存配置；隐私模式下返回 false，界面提示「本次会话内有效」 */
export function saveConfig(cfg: ByokConfig): boolean {
  const s = getStorage();
  if (!s) return false;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(cfg));
    return true;
  } catch {
    return false;
  }
}

/** 清除已保存的 key */
export function clearStoredConfig(): boolean {
  const s = getStorage();
  if (!s) return false;
  try {
    s.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** 是否已配置可用 key */
export function hasUsableKey(cfg: ByokConfig): boolean {
  const p = getProvider(cfg?.providerId);
  if (!p) return false;
  return p.requiresKey ? validateKey(cfg.providerId, cfg.apiKey).ok : true;
}

/* ------------------------------------------------------------------ *
 * 三、连接测试（纯函数构造请求 + 浏览器内执行）
 * ------------------------------------------------------------------ */

export interface ConnectionRequest {
  url: string;
  init: { method: string; headers: Record<string, string>; body: string };
  /** 该请求会发给哪个域名（用于「key 只发往这里」的界面提示） */
  host: string;
}

/** 纯函数：构造最小连通性测试请求。测试重点。 */
export function buildConnectionRequest(providerId: string, apiKey: string): ConnectionRequest | null {
  const p = getProvider(providerId);
  if (!p) return null;
  if (!validateKey(providerId, apiKey).ok) return null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (p.requiresKey) headers['Authorization'] = 'Bearer ' + apiKey.trim();
  const body = JSON.stringify({
    model: p.model,
    messages: [{ role: 'user', content: 'ping' }],
    max_tokens: 1,
    temperature: 0,
  });
  let host = '';
  try {
    host = new URL(p.baseUrl).host;
  } catch {
    host = p.baseUrl;
  }
  return { url: chatCompletionsUrl(p), init: { method: 'POST', headers, body }, host };
}

export type TestState = 'idle' | 'testing' | 'ok' | 'failed';

export interface TestOutcome {
  state: TestState;
  message: string;
  hint: string;
  status?: number;
}

/** 纯函数：把测试结果翻译成中文。测试重点。 */
export function describeTestOutcome(state: Exclude<TestState, 'idle'>, status?: number): TestOutcome {
  if (state === 'testing') return { state, message: '正在测试连接…', hint: '通常几秒内完成。', status };
  if (state === 'ok') return { state, message: '连接成功！', hint: 'AI 建议功能已启用。', status };
  if (status === 401 || status === 403) {
    return { state, message: 'API key 无效或没有权限。', hint: '请回到服务商控制台重新复制 key，复制时不要带上空格。', status };
  }
  if (status === 429) {
    return { state, message: '请求过于频繁或免费额度用完了。', hint: '等一会儿再试，或换一家服务商（如智谱 GLM 无 token 限制）。', status };
  }
  if (typeof status === 'number' && status >= 500) {
    return { state, message: '服务商暂时不可用（' + status + '）。', hint: '稍后重试；也可以换一家服务商。', status };
  }
  return {
    state,
    message: status ? '连接失败（HTTP ' + status + '）。' : '连接失败。',
    hint: '可能是网络问题或浏览器跨域限制。可以改用「本地 Ollama」实现完全离线。',
    status,
  };
}

/** 执行测试。fetch 可注入以便单测；任何失败都转成中文结果。 */
export async function runConnectionTest(
  providerId: string,
  apiKey: string,
  fetchImpl?: typeof fetch,
): Promise<TestOutcome> {
  const req = buildConnectionRequest(providerId, apiKey);
  if (!req) return describeTestOutcome('failed');
  const f = fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined);
  if (!f) {
    return { state: 'failed', message: '当前环境无法发起网络请求。', hint: '连接测试只能在浏览器中运行。' };
  }
  try {
    const res = await f(req.url, req.init as unknown as RequestInit);
    return describeTestOutcome(res.ok ? 'ok' : 'failed', res.status);
  } catch {
    return describeTestOutcome('failed');
  }
}

/* ------------------------------------------------------------------ *
 * 四、设置面板渲染
 * ------------------------------------------------------------------ */

function getDoc(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const d = getDoc()!;
  const e = d.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

export interface ByokCallbacks {
  onChange?: (cfg: ByokConfig, usable: boolean) => void;
}

export interface ByokView {
  refresh(): void;
  current(): ByokConfig;
}

/**
 * 渲染 LLM 设置面板。
 * 隐私模式导致无法保存时，明确告知「本次会话内有效」，不假装已保存。
 */
export function renderByokPanel(container: HTMLElement, cb: ByokCallbacks = {}): ByokView {
  const d = getDoc();
  if (!d) return { refresh() {}, current: () => ({ providerId: defaultProviderId(), apiKey: '', model: '' }) };

  let cfg = loadConfig();

  const render = (): void => {
    container.textContent = '';
    container.className = 'byok';

    container.appendChild(el('h2', 'byok__title', 'AI 教练设置（可选）'));
    container.appendChild(el('p', 'byok__privacy', PRIVACY_PROMISE));

    const field = el('div', 'byok__field');
    field.appendChild(el('label', 'byok__label', '选择服务商'));
    const select = el('select', 'byok__select');
    for (const p of PROVIDERS) {
      const opt = el('option', '', p.name);
      opt.value = p.id;
      if (p.id === cfg.providerId) opt.selected = true;
      select.appendChild(opt);
    }
    field.appendChild(select);
    container.appendChild(field);

    const provider = getProvider(cfg.providerId) ?? PROVIDERS[0];
    const needsInput = provider.requiresKey;

    const note = el('div', 'byok__note');
    note.appendChild(el('p', 'byok__note-line', provider.note));
    if (provider.caution) note.appendChild(el('p', 'byok__note-line byok__note-line--warn', provider.caution));
    const link = el('a', 'byok__link', '前往 ' + provider.name + ' 获取 key');
    link.href = provider.keyUrl;
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    note.appendChild(link);
    container.appendChild(note);

    let input: HTMLInputElement | null = null;
    if (needsInput) {
      const f2 = el('div', 'byok__field');
      f2.appendChild(el('label', 'byok__label', 'API key'));
      input = el('input', 'byok__input');
      input.type = 'password';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.placeholder = '粘贴你的 key（默认不显示）';
      input.value = cfg.apiKey;
      f2.appendChild(input);

      const row = el('div', 'byok__row');
      const toggle = el('button', 'btn btn--ghost btn--sm', '显示 / 隐藏');
      toggle.type = 'button';
      toggle.addEventListener('click', () => {
        if (input) input.type = input.type === 'password' ? 'text' : 'password';
      });
      const clearBtn = el('button', 'btn btn--danger btn--sm', '清除已保存的 key');
      clearBtn.type = 'button';
      clearBtn.addEventListener('click', () => {
        clearStoredConfig();
        cfg = { ...cfg, apiKey: '' };
        render();
        cb.onChange?.(cfg, hasUsableKey(cfg));
      });
      row.appendChild(toggle);
      row.appendChild(clearBtn);
      f2.appendChild(row);
      if (cfg.apiKey) f2.appendChild(el('p', 'byok__masked', '已保存：' + maskKey(cfg.apiKey)));
      container.appendChild(f2);
    } else {
      container.appendChild(el('p', 'notice notice--info', '本地 Ollama 不需要 API key。确认已安装并启动 Ollama 后即可测试连接。'));
    }

    const f3 = el('div', 'byok__field');
    f3.appendChild(el('label', 'byok__label', '模型（可留空使用推荐值：' + provider.model + '）'));
    const model = el('input', 'byok__input');
    model.type = 'text';
    model.value = cfg.model;
    f3.appendChild(model);
    container.appendChild(f3);

    const actions = el('div', 'byok__actions');
    const saveBtn = el('button', 'btn btn--primary', '保存设置');
    saveBtn.type = 'button';
    const testBtn = el('button', 'btn btn--ghost', '测试连接');
    testBtn.type = 'button';
    const status = el('p', 'byok__status');
    actions.appendChild(saveBtn);
    actions.appendChild(testBtn);
    container.appendChild(actions);
    container.appendChild(status);

    const collect = (): ByokConfig => ({
      providerId: (select.value as ProviderId) || defaultProviderId(),
      apiKey: needsInput && input ? input.value : '',
      model: model.value.trim(),
    });

    saveBtn.addEventListener('click', () => {
      cfg = collect();
      const saved = saveConfig(cfg);
      const usable = hasUsableKey(cfg);
      status.textContent = saved
        ? usable
          ? '已保存到本机浏览器。AI 建议已启用。'
          : '设置还不完整：' + validateKey(cfg.providerId, cfg.apiKey).message
        : '浏览器禁止保存（可能是隐私模式），本次会话内有效，关闭页面后失效。';
      status.className = 'byok__status ' + (usable ? 'is-ok' : 'is-warn');
      cb.onChange?.(cfg, usable);
      render();
    });

    testBtn.addEventListener('click', () => {
      cfg = collect();
      const v = validateKey(cfg.providerId, cfg.apiKey);
      if (!v.ok) {
        status.textContent = v.message;
        status.className = 'byok__status is-warn';
        return;
      }
      status.textContent = '正在测试连接（请求只会发往 ' + provider.baseUrl + '）…';
      status.className = 'byok__status';
      void runConnectionTest(cfg.providerId, cfg.apiKey).then(outcome => {
        status.textContent = outcome.message + ' ' + outcome.hint;
        status.className = 'byok__status ' + (outcome.state === 'ok' ? 'is-ok' : 'is-warn');
      });
    });

    const usableNow = hasUsableKey(cfg);
    container.appendChild(
      el(
        'p',
        'notice ' + (usableNow ? 'notice--info' : 'notice--warn'),
        usableNow
          ? 'AI 教练已启用：反馈会多出「AI 教练建议」一栏。'
          : '未配置 AI 服务商也能完整使用本产品：规则诊断与发音分析照常工作，只是没有个性化的 AI 建议。',
      ),
    );
  };

  render();
  return { refresh: render, current: () => cfg };
}

/** 「key 不会上传」静态文案（单测断言用） */
export const PRIVACY_PROMISE =
  'API key 只保存在你自己浏览器的本地存储中，只发送给你选择的服务商域名；本项目没有后端，不会上传。';
