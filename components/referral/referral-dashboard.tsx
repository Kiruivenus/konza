"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Gift, Copy, Check, TrendingUp, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReferralStats {
  referralCode: string
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalEarnings: number
  recentReferrals: Array<{
    _id: string
    referredUsername: string
    bonusAmount: number
    status: string
    createdAt: string
    completedAt?: string
  }>
}

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/referral/stats")
      const data = await res.json()

      if (res.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch referral stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleCopyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode)
      setCopied(true)
      toast({
        title: "✓ Copied!",
        description: "Referral code copied to clipboard",
        className: "bg-green-50 border-green-200",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyLink = () => {
    if (stats?.referralCode) {
      const link = `${window.location.origin}/register?ref=${stats.referralCode}`
      navigator.clipboard.writeText(link)
      toast({
        title: "✓ Copied!",
        description: "Referral link copied to clipboard",
        className: "bg-green-50 border-green-200",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load referral data</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-primary" />
            Your Referral Code
          </CardTitle>
          <CardDescription className="text-base">Share your code and earn rewards when friends join</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={stats?.referralCode || ""}
              readOnly
              className="text-xl font-mono font-bold text-center bg-background border-primary/30"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0 border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={handleCopyLink} className="w-full" size="lg">
            <Copy className="mr-2 h-4 w-4" />
            Copy Referral Link
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time referrals</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Check className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats?.completedReferrals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">KYC verified</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats?.pendingReferrals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting KYC</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.totalEarnings?.toFixed(4) || "0.0000"} KZC</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime rewards</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      {stats && stats.recentReferrals.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Recent Referrals</CardTitle>
            <CardDescription>Your latest referrals and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentReferrals.map((referral) => (
                <div
                  key={referral._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{referral.referredUsername}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(referral.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {referral.status === "completed" ? (
                      <>
                        <p className="font-semibold text-primary text-lg">+{referral.bonusAmount.toFixed(4)} KZC</p>
                        <div className="flex items-center gap-1 text-xs text-green-500">
                          <Check className="h-3 w-3" />
                          Completed
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-muted-foreground">{referral.bonusAmount.toFixed(4)} KZC</p>
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <Clock className="h-3 w-3" />
                          Pending KYC
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert className="border-primary/30 bg-primary/5">
        <Gift className="h-4 w-4 text-primary" />
        <AlertDescription className="text-base">
          Earn rewards when your referrals complete KYC verification. Share your code with friends to start earning!
        </AlertDescription>
      </Alert>
    </div>
  )
}
