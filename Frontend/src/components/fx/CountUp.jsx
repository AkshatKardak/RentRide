import React, { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

export function CountUp({
  to = 0,
  from = 0,
  duration = 1.6,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const motionVal = useMotionValue(from)
  const spring = useSpring(motionVal, {
    duration: duration * 1000,
    bounce: 0
  })

  useEffect(() => {
    if (inView) {
      motionVal.set(to)
    }
  }, [inView, motionVal, to])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Number(latest).toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })}${suffix}`
      }
    })
    return () => unsubscribe()
  }, [spring, prefix, suffix, decimals])

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      {prefix}{from.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

export default CountUp
