"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface CyberHeroProps {
  title: string
  description: string
  className?: string
}

export default function CyberHero({ title, description, className }: CyberHeroProps) {
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(
      () => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 200)
      },
      Math.random() * 5000 + 3000,
    )

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <div className={cn("relative py-16 px-4 overflow-hidden bg-cyber-dark border-b border-neon-blue/30", className)}>
      {/* Grid background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1
            className={cn(
              "text-5xl md:text-6xl font-bold mb-6 text-white",
              glitchActive ? "animate-glitch" : "animate-glow",
            )}
            data-text={title}
          >
            <span className="relative inline-block">
              {/* Glitch layers */}
              {glitchActive && (
                <>
                  <span className="absolute top-0 left-0.5 text-neon-pink opacity-70">{title}</span>
                  <span className="absolute top-0 -left-0.5 text-neon-blue opacity-70">{title}</span>
                </>
              )}
              {/* Main text with gradient */}
              <span className="relative bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent neon-text">
                {title}
              </span>
            </span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <p className="text-xl text-neon-blue/90 max-w-2xl mx-auto neon-text-blue">{description}</p>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-neon-pink/30 opacity-50 hidden md:block" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border border-neon-blue/30 opacity-50 hidden md:block" />
      </div>
    </div>
  )
}
