import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * 加载遮罩：页面进入时短暂显示品牌文字，然后淡出。
 * 相比原站（等模型加载完），本站在无模型时也保持观感节奏。
 */
export default function LoadingScreen() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    // 只保护首帧，不能遮住模型约 2 秒的入场动画
    const t = setTimeout(() => setDone(true), 260)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div
      className="loading"
      initial={{ opacity: 1 }}
      animate={done ? { opacity: 0 } : undefined}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ pointerEvents: done ? 'none' : 'auto' }}
      aria-hidden="true"
    >
      <span className="loading-text">Loading…</span>
    </motion.div>
  )
}
