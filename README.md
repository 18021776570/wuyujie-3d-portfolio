# 我的 3D 个人主页（My 3D Portfolio）

一个**滚动式 3D 个人主页**：固定 3D 背景 + 可滚动内容（About → 履历 → 作品集）。
参考并重构自 [sen-3d-resume](https://github.com/dayinji/sen-3d-resume)（MIT 协议，代码可复用；素材/内容版权归原作者，需自行替换）。

**滚动就是运镜**：往下滚，相机从人物正面 → 绕到侧面 → 拉远俯视作品舞台。所有内容都在配置文件里，你只需要：
1. 改 `src/config/profile.ts` —— 你的名字、履历、作品
2. 往 `public/videos/` `public/images/` `public/models/` 里丢文件
3. 完事。

---

## 一、原站拆解（你让我分析的东西）

参考站 `sen-3d-resume` 的核心架构是**三层叠放 + 一个滚动时间轴**：

```
┌────────────────────────────────────────────┐
│ ① 固定 3D 背景层 (Canvas, position: fixed)  │  ← 人物模型 + 相机动画
├────────────────────────────────────────────┤
│ ② 蒙层组 (scrim 渐暗 / stage-fog / 磨砂轨)   │  ← 保证文字可读 + 氛围
├────────────────────────────────────────────┤
│ ③ 可滚动 HTML 内容层 (About → 履历 → 作品)  │  ← 唯一的滚动源
└────────────────────────────────────────────┘
        滚动位置 ──▶ 时间轴帧 ──▶ 相机动画
```

| 关键设计 | 做法 |
| --- | --- |
| **滚动驱动运镜** | 滚动进度换算成「时间轴帧号」，用 `AnimationMixer` 擦除 glb 里烘焙好的相机动画（每 50 帧停一个锚点） |
| **履历即镜头停靠点** | 每条履历对应 glb 里一个 `focus-*` 空对象，滚动到哪条，镜头就推到哪 |
| **内容与表现分离** | 文案 / 履历 / 作品全部数据化：改数据不改代码 |
| **氛围三件套** | 自动对焦景深（DoF 跟随锚点）+ Bloom 辉光 + 胶片噪点（独立 Canvas shader） |
| **眼球跟随** | glb 里命名含 `eye` 的网格，按鼠标位置旋转双眼（斗鸡眼内转） |
| **作品集** | 竖滚 pin 一屏，内部 track 横向滑过所有板块卡；点击作品弹全屏详情（markdown） |

> 原站的关键依赖：**glb 必须自带相机动画 + focus 锚点**（需 Blender 或 intro3d 处理）。
> 本项目把这一步**代码化**了——镜头路径由代码生成，你拿到任何静态模型都能直接用。

技术栈对照：

| | 原站 | 本项目 |
| --- | --- | --- |
| 框架 | React 18 + TypeScript + Vite 5 | ✅ 相同 |
| 3D | React Three Fiber + drei + three r169 | ✅ 相同 |
| 动画 | framer-motion（滚动驱动） | ✅ 相同 |
| 运镜 | glb 烘焙相机动画 | **代码路径插值（无需烘焙）** |
| 模型 | 必须含 focus 锚点 + 动画 | 任意静态 glb / 内置占位小人 |
| 详情 | markdown 文件 | 结构化字段（更简单直接） |

---

## 二、项目结构

```
my-3d-portfolio/
├── index.html
├── public/                      ← ★ 放资源的地方
│   ├── models/                  ←   .glb 3D 模型
│   ├── videos/                  ←   .mp4 / .webm 视频
│   ├── images/                  ←   图片（logo、封面、海报）
│   └── works/covers/            ←   （可选）板块封面
└── src/
    ├── config/profile.ts        ← ★★★ 唯一需要改的配置文件（全部内容）
    ├── App.tsx                  ← 布局：3D 背景 + 蒙层 + 内容层
    ├── styles.css               ← 全站样式（暗色电影感）
    ├── scene/
    │   ├── Scene.tsx            ← 滚动运镜核心（代码镜头路径 + 灯光 + 后处理）
    │   ├── Placeholder.tsx      ← 内置占位小人（没模型也能跑）
    │   └── CustomModel.tsx      ← 加载你的 glb（可选）
    └── ui/
        ├── Hero.tsx             ← 首屏 About
        ├── Resume.tsx           ← 履历时间轴（每条 = 一个镜头停靠点）
        ├── Works.tsx            ← 作品画廊（支持视频封面/视频详情）
        ├── LoadingScreen.tsx    ← 入场遮罩
        └── NoiseOverlay.tsx     ← 胶片噪点
```

---

## 三、怎么放你的内容（三步）

### ① 放「个人信息」

编辑 `src/config/profile.ts` 顶部：

```ts
export const PROFILE = {
  name: '你的名字',          // 首屏左上角
  title: 'Creative Technologist',  // 职业
  basedIn: '所在城市',       // 右下角
  motto: 'Code · Art · Play',      // 左下角签名
  about: ['一段自我介绍', '第二段'],  // 首屏 About
  social: [ // 社交媒体，支持 bilibili / douyin / xiaohongshu / github
    { id: 'github', label: 'GitHub', href: 'https://github.com/你的名字' },
  ],
}
```

### ② 放「视频」

把视频丢进 `public/videos/`，然后在 `WORKS` 里引用：

```ts
export const WORKS: WorkSection[] = [
  {
    id: 'video',
    no: '01',
    title: '视频作品',
    tagline: '作品一句话介绍',
    cover: { type: 'video', src: '/videos/cover.mp4' }, // ← 板块封面直接是视频（自动循环播放）
    items: [
      {
        name: '第一个视频作品',
        meta: '100 万 播放',
        tags: ['热门'],
        video: '/videos/demo.mp4',   // ← 详情页点开可播放
        desc: '作品简介文字',
      },
    ],
  },
]
```

- 板块封面：`cover.type` 可以是 `'video'`（循环播放）或 `'image'`（图片），不填则显示大编号渐变占位
- 作品详情：有 `video` 字段就渲染播放器（controls 控制条），可配 `poster` 封面图

### ③ 放「3D 模型」

- **没有模型**：什么都不用做，内置「几何占位小人」直接显示，镜头照样运镜。
- **有 glb 模型**（推荐静态 T-pose/A-pose，无需动画）：

```ts
export const SCENE = {
  glb: '/models/me.glb',   // ← 丢进 public/models/ 后填这里
  modelHeight: 2.9,        // 模型目标高度（世界单位），大了改小、小了改大
  bloom: true,             // 辉光开关
}
```

> 提示：模型不需要像原站那样烘焙相机动画和 focus 锚点——镜头路径是纯代码的，模型放在原点（地面 y≈-1.15）即可。若模型不在这个位置，调 `CustomModel.tsx` 里的 `scale`/`position`。

**已接入你的 IP 模型（个人IP_武煜杰_带动画.glb）**：
- 已复制为 `public/models/me.glb` 并配置好 `SCENE.glb`
- 自动识别了两只眼球（`Eye_Ball_Left/Right` + `EYE_Ctr_L/R` 轴心），已开启**眼球跟随鼠标**（原站同款交互，触屏/窄屏自动关闭）
- 注意：该 glb 内部未包含动画数据（"带动画"文件名来自 Blender 约束动画，导出后丢失），网页端目前由程序化动画补足（呼吸悬浮 + 极慢自转）；若想让模型做更复杂的动作（挥手/眨眼），需要在 Blender 里**烘焙骨骼或形态键动画**后重新导出
- 模型 80MB（含 10 张纹理），本地开发无碍；上线前建议用 gltf-transform 压缩（`npx gltf-transform optimize in.glb out.glb` 可压掉 60%+ 体积）

---

## 四、履历与镜头

每条履历 = 一个镜头停靠点，增删履历只改 `RESUME` 数组：

```ts
export const RESUME: ResumeEntry[] = [
  { period: '2019 – 2023', place: '示例大学', role: '数字媒体 · 本科', points: ['…'] },
  { period: '2023 – 2025', place: '示例公司', role: '创意开发', points: ['…'] },
  { period: '2025 – 至今', place: '独立创作', role: '内容创作者', points: ['…'] },
]
```

镜头会自动围绕模型从左侧弧线扫到右侧，每条履历停一下，最后拉远进作品区。想改镜头远近/高度，调 `src/scene/Scene.tsx` 里的 `shots`。

---

## 五、本地运行 & 部署

```bash
npm install
npm run dev       # 开发 http://localhost:5173
npm run build     # 类型检查 + 打包 → dist/
npm run preview   # 预览构建产物
```

部署：`dist/` 是纯静态文件（相对路径），可扔到 GitHub Pages、Cloudflare Pages、Vercel 或任意静态托管。

---

## 六、常见问题

- **视频不播？** 确认路径以 `/videos/...` 开头、文件在 `public/videos/` 下；浏览器对自动播放要求静音（板块封面已 mute，详情页是用户主动点开的，正常播放）。
- **模型太大 / 太小？** 调 `SCENE.modelHeight`。
- **想换背景色 / 强调色？** 改 `src/styles.css` 顶部的 CSS 变量，和 `Scene.tsx` 里 `GradientBackground` 的 `uTop/uBottom`。
- **想加英文版？** 原站做法是 `COPY`/`RESUME`/`WORKS` 双份数据 + 语言切换按钮，本站在结构上预留了位置，需要的话照着加。
- **模型版权**：原站 `me.glb` 是作者本人，**不在 MIT 范围内**，请用你自己的模型。

---
*代码：MIT · 内容（名字/模型/作品）属于你自己*
