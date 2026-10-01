/**
 * 引擎层自测 —— 零网络、零模型权重、零浏览器 API
 *
 * 许可：AGPL-3.0-only
 *
 * 运行：node --experimental-strip-types tests/engine.test.ts
 *
 * 本文件刻意不 import src/materials/（语料尚未就绪，engine 必须能独立测试），
 * 也刻意不触发任何真实模型下载：所有需要模型的路径都验证「失败时抛
 * EngineUnavailable 而不是崩溃」，这正是 ARCHITECTURE.md 第 4 条降级阶梯的要求。
 */

import {
  // capabilities
  EngineUnavailable,
  isEngineUnavailable,
  safeStorage,
  loadPrefs,
  savePrefs,
  resetPrefs,
  resetPrefsCache,
  capabilities,
  detectWebGPU,
  hasWebGPUFlag,
  pickDevice,
  setModelState,
  getModelState,
  resetModelStates,
  detectDeviceProfile,
  // audio
  TARGET_SAMPLE_RATE,
  durationMsOf,
  toMono,
  resample,
  normalizePeak,
  rms,
  isSilent,
  audioQuality,
  detectSpeechActivity,
  trimSilence,
  preprocessForModel,
  decodeWavToPcm,
  isRecordingSupported,
  MicrophoneRecorder,
  // phoneme
  normalizeIpa,
  phoneDistance,
  phoneClass,
  splitIpaToPhones,
  splitModelOutput,
  alignPhonemeSequences,
  alignByWord,
  fallbackG2pWord,
  g2pReference,
  describeError,
  assessPhonemes,
  isPhonemeModelReady,
  resetPhonemeModel,
  // asr
  transcribe,
  parseWhisperOutput,
  isAsrModelReady,
  resetAsrModel,
  ASR_MODELS,
  // llm
  PROVIDERS,
  providerById,
  resolveSettings,
  isLlmConfigured,
  requestAdvice,
  enhance,
  parseAdvice,
  extractJsonObject,
  buildRequestBody,
  buildHeaders,
  resolveEndpoint,
  maskKey,
  // pipeline
  analyze,
  createEngine,
  getEngine,
  resetEngine,
} from "../src/engine/index.ts";

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log("  PASS  " + name);
  } else {
    fail++;
    console.log("  FAIL  " + name + (detail ? "  -> " + detail : ""));
  }
}

/** 异步断言：失败也要记录，不能让整个测试挂掉 */
async function checkAsync(name: string, fn: () => Promise<boolean>, detail = "") {
  try {
    const ok = await fn();
    check(name, ok, detail);
  } catch (e) {
    check(name, false, String(e));
  }
}

function section(title: string) {
  console.log("\n[" + title + "]");
}

// 本文件必须能直接 node --experimental-strip-types 运行，因此不依赖 @types/node
// 是否被 tsconfig 加载：自己按需取 process，缺失时静默跳过退出码设置。
const proc = (globalThis as unknown as { process?: { exit(code: number): void } }).process;

/** 断言某个调用抛出 EngineUnavailable，而不是别的异常 */
async function expectUnavailable(name: string, fn: () => Promise<unknown>, layer?: string) {
  await checkAsync(
    name,
    async () => {
      try {
        await fn();
        return false;
      } catch (e) {
        if (!isEngineUnavailable(e)) return false;
        if (layer && (e as EngineUnavailable).layer !== layer) return false;
        return true;
      }
    },
    "未抛出 EngineUnavailable",
  );
}

/* --------------------------------------------------------------- *
 * 构造一段测试用 WAV（16bit PCM 单声道）
 * 这样 decodeWavToPcm 可以在 Node 里被完整验证，不依赖 AudioContext。
 * --------------------------------------------------------------- */
function makeWav(samples: Float32Array, sampleRate: number, channels = 1): Uint8Array {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataLen = samples.length * blockAlign;
  const buf = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buf);
  const putStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  putStr(0, "RIFF");
  view.setUint32(4, 36 + dataLen, true);
  putStr(8, "WAVE");
  putStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);          // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  putStr(36, "data");
  view.setUint32(40, dataLen, true);
  let off = 44;
  for (const s of samples) {
    const v = Math.max(-1, Math.min(1, s));
    for (let c = 0; c < channels; c++) {
      view.setInt16(off, Math.round(v * 32767), true);
      off += 2;
    }
  }
  return new Uint8Array(buf);
}

