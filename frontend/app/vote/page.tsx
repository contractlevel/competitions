"use client"

import VotePost from "@/components/vote-post"
import CyberHero from "@/components/cyber-hero"

export default function VotePage() {
  return (
    <main className="min-h-screen">
      <CyberHero title="Vote for a Post" description="Cast your vote for a post in a competition" className="mb-8" />

      <div className="container mx-auto py-8 px-4">
        <VotePost />
      </div>
    </main>
  )
}
