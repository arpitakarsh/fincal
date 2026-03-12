"use client"
import { motion } from "framer-motion"

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}
const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}
const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}
const navGlowVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.5 } },
}
const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

export default function GlowMenu({ items, activeItem, onItemClick }) {
  return (
    <motion.nav
      className="p-2 rounded-2xl bg-white/80 backdrop-blur-lg border border-gray-200 shadow-md relative overflow-hidden"
      initial="initial"
      whileHover="hover"
    >
      <motion.div
        className="absolute -inset-2 rounded-3xl z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,76,135,0.08) 0%, transparent 70%)"
        }}
        variants={navGlowVariants}
      />
      <ul className="flex items-center gap-1 relative z-10 list-none m-0 p-0">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.label === activeItem
          return (
            <li key={item.label}>
              <button
                onClick={() => onItemClick?.(item.label)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <motion.div
                  style={{ perspective: "600px" }}
                  whileHover="hover"
                  initial="initial"
                  className="relative rounded-xl overflow-visible"
                >
                  <motion.div
                    className="absolute inset-0 z-0 pointer-events-none rounded-xl"
                    variants={glowVariants}
                    animate={isActive ? "hover" : "initial"}
                    style={{ background: item.gradient }}
                  />
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 relative z-10 rounded-xl"
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: "center bottom",
                      color: isActive ? '#224c87' : '#919090',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 14,
                    }}
                    variants={itemVariants}
                    transition={sharedTransition}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 rounded-xl"
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: "center top",
                      rotateX: 90,
                      color: item.iconColor || '#224c87',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                    variants={backVariants}
                    transition={sharedTransition}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </motion.div>
                </motion.div>
              </button>
            </li>
          )
        })}
      </ul>
    </motion.nav>
  )
}
