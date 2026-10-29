/* ============================================================================
 * ★★★ 你的个人主页 · 唯一需要修改的配置文件 ★★★
 * ----------------------------------------------------------------------------
 * 以后你想改任何内容（名字 / 履历 / 作品 / 视频 / 3D 模型），
 * 都只要改这个文件，把文件放到 public/ 对应目录即可，不用碰任何代码。
 *
 *   public/models/  → 放 3D 模型（.glb）
 *   public/videos/  → 放视频（.mp4 / .webm）
 *   public/images/  → 放图片
 * ========================================================================== */

/* ------------------------------ 个人信息 ------------------------------ */
/** 社交媒体链接。id 目前支持: bilibili | douyin | xiaohongshu | github */
export interface SocialLink {
  id: 'bilibili' | 'douyin' | 'xiaohongshu' | 'github'
  label: string
  href: string
}

export const PROFILE = {
  /** 显示在首屏角落的名字（左上角元数据） */
  name: '武煜杰',

  /** 职业 / 头衔 */
  title: '数字媒体 · 创意技术',

  /** 所在城市 */
  basedIn: '中国 · 常州',

  /** 首屏底部的一句话签名 */
  motto: 'Army · Art · AI',

  /** 作品集年份角标，如 'Portfolio — 2026' */
  portfolioYear: 'Portfolio — 2026',

  /** 首屏 About 标题 */
  heroTitle: 'Hi, 我是武煜杰',

  /** 首屏 About 段落（一段一个 <p>，可多段） */
  about: [
    '军旅 2 年 · 数字媒体在校生',
    '爱技术，也爱创造。',
  ],

  /** 社交媒体（左下角 / 履历区显示） */
  social: [] as SocialLink[],
}

/* ------------------------------ MBTI 测评结果 ------------------------------ */
/** 一个维度的两端（如 E 外倾 / I 内倾），win 标记胜出端，percent 为胜出端占比 */
export interface MbtiDimension {
  /** 一端字母，如 'E' */
  code: string
  /** 该端中文名，如 '外倾' */
  label: string
  /** 是否为该维度胜出端 */
  win: boolean
  /** 胜出端百分比（0–100，一位小数） */
  percent: number
}

export interface MbtiProfile {
  /** 四字人格类型，如 'ISTP' */
  type: string
  /** 类型中文名，如 '鉴赏家' */
  name: string
  /** 倾向强度 0–100（高出端百分比均值） */
  score: number
  /** 人群占比，如 '5.4%' */
  proportion: string
  /** 四个维度对（按 EI / SN / TF / JP 顺序，每对两端齐全） */
  dimensions: MbtiDimension[]
}

/* ------------------------------ 履历时间轴 ------------------------------ */
/** 每一条 = 相机的一个停靠点。想加 / 减履历，直接增删数组元素即可 */
export interface ResumeEntry {
  /** 时间段，如 '2019 – 2023' */
  period: string
  /** 机构 / 公司 / 学校 */
  place: string
  /** 角色，如 '创始人'、'软件工程 · 本科' */
  role?: string
  /** 亮点 bullet 列表（可选） */
  points?: string[]
  /** 技能标签 chip（可选，Apple 风格） */
  tags?: string[]
  /** 机构 Logo 图片（可选，放 public/images/，如 '/images/company.png'） */
  logo?: string
  /**
   * 该身份阶段对应的「人物形象」图（可选，透明底 WebP/PNG，人物已抠出背景）。
   * 放 public/images/personas/，如 '/images/personas/persona-student.webp'。
   * 一旦填写：滚动到该履历条时，3D 模型淡出、整屏切换为这张 2D 形象图。
   * 留空 → 该条不切换形象（3D 模型保持显示，用于首屏/联系我等）。
   */
  image?: string
  /** MBTI 测评结果（可选，卡片内以紧凑色条展示；一般只放在「个人优势」这类总结性卡片上） */
  mbti?: MbtiProfile
}

/**
 * 履历顺序：按「简历倒序」——最近的经历在前。
 * 滚动到某一条时，会切换到对应的「人物形象」插画（见 image 字段）。
 */