/** 生成一段带静音首尾的正弦波，用来测 VAD 裁剪 */
function toneWithSilence(total: number, toneFrom: number, toneTo: number, freq = 220): Float32Array {
  const out = new Float32Array(total);
  for (let i = toneFrom; i < toneTo && i < total; i++) {
    out[i] = 0.5 * Math.sin((2 * Math.PI * freq * i) / 16000);
  }
  return out;
}

/* ===== A. 能力中枢 ===== */
section("A. 能力中枢 capabilities.ts");

resetPrefs();
resetPrefsCache();

const st = safeStorage();
check("Node 下安全存储可用", !!st);
check("Node 下退化为内存存储", st.memoryOnly === true);
st.setItem("k", "v");
check("内存存储可读写", st.getItem("k") === "v", String(st.getItem("k")));

check("偏好默认值：ASR 开启", loadPrefs().enableAsr === true);
check("偏好默认值：LLM 默认关闭", loadPrefs().llm.enabled === false);
check("偏好默认值：默认服务商为智谱", loadPrefs().llm.provider === "zhipu");

savePrefs({ enableAsr: false });
check("保存偏好生效", loadPrefs().enableAsr === false);
resetPrefsCache();
check("清缓存后从存储读回（往返一致）", loadPrefs().enableAsr === false, String(loadPrefs().enableAsr));

// 脏数据容错：字段类型不对时必须回退到默认值，而不是抛错或把字符串当真
st.setItem("dsh:prefs:v1", JSON.stringify({ enableAsr: "yes", llm: { temperature: 999, timeoutMs: 1 } }));
resetPrefsCache();
const dirty = loadPrefs();
check("脏字段回退为布尔默认值", typeof dirty.enableAsr === "boolean" && dirty.enableAsr === true, String(dirty.enableAsr));
check("越界温度被夹紧到 2", dirty.llm.temperature === 2, String(dirty.llm.temperature));

st.setItem("dsh:prefs:v1", "{这不是 JSON");
resetPrefsCache();
let dirtyOk = false;
try { dirtyOk = loadPrefs().enableAsr === true; } catch { dirtyOk = false; }
check("损坏的偏好 JSON 不会导致崩溃", dirtyOk);
resetPrefs();
resetPrefsCache();

await checkAsync("Node 下 WebGPU 探测返回 false", async () => (await detectWebGPU()) === false);
check("Node 下 navigator.gpu 标志为 false", hasWebGPUFlag() === false);
check("强制 WASM 时设备为 wasm", pickDevice(false) === "wasm");
check("无 WebGPU 时设备为 wasm", pickDevice(true) === "wasm");
const prof = detectDeviceProfile();
check("设备画像可读（cores>0）", prof.cores > 0, String(prof.cores));

resetModelStatesSafe();
function resetModelStatesSafe() {
  setModelState("asr", "idle");
  setModelState("phoneme", "idle");
}
check("初始模型状态为 idle", getModelState("asr") === "idle");
check("初始能力：ASR 未就绪", capabilities().asr === false);
setModelState("asr", "ready");
check("标记 ready 后能力为 true", capabilities().asr === true);
savePrefs({ enableAsr: false });
check("偏好关闭时能力仍为 false", capabilities().asr === false);
savePrefs({ enableAsr: true });
check("偏好恢复后能力为 true", capabilities().asr === true);
setModelState("asr", "idle");
check("状态回落为 idle", getModelState("asr") === "idle" && capabilities().asr === false);

const err = new EngineUnavailable("模型没加载", "L2", "model_load_failed");
check("EngineUnavailable 是 Error", err instanceof Error);
check("EngineUnavailable 带 layer/reason", err.layer === "L2" && err.reason === "model_load_failed");
check("isEngineUnavailable 正向判定", isEngineUnavailable(err));
check("isEngineUnavailable 反向判定", !isEngineUnavailable(new Error("普通错误")));
/* ===== B. 音频 ===== */
section("B. 音频 audio.ts");

