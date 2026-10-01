/**
 * 近似声明文案 —— 代码与界面共用同一份，确保口径永远一致。
 *
 * 许可：AGPL-3.0-only
 *
 * 为什么单独抽出来：措辞散落在各处必然漂移，早晚有人说漏一句「你的得分是 X」。
 * 集中管理并由测试断言，是防止口径腐化的唯一可靠办法。
 *
 * 参见 spec/suzhou-listening-speaking.spec.md 第 0 节的措辞规范。
 */

/** 短标识：必须紧邻任何近似分出现 */
export const BADGE = '近似模拟';

/** 界面顶部横幅 */
export const BANNER = '近似模拟 · 本工具自研规则，非考场评分';

/** 分数标签：不得单独使用「得分」「成绩」 */
export const SCORE_LABEL = '近似分';

/** 分项标签 */
export const DIMENSION_LABELS = {
  completeness: '完整度（有没有读全）',
  accuracy: '准确度（有没有读错）',
  fluency: '流利度（语速是否合适）',
} as const;

/**
 * 已知局限 —— 必须在界面可见。
 * 这些不是套话，是具体的、本工具确实做不到的事。
 * 写在这里是为了防止「我们支持音素级发音评估」这类不实宣传。
 */
export const KNOWN_LIMITS: string[] = [
  '不评估音素级发音错误：把 th 读成 s 这类替换，本工具检测不到。',
  '不评估语调与韵律：教辅明确考察「突出语调」，本工具完全未做。',
  '转写会掩盖错读：语音转写引擎可能自动把读错的词纠正成正确拼写。',
  '不折算中考 30 分制：各题型官方分值未公布，权重为本项目假设值。',
  '语料正文为等效练习材料，非教材原文；其中 18 篇的材料位置为推定值。',
];

export interface DisclaimerBlock {
  badge: string;
  banner: string;
  scoreLabel: string;
  paragraphs: string[];
  limits: string[];
}

export function disclaimerBlock(): DisclaimerBlock {
  return {
    badge: BADGE,
    banner: BANNER,
    scoreLabel: SCORE_LABEL,
    paragraphs: [
      '本工具输出的是近似模拟结果，不是苏州市中考听力口语考试的评分。',
      '真实评分由讯飞承建的引擎完成，算法不对外，本项目无法复刻，也不试图等同。',
      '这里的分数只用于发现漏读了哪些词、哪些词可能读错、语速是否合适。',
    ],
    limits: KNOWN_LIMITS.slice(),
  };
}
