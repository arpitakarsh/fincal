"use client"
import { useEffect, useRef, useState } from "react"

export default function NumberCounter({ 
  value, 
  startValue = 0, 
  duration = 1000,
  prefix = "",
  suffix = "",
  style = {}
}) {
  const [display, setDisplay] = useState(startValue)
  const frameRef = useRef(null)
  const prevValueRef = useRef(startValue)

  useEffect(() => {
    const from = prevValueRef.current
    const to = value
    const startTime = performance.now()

    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4)
    }

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)
      const current = Math.round(from + (to - from) * eased)
      setDisplay(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        prevValueRef.current = to
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  const formatted = display.toLocaleString('en-IN')

  return (
    <span style={style}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