check("目标采样率为 16kHz", TARGET_SAMPLE_RATE === 16000);

check("时长计算正确", Math.abs(durationMsOf(new Float32Array(16000), 16000) - 1000) < 0.001);
check("空音频时长为 0", durationMsOf(new Float32Array(0), 16000) === 0);

const stereo = [new Float32Array([1, 0, -1, 0]), new Float32Array([0, 1, 0, -1])];
const mono = toMono(stereo);
check("多声道下混为单声道", mono.length === 4 && mono[0] === 0.5 && mono[1] === 0.5 && mono[2] === -0.5, Array.from(mono).join(","));

const src48 = new Float32Array(4800);
for (let i = 0; i < src48.length; i++) src48[i] = Math.sin((2 * Math.PI * 200 * i) / 48000);
const out16 = resample(src48, 48000, 16000);
check("48k→16k 长度正确", out16.length === 1600, String(out16.length));
check("重采样后仍有信号", rms(out16) > 0.3 && rms(out16) < 0.8, String(rms(out16)));
const same = resample(src48, 48000, 48000);
check("同采样率返回副本而非同一引用", same !== src48 && same.length === src48.length);

// WAV 解码：纯函数，无浏览器 API，Node 里可完整验证
const wav8k = makeWav(new Float32Array(8000).fill(0.5), 8000);
const pcm = decodeWavToPcm(wav8k);
check("WAV 解码后采样率为 16k", pcm.sampleRate === 16000, String(pcm.sampleRate));
check("WAV 8k/1s → 16k/1s", Math.abs(pcm.durationMs - 1000) < 5, String(pcm.durationMs));
check("WAV 振幅保持", Math.abs(pcm.samples[100] - 0.5) < 0.01, String(pcm.samples[100]));

const wavStereo = makeWav(new Float32Array(4000).fill(0.25), 16000, 2);
const pcmS = decodeWavToPcm(wavStereo);
check("立体声 WAV 正确下混", Math.abs(pcmS.samples[10] - 0.25) < 0.01, String(pcmS.samples[10]));

await expectUnavailable("非法 WAV 抛 EngineUnavailable", async () => decodeWavToPcm(new Uint8Array(10)), "audio");

const voiced = toneWithSilence(16000, 4000, 12000);
const act = detectSpeechActivity(voiced, 16000);
// toneWithSilence 的下标是采样点：4000~12000 @16kHz 即 250ms~750ms
check("VAD 找到语音起点（跳过首部静音）", act.startMs > 200 && act.startMs < 400, String(act.startMs));
// 帧级 VAD 的边界误差最多一帧（25ms），终点允许落在一帧之后
check("VAD 找到语音终点", act.endMs >= 700 && act.endMs <= 1000, String(act.endMs));
check("VAD 语音时长接近真实 500ms", act.speechMs > 400 && act.speechMs < 800, String(act.speechMs));
const trimmed = trimSilence(voiced, 16000);
check("裁剪后长度显著变短", trimmed.length < 16000 && trimmed.length > 4000, String(trimmed.length));

const silence = new Float32Array(16000);
check("全静音被识别", isSilent(silence));
check("静音段 VAD 标记 silent", detectSpeechActivity(silence, 16000).silent === true);
check("静音的 audioQuality 为 0", audioQuality(silence) === 0);
check("正常语音的 audioQuality 大于 0", audioQuality(voiced) > 0.5, String(audioQuality(voiced)));

const norm = normalizePeak(new Float32Array([0.1, -0.2, 0.05]));
check("峰值归一化到 0.95", Math.abs(Math.max(...Array.from(norm).map(Math.abs)) - 0.95) < 1e-5);
check("静音归一化不会放大噪声", normalizePeak(silence)[0] === 0);

const pre = preprocessForModel(src48, 48000);
check("预处理输出 16k", pre.sampleRate === 16000);
check("预处理做了峰值归一化", Math.abs(pre.samples[100]) < 1.0, String(pre.samples[100]));
check("预处理输出了时长", pre.durationMs > 90 && pre.durationMs < 110, String(pre.durationMs));

