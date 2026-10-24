import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import Hero from './ui/Hero'
import Resume from './ui/Resume'
import Works from './ui/Works'
import Contact from './ui/Contact'
import LoadingScreen from './ui/LoadingScreen'
import NoiseOverlay from './ui/NoiseOverlay'
import { SceneErrorBoundary, SceneFallback, detectWebGL } from './ui/SceneFallback'
import { PROFILE, RESUME } from './config/profile'

export default function App() {
  const { scrollY } = useScroll()
  const worksRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)
  // 进入页尾「联系我」时，收掉作品区的暖白蒙层，保证 3D 模型与卡片干净呈现
  const contactInView = useInView(contactRef, { margin: '-20% 0px -20% 0px' })
  // 作品区进入视口时压一层很淡的暖光，保证卡片文字清晰（页尾不加）
  const worksInView = useInView(worksRef, { margin: '-25% 0px -25% 0px' })
  // 浏览器是否支持 WebGL：不支持时跳过 3D，直接用静态形象图兜底
  const [webglOk] = useState(() => (typeof window === 'undefined' ? true : detectWebGL()))

  // 当前激活的履历条目（用于「滚动切换身份形象图」）
  const activePersona = useActivePersona()
  // 命中带形象图的履历 → 3D 模型淡出，改由 2D 形象图整屏呈现；
  // 首屏 / 「联系我」(无图) → 保留真实 3D 模型。
  const show3D = !(activePersona !== null && !!RESUME[activePersona]?.image)

  // 离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // 首屏滚动提示淡出
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // 首屏装饰淡出
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])
  const fogOpacity = contactInView ? 0 : worksInView ? 0.3 : 0


  return (
    <>
      <LoadingScreen />

      {/* 固定 3D 背景（命中身份形象图时淡出） */}
      <div className="scene-bg" style={{ opacity: show3D ? 1 : 0 }}>
        {webglOk ? (
          <SceneErrorBoundary fallback={<SceneFallback />}>
            <Canvas
              shadows={{ type: THREE.PCFShadowMap }}
              dpr={[1, 1.5]}
              camera={{ position: [0, 1.8, 9.5], fov: 42, near: 0.1, far: 500 }}
              gl={{ antialias: true, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
            >
              <color attach="background" args={['#f4e7cd']} />
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </SceneErrorBoundary>
        ) : (
          <SceneFallback />
        )}
      </div>

      {/* 身份形象图层：滚动到对应履历段时整屏淡入（3D 同步淡出）。
          每条带 image 的履历各占一层，交叉淡入淡出。 */}
      {RESUME.map((e, i) =>
        e.image ? (
          <div
            key={i}
            className={`persona-layer${activePersona === i ? ' is-on' : ''}`}
            aria-hidden="true"
          >
            <img src={e.image} alt={e.place} loading="eager" />
            <span className="persona-caption">{e.place}</span>
          </div>
        ) : null,
      )}

      {/* 暖阳柔光层：顶部柔和日光，营造「午后阳光」氛围 */}
      <div className="sun-glow" aria-hidden="true" />

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层 */}
      <motion.div
        className="stage-fog"
        style={{
          opacity: fogOpacity,
          background: 'rgba(244, 234, 214, 0.92)',
        }}
        aria-hidden="true"
      />

      {/* 固定磨砂右轨（进入履历区后淡入） */}
      <GlassRail />

      {/* 首屏装饰：发丝内框 + 四角定位标 + 角标元数据 */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">{PROFILE.name}</span>
          <span>{PROFILE.title}</span>
        </div>
        <div className="hero-meta hm-tr">{PROFILE.portfolioYear}</div>
        <div className="hero-meta hm-bl">{PROFILE.motto}</div>
        <div className="hero-meta hm-right">Based in {PROFILE.basedIn}</div>
      </motion.div>

      {/* 全屏胶片噪点 */}
      <NoiseOverlay />

      {/* 可滚动内容 */}
      <main className="content">
        <Hero cueOpacity={cueOpacity} />
        <Resume />
        <Works innerRef={worksRef} />
        {/* 页尾：看完作品再留联系方式 */}
        <Contact innerRef={contactRef} />
      </main>
    </>
  )
}

/** 磨砂右轨：position fixed 的竖条，进入履历区后淡入（复刻原站视觉） */
function GlassRail() {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  return <motion.div className="glass-rail" style={{ opacity }} aria-hidden="true" />
}

/**
 * 判断当前「激活」的履历条目（用于切换身份形象图）。
 * 规则：视口中心落在 .resume 区域内时，取与中心最近的 .tl-entry；
 *       在首屏或作品区（.resume 之外）时返回 null → 显示 3D 模型。
 */
function useActivePersona() {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    let raf = 0

    const compute = () => {
      const section = document.querySelector<HTMLElement>('.resume')
      const entries = Array.from(document.querySelectorAll<HTMLElement>('.tl-entry'))
      if (!section || entries.length === 0) {
        setActive(null)
        return
      }
      const center = window.scrollY + window.innerHeight * 0.45
      const sr = section.getBoundingClientRect()
      const sTop = sr.top + window.scrollY
      const sBot = sTop + sr.height
      // 在履历区之外（首屏 / 作品区）→ 显示 3D
      if (center < sTop || center > sBot) {
        setActive(null)
        return
      }
      // 取与视口中心最近的一条，避免条目间隙出现 3D 闪回
      let best = 0
      let bestD = Infinity
      for (let i = 0; i < entries.length; i++) {
        const r = entries[i].getBoundingClientRect()
        const t = r.top + window.scrollY
        const b = t + r.height
        const d = center < t ? t - center : center > b ? center - b : 0
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      setActive(best)
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return active
}