"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Menu,
  User,
  Shield,
  UsersIcon,
  Search,
  SettingsIcon,
  LogOut,
  Pickaxe,
  Loader2,
  Clock,
  Coins,
  Copy,
} from "lucide-react"
import { SendDialog } from "@/components/wallet/send-dialog"
import { ReceiveDialog } from "@/components/wallet/receive-dialog"
import { PinSetupDialog } from "@/components/wallet/pin-setup-dialog"
import { TransactionList } from "@/components/wallet/transaction-list"
import { SwapInterface } from "@/components/swap/swap-interface"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Suspense } from "react"
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog"
import { ChangePinDialog } from "@/components/settings/change-pin-dialog"
import { ResetPinDialog } from "@/components/settings/reset-pin-dialog"
import { EditProfileDialog } from "@/components/settings/edit-profile-dialog"

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "home"
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  const [miningSession, setMiningSession] = useState<any>(null)
  const [startingMining, setStartingMining] = useState(false)
  const [claimingReward, setClaimingReward] = useState(false)

  useEffect(() => {
    fetchUserData()
    checkPin()
    fetchMiningStatus()

    const priceInterval = setInterval(() => {
      fetchUserData()
    }, 10000)

    return () => clearInterval(priceInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (miningSession && !miningSession.claimed) {
        fetchMiningStatus()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [miningSession])

  const fetchUserData = async () => {
    try {
      const [userRes, balanceRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/wallet/balance")])

      const userData = await userRes.json()
      const balanceData = await balanceRes.json()

      setUser(userData.user)
      setBalance(balanceData)
    } catch (error) {
      console.error("[v0] Failed to fetch user data:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const checkPin = async () => {
    try {
      const response = await fetch("/api/wallet/pin")
      const data = await response.json()
      setHasPin(data.hasPin)
    } catch (error) {
      console.error("[v0] Failed to check PIN:", error)
    }
  }

  const fetchMiningStatus = async () => {
    try {
      const res = await fetch("/api/mining/status")
      const data = await res.json()
      if (res.ok) {
        setMiningSession(data.session)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch mining status:", error)
    }
  }

  const handleStartMining = async () => {
    setStartingMining(true)
    try {
      const res = await fetch("/api/mining/start", { method: "POST" })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Mining Started",
          description: "Your mining session has begun!",
        })
        fetchMiningStatus()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start mining",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start mining",
        variant: "destructive",
      })
    } finally {
      setStartingMining(false)
    }
  }

  const handleClaimReward = async () => {
    setClaimingReward(true)
    try {
      const res = await fetch("/api/mining/claim", { method: "POST" })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Reward Claimed!",
          description: `You received ${data.reward.toFixed(4)} KZC`,
        })
        setMiningSession(null)
        fetchUserData()
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
      setClaimingReward(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const setTab = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Konza Coin</h1>
          {user?.kycStatus === "Approved" && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-xs font-semibold text-green-500">Verified</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setTab("settings")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/kyc" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  KYC Verification
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/referral" className="cursor-pointer">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Referrals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/explorer" className="cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  Transaction Explorer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTab("settings")} className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* KYC status banner */}
            {user?.kycStatus === "Not Submitted" && (
              <Card className="border-chart-1/50 bg-chart-1/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">Complete KYC Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        Verify your identity to unlock token swapping and referral rewards
                      </p>
                    </div>
                    <Link href="/kyc">
                      <Button size="sm">Verify Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pickaxe className="h-5 w-5 text-primary" />
                  Mining
                </CardTitle>
                <CardDescription>Mine KZC tokens and earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!miningSession ? (
                  <div className="text-center py-4 space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Pickaxe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Start Mining</h3>
                      <p className="text-sm text-muted-foreground">Begin a mining session to earn KZC rewards</p>
                    </div>
                    <Button onClick={handleStartMining} disabled={startingMining} className="gap-2">
                      {startingMining ? (
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{miningSession.progress?.toFixed(1) || 0}%</span>
                      </div>
                      <Progress value={miningSession.progress || 0} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Coins className="h-4 w-4" />
                          Current Reward
                        </div>
                        <p className="text-xl font-bold text-primary">
                          {miningSession.currentReward?.toFixed(4) || "0.0000"} KZC
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          Total Reward
                        </div>
                        <p className="text-xl font-bold">{miningSession.totalReward?.toFixed(4) || "0.0000"} KZC</p>
                      </div>
                    </div>

                    {miningSession.isComplete && !miningSession.claimed ? (
                      <Button onClick={handleClaimReward} disabled={claimingReward} className="w-full gap-2">
                        {claimingReward ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Coins className="h-4 w-4" />
                            Claim {miningSession.totalReward?.toFixed(4)} KZC
                          </>
                        )}
                      </Button>
                    ) : (
                      !miningSession.claimed && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                          <Clock className="h-4 w-4" />
                          Mining in progress...
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Balance
                </CardTitle>
                <CardDescription>Your Konza Coin holdings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-4xl font-bold">{balance?.balance?.toFixed(2) || "0.00"} KZC</p>
                  <p className="text-muted-foreground mt-1">≈ ${balance?.usdtEquivalent?.toFixed(2) || "0.00"} USD</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current Price: ${balance?.kzcPrice?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setSendDialogOpen(true)} className="w-full">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                  <Button onClick={() => setReceiveDialogOpen(true)} variant="outline" className="w-full">
                    <ArrowDownLeft className="mr-2 h-4 w-4" />
                    Receive
                  </Button>
                </div>

                {!hasPin && (
                  <div className="bg-chart-1/10 border border-chart-1/20 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Set up your wallet PIN</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Secure your transactions by setting up a 4-digit PIN
                    </p>
                    <Button size="sm" onClick={() => setPinDialogOpen(true)}>
                      Set PIN Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">USDT Balance</p>
                      <p className="text-2xl font-bold">{balance?.usdtBalance?.toFixed(2) || "0.00"}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-chart-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">KYC Status</p>
                      <p className="text-2xl font-bold">{user?.kycStatus || "Not Submitted"}</p>
                    </div>
                    <Shield className="h-8 w-8 text-chart-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet Address</p>
                      <p className="text-lg font-mono">{user?.walletAddress?.slice(0, 12)}...</p>
                    </div>
                    <Wallet className="h-8 w-8 text-chart-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction List */}
            <TransactionList walletAddress={user?.walletAddress || ""} />
          </div>
        )}

        {activeTab === "swap" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Swap</h2>
              <p className="text-muted-foreground">Exchange between KZC and USDT</p>
            </div>
            <SwapInterface />
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Wallet</h2>
              <p className="text-muted-foreground">Manage your crypto assets</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    KZC Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary mb-2">{balance?.balance?.toFixed(4) || "0.0000"}</p>
                  <p className="text-sm text-muted-foreground">
                    ≈ ${balance?.usdtEquivalent?.toFixed(2) || "0.00"} USD
                  </p>
                </CardContent>
              </Card>

              <Card className="border-chart-3/20 bg-gradient-to-br from-chart-3/5 to-chart-3/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-chart-3" />
                    USDT Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-chart-3 mb-2">{balance?.usdtBalance?.toFixed(2) || "0.00"}</p>
                  <p className="text-sm text-muted-foreground">Stablecoin Balance</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setSendDialogOpen(true)} size="lg" className="gap-2 h-14">
                <ArrowUpRight className="h-5 w-5" />
                <span className="text-base font-semibold">Send</span>
              </Button>
              <Button
                onClick={() => setReceiveDialogOpen(true)}
                variant="outline"
                size="lg"
                className="gap-2 h-14 border-2"
              >
                <ArrowDownLeft className="h-5 w-5" />
                <span className="text-base font-semibold">Receive</span>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>Your wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                    <code className="text-sm font-mono flex-1 break-all">{user?.walletAddress}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(user?.walletAddress || "")
                        toast({
                          title: "✓ Copied!",
                          description: "Wallet address copied to clipboard",
                          className: "bg-green-50 border-green-200 text-green-900",
                        })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current KZC Price</p>
                  <p className="text-2xl font-bold">${balance?.kzcPrice?.toFixed(4) || "0.0000"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList walletAddress={user?.walletAddress || ""} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your account details and personal information</CardDescription>
                </div>
                <Button onClick={() => setEditProfileOpen(true)} variant="outline" size="sm">
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* KYC Status Section */}
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      KYC Verification Status
                    </h4>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        user?.kycStatus === "Approved"
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : user?.kycStatus === "Pending"
                            ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                            : user?.kycStatus === "Rejected"
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {user?.kycStatus === "Approved" && (
                        <>
                          <span className="text-lg">✓</span>
                          Verified
                        </>
                      )}
                      {user?.kycStatus === "Pending" && (
                        <>
                          <span className="text-lg">⏳</span>
                          Pending Review
                        </>
                      )}
                      {user?.kycStatus === "Rejected" && (
                        <>
                          <span className="text-lg">✕</span>
                          Rejected
                        </>
                      )}
                      {user?.kycStatus === "Not Submitted" && (
                        <>
                          <span className="text-lg">○</span>
                          Not Submitted
                        </>
                      )}
                    </div>
                  </div>
                  {user?.kycStatus === "Not Submitted" && (
                    <Link href="/kyc">
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        Submit KYC Verification
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Personal Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">First Name</p>
                      <p className="font-medium text-lg">{user?.profile?.firstName || "Not set"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Last Name</p>
                      <p className="font-medium text-lg">{user?.profile?.lastName || "Not set"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium text-lg">{user?.phone || "Not set"}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold">Account Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium text-lg">{user?.username}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-lg">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold">Wallet Address</h4>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                    <code className="text-sm font-mono flex-1 break-all">{user?.walletAddress}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(user?.walletAddress || "")
                        toast({
                          title: "✓ Copied!",
                          description: "Wallet address copied to clipboard",
                          className: "bg-green-50 border-green-200 text-green-900",
                        })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold">Referral Code</h4>
                  <p className="text-sm text-muted-foreground">Share this code to earn referral bonuses</p>
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <code className="text-sm font-mono font-bold flex-1 text-primary">{user?.referralCode}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(user?.referralCode || "")
                        toast({
                          title: "✓ Copied!",
                          description: "Referral code copied to clipboard",
                          className: "bg-green-50 border-green-200 text-green-900",
                        })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your password and PIN</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <ChangePasswordDialog />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Change PIN</p>
                    <p className="text-sm text-muted-foreground">Update your wallet PIN</p>
                  </div>
                  <ChangePinDialog />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Reset PIN</p>
                    <p className="text-sm text-muted-foreground">Forgot your PIN? Reset it using your password</p>
                  </div>
                  <ResetPinDialog />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleLogout} variant="destructive" className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setTab("home")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "home" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setTab("swap")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "swap" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs font-medium">Swap</span>
            </button>

            <button
              onClick={() => setTab("wallet")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "wallet" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-medium">Wallet</span>
            </button>

            <button
              onClick={() => setTab("settings")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Dialogs */}
      <SendDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} onSuccess={fetchUserData} transferFee={1.5} />
      <ReceiveDialog
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        walletAddress={user?.walletAddress || ""}
      />
      <PinSetupDialog open={pinDialogOpen} onOpenChange={setPinDialogOpen} onSuccess={checkPin} />
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSuccess={fetchUserData}
        initialData={{
          firstName: user?.profile?.firstName,
          lastName: user?.profile?.lastName,
          phone: user?.phone,
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
