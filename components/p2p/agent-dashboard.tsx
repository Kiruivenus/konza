"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Trash2, CheckCircle, Clock, TrendingUp, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AgentOffer {
  _id: string
  type: "buy" | "sell"
  coin: string
  pricePerCoin: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  status: "active" | "paused"
}

interface Trade {
  _id: string
  offerId: string
  buyerId: string
  sellerId: string
  amount: number
  coin: string
  totalPrice: number
  status: "waiting_for_payment" | "payment_confirmed" | "completed" | "cancelled"
  createdAt: Date
}

interface AgentStats {
  activeOffers: number
  totalTrades: number
  completedTrades: number
  pendingTrades: number
  completionRate: number
  totalEarnings: number
}

export function AgentDashboard() {
  const [offers, setOffers] = useState<AgentOffer[]>([])
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([])
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState({
    type: "buy" as const,
    coin: "KZC",
    pricePerCoin: "",
    minAmount: "",
    maxAmount: "",
    paymentMethods: [] as string[],
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchOffers(), fetchTrades(), fetchStats()])
  }

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/p2p/agent/offers")
      if (res.ok) {
        const data = await res.json()
        setOffers(data)
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrades = async () => {
    try {
      const [pendingRes, completedRes] = await Promise.all([
        fetch("/api/p2p/agent/trades?status=pending"),
        fetch("/api/p2p/agent/trades?status=completed"),
      ])

      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setPendingTrades(data)
      }

      if (completedRes.ok) {
        const data = await completedRes.json()
        setCompletedTrades(data)
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/p2p/agent/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/p2p/agent/create-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricePerCoin: Number.parseFloat(formData.pricePerCoin),
          minAmount: Number.parseFloat(formData.minAmount),
          maxAmount: Number.parseFloat(formData.maxAmount),
        }),
      })

      if (res.ok) {
        toast({ description: "Offer created successfully" })
        setFormData({ type: "buy", coin: "KZC", pricePerCoin: "", minAmount: "", maxAmount: "", paymentMethods: [] })
        setShowCreateForm(false)
        fetchOffers()
      } else {
        const error = await res.json()
        toast({ description: error.message || "Failed to create offer", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error creating offer:", error)
      toast({ description: "Failed to create offer", variant: "destructive" })
    }
  }

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const res = await fetch("/api/p2p/agent/delete-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      })

      if (res.ok) {
        toast({ description: "Offer deleted" })
        fetchOffers()
      }
    } catch (error) {
      console.error("Error deleting offer:", error)
      toast({ description: "Failed to delete offer", variant: "destructive" })
    }
  }

  const handleMarkPaid = async (tradeId: string) => {
    try {
      const res = await fetch("/api/p2p/trade/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      })

      if (res.ok) {
        toast({ description: "Payment marked as received" })
        fetchTrades()
      }
    } catch (error) {
      toast({ description: "Failed to mark payment", variant: "destructive" })
    }
  }

  const handleConfirmPayment = async (tradeId: string) => {
    try {
      const res = await fetch("/api/p2p/trade/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      })

      if (res.ok) {
        toast({ description: "Payment confirmed" })
        fetchTrades()
      }
    } catch (error) {
      toast({ description: "Failed to confirm payment", variant: "destructive" })
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="offers">My Offers</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-4">
        {stats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Offers</p>
                  <p className="text-2xl font-bold">{stats.activeOffers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{stats.totalTrades}</p>
                </div>
                <User className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </Card>
          </div>
        )}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Pending Orders:</span>
              <span className="font-medium">{stats?.pendingTrades || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Orders:</span>
              <span className="font-medium">{stats?.completedTrades || 0}</span>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="offers" className="mt-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid gap-4">
              {offers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No offers yet</p>
              ) : (
                offers.map((offer) => (
                  <Card key={offer._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-sm font-semibold px-2 py-1 rounded ${offer.type === "buy" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {offer.type.toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold">{offer.coin}</span>
                          <Badge variant={offer.status === "active" ? "default" : "secondary"}>{offer.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Price: {offer.pricePerCoin}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: {offer.minAmount} - {offer.maxAmount}
                        </p>
                        <p className="text-sm text-muted-foreground">Methods: {offer.paymentMethods.join(", ")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOffer(offer._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {!showCreateForm ? (
              <Button onClick={() => setShowCreateForm(true)} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Create Offer
              </Button>
            ) : (
              <Card className="p-4 space-y-4">
                <form onSubmit={handleCreateOffer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "buy" | "sell" })}
                        className="w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm"
                      >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Coin</label>
                      <select
                        value={formData.coin}
                        onChange={(e) => setFormData({ ...formData, coin: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm"
                      >
                        <option>KZC</option>
                        <option>USDT</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-sm font-medium">Price</label>
                      <input
                        type="number"
                        placeholder="Price per coin"
                        value={formData.pricePerCoin}
                        onChange={(e) => setFormData({ ...formData, pricePerCoin: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Min</label>
                      <input
                        type="number"
                        placeholder="Min amount"
                        value={formData.minAmount}
                        onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max</label>
                      <input
                        type="number"
                        placeholder="Max amount"
                        value={formData.maxAmount}
                        onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Create
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-4 space-y-4">
        {pendingTrades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending orders</p>
        ) : (
          <div className="space-y-3">
            {pendingTrades.map((trade) => (
              <Card key={trade._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">
                      {trade.amount} {trade.coin}
                    </h3>
                    <p className="text-sm text-muted-foreground">Total: ${trade.totalPrice.toFixed(2)}</p>
                  </div>
                  <Badge variant={trade.status === "payment_confirmed" ? "secondary" : "default"}>
                    {trade.status === "waiting_for_payment" && <Clock className="w-3 h-3 mr-1" />}
                    {trade.status === "payment_confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {trade.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {trade.status === "waiting_for_payment" && (
                    <Button size="sm" onClick={() => handleMarkPaid(trade._id)} className="flex-1">
                      Mark as Paid
                    </Button>
                  )}
                  {trade.status === "payment_confirmed" && (
                    <Button size="sm" onClick={() => handleConfirmPayment(trade._id)} className="flex-1">
                      Confirm Received
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-4 space-y-4">
        {completedTrades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No completed orders</p>
        ) : (
          <div className="space-y-3">
            {completedTrades.map((trade) => (
              <Card key={trade._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">
                      {trade.amount} {trade.coin}
                    </h3>
                    <p className="text-sm text-muted-foreground">Total: ${trade.totalPrice.toFixed(2)}</p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
