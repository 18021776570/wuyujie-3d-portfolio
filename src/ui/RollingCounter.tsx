import { useEffect, useState } from 'react'

/**
 * 数字里程表：根据整个履历区的滚动位置连续滚动显示年份。
 * 用于履历标题旁的「翻页 / 里程表」视觉。
 */
export function RollingCounter({
  min,
  max,
  label,
  className,
}: {
  min: number
  max: number
  label: string
  className?: string
}) {
  const [value, setValue] = useState(max)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const section = document.querySelector<HTMLElement>('.resume')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const travel = Math.max(1, rect.height - window.innerHeight * 0.55)
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.35 - rect.top) / travel))
      setValue(Math.round(max - progress * (max - min)))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [min, max])

  return (
    <div className={`rolling-counter${className ? ' ' + className : ''}`} aria-hidden="true">
      <span className="rolling-counter-num">{value}</span>
      <span className="rolling-counter-label">{label}</span>
    </div>
  )
}