check("Node 下录音不可用", isRecordingSupported() === false);
check("录音器状态为 unsupported", new MicrophoneRecorder().state === "unsupported");
await expectUnavailable("录音器在 Node 抛 EngineUnavailable", async () => new MicrophoneRecorder().start(), "audio");
/* ===== C. L1 音素：纯算法 ===== */
section("C. L1 音素纯逻辑 phoneme.ts");

check("归一化去掉重音但保留长度符", normalizeIpa("ˈiː") === "iː", normalizeIpa("ˈiː"));
check("归一化去掉连音符", normalizeIpa("t͡s") === "ts", normalizeIpa("t͡s"));
check("元音分类正确", phoneClass("æ") === "vowel");
check("塞音分类正确", phoneClass("t") === "plosive");
check("摩擦音分类正确", phoneClass("ʃ") === "fricative");
check("鼻音分类正确", phoneClass("ŋ") === "nasal");

check("相同音素距离为 0", phoneDistance("æ", "æ") === 0);
check("仅长度不同距离 0.25", phoneDistance("iː", "i") === 0.25, String(phoneDistance("iː", "i")));
check("同类音素距离 0.5", phoneDistance("t", "p") === 0.5, String(phoneDistance("t", "p")));
check("异类音素距离 1", phoneDistance("t", "iː") === 1, String(phoneDistance("t", "iː")));

const split1 = splitIpaToPhones("dʒˈɛm");
check("连写 IPA 正确切分", JSON.stringify(split1) === JSON.stringify(["dʒ", "ɛ", "m"]), split1.join("|"));
check("双音素不被拆开", splitIpaToPhones("eɪ").length === 1, splitIpaToPhones("eɪ").join("|"));

const seq = ["h", "ɛ", "l", "oʊ"];
const a1 = alignPhonemeSequences(seq, seq.slice());
check("完全一致时全部匹配", a1.steps.every((s) => s.op === "M"), JSON.stringify(a1.steps.map((s) => s.op)));
check("完全一致时相似度为 1", Math.abs(a1.similarity - 1) < 1e-9, String(a1.similarity));

const a2 = alignPhonemeSequences(seq, ["h", "ɛ", "l"]);
check("少读一个音判为 D", a2.steps.filter((s) => s.op === "D").length === 1, JSON.stringify(a2.steps.map((s) => s.op)));
const a3 = alignPhonemeSequences(seq, ["h", "ɛ", "l", "oʊ", "z"]);
check("多读一个音判为 I", a3.steps.filter((s) => s.op === "I").length === 1, JSON.stringify(a3.steps.map((s) => s.op)));
const a4 = alignPhonemeSequences(seq, ["h", "e", "l", "oʊ"]);
check("读错一个音判为 S", a4.steps.filter((s) => s.op === "S").length === 1, JSON.stringify(a4.steps.map((s) => s.op)));
check("空参考得到全 D", alignPhonemeSequences([], ["a"]).steps[0].op === "I");
check("空实际得到全 D", alignPhonemeSequences(["a"], []).steps[0].op === "D");