export const RESUME: ResumeEntry[] = [
  {
    // ① 现在（在读）——大学生形象
    period: '2023 — 2027',
    place: '常州工学院',
    role: '数字媒体 · 本科（在读）',
    image: import.meta.env.BASE_URL + 'images/personas/persona-student.webp',
    tags: ['Ae', 'PS', 'PR', '达芬奇', '剪映', 'Ai', 'An', 'Blender', 'UE', 'Python', '英语四级', 'AI视频'],
  },
  {
    // ② 参军经历——军人形象
    period: '2021.9 — 2023.9',
    place: '火箭军',
    role: '参军 · 服役',
    image: import.meta.env.BASE_URL + 'images/personas/persona-soldier.webp',
    tags: ['军旅', '纪律', '坚韧'],
  },
  {
    // ③ 个人优势（配「毕业后」形象图 + MBTI 测评）
    period: '核心优势',
    place: '个人优势',
    role: 'MBTI ISTP · 鉴赏家',
    image: import.meta.env.BASE_URL + 'images/personas/persona-grad.webp',
    mbti: {
      type: 'ISTP',
      name: '鉴赏家',
      score: 66,
      proportion: '5.4%',
      dimensions: [
        { code: 'E', label: '外倾', win: false, percent: 36.4 },
        { code: 'I', label: '内倾', win: true, percent: 63.6 },
        { code: 'S', label: '实感', win: true, percent: 63.6 },
        { code: 'N', label: '直觉', win: false, percent: 36.4 },
        { code: 'T', label: '思维', win: true, percent: 72.7 },
        { code: 'F', label: '情感', win: false, percent: 27.3 },
        { code: 'J', label: '判断', win: false, percent: 36.4 },
        { code: 'P', label: '知觉', win: true, percent: 63.6 },
      ],
    },
    points: [
      '全链路数字媒体：剪辑 · 特效 · 三维 · AI',
      '火箭军服役两年：纪律 · 执行 · 抗压',
      '英语四级 + AI 视频敏感度：追得上前沿',
    ],
    tags: ['全栈数字媒体', '军旅历练', '执行力强', 'AI 视频'],
  },
]

/* ------------------------------ 联系我（网页最末尾） ------------------------------ */
/**
 * 「联系我」不再放在履历时间轴里，而是独立成页尾板块，
 * 位于作品集之后 —— 浏览完作品再留下联系方式，动线更顺。
 */
export const CONTACT = {
  /** 小标签 */
  kicker: 'Contact',
  /** 主标题 */
  title: '联系我',
  /** 副标题 */
  role: '欢迎合作',
  /** 联系方式（一行一条） */
  lines: ['📱 18021776570（微信同号）'],
  /** 标签 chip */
  tags: ['微信', '随时可聊'],
  /** 收尾的一句话 */
  note: '看到这里啦 —— 期待和你一起做点有意思的东西',
}

/* ------------------------------ 作品集 ------------------------------ */
export interface WorkItem {
  /** 作品名 */
  name: string
  /** 右侧小字（播放量 / 年份 / 一句话） */
  meta?: string
  /** 标签 */
  tags?: string[]
  /** 外链（“访问作品”按钮） */
  link?: string
  /** 详情视频：放 public/videos/，如 '/videos/demo.mp4'（可选） */
  video?: string
  /** 视频封面图：放 public/images/（可选，缺省用首帧） */
  poster?: string
  /** 详情页简介文字 */
  desc?: string
}

export interface WorkSection {
  /** 板块唯一 id（用于封面索引） */
  id: string
  /** 编号，如 '01' */
  no: string
  /** 板块标题，如 '视频作品' */
  title: string
  /** 右侧一句话 */
  tagline: string
  /**
   * 板块封面（横向画廊每张卡片的整高封面）。
   * 支持图片或视频：{ type: 'video', src: '/videos/cover.mp4' } 会静音循环自动播放
   * 不填 → 用大编号渐变占位
   */
  cover?: { type: 'image' | 'video'; src: string }
  /** 作品清单 */
  items: WorkItem[]
  /** 奖项 chip（可选） */
  awards?: string[]
  /** 底部技术备注一行（可选） */
  footer?: string
}

