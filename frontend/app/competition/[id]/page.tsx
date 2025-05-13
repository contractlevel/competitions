"use client"

import { useParams } from "next/navigation"
import CompetitionDetails from "@/components/competition-details"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CompetitionPage() {
  const params = useParams()
  const competitionId = params.id as string

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="flex items-center gap-2 cyber-button">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <CompetitionDetails competitionId={competitionId} />
    </main>
  )
}
