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
  return (
    <li className="wk-line">
      <button className="wk-line-btn" onClick={() => onOpen(item)}>
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

/* ---------------- 作品区：竖滚 pin → 横移画廊 ---------------- */
export default function Works({ innerRef }: { innerRef: Ref<HTMLElement> }) {
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

          <div className="wk-progress" aria-hidden="true">
            <motion.div className="wk-progress-fill" style={{ scaleX: scrollYProgress }} />
          </div>
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
