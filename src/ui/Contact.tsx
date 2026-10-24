import { motion } from 'framer-motion'
import type { Ref } from 'react'
import { CONTACT, PROFILE } from '../config/profile'
import { Magnetic } from './Interactive'

const EASE = [0.22, 1, 0.36, 1]

/**
 * 页尾「联系我」板块
 * —— 位于作品集之后，是整站的最后一屏：
 *    左侧留给真实 3D 模型（无形象图 → 保持 3D），右侧是温润奶油卡。
 */
export default function Contact({ innerRef }: { innerRef?: Ref<HTMLElement> }) {
  const year = new Date().getFullYear()

  return (
    <section className="contact" ref={innerRef}>
      <motion.div
        className="contact-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.85, ease: EASE }}
      >
        <motion.span
          className="contact-kicker"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
        >
          {CONTACT.kicker}
        </motion.span>

        <motion.h2
          className="contact-title"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
        >
          {CONTACT.title}
        </motion.h2>

        <motion.p
          className="contact-role"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
        >
          {CONTACT.role}
        </motion.p>

        <motion.ul
          className="contact-lines"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
        >
          {CONTACT.lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </motion.ul>

        <motion.div
          className="contact-tags"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        >
          {CONTACT.tags.map((t, i) => (
            <Magnetic key={i} strength={0.4} className="tl-tag-mag">
              <span className="tl-tag">{t}</span>
            </Magnetic>
          ))}
        </motion.div>

        <motion.p
          className="contact-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {CONTACT.note}
        </motion.p>
      </motion.div>

      <footer className="contact-foot">
        © {year} {PROFILE.name} · {PROFILE.title}
      </footer>
    </section>
  )
}
