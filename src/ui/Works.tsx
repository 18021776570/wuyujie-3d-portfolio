import { useEffect, useRef, useState, type Ref } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WORKS, type WorkItem, type WorkSection } from '../config/profile'

const EASE = [0.22, 1, 0.36, 1]
/** 触发翻页的拖动距离阈值：卡片宽度的 12%（不够就回弹） */
const swipeThreshold = (w: number) => Math.max(56, w * 0.12)

/* ---------------- 封面（支持图片 / 视频 / 渐变占位） ---------------- */
function Cover({
  cover,
  alt,
  no,
}: {
  cover?: WorkSection['cover']
  alt: string
  no: string
}) {
  const [err, setErr] = useState(false)
  if (cover && cover.type === 'video' && !err) {
    return (
      <video
        className="wk-cover-media"
        src={cover.src}
        autoPlay
        muted
        loop
        playsInline
        onError={() => setErr(true)}
      />
    )
  }
  if (cover && cover.type === 'image' && !err) {
    return <img className="wk-cover-media" src={cover.src} alt={alt} onError={() => setErr(true)} />
  }
  return (
    <div className="wk-card-cover-ph" aria-hidden="true">
      <span className="wk-card-cover-no">{no}</span>
    </div>
  )
}

/* ---------------- 作品清单一行 ---------------- */
function WorkLine({ item, onOpen }: { item: WorkItem; onOpen: (item: WorkItem) => void }) {
  const hasMeta = item.meta || (item.tags && item.tags.length)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const onClick = (e: React.MouseEvent) => {
    const el = btnRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      const id = Date.now()
      setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
      setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 700)
    }
    onOpen(item)
  }

  return (
    <li className="wk-line">
      <button className="wk-line-btn" ref={btnRef} onClick={onClick}>
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
          </span>
        )}
        {ripples.map((p) => (
          <span
            key={p.id}
            className="wk-ripple"
            style={{ left: p.x, top: p.y }}
            aria-hidden="true"
          />
        ))}
      </button>
    </li>
  )
}

