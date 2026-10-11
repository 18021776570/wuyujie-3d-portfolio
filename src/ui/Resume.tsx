import { motion } from 'framer-motion'
import { RESUME } from '../config/profile'
import { SOCIAL_ICONS, type SocialId } from './SocialIcons'
import { PROFILE } from '../config/profile'

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
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
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.tags && entry.tags.length > 0 && (
          <motion.div className="tl-tags" variants={itemV}>
            {entry.tags.map((t, i) => (
              <span key={i} className="tl-tag">
                {t}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/** 履历区：标题 + 时间轴。每条履历对应一个相机停靠点 */
export default function Resume() {
  return (
    <section className="resume">
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        Résumé
      </motion.h2>
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
