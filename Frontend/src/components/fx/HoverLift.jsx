import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function HoverLift({
  children,
  lift = -4,
  scale = 1.015,
  className = '',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className} {...props}>{children}</div>
  }

  return (
    <motion.div
      whileHover={{ y: lift, scale }}
      whileTap={{ scale: 0.99 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default HoverLift
