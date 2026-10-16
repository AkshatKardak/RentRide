import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function TextReveal({
  text = '',
  className = '',
  delay = 0,
  stagger = 0.04
}) {
  const shouldReduceMotion = useReducedMotion()
  const words = text ? text.split(' ') : []

  if (shouldReduceMotion || !text) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay
          }
        }
      }}
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.28em] align-top">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '100%', opacity: 0 },
              show: {
                y: '0%',
                opacity: 1,
                transition: {
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1]
                }
              }
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

export default TextReveal