// 逐词归并：三种错误分别验证，避免 DTW 在混合场景下走不同路径导致断言不稳定
const wRef = ["thing"];
const wExp = [["θ", "ɪ", "ŋ"]];
const wS = alignByWord(wRef, wExp, ["θ", "ɪ", "s"]);
check("替换 S 归到正确的词", wS.words.length === 1 && wS.words[0].errors.some((e) => e.type === "S"), JSON.stringify(wS.words[0].errors.map((e) => e.type)));
check("替换计入 summary", wS.summary.substitutions === 1, JSON.stringify(wS.summary));
const wD = alignByWord(wRef, wExp, ["θ", "ɪ"]);
check("删除 D 被检出", wD.words[0].errors.some((e) => e.type === "D"), JSON.stringify(wD.words[0].errors.map((e) => e.type)));
check("删除计入 summary", wD.summary.deletions === 1);
const wI = alignByWord(wRef, wExp, ["θ", "ɪ", "ŋ", "s"]);
check("插入 I 被检出", wI.words[0].errors.some((e) => e.type === "I"), JSON.stringify(wI.words[0].errors.map((e) => e.type)));
check("插入计入 summary", wI.summary.insertions === 1);
check("完全读对时无错误且准确率 1", wI.words[0].accuracy >= 0 && alignByWord(wRef, wExp, wExp[0]).words[0].accuracy === 1);
check("准确率落在 0~1", wD.words[0].accuracy >= 0 && wD.words[0].accuracy <= 1, String(wD.words[0].accuracy));
check("置信率受质量系数影响", wD.words[0].confidence <= wD.words[0].accuracy + 1e-9, String(wD.words[0].confidence));
check("G2P 降级时置信度打折", alignByWord(wRef, wExp, wExp[0], { g2pSource: "fallback" }).words[0].confidence < 1);

const g1 = fallbackG2pWord("three");
check("近似 G2P 输出非空", g1.length >= 3, g1.join(""));
const g2 = fallbackG2pWord("books");
check("近似 G2P 处理复数", g2.length >= 3, g2.join(""));
check("近似 G2P 对空串安全", fallbackG2pWord("").length === 0);
await checkAsync("Node 下 G2P 降级为 fallback", async () => {
  const r = await g2pReference("hello world");
  return r.source === "fallback" && r.words.length === 2 && r.words.every((w) => w.length > 0);
});

check("模型输出按空格切分", splitModelOutput("h ɛ l oʊ").length === 4, splitModelOutput("h ɛ l oʊ").join("|"));
check("模型输出按 | 分词", splitModelOutput("h ɛ|l oʊ").length === 4, splitModelOutput("h ɛ|l oʊ").join("|"));
check("空模型输出返回空数组", splitModelOutput("").length === 0);

const desc = describeError("D", "ŋ", null, "thing", 2);
check("错误描述为中文且含音素", desc.detail.includes("漏读") && desc.tip.length > 0, desc.detail);
check("替换错误含 expected 与 actual", describeError("S", "ŋ", "s", "thing", 2).detail.includes("s"));

check("Node 下音素模型未就绪", isPhonemeModelReady() === false);
await expectUnavailable("无模型时音素比对抛 EngineUnavailable(L1)", async () => assessPhonemes(src48, 48000, "hello world"), "L1");
resetPhonemeModel();

/* ===== D. L2 ASR ===== */
section("D. L2 语音识别 asr.ts");

check("ASR 模型目录含 tiny/base", !!ASR_MODELS.tiny && !!ASR_MODELS.base);
const emptyOut = await transcribe(new Float32Array(0), 16000);
check("空音频直接返回空结果而不抛错", emptyOut.empty === true && emptyOut.text === "");
check("Node 下 ASR 模型未就绪", isAsrModelReady() === false);
await expectUnavailable("无模型时转写抛 EngineUnavailable(L2)", async () => transcribe(src48, 48000), "L2");
resetAsrModel();

const parsed = parseWhisperOutput({
  text: "hello world",
  chunks: [
    { timestamp: [0, 1.2], text: "hello" },
    { timestamp: [1.2, 2.5], text: " world" },
  ],
}, 2500);
check("转写文本被解析", parsed.text === "hello world", parsed.text);
check("分段时间戳转成毫秒", parsed.segments[1].startMs === 1200 && parsed.segments[1].endMs === 2500, JSON.stringify(parsed.segments));
check("空输出标记 empty", parseWhisperOutput({}, 100).empty === true);
check("null 输出不崩", parseWhisperOutput(null, 100).text === "");
/* ===== E. L3 LLM（不联网） ===== */
section("E. L3 BYOK 客户端 llm.ts");

