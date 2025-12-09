"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Pickaxe, Clock, Coins, TrendingUp, Timer, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MiningSession {
  _id: string
  startTime: string
  endTime: string
  progress: number
  isComplete: boolean
  currentReward: number
  totalReward: number
  claimed: boolean
}

interface MiningHistory {
  _id: string
  startTime: string
  endTime: string
  rewardRate: number
  status: string
  claimed: boolean
  claimedAt?: string
}

export function MiningDashboard() {
  const [session, setSession] = useState<MiningSession | null>(null)
  const [history, setHistory] = useState<MiningHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [userRestriction, setUserRestriction] = useState<string | null>(null)
  const [userStatus, setUserStatus] = useState<string>("active")
  const { toast } = useToast()

  const fetchUserRestrictions = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (res.ok && data.user) {
        setUserStatus(data.user.status || "active")
        if (data.user.status === "banned") {
          setUserRestriction("Your account has been banned and cannot mine.")
        } else if (data.user.status === "suspended") {
          setUserRestriction("Your account has been suspended. Please contact support.")
        } else if (Array.isArray(data.user.restrictions) && data.user.restrictions.includes("mine")) {
          setUserRestriction("Your account is restricted from mining.")
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user restrictions:", error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/mining/status")
      const data = await res.json()

      if (res.ok) {
        setSession(data.session)
      }
    } catch (error) {
      console.error("Failed to fetch mining status:", error)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/mining/history")
      const data = await res.json()

      if (res.ok) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error("Failed to fetch mining history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserRestrictions()
    fetchStatus()
    fetchHistory()

    // Poll for updates every 5 seconds if there's an active session
    const interval = setInterval(() => {
      if (session && !session.claimed) {
        fetchStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [session]) // Updated dependency array to include session

  const handleStartMining = async () => {
    setStarting(true)
    console.log("[v0] Starting mining session...")
    try {
      const res = await fetch("/api/mining/start", {
        method: "POST",
      })
      const data = await res.json()

      console.log("[v0] Mining start response:", data)

      if (res.ok) {
        toast({
          title: "Mining Started",
          description: "Your mining session has begun!",
        })
        fetchStatus()
      } else {
        console.error("[v0] Mining start failed:", data)

        let errorMessage = data.error || "Failed to start mining"

        if (data.error?.includes("banned")) {
          errorMessage = "❌ Your account has been banned and cannot mine."
        } else if (data.error?.includes("suspended")) {
          errorMessage = "❌ Your account has been suspended. Please contact support."
        } else if (data.error?.includes("restricted")) {
          errorMessage = "❌ Mining feature is restricted for your account. Contact support for more information."
        } else if (data.error?.includes("disabled")) {
          errorMessage = "❌ Mining is currently disabled by the platform."
        } else if (data.error?.includes("active")) {
          errorMessage = "❌ You already have an active mining session. Complete it first."
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Mining start error:", error)
      toast({
        title: "Error",
        description: "Failed to start mining",
        variant: "destructive",
      })
    } finally {
      setStarting(false)
    }
  }

  const handleClaimReward = async () => {
    setClaiming(true)
    try {
      const res = await fetch("/api/mining/claim", {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Reward Claimed!",
          description: `You received ${data.reward.toFixed(4)} KZC`,
        })
        setSession(null)
        fetchHistory()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to claim reward",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      })
    } finally {
      setClaiming(false)
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    return `${hours}h`
  }

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const remaining = end - now

    if (remaining <= 0) return "Complete"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`
    } else {
      return `${seconds}s remaining`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {userRestriction && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive font-medium">{userRestriction}</AlertDescription>
        </Alert>
      )}

      {/* Active Mining Session */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pickaxe className="h-5 w-5 text-primary" />
            Mining Dashboard
          </CardTitle>
          <CardDescription>Mine KZC tokens and earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!session ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Pickaxe className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Start Mining</h3>
                <p className="text-sm text-muted-foreground mb-4">Begin a mining session to earn KZC rewards</p>
              </div>
              <Button onClick={handleStartMining} disabled={starting || !!userRestriction} size="lg" className="gap-2">
                {starting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Pickaxe className="h-4 w-4" />
                    Start Mining
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">
                      {session.isComplete ? "Mining Complete!" : "Mining in Progress"}
                    </span>
                  </div>
                  {!session.isComplete && (
                    <span className="text-sm font-medium text-primary">{getTimeRemaining(session.endTime)}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{session.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={session.progress} className="h-3" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="h-4 w-4" />
                    Current Reward
                  </div>
                  <p className="text-2xl font-bold text-primary">{session.currentReward.toFixed(4)} KZC</p>
                </div>
                <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Total Reward
                  </div>
                  <p className="text-2xl font-bold">{session.totalReward.toFixed(4)} KZC</p>
                </div>
              </div>

              {/* Time Info */}
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">{formatTime(session.startTime)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ends</span>
                  <span className="font-medium">{formatTime(session.endTime)}</span>
                </div>
              </div>

              {/* Claim Button */}
              {session.isComplete && !session.claimed && (
                <Button onClick={handleClaimReward} disabled={claiming} size="lg" className="w-full gap-2">
                  {claiming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4" />
                      Claim {session.totalReward.toFixed(4)} KZC
                    </>
                  )}
                </Button>
              )}

              {!session.isComplete && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center p-3 rounded-lg bg-primary/5">
                  <Clock className="h-4 w-4 animate-pulse" />
                  Mining in progress... Check back later to claim your reward
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mining History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mining History</CardTitle>
            <CardDescription>Your past mining sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Pickaxe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDuration(item.startTime, item.endTime)} session</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatTime(item.startTime)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-primary">+{item.rewardRate.toFixed(4)} KZC</p>
                    <p className="text-xs text-muted-foreground">{item.claimed ? "Claimed" : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
