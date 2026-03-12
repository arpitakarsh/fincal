"use client"

import { useEffect, useRef } from "react"

export default function AnimatedShinyText({ children, className = "", style = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const sheet = document.createElement("style")
    sheet.textContent = `
      @keyframes shiny-text-sweep {
        0%, 90%, 100% {
          background-position: calc(-100% - 200px);
        }
        60% {
          background-position: calc(100% + 200px);
        }
      }
    `
    document.head.appendChild(sheet)
    return () => sheet.remove()
  }, [])

  return (
    <span
      ref={ref}
      className={className}
      style={{
        backgroundImage:
          "linear-gradient(120deg, #224c87 40%, #93c5fd 50%, #224c87 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shiny-text-sweep 3.5s infinite linear",
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </span>
  )
}