check("服务商数量为 5", PROVIDERS.length === 5, String(PROVIDERS.length));
const zhipu = providerById("zhipu");
check("智谱 base url 符合契约", zhipu.baseUrl === "https://open.bigmodel.cn/api/paas/v4", zhipu.baseUrl);
check("智谱默认模型为 glm-4-flash", zhipu.model === "glm-4-flash");
check("硅基流动 base url 正确", providerById("siliconflow").baseUrl === "https://api.siliconflow.cn/v1");
check("Groq base url 正确", providerById("groq").baseUrl === "https://api.groq.com/openai/v1");
check("Gemini base url 正确", providerById("gemini").baseUrl === "https://generativelanguage.googleapis.com/v1beta/openai");
check("Ollama base url 正确", providerById("ollama").baseUrl === "http://localhost:11434/v1");
check("Ollama 不需要 key", providerById("ollama").needsKey === false);
check("未知服务商回退智谱", providerById("not-exist").id === "zhipu");
check("所有服务商都有中文备注", PROVIDERS.every((p) => p.note.length > 0));

const sZhipu = resolveSettings({ provider: "zhipu", apiKey: "  abc  " });
check("请求地址拼接 /chat/completions", resolveEndpoint(sZhipu) === "https://open.bigmodel.cn/api/paas/v4/chat/completions", resolveEndpoint(sZhipu));
check("尾部斜杠被清理", resolveEndpoint(resolveSettings({ provider: "gemini", baseUrl: "https://x.test/v1beta/openai/" })).endsWith("/chat/completions"));
check("未填模型时用服务商默认模型", sZhipu.model === "glm-4-flash");
check("key 被 trim", sZhipu.apiKey === "abc");
check("有 key 时带 Bearer 头", buildHeaders(sZhipu).Authorization === "Bearer abc", JSON.stringify(buildHeaders(sZhipu)));
const sOllama = resolveSettings({ provider: "ollama" });
check("无 key 时不带 Authorization", buildHeaders(sOllama).Authorization === undefined);
check("未配置 key 时 isLlmConfigured 为 false", isLlmConfigured({ provider: "zhipu", apiKey: "" }) === false);
check("Ollama 无 key 也算已配置", isLlmConfigured({ provider: "ollama", enabled: true }) === true);
check("enabled=false 时不算已配置", isLlmConfigured({ provider: "ollama", enabled: false }) === false);

check("key 打码不泄露完整 key", maskKey("sk-1234567890abcd").includes("****") && !maskKey("sk-1234567890abcd").includes("1234567890"));
check("短 key 完全打码", maskKey("abc").length === 8);

const body = buildRequestBody(sZhipu, { transcript: "I like basketball", kind: "topic", topicName: "my favourite sport" });
check("请求体含 model", body.model === "glm-4-flash");
check("请求体含 system+user 两条消息", Array.isArray(body.messages) && (body.messages as unknown[]).length === 2);
check("关闭流式输出", body.stream === false);
const userMsg = (body.messages as Array<{ content: string }>)[1].content;
check("提示词包含转写文本", userMsg.includes("I like basketball"));
check("提示词包含话题", userMsg.includes("my favourite sport"));
check("系统提示要求中文输出", (body.messages as Array<{ content: string }>)[0].content.includes("简体中文"));

const goodJson = JSON.stringify({ summary: "不错", grammar: ["a"], fluency: [], examples: ["Nice to meet you."], practice: [] });
check("解析纯 JSON", parseAdvice(goodJson)?.summary === "不错");
check("解析带 Markdown 围栏的 JSON", parseAdvice("```json\n" + goodJson + "\n```")?.summary === "不错");
check("解析前后夹带解释的 JSON", parseAdvice("好的，我的建议如下：" + goodJson + " 希望有帮助！")?.summary === "不错");
check("非 JSON 返回 null", parseAdvice("我觉得你读得不错") === null);
check("空串返回 null", parseAdvice("") === null);
check("全空字段返回 null", parseAdvice(JSON.stringify({ summary: "", grammar: [], fluency: [], examples: [], practice: [] })) === null);
check("缺少部分字段仍可解析", parseAdvice(JSON.stringify({ summary: "ok" }))?.grammar.length === 0);
check("对象/null 元素被丢弃", parseAdvice(JSON.stringify({ summary: "ok", grammar: [1, "  ", "b", null, {}] }))?.grammar.length === 2);
check("花括号在字符串内不影响配平", extractJsonObject("前缀 {\"a\":\"}\"} 后缀") === "{\"a\":\"}\"}");

