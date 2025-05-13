"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  connectWallet,
  fetchCompetition,
  checkIfPostSubmitted,
  getMockCompetitionDeadlines,
} from "@/lib/contract-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Send } from "lucide-react"

export default function SubmitPost() {
  const [competitionId, setCompetitionId] = useState("")
  const [postId, setPostId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loadingCompetitions, setLoadingCompetitions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // This is a placeholder - in a real app, you'd fetch active competitions
  useEffect(() => {
    async function fetchActiveCompetitions() {
      setLoadingCompetitions(true)
      setError(null)

      try {
        // For demo purposes, we'll just use a few hardcoded IDs
        // In a real app, you'd need to fetch this data from events or a backend
        const competitionIds = ["1", "2", "3"]
        const fetchedCompetitions = []

        for (const id of competitionIds) {
          try {
            const competition = await fetchCompetition(id)
            // Only include competitions in submission phase
            const now = Math.floor(Date.now() / 1000)
            if (now < competition.submissionDeadline) {
              fetchedCompetitions.push(competition)
            }
          } catch (err) {
            console.error(`Error fetching competition ${id}:`, err)
            // Continue with other competitions even if one fails
          }
        }

        if (fetchedCompetitions.length === 0) {
          // If no competitions were found in submission phase, use mock data
          const mockCompetitions = []
          for (const id of competitionIds) {
            const deadlines = getMockCompetitionDeadlines(id)
            const now = Math.floor(Date.now() / 1000)

            // Only include competitions in submission phase
            if (now < deadlines.submissionDeadline) {
              let theme = "Generic Competition Theme"
              if (id === "1") {
                theme = "Web3 Innovation - Create a dApp that solves a real-world problem using blockchain technology"
              } else if (id === "2") {
                theme =
                  "DeFi Applications - Showcase a decentralized finance application that improves financial inclusion"
              } else if (id === "3") {
                theme = "NFT Showcase - Create an innovative NFT project with real utility beyond digital art"
              }

              mockCompetitions.push({
                id,
                theme,
                ...deadlines,
                prizePool: id === "1" ? "0.5" : id === "2" ? "1.0" : "0.3",
                submissions: [],
              })
            }
          }
          setCompetitions(mockCompetitions)
        } else {
          setCompetitions(fetchedCompetitions)
        }
      } catch (err: any) {
        console.error("Error fetching competitions:", err)
        setError("Failed to load competitions. Please check your connection and try again.")
      } finally {
        setLoadingCompetitions(false)
      }
    }

    fetchActiveCompetitions()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!competitionId || !postId) {
        throw new Error("Please fill all fields")
      }

      // Check if post is already submitted
      setIsChecking(true)
      const isSubmitted = await checkIfPostSubmitted(competitionId, postId)
      setIsChecking(false)

      if (isSubmitted) {
        throw new Error(`Post #${postId} has already been submitted to this competition`)
      }

      const { contract } = await connectWallet()

      const tx = await contract.submitPost(competitionId, postId)

      toast({
        title: "Post submitted",
        description: `Your post has been submitted to competition #${competitionId}. Transaction: ${tx.hash.slice(0, 10)}...`,
      })

      await tx.wait()

      toast({
        title: "Submission confirmed",
        description: `Your post #${postId} has been successfully submitted to competition #${competitionId}!`,
      })

      // Reset form
      setPostId("")
    } catch (err: any) {
      console.error("Error submitting post:", err)
      setError(err.message || "Failed to submit post. Please check your connection and try again.")
      toast({
        title: "Error submitting post",
        description: err.message || "Failed to submit post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
      <CardHeader>
        <CardTitle>Submit a Post</CardTitle>
        <CardDescription>Submit your Lens post to a competition</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitionId">Competition</Label>
            {loadingCompetitions ? (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Loading competitions..." />
                </SelectTrigger>
              </Select>
            ) : competitions.length > 0 ? (
              <Select value={competitionId} onValueChange={setCompetitionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      #{competition.id}: {competition.theme.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex space-x-2">
                <Input
                  id="competitionId"
                  type="number"
                  placeholder="1"
                  value={competitionId}
                  onChange={(e) => setCompetitionId(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (!competitionId) return
                    try {
                      const competition = await fetchCompetition(competitionId)
                      toast({
                        title: `Competition #${competitionId}`,
                        description: `Theme: ${competition.theme}`,
                      })
                    } catch (err: any) {
                      toast({
                        title: "Error",
                        description: err.message || "Competition not found",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Verify
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postId">Post ID</Label>
            <Input
              id="postId"
              type="number"
              placeholder="123456"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="bg-muted/10">
        <Button onClick={handleSubmit} disabled={isLoading || isChecking} className="w-full">
          {isLoading || isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isChecking ? "Checking..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Post
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
