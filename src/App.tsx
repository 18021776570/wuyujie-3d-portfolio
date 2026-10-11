import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import Hero from './ui/Hero'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import NoiseOverlay from './ui/NoiseOverlay'
import { PROFILE } from './config/profile'

export default function App() {
  const { scrollY } = useScroll()
  const worksRef = useRef<HTMLElement>(null)

  // 作品区蒙层：作品区进入视口后压暗 3D 背景，保证画廊文字可读
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.45)']
  )
  // 离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // 首屏滚动提示淡出
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // 首屏装饰淡出
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      <LoadingScreen />

      {/* 固定 3D 背景 */}
      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.8, 9.5], fov: 42, near: 0.1, far: 500 }}
          gl={{ antialias: true, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0a0e16']} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层 */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg }}
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