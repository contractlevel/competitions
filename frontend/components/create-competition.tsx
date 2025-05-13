"use client"

import type React from "react"

import { useState } from "react"
import { ethers } from "ethers"
import { connectWallet, timestampFromDate } from "@/lib/contract-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Trophy } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function CreateCompetition() {
  const [theme, setTheme] = useState("")
  const [prizePool, setPrizePool] = useState("")
  const [submissionDate, setSubmissionDate] = useState<Date | undefined>(undefined)
  const [votingDate, setVotingDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setTxHash("")

    try {
      if (!theme || !prizePool || !submissionDate || !votingDate) {
        throw new Error("Please fill all fields")
      }

      const submissionDeadline = timestampFromDate(submissionDate)
      const votingDeadline = timestampFromDate(votingDate)

      if (submissionDeadline <= Math.floor(Date.now() / 1000)) {
        throw new Error("Submission deadline must be in the future")
      }

      if (votingDeadline <= submissionDeadline) {
        throw new Error("Voting deadline must be after submission deadline")
      }

      const { contract } = await connectWallet()

      const tx = await contract.createCompetition(theme, submissionDeadline, votingDeadline, {
        value: ethers.utils.parseEther(prizePool),
      })

      setTxHash(tx.hash)
      await tx.wait()

      // Reset form
      setTheme("")
      setPrizePool("")
      setSubmissionDate(undefined)
      setVotingDate(undefined)
    } catch (err: any) {
      console.error("Error creating competition:", err)
      setError(err.message || "Failed to create competition")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
      <CardHeader>
        <CardTitle>Create a Competition</CardTitle>
        <CardDescription>Set up a new content competition with a prize pool</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in-50 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {txHash && (
          <Alert className="mb-6 animate-in fade-in-50 duration-300">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Transaction Submitted</AlertTitle>
            <AlertDescription>
              Your competition has been created! Transaction hash: {txHash.slice(0, 10)}...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Competition Theme</Label>
            <Textarea
              id="theme"
              placeholder="Describe the theme or topic of your competition"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizePool">Prize Pool (GRASS)</Label>
            <Input
              id="prizePool"
              type="number"
              step="0.01"
              placeholder="0.1"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Submission Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !submissionDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {submissionDate ? format(submissionDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={submissionDate} onSelect={setSubmissionDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Voting Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !votingDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {votingDate ? format(votingDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={votingDate} onSelect={setVotingDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="bg-muted/10">
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Create Competition
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
