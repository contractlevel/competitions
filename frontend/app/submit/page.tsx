"use client"

import SubmitPost from "@/components/submit-post"
import CyberHero from "@/components/cyber-hero"

export default function SubmitPage() {
  return (
    <main className="min-h-screen">
      <CyberHero title="Submit a Post" description="Submit your Lens post to a competition" className="mb-8" />

      <div className="container mx-auto py-8 px-4">
        <SubmitPost />
      </div>
    </main>
  )
}
