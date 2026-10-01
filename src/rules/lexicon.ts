/**
 * 词表与词典 —— 连接词、填充词、课标五级核心词、话题要点库
 *
 * 许可：AGPL-3.0-only
 *
 * 数据来源：《义务教育英语课程标准（2011年版）》附录 5 话题项目表、
 * 译林版初中教材常用词汇、《江苏省初中英语听力口语自动化考试要求》公开范围。
 * 生产环境应把完整词表拆到 data/ 下独立加载。
 *
 * 注：内置词表为高频子集，用于演示与自测；接入生产前请替换为完整版。
 */
export const CONNECTORS = {
  enumeration: ['first','firstly','second','secondly','third','thirdly','next','then','finally','lastly','also','besides','moreover','furthermore'],
  contrast: ['but','however','although','though','while','whereas','instead'],
  cause: ['because','since','as','so','therefore','thus'],
  addition: ['and','also','in addition','additionally','what is more'],
} as const;

export const ALL_CONNECTORS: string[] = Object.values(CONNECTORS).flat();

export const CONNECTOR_PHRASES = ['in addition','what is more','as well as','because of'];

export const FILLERS = [
  'um','uh','er','ah','eh','hmm','mhm','erm','umm','uhh','huh',
  '那个','这个','就是说','就是','然后',
];
const V = [
'i','me','my','mine','we','us','our','you','your','he','him','his','she','her','it','its','they','them','their',
'this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','do','does','did',
'will','would','shall','should','can','could','may','might','must','need','what','which','who','when','where','why','how',
'all','any','both','each','few','more','most','other','some','such','no','not','only','own','same','so','than','too','very',
'one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','twenty','thirty','hundred',
'today','yesterday','tomorrow','morning','afternoon','evening','night','week','month','year','hour','minute',
'home','house','room','school','class','classroom','teacher','student','study','learn','read','write','speak','listen','talk',
'friend','family','father','mother','brother','sister','parent','son','daughter','doctor','nurse','worker',
'good','bad','big','small','long','short','high','low','old','young','new','hot','cold','easy','difficult','hard','simple','important',
'day','time','life','work','play','game','sport','football','basketball','run','swim','draw','sing','dance','music',
'film','movie','story','book','picture','photo','animal','dog','cat','bird','fish','tree','flower','sun','moon','rain',
'food','rice','noodle','bread','milk','egg','meat','vegetable','apple','fruit','water','tea','cake',
'because','if','but','and','or','before','after','first','next','last','however','therefore','also','help','happy','healthy',
'fun','train','exercise','team','weekend','problem','stress','pressure','communicate','solve','grow','subject','homework','club',
'activity','grandparent','support','together','english','grammar','word','practice','interesting','useful','improve','author',
'adventure','character','recommend','page','environment','protect','pollution','rubbish','recycle','save','energy','waste','nature',
'action','dream','become','future','hope','job','achieve','goal','believe','try','advice','dangerous','safe','public',
];

export const CORE_VOCABULARY = new Set<string>(V);
export interface TopicProfile {
  /** 话题名（考试时屏幕上显示的内容） */
  name: string;
  /** 中文提示, 仅供教师/家长参考, 考试不显示 */
  hint?: string;
  /** 关键内容词, 命中视为要点覆盖 */
  keywords: string[];
  /** 加分短语 */
  bonusPhrases?: string[];
}

export const PII_PATTERNS: RegExp[] = [
  /\b1[3-9]\d{9}\b/,
  /\b[\w.+-]+@[\w-]+\.[\w.]+\b/,
  /\b\d+\s*(?:road|street|avenue)\b/i,
  /\d+\s*(?:号|室|栋|单元|路|街)\b/,
];

export const TOPICS: TopicProfile[] = [
  {
    name: "my favourite sport",
    hint: "我最喜欢的运动",
    keywords: ["sport","play","like","love","team","exercise","healthy","weekend","school","good","fun","train"],
    bonusPhrases: ["play with my friends","after school","every weekend","keep fit"],
  },
  {
    name: "teenage problems",
    hint: "青春期问题",
    keywords: ["problem","study","stress","pressure","friend","family","parent","communicate","help","solve","grow","important"],
    bonusPhrases: ["talk with","make a plan","ask for help"],
  },
  {
    name: "my school life",
    hint: "我的校园生活",
    keywords: ["school","class","study","teacher","friend","subject","homework","club","activity","learn","happy","busy"],
    bonusPhrases: ["take part in","after class","learn a lot"],
  },
  {
    name: "my family",
    hint: "我的家庭",
    keywords: ["family","father","mother","parent","brother","sister","grandparent","love","together","home","happy","support"],
    bonusPhrases: ["spend time with","look after","my parents"],
  },
  {
    name: "learning english",
    hint: "学习英语",
    keywords: ["english","learn","study","word","grammar","listen","speak","read","practice","interesting","useful","improve"],
    bonusPhrases: ["every day","watch english videos","speak more"],
  },
  {
    name: "my favourite book",
    hint: "我最喜欢的书",
    keywords: ["book","read","story","author","interesting","learn","life","adventure","character","recommend","love","page"],
    bonusPhrases: ["teach me","read it twice","a lot of"],
  },
  {
    name: "environmental protection",
    hint: "环境保护",
    keywords: ["environment","protect","pollution","rubbish","recycle","save","energy","waste","nature","important","together","action"],
    bonusPhrases: ["throw away","plant trees","pick up"],
  },
  {
    name: "my dream",
    hint: "我的梦想",
    keywords: ["dream","want","become","future","hope","job","study","hard","achieve","goal","believe","try"],
    bonusPhrases: ["in the future","work hard","make my dream come true"],
  },
];
