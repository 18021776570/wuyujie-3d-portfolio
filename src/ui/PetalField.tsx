import { useEffect, useRef } from 'react'

/**
 * 秋日花瓣 / 光尘粒子层
 * - 轻量单 canvas，约 26 个粒子（暖金 / 赤陶 / 鼠尾草绿）
 * - 缓慢飘落 + 左右摇摆；鼠标移动时产生柔和视差（粒子向鼠标反方向漂移）
 * - 无鼠标（触屏）时视差归零，粒子正常飘落
 */
type P = {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  sway: number
  swaySpeed: number
  hue: string
  alpha: number
  spin: number
  spinSpeed: number
}

export default function PetalField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const COLORS = [
      '230,168,62', // 蜂蜜金
      '180,97,78', // 赤陶
      '126,138,84', // 鼠尾草绿
      '199,145,62', // 暖金
    ]

    const parts: P[] = []
    const COUNT = 40

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const init = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * DPR
      canvas.height = h * DPR
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      parts.length = 0
      for (let i = 0; i < COUNT; i++) {
        parts.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(1.5, 4.2),
          vy: rand(0.18, 0.5),
          vx: rand(-0.08, 0.08),
          sway: rand(0, Math.PI * 2),
          swaySpeed: rand(0.008, 0.02),
          hue: COLORS[i % COLORS.length],
          alpha: rand(0.16, 0.44),
          spin: rand(0, Math.PI * 2),
          spinSpeed: rand(-0.03, 0.03),
        })
      }
    }

    // 鼠标相对画面中心 -1..1
    const mouse = { x: 0, y: 0 }
    let hasMouse = false
    const onMove = (e: MouseEvent) => {
      hasMouse = true
      mouse.x = (e.clientX / w - 0.5) * 2
      mouse.y = (e.clientY / h - 0.5) * 2
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        p.sway += p.swaySpeed
        p.spin += p.spinSpeed
        p.y += p.vy
        p.x += p.vx + Math.sin(p.sway) * 0.35
        // 视差：粒子越靠下，受鼠标影响越大（近景感）
        const depth = 0.5 + (p.y / h) * 0.5
        const px = hasMouse ? mouse.x * 14 * depth : 0
        const py = hasMouse ? mouse.y * 10 * depth : 0
        const cx = p.x + px
        const cy = p.y + py

        // 卷到顶
        if (p.y > h + 12) {
          p.y = -12
          p.x = rand(0, w)
        }

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(p.spin)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = `rgb(${p.hue})`
        // 花瓣形：椭圆
        ctx.beginPath()
        ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    init()
    draw()
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', init)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', init)
    }
  }, [])

  return <canvas className="petal-field" ref={ref} aria-hidden="true" />
}
