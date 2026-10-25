import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PROFILE } from '../config/profile'

/**
 * 首屏 About：标题 + 段落 + 滚动提示。
 * 段落改为「打字机」逐字显现 + 光标闪烁；滚动时视差上移 / 模糊 / 淡出。
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
          <Typewriter lines={PROFILE.about} bodyY={bodyY} />
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

/** 打字机：多段文本逐字打出，打字中的段落末尾显示闪烁光标 */
function Typewriter({ lines, bodyY }: { lines: string[]; bodyY: any }) {
  // 显示到第几段、该段显示到第几个字
  const [progress, setProgress] = useState<{ seg: number; ch: number }>({ seg: 0, ch: 0 })
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 入场动画后开始（约 1.1s，等 fadeDown 稳定）
    const boot = setTimeout(() => {
      let seg = 0
      let ch = 0
      const tick = () => {
        // 当前段打满 → 换下一段
        if (ch >= lines[seg].length) {
          if (seg >= lines.length - 1) {
            setDone(true)
            return
          }
          seg += 1
          ch = 0
        }
        setProgress({ seg, ch: ch + 1 })
        ch += 1
        timerRef.current = setTimeout(tick, 46)
      }
      timerRef.current = setTimeout(tick, 120)
    }, 1100)
    return () => {
      clearTimeout(boot)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {lines.map((line, i) => {
        const isActive = i === progress.seg
        const shown = isActive ? line.slice(0, progress.ch) : i < progress.seg ? line : ''
        // 光标停留在「正在打字」的段落；全部打完后停在最后一段末尾
        const caret = isActive || (done && i === lines.length - 1)
        return (
          <motion.p key={i} className="about-body" style={{ y: bodyY }}>
            {shown}
            {caret && <span className="about-caret" aria-hidden="true" />}
          </motion.p>
        )
      })}
    </>
  )
}