const jsonReply = {
  choices: [{ message: { content: goodJson } }],
};
const okFetch = (async () => ({
  ok: true,
  status: 200,
  json: async () => jsonReply,
  text: async () => "",
})) as unknown as typeof fetch;

await checkAsync("增强接口：注入 fetch 可解析成功", async () => {
  const r = await enhance(
    { transcript: "I like basketball", kind: "topic" },
    { settings: { provider: "zhipu", apiKey: "k", enabled: true }, fetchImpl: okFetch },
  );
  return !!r && r.summary === "不错";
});

await checkAsync("增强接口：未配置时返回 null 且不抛错", async () => {
  const r = await enhance({ transcript: "x", kind: "topic" }, { settings: { provider: "zhipu", apiKey: "", enabled: true } });
  return r === null;
});

const boomFetch = (async () => {
  throw new Error("network down");
}) as unknown as typeof fetch;
await checkAsync("增强接口：网络异常降级为 null", async () => {
  const r = await enhance(
    { transcript: "x", kind: "topic" },
    { settings: { provider: "zhipu", apiKey: "k", enabled: true }, fetchImpl: boomFetch },
  );
  return r === null;
});

const errFetch = (async () => ({
  ok: false,
  status: 401,
  statusText: "Unauthorized",
  text: async () => "invalid key",
})) as unknown as typeof fetch;
await expectUnavailable("底层接口：401 抛 EngineUnavailable(L3)", async () =>
  requestAdvice({ transcript: "x", kind: "topic" }, { settings: { provider: "zhipu", apiKey: "k", enabled: true }, fetchImpl: errFetch }), "L3");
await checkAsync("增强接口：401 降级为 null", async () => {
  const r = await enhance({ transcript: "x", kind: "topic" }, { settings: { provider: "zhipu", apiKey: "k", enabled: true }, fetchImpl: errFetch });
  return r === null;
});

// 超时：fetch 永不返回，必须在 timeoutMs 后放弃（这是「LLM 不能影响主流程」的关键）
const hangFetch = ((_url: string, init?: RequestInit) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new Error("The operation was aborted")));
  })) as unknown as typeof fetch;
const t0 = Date.now();
const hangResult = await enhance(
  { transcript: "x", kind: "topic" },
  { settings: { provider: "ollama", enabled: true, timeoutMs: 120 }, fetchImpl: hangFetch },
);
const elapsed = Date.now() - t0;
check("超时后返回 null", hangResult === null, String(hangResult));
check("超时确实生效（未无限等待）", elapsed < 3000, elapsed + "ms");

/* ===== F. 编排与降级阶梯 ===== */
section("F. 编排 pipeline.ts");

// F1：所有层都不可用 —— 这是降级阶梯的底线，必须仍给出 L0 反馈
resetModelStates();
setModelState("asr", "idle");
setModelState("phoneme", "idle");
const bare = await analyze({
  audio: new Float32Array(0),
  sampleRate: 16000,
  kind: "topic",
  durationMs: 20000,
});
check("全降级时不抛错", !!bare);
check("全降级仍返回 L0 报告", !!bare.rules && typeof bare.rules.score === "number", String(bare.rules?.score));
check("全降级无转写文本", !bare.transcript);
check("全降级无音素报告", !bare.phonemes);
check("全降级无 AI 建议", !bare.advice);
check("降级说明非空", bare.warnings.length >= 2, JSON.stringify(bare.warnings));
check("降级说明含 L2 缺失提示", bare.warnings.some((w) => w.includes("手动输入")), JSON.stringify(bare.warnings));
check("降级说明含 LLM 缺失提示", bare.warnings.some((w) => w.includes("API key")), JSON.stringify(bare.warnings));

// F2：手动输入转写（ASR 不可用时的官方降级路径）
const manual = await analyze(
  { audio: new Float32Array(0), sampleRate: 16000, kind: "topic", durationMs: 30000 },
  { manualTranscript: "First I like basketball very much. Also I play with my friends every weekend." },
);
check("手动输入被采用为转写", manual.rules.checks.length.value >= 1, String(manual.rules.checks.length.value));
check("手动输入有对应说明", manual.warnings.some((w) => w.includes("手动输入的内容")));

