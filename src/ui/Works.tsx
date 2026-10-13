import { useEffect, useRef, useState, type Ref } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { WORKS, type WorkItem, type WorkSection } from '../config/profile'

const EASE = [0.22, 1, 0.36, 1]

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
      <div className="wk-card-head">
        <span className="wk-card-no">{section.no}</span>
        <h3 className="wk-card-title">{section.title}</h3>
        <span className="wk-card-tagline">{section.tagline}</span>
      </div>
      <div className="wk-card-cover">
        <Cover cover={section.cover} alt={section.title} no={section.no} />
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

/* ---------------- 进度圆环：SVG 圆环 + 当前百分比 ---------------- */
function RingProgress({ progress }: { progress: any }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const unsub = progress.on('change', (v: number) => {
      setPct(Math.round(v * 100))
    })
    return unsub
  }, [progress])

  const R = 26
  const C = 2 * Math.PI * R
  const dashOffset = C - (pct / 100) * C

  return (
    <div className="wk-ring" aria-hidden="true">
      <svg viewBox="0 0 64 64" className="wk-ring-svg">
        <circle className="wk-ring-track" cx="32" cy="32" r={R} />
        <circle
          className="wk-ring-fill"
          cx="32"
          cy="32"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="wk-ring-pct">{pct}%</span>
    </div>
  )
}

/* ---------------- 作品区：竖滚 pin → 横移画廊 ---------------- */
export default function Works({
  innerRef,
  onProgressChange,
}: {
  innerRef: Ref<HTMLElement>
  onProgressChange?: (value: number) => void
}) {
  const [active, setActive] = useState<WorkItem | null>(null)

  const galleryRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start start', 'end end'],
  })

  const [scrollRange, setScrollRange] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setScrollRange(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [WORKS.length])

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  const hintOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])

  // 把横向画廊真实进度回传给 App，蒙层只跟随作品卡片覆盖进度
  useEffect(() => {
    if (!onProgressChange) return
    const unsubscribe = scrollYProgress.on('change', onProgressChange)
    return unsubscribe
  }, [onProgressChange, scrollYProgress])

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
      <div
        className="wk-gallery"
        ref={galleryRef}
        style={{ height: `calc(100vh + ${scrollRange}px)` }}
      >
        <div className="wk-gallery-sticky">
          <span className="wk-gallery-title">Works</span>

          <motion.div className="wk-track" ref={trackRef} style={{ x }}>
            {WORKS.map((s) => (
              <SectionCard key={s.id} section={s} onOpen={setActive} />
            ))}
          </motion.div>

          {/* 进度圆环 + 百分比 */}
          <RingProgress progress={scrollYProgress} />
          <motion.span className="wk-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            继续下滑
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <WorkDetail key={active.name} item={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