/* ---------------- 板块卡 ---------------- */
function SectionCard({
  section,
  onOpen,
}: {
  section: WorkSection
  onOpen: (item: WorkItem) => void
}) {
  return (
    <div className="wk-card">
      <div className="wk-card-top">
        <div className="wk-card-head">
          <span className="wk-card-no">{section.no}</span>
          <h3 className="wk-card-title">{section.title}</h3>
          <span className="wk-card-tagline">{section.tagline}</span>
        </div>
        <div className="wk-card-cover">
          <Cover cover={section.cover} alt={section.title} no={section.no} />
        </div>
      </div>
      <div className="wk-card-body">
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} onOpen={onOpen} />
          ))}
        </ul>
        {(section.awards || section.footer) && (
          <div className="wk-foot">
            {section.awards && (
              <p className="wk-foot-line">
                <span className="wk-foot-label">奖项</span>
                <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
              </p>
            )}
            {section.footer && <p className="wk-foot-line">{section.footer}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- 全屏详情（支持视频播放） ---------------- */
function WorkDetail({
  item,
  onClose,
}: {
  item: WorkItem
  onClose: () => void
}) {
  const hasVideo = !!item.video
  return (
    <>
      <motion.div
        className="wk-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="wk-detail"
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 6 }}
        transition={{ duration: 0.42, ease: EASE }}
      >
        <button className="wk-detail-close" onClick={onClose} aria-label="返回">
          ✕
        </button>

        {hasVideo ? (
          <div className="wk-detail-video">
            <video
              src={item.video}
              poster={item.poster}
              controls
              playsInline
              preload="metadata"
            />
          </div>
        ) : (
          <div className="wk-detail-banner is-ph" aria-hidden="true">
            <span className="wk-detail-ph-text">{item.name}</span>
          </div>
        )}

        <article className="wk-detail-article">
          <header className="wk-detail-head">
            <h3 className="wk-detail-title">{item.name}</h3>
            {item.meta && <div className="wk-detail-sub">{item.meta}</div>}
            {item.tags && item.tags.length > 0 && (
              <div className="wk-detail-tags">
                {item.tags.map((t, i) => (
                  <span key={i} className="wk-badge">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </header>
          {item.desc && <p className="wk-detail-desc">{item.desc}</p>}
          {item.link && (
            <a className="wk-detail-link" href={item.link} target="_blank" rel="noopener noreferrer">
              访问作品 <span aria-hidden="true">↗</span>
            </a>
          )}
        </article>
      </motion.div>
    </>
  )
}

/* ---------------- 卡片式画廊：拖动 / 滑动切换 ---------------- */
export default function Works({ innerRef }: { innerRef?: Ref<HTMLElement> }) {
  const n = WORKS.length
  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)
  const [active, setActive] = useState<WorkItem | null>(null)

  const stageRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<null | (() => void)>(null)
  const movedRef = useRef(false)

  const go = (i: number) => {
    setTouched(true)
    setIndex(Math.max(0, Math.min(n - 1, i)))
  }

  /* ---- 指针拖动：鼠标拖拽 + 触屏左右滑都走这一套 ----
   * 不用 setPointerCapture：否则 click 会被舞台吞掉，卡内作品清单点不开。
   * 按下时立刻在 window 上挂 move / up（挂在 effect 里会晚一帧，丢掉手势起始）。 */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    const pid = e.pointerId
    let axis: '' | 'x' | 'y' = ''
    movedRef.current = false

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      const dx = ev.clientX - sx
      const dy = ev.clientY - sy
      // 先判定手势方向：横向 → 交给我们翻页；纵向 → 交还页面滚动
      if (!axis) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
      if (axis !== 'x') return
      movedRef.current = true
      setDragging(true)
      // 首尾越界时加阻尼，手感上"拉不动"
      const atEdge = (index === 0 && dx > 0) || (index === n - 1 && dx < 0)
      setDrag(atEdge ? dx * 0.32 : dx)
    }

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      const dx = ev.clientX - sx
      if (axis === 'x') {
        const th = swipeThreshold(stageRef.current?.clientWidth ?? 800)
        if (dx <= -th) go(index + 1)
        else if (dx >= th) go(index - 1)
        else setTouched(true)
      }
      detach()
      setDrag(0)
      setDragging(false)
    }

    const detach = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (cleanupRef.current === detach) cleanupRef.current = null
    }

    cleanupRef.current?.()
    cleanupRef.current = detach
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  // 卸载时兜底摘掉监听
  useEffect(() => () => cleanupRef.current?.(), [])

  // 拖动结束后紧跟的 click 不应打开作品详情
  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      movedRef.current = false
    }
  }

  // 键盘 ← → 翻页（仅在作品区进入视口时生效）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active) return
      const el = stageRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.bottom < 120 || r.top > window.innerHeight - 120) return
      if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, active])

  // 详情打开时锁滚动 + ESC 关闭
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active])

  return (
    <section className="works" ref={innerRef}>
      <span className="wk-gallery-title">Works</span>

      <div
        className={`wk-stage${dragging ? ' is-dragging' : ''}`}
        ref={stageRef}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {WORKS.map((s, i) => {
          const d = i - index
          const ad = Math.abs(d)
          if (ad > 2) return null
          return (
            <div
              key={s.id}
              className={`wk-slide${d === 0 ? ' is-active' : ''}`}
              style={{
                transform: `translateX(calc(${d} * (100% + var(--wk-gap)) + ${drag}px)) scale(${
                  1 - ad * 0.07
                })`,
                opacity: ad === 0 ? 1 : ad === 1 ? 0.6 : 0.28,
                zIndex: 10 - ad,
              }}
              onClick={() => d !== 0 && go(i)}
              aria-hidden={d !== 0}
            >
              <SectionCard section={s} onOpen={setActive} />
            </div>
          )
        })}

        {/* 左右翻页按钮 */}
        <button
          className="wk-nav wk-nav-prev"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="上一个作品"
        >
          ‹
        </button>
        <button
          className="wk-nav wk-nav-next"
          onClick={() => go(index + 1)}
          disabled={index === n - 1}
          aria-label="下一个作品"
        >
          ›
        </button>
      </div>

      {/* 分页指示 + 操作提示 */}
      <div className="wk-bar">
        <div className="wk-dots" role="tablist" aria-label="作品板块切换">
          {WORKS.map((s, i) => (
            <button
              key={s.id}
              className={`wk-dot${i === index ? ' is-on' : ''}`}
              onClick={() => go(i)}
              aria-label={s.title}
              aria-selected={i === index}
              role="tab"
            >
              <span className="wk-dot-no">{s.no}</span>
            </button>
          ))}
        </div>
        <motion.span
          className="wk-hint"
          initial={{ opacity: 1 }}
          animate={{ opacity: touched ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          {index === n - 1 ? '已经是最后一个啦 · 可向左滑回看' : '向左滑动 · 查看下一个作品'}
        </motion.span>
      </div>

      <AnimatePresence>
        {active && (
          <WorkDetail key={active.name} item={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