// F3：朗读题没有音频 → 用原文兜底并明确标注
const reading = await analyze({
  audio: new Float32Array(0),
  sampleRate: 16000,
  kind: "reading",
  reference: "The weather is nice today.",
  durationMs: 3000,
});
check("朗读题缺音频时降级为原文", reading.rules.checks.length.value === 1, String(reading.rules.checks.length.value));
check("原文兜底有明确说明", reading.warnings.some((w) => w.includes("仅供结构参考")), JSON.stringify(reading.warnings));
check("朗读题缺音频时无音素报告", !reading.phonemes);

// F4：三层全部可用 —— 注入替身验证编排正确性（不下载任何模型）
// 注意：导出的 analyze(input, opts) 第二参是 AnalyzeOptions；
// 要替换某一层必须用 createEngine(overrides)，这样注入点才唯一。
const fullEngine = createEngine({
    capabilities: () => ({ webgpu: true, phoneme: true, asr: true, llm: true }),
    transcribe: async () => ({ text: "hello world", segments: [], durationMs: 2000, model: "stub" }),
    assessPhonemes: async () => ({
      reference: "hello world",
      words: [],
      accuracy: 0.9,
      confidence: 0.8,
      summary: { substitutions: 1, deletions: 0, insertions: 0, totalErrors: 1, correct: 5, expectedTotal: 6 },
      errors: [],
      g2p: "espeak",
      model: "stub",
      audioQuality: 0.7,
      durationMs: 2000,
    }),
    enhance: async () => ({ summary: "不错", grammar: [], fluency: [], examples: [], practice: [] }),
});
const full = await fullEngine.analyze(
  { audio: src48, sampleRate: 48000, kind: "reading", reference: "hello world", durationMs: 2000 },
);
check("全层可用时带出转写", full.transcript === "hello world", String(full.transcript));
check("全层可用时带出音素报告", !!full.phonemes && full.phonemes.accuracy === 0.9);
check("全层可用时带出 AI 建议", !!full.advice && full.advice.summary === "不错");
check("全层可用时没有降级警告", full.warnings.length === 0, JSON.stringify(full.warnings));

// F5：各层抛错时必须优雅降级，而不是让 analyze 失败
const brokenEngine = createEngine({
    capabilities: () => ({ webgpu: false, phoneme: true, asr: true, llm: true }),
    transcribe: async () => { throw new EngineUnavailable("没模型", "L2", "model_load_failed"); },
    assessPhonemes: async () => { throw new EngineUnavailable("没模型", "L1", "model_load_failed"); },
    enhance: async () => null,
});
const broken = await brokenEngine.analyze(
  { audio: src48, sampleRate: 48000, kind: "reading", reference: "hello world", durationMs: 2000 },
);
check("各层抛错时 analyze 仍返回", !!broken.rules);
check("ASR 抛错 → 提示手动输入", broken.warnings.some((w) => w.includes("手动输入")), JSON.stringify(broken.warnings));
check("音素抛错 → 提示跳过", broken.warnings.some((w) => w.includes("音素模型不可用")), JSON.stringify(broken.warnings));
check("LLM 返回 null → 提示无响应", broken.warnings.some((w) => w.includes("AI 服务无响应")), JSON.stringify(broken.warnings));
check("抛错时 L0 仍然有分", typeof broken.rules.score === "number");

// F6：Engine 门面
const eng = createEngine({
  capabilities: () => ({ webgpu: false, phoneme: false, asr: false, llm: false }),
});
check("Engine.capabilities 可用", eng.capabilities().llm === false);
check("getEngine 返回单例", getEngine() === getEngine());
resetEngine();

/* ===== 汇总 ===== */
resetModelStates();
resetPhonemeModel();
resetAsrModel();
resetPrefs();

console.log("\n=== 结果: " + pass + " passed, " + fail + " failed ===");
if (fail > 0) proc?.exit(1);



