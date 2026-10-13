import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/** 仅在有精细指针的设备上启用（触屏禁用，避免跟手错乱） */
function canHover() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * 卡片视差组件：鼠标悬停时卡片轻微倾斜（像手扶书页），离开回弹。
 * 用法：<TiltCard maxTilt={4}>...</TiltCard>
 */
export function TiltCard({
  children,
  maxTilt = 4,
  className,
}: {
  children: ReactNode
  maxTilt?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled] = useState(canHover)

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 18 })
  const sry = useSpring(ry, { stiffness: 220, damping: 18 })

  const onMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * maxTilt * 2) // 水平 → 绕 Y 轴
    rx.set(-py * maxTilt * 2) // 垂直 → 绕 X 轴
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

/**
 * 磁性磁贴：鼠标靠近时徽章被"吸"向光标，离开回弹。
 * 用于联系方式 / 社交入口，营造可点击的吸引感。
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 150,
  className,
}: {
  children: ReactNode
  strength?: number
  radius?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled] = useState(canHover)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 16, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 16, mass: 0.6 })

  const onMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist < radius) {
      const f = (1 - dist / radius) * strength
      x.set(dx * f)
      y.set(dy * f)
    } else {
      x.set(0)
      y.set(0)
    }
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
