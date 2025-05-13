"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  className?: string
}

export default function FeatureCard({ title, description, href, icon: Icon, className }: FeatureCardProps) {
  return (
    <Link href={href} className="block group">
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Card
          className={cn(
            "h-full transition-all duration-300 hover:shadow-lg cyber-card relative overflow-hidden",
            className,
          )}
        >
          {/* Glowing border effect */}
          <div className="absolute inset-0 border border-neon-blue/30 rounded-lg pointer-events-none"></div>

          {/* Animated corner accent */}
          <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-1 bg-neon-pink transform rotate-45 translate-y-1 group-hover:bg-neon-blue transition-colors duration-300"></div>
          </div>

          <CardHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-cyber-dark text-neon-pink group-hover:text-neon-blue transition-colors duration-300">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-neon-pink group-hover:text-neon-blue transition-colors duration-300">
                {title}
              </CardTitle>
            </div>
            <CardDescription className="text-gray-400">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{description}</p>
          </CardContent>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-neon-blue/30 group-hover:bg-neon-blue/60 transition-colors duration-300"></div>
        </Card>
      </motion.div>
    </Link>
  )
}
