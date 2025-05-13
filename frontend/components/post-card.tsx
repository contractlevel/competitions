"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPost, fetchPostContent, fetchPostVotes, truncateAddress } from "@/lib/contract-utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Crown, Loader2, ThumbsUp, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PostCardProps {
  competitionId: string
  postId: string
  canVote: boolean
  onVote: (postId: string) => void
  isVoting: boolean
  votingPostId: string
  isWinner?: boolean
  hideWinnerLabel?: boolean
}

export default function PostCard({
  competitionId,
  postId,
  canVote,
  onVote,
  isVoting,
  votingPostId,
  isWinner = false,
  hideWinnerLabel = false,
}: PostCardProps) {
  const [post, setPost] = useState<any>(null)
  const [content, setContent] = useState<any>(null)
  const [votes, setVotes] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function loadPostData() {
      try {
        setLoading(true)

        // Fetch post data from the contract
        const postData = await fetchPost(postId)
        setPost(postData)

        // Fetch post content from IPFS or other storage
        if (postData.contentURI) {
          try {
            const contentData = await fetchPostContent(postData.contentURI)
            setContent(contentData)
          } catch (contentErr) {
            console.error("Error fetching post content:", contentErr)
            // Continue even if content fetch fails
          }
        }

        // Fetch votes for this post
        const votesCount = await fetchPostVotes(competitionId, postId)
        setVotes(votesCount)

        setLoading(false)
      } catch (err: any) {
        console.error("Error loading post data:", err)
        setError(err.message || "Failed to load post data")
        setLoading(false)
      }
    }

    loadPostData()
  }, [competitionId, postId])

  // Refresh votes when voting status changes
  useEffect(() => {
    if (!isVoting && votingPostId === postId) {
      // Refresh votes after voting
      fetchPostVotes(competitionId, postId)
        .then((votesCount) => {
          setVotes(votesCount)
        })
        .catch((err) => {
          console.error("Error refreshing votes:", err)
        })
    }
  }, [isVoting, votingPostId, competitionId, postId])

  if (loading) {
    return (
      <Card className="w-full mb-4 overflow-hidden cyber-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-full bg-cyber-light/20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px] bg-cyber-light/20" />
              <Skeleton className="h-4 w-[150px] bg-cyber-light/20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2 bg-cyber-light/20" />
          <Skeleton className="h-4 w-full mb-2 bg-cyber-light/20" />
          <Skeleton className="h-4 w-2/3 bg-cyber-light/20" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full mb-4 cyber-card-pink">
        <CardContent className="p-4">
          <p className="text-neon-pink">
            Error loading post #{postId}: {error}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!post) {
    return (
      <Card className="w-full mb-4 cyber-card">
        <CardContent className="p-4">
          <p className="text-gray-400">Post #{postId} not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "w-full mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg",
        isWinner ? "cyber-card-green" : "cyber-card",
        isWinner && "border-neon-green border-2",
      )}
    >
      {isWinner && !hideWinnerLabel && (
        <div className="bg-neon-green/20 py-1 px-4 flex items-center justify-center">
          <Crown className="h-4 w-4 mr-2 text-neon-green" />
          <span className="text-neon-green font-semibold">WINNER</span>
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar
            className={cn(
              "border",
              isWinner ? "border-neon-green/30 bg-cyber-dark" : "border-neon-blue/30 bg-cyber-dark",
            )}
          >
            <AvatarFallback className={cn("bg-cyber-dark", isWinner ? "text-neon-green" : "text-neon-blue")}>
              {post.author.slice(2, 4)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium flex items-center gap-2 text-neon-blue">
              Post #{postId}
              <Badge variant="outline" className="ml-2 cyber-badge">
                Lens Post
              </Badge>
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <User className="h-3 w-3 text-neon-pink" /> {truncateAddress(post.author)}
            </p>
          </div>
          <div className="ml-auto flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-gray-400 flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1 text-neon-green" />
                    {new Date(post.creationTimestamp * 1000).toLocaleDateString()}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="cyber-card border-neon-green/30">
                  <p className="text-neon-green">
                    Posted on {new Date(post.creationTimestamp * 1000).toLocaleString()}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {content ? (
          <div className="mb-4">
            {content.content && (
              <p className="text-gray-300 bg-cyber-dark/50 p-3 rounded-md border border-neon-blue/20">
                {content.content}
              </p>
            )}
            {content.image && (
              <div className="mt-2 rounded-md overflow-hidden border border-neon-pink/30">
                <img
                  src={content.image || "/placeholder.svg"}
                  alt="Post content"
                  className="max-h-[300px] object-cover w-full"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 mb-4 bg-cyber-dark/50 p-3 rounded-md overflow-hidden text-ellipsis border border-neon-blue/20">
            Content URI: {post.contentURI}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className={cn("flex items-center gap-1", isWinner ? "cyber-badge-green" : "cyber-badge")}
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{votes} votes</span>
            </Badge>
          </div>
        </div>
      </CardContent>

      {canVote && (
        <CardFooter className="px-4 py-3 border-t border-neon-blue/20 bg-cyber-dark/30">
          <Button variant="outline" className="w-full cyber-button" onClick={() => onVote(postId)} disabled={isVoting}>
            {isVoting && votingPostId === postId ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Voting...
              </>
            ) : (
              <>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Vote for this post
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
