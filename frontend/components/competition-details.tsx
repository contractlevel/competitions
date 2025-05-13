"use client"

import { useState, useEffect } from "react"
import {
  formatDate,
  fetchCompetition,
  connectWallet,
  isContractDeployed,
  fetchWinningAuthor,
  getMockCompetitionDeadlines,
} from "@/lib/contract-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, CalendarDays, Crown, Trophy, Users } from "lucide-react"
import PostCard from "./post-card"
import { toast } from "@/components/ui/use-toast"
import { CONTRACT_ADDRESS } from "@/lib/contract-config"
import { motion } from "framer-motion"

interface CompetitionDetailsProps {
  competitionId: string
}

export default function CompetitionDetails({ competitionId }: CompetitionDetailsProps) {
  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [votingPostId, setVotingPostId] = useState<string>("")
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [useMockData, setUseMockData] = useState<boolean>(false)
  const [winningAuthor, setWinningAuthor] = useState<string | null>(null)

  useEffect(() => {
    async function loadCompetitionData() {
      if (!competitionId) return

      setLoading(true)
      setError("")
      setUseMockData(false)
      setWinningAuthor(null)

      try {
        // First check if the contract is deployed
        const deployed = await isContractDeployed()
        if (!deployed) {
          setError(`Contract not deployed at address ${CONTRACT_ADDRESS}`)
          setUseMockData(true)
          loadMockData()
          setLoading(false)
          return
        }

        try {
          const competitionData = await fetchCompetition(competitionId)
          setCompetition(competitionData)

          // If competition is completed and has a winning post ID, fetch the winning author
          if (competitionData.prizeDistributed && competitionData.winningPostId) {
            try {
              const author = await fetchWinningAuthor(competitionId)
              if (author) {
                setWinningAuthor(author)
              }
            } catch (authorErr) {
              console.error("Error fetching winning author:", authorErr)
            }
          }
        } catch (err: any) {
          console.error("Error fetching competition:", err)
          setError(err.message || "Failed to load competition data")

          // If the competition doesn't exist, use mock data
          setUseMockData(true)
          loadMockData()
        }
      } catch (err: any) {
        console.error("Error checking contract:", err)
        setError(err.message || "Failed to check contract deployment")
        setUseMockData(true)
        loadMockData()
      } finally {
        setLoading(false)
      }
    }

    function loadMockData() {
      // Use mock data with consistent deadlines
      const deadlines = getMockCompetitionDeadlines(competitionId)

      // Match the competition ID to the mock data
      if (competitionId === "1") {
        setCompetition({
          id: competitionId,
          creator: "0x1234567890123456789012345678901234567890",
          prizeDistributed: false,
          theme: "Web3 Innovation - Create a dApp that solves a real-world problem using blockchain technology",
          ...deadlines,
          prizePool: "0.5",
          submissions: ["1", "2", "3"],
        })
      } else if (competitionId === "2") {
        setCompetition({
          id: competitionId,
          creator: "0x1234567890123456789012345678901234567890",
          prizeDistributed: false,
          theme: "DeFi Applications - Showcase a decentralized finance application that improves financial inclusion",
          ...deadlines,
          prizePool: "1.0",
          submissions: ["4", "5"],
        })
      } else if (competitionId === "3") {
        setCompetition({
          id: competitionId,
          creator: "0x1234567890123456789012345678901234567890",
          prizeDistributed: true,
          theme: "NFT Showcase - Create an innovative NFT project with real utility beyond digital art",
          ...deadlines,
          prizePool: "0.3",
          submissions: ["6", "7", "8", "9"],
          winningPostId: "7", // Add winner for completed competition
        })
        setWinningAuthor("0x7890123456789012345678901234567890123456") // Add winning author address
      } else {
        // Default mock data for any other ID
        setCompetition({
          id: competitionId,
          creator: "0x1234567890123456789012345678901234567890",
          prizeDistributed: false,
          theme: "Generic Competition Theme",
          ...deadlines,
          prizePool: "0.5",
          submissions: ["1", "2", "3"],
        })
      }
    }

    loadCompetitionData()
  }, [competitionId])

  const handleVote = async (postId: string) => {
    try {
      setVotingPostId(postId)
      setIsVoting(true)

      const { contract } = await connectWallet()
      const tx = await contract.vote(competitionId, postId)

      toast({
        title: "Vote submitted",
        description: `Your vote for post #${postId} has been submitted. Transaction: ${tx.hash.slice(0, 10)}...`,
      })

      await tx.wait()

      toast({
        title: "Vote confirmed",
        description: `Your vote for post #${postId} has been confirmed!`,
      })

      // Refresh competition data
      const competitionData = await fetchCompetition(competitionId)
      setCompetition(competitionData)
    } catch (err: any) {
      console.error("Error voting:", err)
      toast({
        title: "Error voting",
        description: err.message || "Failed to vote for post",
        variant: "destructive",
      })
    } finally {
      setVotingPostId("")
      setIsVoting(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto cyber-card">
        <div className="h-2 bg-gradient-to-r from-neon-pink to-neon-blue" />
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-8 w-[250px] bg-cyber-light/20" />
              <Skeleton className="h-4 w-[150px] mt-2 bg-cyber-light/20" />
            </div>
            <Skeleton className="h-8 w-[100px] bg-cyber-light/20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Skeleton className="h-5 w-[100px] mb-2 bg-cyber-light/20" />
            <Skeleton className="h-20 w-full bg-cyber-light/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-5 w-[150px] mb-2 bg-cyber-light/20" />
              <Skeleton className="h-6 w-[200px] bg-cyber-light/20" />
            </div>
            <div>
              <Skeleton className="h-5 w-[150px] mb-2 bg-cyber-light/20" />
              <Skeleton className="h-6 w-[200px] bg-cyber-light/20" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-[200px] mb-4 bg-cyber-light/20" />
            <div className="space-y-4">
              <Skeleton className="h-40 w-full bg-cyber-light/20" />
              <Skeleton className="h-40 w-full bg-cyber-light/20" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !useMockData) {
    return (
      <Card className="w-full max-w-3xl mx-auto cyber-card">
        <CardHeader>
          <CardTitle className="text-neon-pink">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="cyber-card-pink">
            <AlertCircle className="h-4 w-4 text-neon-pink" />
            <AlertTitle className="text-neon-pink">Error Loading Competition</AlertTitle>
            <AlertDescription className="text-gray-300">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!competition) {
    return (
      <Card className="w-full max-w-3xl mx-auto cyber-card">
        <CardHeader>
          <CardTitle className="text-neon-blue">Competition Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">No competition found with ID {competitionId}</p>
        </CardContent>
      </Card>
    )
  }

  const now = Math.floor(Date.now() / 1000)
  const isSubmissionOpen = now < competition.submissionDeadline
  const isVotingOpen = now >= competition.submissionDeadline && now < competition.votingDeadline
  const isCompleted = now >= competition.votingDeadline

  // Filter out the winning post from the submissions list if it's completed
  const filteredSubmissions =
    isCompleted && competition.winningPostId
      ? competition.submissions.filter((id) => id !== competition.winningPostId)
      : competition.submissions

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden cyber-card">
      {useMockData && (
        <Alert className="rounded-b-none border-x-0 border-t-0 cyber-card">
          <AlertTriangle className="h-4 w-4 text-neon-yellow" />
          <AlertTitle className="text-neon-yellow">Using Demo Data</AlertTitle>
          <AlertDescription className="text-gray-300">
            Unable to fetch real competition data. Showing demo data instead.
          </AlertDescription>
        </Alert>
      )}

      <div className="h-2 bg-gradient-to-r from-neon-pink to-neon-blue" />
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2 text-neon-blue neon-text-blue">
              Competition #{competition.id}
            </CardTitle>
            <CardDescription className="flex items-center mt-1 text-neon-pink">
              <Trophy className="h-4 w-4 mr-1 text-neon-pink" />
              Prize Pool: {competition.prizePool} GRASS
            </CardDescription>
          </div>
          <Badge
            variant={isSubmissionOpen ? "default" : isVotingOpen ? "secondary" : "outline"}
            className={`px-3 py-1 ${
              isSubmissionOpen ? "cyber-badge-green" : isVotingOpen ? "cyber-badge" : "cyber-badge-pink"
            }`}
          >
            {isSubmissionOpen ? "Submission Open" : isVotingOpen ? "Voting Open" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-neon-blue">Theme</h3>
          <p className="text-gray-300 bg-cyber-dark/50 p-3 rounded-md border border-neon-blue/20">
            {competition.theme}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyber-dark/50 p-3 rounded-md border border-neon-pink/20">
            <h3 className="text-sm font-medium flex items-center gap-2 text-neon-pink">
              <CalendarDays className="h-4 w-4 text-neon-pink" />
              Submission Deadline
            </h3>
            <p className="text-gray-300 mt-1">{formatDate(competition.submissionDeadline)}</p>
          </div>
          <div className="bg-cyber-dark/50 p-3 rounded-md border border-neon-blue/20">
            <h3 className="text-sm font-medium flex items-center gap-2 text-neon-blue">
              <CalendarDays className="h-4 w-4 text-neon-blue" />
              Voting Deadline
            </h3>
            <p className="text-gray-300 mt-1">{formatDate(competition.votingDeadline)}</p>
          </div>
        </div>

        {/* Show winner section for completed competitions */}
        {isCompleted && competition.winningPostId && (
          <div id="winner" className="bg-neon-green/10 p-4 rounded-md border border-neon-green/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neon-green">
              <Crown className="h-5 w-5 text-neon-green" />
              Winner
            </h3>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <PostCard
                competitionId={competition.id}
                postId={competition.winningPostId}
                canVote={false}
                onVote={() => {}}
                isVoting={false}
                votingPostId=""
                isWinner={true} // Use the same styling as the winner in the list
                hideWinnerLabel={true} // Hide the internal winner label
              />
            </motion.div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neon-green">
            <Users className="h-5 w-5 text-neon-green" />
            Submissions ({filteredSubmissions.length})
          </h3>
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((postId: string, index: number) => (
                <motion.div
                  key={postId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard
                    competitionId={competition.id}
                    postId={postId}
                    canVote={isVotingOpen && !isVoting}
                    onVote={handleVote}
                    isVoting={isVoting}
                    votingPostId={votingPostId}
                    isWinner={false} // No need to mark as winner in the list since it's filtered out
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 bg-cyber-dark/50 p-6 rounded-md text-center border border-neon-blue/20">
              No submissions yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
