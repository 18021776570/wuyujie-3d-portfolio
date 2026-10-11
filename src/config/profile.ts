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
    // ③ 个人优势（总结性卡片，无形象图 → 显示真实 3D 模型）
    period: '核心优势',
    place: '个人优势',
    role: 'MBTI ISTP · 鉴赏家',
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
  {
    // ④ 联系我（无形象图 → 回到真实 3D 模型「现在的你」）
    period: 'Contact',
    place: '联系我',
    role: '欢迎合作',
    points: ['📱 18021776570（微信同号）'],
    tags: ['微信', '随时可聊'],
  },
]

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
    tagline: '作品一句话介绍',
    cover: undefined, // 例如 { type: 'video', src: '/videos/cover.mp4' }
    items: [
      {
        name: '第一个视频作品',
        meta: '100 万 播放',
        tags: ['热门'],
        video: '/videos/demo.mp4', // ← 把视频放到 public/videos/ 后填这里
        desc: '在这里写作品简介，也可以放更多细节。',
      },
      {
        name: '第二个视频作品',
        meta: '2026',
        video: '/videos/demo2.mp4',
      },
    ],
    awards: ['示例奖项'],
    footer: '视频制作 · 剪辑 · 包装',
  },
  {
    id: 'model',
    no: '02',
    title: '3D 模型',
    tagline: 'Blender · 建模 · 渲染',
    cover: { type: 'image', src: '/images/model-cover.png' },
    items: [
      {
        name: '模型作品 A',
        meta: 'Blender',
        desc: '在这里放模型的介绍，配图可以放进 markdown 风格描述或直接写文字。',
      },
      { name: '模型作品 B', meta: 'C4D' },
    ],
    footer: '建模 · UV · 材质 · 渲染',
  },
  {
    id: 'project',
    no: '03',
    title: '项目 / 其他',
    tagline: '代码 · 交互 · 更多',
    items: [
      {
        name: '项目一',
        meta: '交互项目',
        link: 'https://example.com/',
        desc: '一个可以点出去的链接项目。',
      },
      { name: '项目二', meta: '2025' },
    ],
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
   * 「个人优势」与「联系我」都无形象图 → 显示真实 3D 模型，回到正面造型。
   */
  resetShots: [2, 3], // 个人优势、联系我

  /** 是否启用 Bloom 辉光（氛围效果，低端设备可关） */
  bloom: true,
}
