"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  title: string
  description: string
  className?: string
}

export default function HeroSection({ title, description, className }: HeroSectionProps) {
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
      <div className="absolute inset-0 cyber-grid-bg opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1
          className={cn(
            "text-4xl md:text-6xl font-bold mb-4 text-white relative",
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
            <span className="relative bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent">
              {title}
            </span>
          </span>
        </h1>
        <p className="text-xl text-neon-blue/80 max-w-2xl mx-auto neon-text-blue">{description}</p>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-transparent to-neon-blue"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl"></div>
    </div>
  )
}
