"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeftRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Swap {
  _id: string
  userId: string
  userEmail: string
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  rate: number
  status: string
  timestamp: string
}

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSwaps()
  }, [])

  const fetchSwaps = async () => {
    try {
      const res = await fetch("/api/admin/swaps")
      const data = await res.json()

      if (res.ok) {
        setSwaps(data.swaps)
      }
    } catch (error) {
      console.error("Failed to fetch swaps:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Swap History</h1>
        <p className="text-muted-foreground">All token swaps on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Swaps ({swaps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {swaps.map((swap) => (
              <div key={swap._id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{swap.userEmail}</p>
                    <Badge variant={swap.status === "completed" ? "default" : "secondary"}>{swap.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold">
                      {swap.fromAmount.toFixed(4)} {swap.fromCurrency}
                    </span>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {swap.toAmount.toFixed(4)} {swap.toCurrency}
                    </span>
                    <span className="text-muted-foreground">@ {swap.rate.toFixed(4)}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {new Date(swap.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {swaps.length === 0 && <p className="text-center text-muted-foreground py-8">No swaps yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
