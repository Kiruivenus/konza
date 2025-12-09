"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SwapRate {
  swapEnabled: boolean
  minSwapAmount: number
  kzcToUsdt: number
  usdtToKzc: number
  swapFee: number
  priceInfo?: {
    trend: string
    changePercentage: number
    progress: number
  }
}

interface SwapHistory {
  _id: string
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  rate: number
  fee: number
  timestamp: string
}

export function SwapInterface() {
  const [fromCurrency, setFromCurrency] = useState<"KZC" | "USDT">("KZC")
  const [toCurrency, setToCurrency] = useState<"KZC" | "USDT">("USDT")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [rate, setRate] = useState<SwapRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [swapping, setSwapping] = useState(false)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pin, setPin] = useState("")
  const [history, setHistory] = useState<SwapHistory[]>([])
  const [userRestriction, setUserRestriction] = useState<string | null>(null)
  const [userStatus, setUserStatus] = useState<string>("active")
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [swapResult, setSwapResult] = useState<{
    open: boolean
    isSuccess: boolean
    title: string
    description: string
  }>({
    open: false,
    isSuccess: false,
    title: "",
    description: "",
  })
  const { toast } = useToast()

  const fetchUserRestrictions = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (res.ok && data.user) {
        setUserStatus(data.user.status || "active")
        setKycStatus(data.user.kycStatus || null)
        if (data.user.status === "banned") {
          setUserRestriction("Your account has been banned and cannot perform swaps.")
        } else if (data.user.status === "suspended") {
          setUserRestriction("Your account has been suspended. Please contact support.")
        } else if (Array.isArray(data.user.restrictions) && data.user.restrictions.includes("swap")) {
          setUserRestriction("Swap feature is restricted for your account. Contact support for more information.")
        } else if (data.user.kycStatus?.toLowerCase() !== "approved") {
          setUserRestriction("KYC verification is required to swap. Please complete your KYC first.")
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user restrictions:", error)
    }
  }

  const fetchRate = async () => {
    try {
      const res = await fetch("/api/swap/rate")
      const data = await res.json()

      if (res.ok) {
        setRate(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch swap rate:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/swap/history")
      const data = await res.json()

      if (res.ok) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch swap history:", error)
    }
  }

  useEffect(() => {
    fetchUserRestrictions()
    fetchRate()
    fetchHistory()

    const priceInterval = setInterval(() => {
      fetchRate()
    }, 5000)

    return () => clearInterval(priceInterval)
  }, [])

  useEffect(() => {
    if (fromAmount && rate) {
      const amount = Number.parseFloat(fromAmount)
      if (!isNaN(amount)) {
        const currentRate = fromCurrency === "KZC" ? rate.kzcToUsdt : rate.usdtToKzc
        const received = amount * currentRate * (1 - rate.swapFee)
        setToAmount(received.toFixed(6))
      } else {
        setToAmount("")
      }
    } else {
      setToAmount("")
    }
  }, [fromAmount, fromCurrency, rate])

  const handleFlip = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setFromAmount(toAmount)
  }

  const handleSwap = () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (rate && Number.parseFloat(fromAmount) < rate.minSwapAmount) {
      toast({
        title: "Error",
        description: `Minimum swap amount is ${rate.minSwapAmount} ${fromCurrency}`,
        variant: "destructive",
      })
      return
    }

    setShowPinDialog(true)
  }

  const executeSwap = async () => {
    if (!pin) {
      toast({
        title: "Error",
        description: "Please enter your PIN",
        variant: "destructive",
      })
      return
    }

    setSwapping(true)
    try {
      const res = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromCurrency,
          toCurrency,
          amount: Number.parseFloat(fromAmount),
          pin,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSwapResult({
          open: true,
          isSuccess: true,
          title: "Swap Successful!",
          description: `Successfully swapped ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`,
        })
        setFromAmount("")
        setToAmount("")
        setPin("")
        setShowPinDialog(false)
        setTimeout(() => {
          fetchHistory()
          fetchRate()
        }, 2000)
      } else {
        let errorMessage = data.error || "Failed to execute swap. Please try again."

        if (data.error?.includes("Invalid PIN")) {
          errorMessage = "Wrong PIN. Please try again."
        } else if (data.error?.includes("Insufficient")) {
          errorMessage = data.error
        } else if (data.error?.includes("KYC")) {
          errorMessage = "KYC verification required for swaps. Please complete your KYC first."
        } else if (data.error?.includes("banned")) {
          errorMessage = "Your account has been banned and cannot perform swaps."
        } else if (data.error?.includes("suspended")) {
          errorMessage = "Your account has been suspended. Please contact support."
        } else if (data.error?.includes("restricted")) {
          errorMessage = "Swap feature is restricted for your account. Contact support for more information."
        } else if (data.error?.includes("disabled")) {
          errorMessage = "Swaps are currently disabled by the platform."
        }

        setSwapResult({
          open: true,
          isSuccess: false,
          title: "Swap Failed",
          description: errorMessage,
        })
        setPin("")
      }
    } catch (error) {
      setSwapResult({
        open: true,
        isSuccess: false,
        title: "Network Error",
        description: "Failed to connect to server. Please check your connection and try again.",
      })
      setPin("")
    } finally {
      setSwapping(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!rate?.swapEnabled) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Swaps are currently disabled. Please check back later.</AlertDescription>
      </Alert>
    )
  }

  const currentRate = fromCurrency === "KZC" ? rate.kzcToUsdt : rate.usdtToKzc
  const feeAmount = fromAmount ? (Number.parseFloat(fromAmount) * rate.swapFee).toFixed(6) : "0"

  return (
    <div className="space-y-6">
      {userRestriction && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive font-medium">{userRestriction}</AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl">Swap Tokens</CardTitle>
          <CardDescription>Exchange KZC for USDT and vice versa instantly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Currency */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="w-24 flex items-center justify-center font-semibold text-lg border rounded-md bg-muted">
                {fromCurrency}
              </div>
            </div>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={handleFlip} className="rounded-full bg-transparent">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label>To (estimated)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input type="text" placeholder="0.00" value={toAmount} readOnly className="text-lg bg-muted" />
              </div>
              <div className="w-24 flex items-center justify-center font-semibold text-lg border rounded-md bg-muted">
                {toCurrency}
              </div>
            </div>
          </div>

          {/* Swap Details */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate (Live)</span>
              <span className="font-medium">
                1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fee ({(rate.swapFee * 100).toFixed(1)}%)</span>
              <span className="font-medium">
                {feeAmount} {fromCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minimum Amount</span>
              <span className="font-medium">
                {rate.minSwapAmount} {fromCurrency}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSwap}
            className="w-full"
            size="lg"
            disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0 || !!userRestriction}
          >
            Swap {fromCurrency} to {toCurrency}
          </Button>
        </CardContent>
      </Card>

      {/* Swap History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Swap History</CardTitle>
            <CardDescription>Your recent swaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {item.fromCurrency} → {item.toCurrency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">
                      -{item.fromAmount.toFixed(4)} {item.fromCurrency}
                    </p>
                    <p className="text-sm text-primary">
                      +{item.toAmount.toFixed(4)} {item.toCurrency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Swap</DialogTitle>
            <DialogDescription>Enter your 4-digit PIN to authorize this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Swap Summary */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 space-y-3 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You're swapping</span>
                <span className="font-semibold text-lg">
                  {fromAmount} {fromCurrency}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <ArrowDownUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You'll receive</span>
                <span className="font-semibold text-lg text-primary">
                  {toAmount} {toCurrency}
                </span>
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-3">
              <Label htmlFor="pin" className="text-base font-semibold">
                Enter PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className="text-center text-2xl tracking-widest h-14"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">Your PIN is required to authorize this swap</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPinDialog(false)
                  setPin("")
                }}
                className="flex-1"
                disabled={swapping}
              >
                Cancel
              </Button>
              <Button onClick={executeSwap} disabled={swapping || pin.length !== 4} className="flex-1" size="lg">
                {swapping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Confirm Swap"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={swapResult.open} onOpenChange={(open) => setSwapResult({ ...swapResult, open })}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-6">
            {swapResult.isSuccess ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-green-600">{swapResult.title}</h2>
                  <p className="text-muted-foreground">{swapResult.description}</p>
                </div>
                <Button onClick={() => setSwapResult({ ...swapResult, open: false })} className="w-full mt-4">
                  Done
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-red-600">{swapResult.title}</h2>
                  <p className="text-muted-foreground text-sm">{swapResult.description}</p>
                </div>
                <Button
                  onClick={() => setSwapResult({ ...swapResult, open: false })}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