export const WORKS: WorkSection[] = [
  {
    id: 'video',
    no: '01',
    title: '视频作品',
    tagline: '三维动画 · AI 短片 · 剪辑包装',
    cover: { type: 'video', src: import.meta.env.BASE_URL + 'videos/personal-ip.mp4' },
    items: [
      {
        name: '个人 IP 3D 展示',
        meta: 'Blender · 三维',
        tags: ['个人IP', '建模', '渲染'],
        video: import.meta.env.BASE_URL + 'videos/personal-ip.mp4',
        desc: '个人专属 3D IP 形象：从建模、绑骨到渲染的完整展示，也是本站主视觉模型的「工作照」。',
      },
      {
        name: '第二个视频作品 — 动起来',
        meta: 'AI 生成 · 2026',
        tags: ['AI 生成', '运动', '短片'],
        video: import.meta.env.BASE_URL + 'videos/ai-sports.mp4',
        desc: '主题：鼓励年轻人动起来。用 AI 生成的短片，唤起「运动就在每一天」的热情。',
      },
      {
        name: '小球弹跳动画',
        meta: '三维动画 · 课程作业',
        tags: ['Blender', '动画', '质感'],
        video: import.meta.env.BASE_URL + 'videos/ball-bounce.mp4',
        desc: '小球弹跳力学练习：节奏、挤压拉伸与地面质感，三维动画入门的代表性小片。',
      },
      {
        name: '走路动画 · 表情',
        meta: 'Maya · 绑定动画',
        tags: ['Maya', '绑骨', '表情'],
        video: import.meta.env.BASE_URL + 'videos/walk-animation.mp4',
        desc: '角色走路循环 + 喜怒哀乐表情动画，体现骨骼绑定与表演能力的综合练习。',
      },
    ],
    footer: 'Blender · Maya · 剪映 · AI 视频',
  },
  {
    id: 'model',
    no: '02',
    title: '三维 · 传统文化数字作品',
    tagline: '中华传统文化数字化三维影像',
    cover: { type: 'image', src: import.meta.env.BASE_URL + 'images/works/book-fragrance.jpg' },
    items: [
      {
        name: '《一笔书香》',
        meta: '国风书房 · 60s 短片',
        tags: ['非遗', '文房四宝', '古风'],
        poster: import.meta.env.BASE_URL + 'images/works/book-fragrance.jpg',
        desc: '中式古典书房场景：青年书生与书童研墨执笔，聚焦笔墨纸砚四大国家级非遗文房器具，以数字化建模还原传统工艺细节。',
      },
      {
        name: '《非遗舞狮》',
        meta: '广东醒狮 · 45s 短片',
        tags: ['非遗', '醒狮', 'Maya'],
        poster: import.meta.env.BASE_URL + 'images/works/lion-dance.jpg',
        desc: '以广东醒狮为核心：Maya + 混元3D 结合，还原「睁眼、洗须、采青」经典动作，红金暖色调突出吉祥奋勇的国风气质。',
      },
      {
        name: '《玉液华光》',
        meta: '传统酒器 · 50s 短片',
        tags: ['酒器', '静物', '国风'],
        poster: import.meta.env.BASE_URL + 'images/works/wine-set.jpg',
        desc: '中式酒杯、酒壶与托盘的三维静物短片：瓷器与木质材质、暖色古风灯光，呈现东方审美中「温润、雅致、含蓄」的气质。',
      },
    ],
    footer: 'Maya · 混元3D · Arnold 渲染',
  },
  {
    id: 'project',
    no: '03',
    title: '项目 / 课程设计',
    tagline: '三维动画 · 项目制协作',
    items: [
      {
        name: '《龙门 · 石中之光》',
        meta: '三维动画课程结课项目',
        tags: ['龙门石窟', '粒子', '体积光'],
        desc: '以龙门石窟为对象的三维动画短片：粒子解构、体积光与水墨融合，让石刻在数字空间中获得动态生命。',
      },
    ],
    footer: '小组协作 · 分镜 · 渲染输出',
  },
]

/* ------------------------------ 3D 场景配置 ------------------------------ */
export const SCENE = {
  /**
   * 3D 人物模型：留空 '' → 使用内置的「几何占位小人」（纯代码生成，无需任何资源）。
   * 想换自己的模型：把 .glb 放到 public/models/ 下，然后填路径：
   *   glb: import.meta.env.BASE_URL + 'models/me.glb'
   * 注意：必须用 import.meta.env.BASE_URL 前缀，部署到 GitHub Pages 子目录才不会 404。
   * 模型建议为 T-pose / A-pose 的静态模型（不含相机动画），代码会用滚动驱动镜头环绕它。
   * 若模型带 EYE_Ctr_L / Eye_Ball_Left 等眼睛结构（见 CustomModel.tsx），会自动开启眼球跟随。
   */
  glb: import.meta.env.BASE_URL + 'models/me.glb',

  /** 模型目标高度（世界单位）。你的 IP 头部模型原始高度约 0.7，按 modelHeight/0.7 放大 */
  modelHeight: 1.96,

  /**
   * 模型整体下移量（世界单位，负值=往下）。
   * 调整它会同步移动所有镜头注视点（构图不漂），
   * 想露出更多/更少头顶就微调这里。
   */
  modelOffsetY: -1,

  /** 镜头到目标的水平距离范围 [近, 远]，滚动时会在这个区间推拉 */
  zoomRange: [6.5, 9.5] as [number, number],

  /**
   * 指定履历的脸部图标特写（entryIndex 从 0 开始，对应 RESUME 数组顺序）。
   * nodeLocal：glb 内图标节点的本地坐标（从模型解析，如右脸颊 Ae_Blank、左脸颊 DY_Blank），
   *            场景会自动换算成世界坐标（含模型缩放与 modelOffsetY），精确对准图标中心。
   * camOffset：相机相对图标的偏移向量（世界单位），与 lookAt 的距离决定放大倍率（越小越放大）。
   * modelTurnDeg：负=模型向左转，正=向右转。
   */
  /**
   * 脸部图标特写镜头（当前不使用：改为「滚动切换身份插画」方案后，
   * 履历段由 2D 形象图接管、3D 模型淡出）。保留空数组以兼容场景代码类型。
   */
  faceShots: [] as {
    entryIndex: number
    nodeLocal: [number, number, number]
    camOffset: [number, number, number]
    modelTurnDeg: number
  }[],

  /**
   * 这些履历索引使用「初始镜头」——与滚到页面顶部的构图完全一致
   * （正面中景、完整露出头发和上半身、模型正面对镜头）。
   * 「联系我」已移出履历时间轴（改为页尾独立板块，见 CONTACT），故这里留空。
   */
  resetShots: [] as number[],

  /** 是否启用 Bloom 辉光（氛围效果，低端设备可关） */
  bloom: true,
}
