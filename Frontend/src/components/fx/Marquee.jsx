import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function Marquee({
  children,
  speed = 30,
  direction = 'left',
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={`flex overflow-x-auto ${className}`}>{children}</div>
  }

  const directionFactor = direction === 'left' ? -1 : 1

  return (
    <div
      className={`relative flex overflow-hidden select-none ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
      }}
    >
      <motion.div
        className="flex shrink-0 items-center gap-8 py-3"
        animate={{ x: directionFactor === -1 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: speed
        }}
        style={{
          willChange: 'transform'
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

export default Marquee
