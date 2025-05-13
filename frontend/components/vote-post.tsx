"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { connectWallet, fetchCompetition, checkIfUserVoted, getMockCompetitionDeadlines } from "@/lib/contract-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, ThumbsUp } from "lucide-react"

export default function VotePost() {
  const [competitionId, setCompetitionId] = useState("")
  const [postId, setPostId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loadingCompetitions, setLoadingCompetitions] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  // Get user address on component mount
  useEffect(() => {
    async function getUserAddress() {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setUserAddress(accounts[0])
          }
        }
      } catch (err) {
        console.error("Error getting user address:", err)
      }
    }

    getUserAddress()
  }, [])

  // This is a placeholder - in a real app, you'd fetch active competitions
  useEffect(() => {
    async function fetchVotingCompetitions() {
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
            // Only include competitions in voting phase
            const now = Math.floor(Date.now() / 1000)
            if (now >= competition.submissionDeadline && now < competition.votingDeadline) {
              fetchedCompetitions.push(competition)
            }
          } catch (err) {
            console.error(`Error fetching competition ${id}:`, err)
          }
        }

        if (fetchedCompetitions.length === 0) {
          // If no competitions were found in voting phase, use mock data
          const mockCompetitions = []
          for (const id of competitionIds) {
            const deadlines = getMockCompetitionDeadlines(id)
            const now = Math.floor(Date.now() / 1000)

            // Only include competitions in voting phase
            if (now >= deadlines.submissionDeadline && now < deadlines.votingDeadline) {
              let theme = "Generic Competition Theme"
              let submissions = []

              if (id === "1") {
                theme = "Web3 Innovation - Create a dApp that solves a real-world problem using blockchain technology"
                submissions = ["1", "2", "3"]
              } else if (id === "2") {
                theme =
                  "DeFi Applications - Showcase a decentralized finance application that improves financial inclusion"
                submissions = ["4", "5"]
              } else if (id === "3") {
                theme = "NFT Showcase - Create an innovative NFT project with real utility beyond digital art"
                submissions = ["6", "7", "8", "9"]
              }

              mockCompetitions.push({
                id,
                theme,
                ...deadlines,
                prizePool: id === "1" ? "0.5" : id === "2" ? "1.0" : "0.3",
                submissions,
              })
            }
          }
          setCompetitions(mockCompetitions)
        } else {
          setCompetitions(fetchedCompetitions)
        }
      } catch (err) {
        console.error("Error fetching competitions:", err)
        setError("Failed to load competitions. Please check your connection and try again.")
      } finally {
        setLoadingCompetitions(false)
      }
    }

    fetchVotingCompetitions()
  }, [])

  // When competition ID changes, fetch the competition details
  useEffect(() => {
    if (!competitionId) {
      setSelectedCompetition(null)
      return
    }

    async function loadCompetition() {
      try {
        const competition = await fetchCompetition(competitionId)
        setSelectedCompetition(competition)
      } catch (err) {
        console.error("Error loading competition:", err)
        setSelectedCompetition(null)
      }
    }

    loadCompetition()
  }, [competitionId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!competitionId || !postId) {
        throw new Error("Please fill all fields")
      }

      // Check if user has already voted
      if (userAddress) {
        setIsChecking(true)
        const hasVoted = await checkIfUserVoted(competitionId, userAddress)
        setIsChecking(false)

        if (hasVoted) {
          throw new Error("You have already voted in this competition")
        }
      }

      const { contract, accounts } = await connectWallet()

      // Update user address after connecting
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0])
      }

      const tx = await contract.vote(competitionId, postId)

      toast({
        title: "Vote submitted",
        description: `Your vote has been submitted. Transaction: ${tx.hash.slice(0, 10)}...`,
      })

      await tx.wait()

      toast({
        title: "Vote confirmed",
        description: `Your vote for post #${postId} in competition #${competitionId} has been confirmed!`,
      })

      // Reset form
      setPostId("")
    } catch (err: any) {
      console.error("Error voting for post:", err)
      setError(err.message || "Failed to vote for post. Please check your connection and try again.")
      toast({
        title: "Error voting",
        description: err.message || "Failed to vote for post",
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
        <CardTitle>Vote for a Post</CardTitle>
        <CardDescription>Cast your vote for a post in a competition</CardDescription>
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
            {selectedCompetition && selectedCompetition.submissions.length > 0 ? (
              <Select value={postId} onValueChange={setPostId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a post" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCompetition.submissions.map((id: string) => (
                    <SelectItem key={id} value={id}>
                      Post #{id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="postId"
                type="number"
                placeholder="123456"
                value={postId}
                onChange={(e) => setPostId(e.target.value)}
                required
              />
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="bg-muted/10">
        <Button onClick={handleSubmit} disabled={isLoading || isChecking} className="w-full">
          {isLoading || isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isChecking ? "Checking..." : "Voting..."}
            </>
          ) : (
            <>
              <ThumbsUp className="mr-2 h-4 w-4" />
              Cast Vote
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
