import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PROFILE } from '../config/profile'

/**
 * 首屏 About：标题 + 段落 + 滚动提示。
 * 滚动时视差上移 / 模糊 / 淡出（与原站 Hero 效果一致）。
 */
export default function Hero({ cueOpacity }: { cueOpacity: any }) {
  const aboutRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])

  return (
    <section className="hero">
      <motion.div className="about" ref={aboutRef} style={{ filter: blur, opacity }}>
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {PROFILE.heroTitle}
          </motion.h1>
          {PROFILE.about.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
            </motion.p>
          ))}
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">向下滚动</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}
