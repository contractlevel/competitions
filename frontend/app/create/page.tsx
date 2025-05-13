"use client"

import CreateCompetition from "@/components/create-competition"
import CyberHero from "@/components/cyber-hero"

export default function CreatePage() {
  return (
    <main className="min-h-screen">
      <CyberHero
        title="Create a Competition"
        description="Set up a new content competition with a prize pool"
        className="mb-8"
      />

      <div className="container mx-auto py-8 px-4">
        <CreateCompetition />
      </div>
    </main>
  )
}
