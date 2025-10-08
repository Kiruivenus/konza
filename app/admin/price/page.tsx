"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminPricePage() {
  const [currentPrice, setCurrentPrice] = useState<any>(null)
  const [livePrice, setLivePrice] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [basePrice, setBasePrice] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [trend, setTrend] = useState<"rising" | "falling" | "stable">("stable")
  const [risingDuration, setRisingDuration] = useState("24")
  const [fallingDuration, setFallingDuration] = useState("24")
  const [stableDuration, setStableDuration] = useState("24")
  const [stableFluctuationRange, setStableFluctuationRange] = useState("0.5")

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const fetchPrice = async () => {
    try {
      const res = await fetch("/api/admin/price")
      const data = await res.json()

      if (res.ok && data.coinPrice) {
        setCurrentPrice(data.coinPrice)
        setBasePrice(data.coinPrice.basePrice?.toString() || data.coinPrice.price?.toString() || "0.001")
        setTargetPrice(data.coinPrice.targetPrice?.toString() || data.coinPrice.price?.toString() || "0.001")
        setTrend(data.coinPrice.trend || "stable")
        setRisingDuration(data.coinPrice.risingDuration?.toString() || "24")
        setFallingDuration(data.coinPrice.fallingDuration?.toString() || "24")
        setStableDuration(data.coinPrice.stableDuration?.toString() || "24")
        setStableFluctuationRange(data.coinPrice.stableFluctuationRange?.toString() || "0.5")
        setError(null)
      } else {
        setError(data.error || "Failed to fetch price")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch price:", error)
      setError("Failed to fetch price data")
    } finally {
      setLoading(false)
    }
  }

  const fetchLivePrice = async () => {
    try {
      const res = await fetch("/api/price/current")
      const data = await res.json()
      if (res.ok) {
        setLivePrice(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch live price:", error)
    }
  }

  useEffect(() => {
    fetchPrice()
    fetchLivePrice()

    // Poll for live price every 10 seconds
    const interval = setInterval(fetchLivePrice, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdatePrice = async () => {
    const base = Number.parseFloat(basePrice)
    const target = Number.parseFloat(targetPrice)
    const rising = Number.parseFloat(risingDuration)
    const falling = Number.parseFloat(fallingDuration)
    const stable = Number.parseFloat(stableDuration)
    const fluctuation = Number.parseFloat(stableFluctuationRange)

    if (isNaN(base) || base <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid base price",
        variant: "destructive",
      })
      return
    }

    if (isNaN(target) || target <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid target price",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      const res = await fetch("/api/admin/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: base,
          targetPrice: target,
          trend,
          risingDuration: rising,
          fallingDuration: falling,
          stableDuration: stable,
          stableFluctuationRange: fluctuation,
        }),
      })

      if (res.ok) {
        toast({
          title: "✓ Success",
          description: "Price fluctuation settings updated successfully",
          duration: 5000,
        })
        fetchPrice()
        fetchLivePrice()
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update price",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Update price error:", error)
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Price Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "falling":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />
    }
  }

  const displayPrice = livePrice?.price ?? currentPrice?.price ?? 0
  const displayTrend = livePrice?.trend ?? currentPrice?.trend ?? "stable"
  const displayProgress = livePrice?.progress ?? 0
  const displayChange = livePrice?.changePercentage ?? 0
  const displayTimeRemaining = livePrice?.timeRemaining

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dynamic Price Management</h1>
        <p className="text-muted-foreground">Configure automatic price fluctuation for KZC coin</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Live Price
            </CardTitle>
            <CardDescription>Real-time KZC to USDT exchange rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-primary">${displayPrice.toFixed(6)}</p>
                <p className="text-sm text-muted-foreground mt-1">per KZC</p>
              </div>
              {getTrendIcon()}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trend</span>
                <span className="font-medium capitalize">{displayTrend}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{displayProgress.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Change</span>
                <span className={`font-medium ${displayChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {displayChange >= 0 ? "+" : ""}
                  {displayChange.toFixed(2)}%
                </span>
              </div>
              {displayTimeRemaining && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Time Remaining
                  </span>
                  <span className="font-medium">
                    {displayTimeRemaining.hours}h {displayTimeRemaining.minutes}m
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>Active fluctuation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span className="font-medium">${(currentPrice?.basePrice ?? 0).toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Price</span>
              <span className="font-medium">${(currentPrice?.targetPrice ?? 0).toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rising Duration</span>
              <span className="font-medium">{currentPrice?.risingDuration ?? 24}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Falling Duration</span>
              <span className="font-medium">{currentPrice?.fallingDuration ?? 24}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stable Duration</span>
              <span className="font-medium">{currentPrice?.stableDuration ?? 24}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stable Fluctuation</span>
              <span className="font-medium">±{currentPrice?.stableFluctuationRange ?? 0.5}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Price Fluctuation</CardTitle>
          <CardDescription>Set base price, target price, and fluctuation timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (USDT)</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.000001"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.000000"
              />
              <p className="text-xs text-muted-foreground">Starting price for current phase</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price (USDT)</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.000001"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.000000"
              />
              <p className="text-xs text-muted-foreground">Price to reach during rising/falling</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trend">Trend</Label>
            <Select value={trend} onValueChange={(value: any) => setTrend(value)}>
              <SelectTrigger id="trend">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rising">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Rising (Base → Target)
                  </div>
                </SelectItem>
                <SelectItem value="stable">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Stable (Random fluctuation)
                  </div>
                </SelectItem>
                <SelectItem value="falling">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Falling (Base → Target)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="risingDuration">Rising Duration (hours)</Label>
              <Input
                id="risingDuration"
                type="number"
                step="1"
                value={risingDuration}
                onChange={(e) => setRisingDuration(e.target.value)}
                placeholder="24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallingDuration">Falling Duration (hours)</Label>
              <Input
                id="fallingDuration"
                type="number"
                step="1"
                value={fallingDuration}
                onChange={(e) => setFallingDuration(e.target.value)}
                placeholder="24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stableDuration">Stable Duration (hours)</Label>
              <Input
                id="stableDuration"
                type="number"
                step="1"
                value={stableDuration}
                onChange={(e) => setStableDuration(e.target.value)}
                placeholder="24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stableFluctuationRange">Stable Fluctuation Range (%)</Label>
            <Input
              id="stableFluctuationRange"
              type="number"
              step="0.1"
              value={stableFluctuationRange}
              onChange={(e) => setStableFluctuationRange(e.target.value)}
              placeholder="0.5"
            />
            <p className="text-xs text-muted-foreground">
              Price will randomly fluctuate within ±{stableFluctuationRange}% during stable phase
            </p>
          </div>

          <Button onClick={handleUpdatePrice} disabled={updating} className="w-full" size="lg">
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Apply Fluctuation Settings"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
