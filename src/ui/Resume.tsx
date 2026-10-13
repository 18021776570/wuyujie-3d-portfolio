import { motion } from 'framer-motion'
import { RESUME } from '../config/profile'
import type { MbtiProfile } from '../config/profile'
import { SOCIAL_ICONS, type SocialId } from './SocialIcons'
import { PROFILE } from '../config/profile'
import { TiltCard, Magnetic } from './Interactive'
import { RollingCounter } from './RollingCounter'

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

/** MBTI 测评结果：一行摘要 + 四维度紧凑色条（胜出端在前，一眼看出倾向） */
function MbtiBlock({ data }: { data: MbtiProfile }) {
  // 把 8 端按维度对两两分组（EI / SN / TF / JP）
  const pairs: MbtiProfile['dimensions'][] = []
  for (let i = 0; i < data.dimensions.length; i += 2) {
    pairs.push(data.dimensions.slice(i, i + 2))
  }

  return (
    <motion.div className="tl-mbti" variants={itemV}>
      <div className="tl-mbti-top">
        <span className="tl-mbti-code">{data.type}</span>
        <span className="tl-mbti-name">{data.name}</span>
        <span className="tl-mbti-meta">
          倾向强度 {data.score} · 人群占比 {data.proportion}
        </span>
      </div>
      <div className="tl-mbti-grid">
        {pairs.map((pair, i) => {
          const win = pair.find((d) => d.win) ?? pair[0]
          const lose = pair.find((d) => !d.win) ?? pair[1]
          return (
            <div className="tl-mbti-cell" key={i}>
              <div className="tl-mbti-letters">
                <b>{win.code}</b>
                <span className="tl-mbti-sep">/</span>
                <span className="tl-mbti-lose">{lose.code}</span>
              </div>
              <div className="tl-mbti-label">
                {win.label} {win.percent.toFixed(1)}%
              </div>
              <span className="tl-mbti-track">
                <i style={{ width: `${win.percent}%` }} />
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/** 履历时间轴条目。data-point 供 3D 场景定位相机停靠点 */
function Entry({ entry, index }: { entry: (typeof RESUME)[number]; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={index}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      <TiltCard maxTilt={4} className="tl-body-wrap">
        <div className="tl-body">
          <motion.div className="tl-period" variants={itemV}>
            {entry.period}
          </motion.div>
          <motion.div className="tl-head" variants={itemV}>
            {entry.logo && (
              <span className="tl-logo-chip">
                <img src={entry.logo} alt={entry.place} loading="lazy" />
              </span>
            )}
            <h3 className="tl-place">{entry.place}</h3>
          </motion.div>
          {entry.role && (
            <motion.div className="tl-role" variants={itemV}>
              {entry.role}
            </motion.div>
          )}
          {entry.mbti && <MbtiBlock data={entry.mbti} />}
          {entry.points && (
            <motion.ul className="tl-points" variants={itemV}>
              {entry.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </motion.ul>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <motion.div className="tl-tags" variants={itemV}>
              {entry.tags.map((t, i) =>
                entry.place === '联系我' ? (
                  <Magnetic key={i} strength={0.4} className="tl-tag-mag">
                    <span className="tl-tag">{t}</span>
                  </Magnetic>
                ) : (
                  <span key={i} className="tl-tag">
                    {t}
                  </span>
                ),
              )}
            </motion.div>
          )}
        </div>
      </TiltCard>
    </motion.div>
  )
}

/** 履历区：标题 + 时间轴。每条履历对应一个相机停靠点 */
export default function Resume() {
  return (
    <section className="resume">
      <div className="resume-head">
        <motion.h2
          className="resume-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          Résumé
        </motion.h2>
        {/* 年份里程表：滚动时从最近年份翻向最早年份 */}
        <RollingCounter min={2021} max={2027} label="yr" className="rolling-counter-side" />
      </div>
      <div className="timeline">
        {RESUME.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>

      {/* 社交入口 */}
      {PROFILE.social.length > 0 && (
        <div className="tl-logos">
          {PROFILE.social.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as SocialId]
            if (!Icon) return null
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
