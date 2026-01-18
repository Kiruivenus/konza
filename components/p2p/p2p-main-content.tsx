"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentDashboard } from "./agent-dashboard"
import { PaymentMethodsContent } from "./payment-methods-content"
import { ApplyAgentContent } from "./apply-agent-content"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings } from "lucide-react"

interface UserStatus {
  isP2PAgent: boolean
  agentStatus: string
}

interface Offer {
  _id: string
  agentId: string
  username: string
  coin: "KZC" | "USDT"
  type: "buy" | "sell"
  price: number
  minLimit: number
  maxLimit: number
  available: number
  paymentMethods: string[]
  rating: number
  completionRate: number
}

export function P2PMainContent() {
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"buy" | "sell">("buy")
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedCoin, setSelectedCoin] = useState<"KZC" | "USDT" | "all">("all")
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "rating">("price-low")
  const [offersLoading, setOffersLoading] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState<"browse" | "agent">("browse")

  useEffect(() => {
    const loadUserStatus = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          const isAgent = data.isP2PAgent === true
          setUserStatus({
            isP2PAgent: isAgent,
            agentStatus: data.p2pAgentStatus || "none",
          })
          console.log("[v0] User agent status - isP2PAgent:", data.isP2PAgent, "p2pAgentStatus:", data.p2pAgentStatus)
          if (isAgent) {
            setActiveMainTab("agent")
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch user status:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserStatus()
  }, [])

  useEffect(() => {
    if (activeMainTab === "browse" && !userStatus?.isP2PAgent) {
      fetchOffers()
    }
  }, [tab, selectedCoin, sortBy, activeMainTab, userStatus])

  const fetchOffers = async () => {
    setOffersLoading(true)
    try {
      const res = await fetch(`/api/p2p/offers?type=${tab}&coin=${selectedCoin}&sort=${sortBy}`)
      if (res.ok) {
        const data = await res.json()
        setOffers(data)
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error)
    } finally {
      setOffersLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading your P2P dashboard...</div>

  if (userStatus?.agentStatus === "pending") {
    return (
      <div className="space-y-4">
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm font-medium text-yellow-800">
            Your agent application is pending admin review. You will be able to create offers once approved.
          </p>
        </Card>
      </div>
    )
  }

  if (userStatus?.isP2PAgent) {
    return (
      <Tabs value={activeMainTab} onValueChange={(value) => setActiveMainTab(value as "browse" | "agent" | "settings")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Offers</TabsTrigger>
          <TabsTrigger value="agent">Agent Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Browse Offers Tab - Same as normal users */}
        <TabsContent value="browse" className="mt-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">P2P Trading</h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-2">
                <span className="text-sm font-medium self-center">Type:</span>
                <Button variant={tab === "buy" ? "default" : "outline"} size="sm" onClick={() => setTab("buy")}>
                  Buy
                </Button>
                <Button variant={tab === "sell" ? "default" : "outline"} size="sm" onClick={() => setTab("sell")}>
                  Sell
                </Button>
              </div>

              <div className="flex gap-2">
                <span className="text-sm font-medium self-center">Coin:</span>
                <Button
                  variant={selectedCoin === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedCoin === "KZC" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("KZC")}
                >
                  KZC
                </Button>
                <Button
                  variant={selectedCoin === "USDT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("USDT")}
                >
                  USDT
                </Button>
              </div>

              <div className="flex gap-2">
                <span className="text-sm font-medium self-center">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border rounded-lg bg-background text-sm"
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>

            {offersLoading ? (
              <div className="text-center py-8">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No {tab} offers available</div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <Link key={offer._id} href={`/p2p/trade/${offer._id}`}>
                    <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{offer.username}</h3>
                          <Badge className="mt-1">{offer.coin}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{offer.price}</div>
                          <div className="text-sm text-muted-foreground">{offer.coin}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium">
                            {offer.available} {offer.coin}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Limits:</span>
                          <span className="font-medium">
                            {offer.minLimit} - {offer.maxLimit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            <span className="font-medium">{offer.rating}</span>
                            <span className="text-xs text-muted-foreground">({offer.completionRate}%)</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Agent Dashboard Tab - Full agent features */}
        <TabsContent value="agent">
          <AgentDashboard />
        </TabsContent>

        {/* Settings Tab for agents */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <PaymentMethodsContent />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  // Normal users see browse offers with settings sheet
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">P2P Trading</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full bg-transparent">
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96 p-0">
            <div className="h-full overflow-y-auto">
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle>Agent & Payment Settings</SheetTitle>
                <SheetDescription>Manage your payment methods and apply to become an agent</SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6">
                <Tabs defaultValue="payment" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payment">Payment Method</TabsTrigger>
                    <TabsTrigger value="agent">Become Agent</TabsTrigger>
                  </TabsList>

                  <TabsContent value="payment" className="mt-4 max-h-96 overflow-y-auto pr-2">
                    <PaymentMethodsContent />
                  </TabsContent>

                  <TabsContent value="agent" className="mt-4 max-h-96 overflow-y-auto pr-2">
                    <ApplyAgentContent />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Type:</span>
            <Button variant={tab === "buy" ? "default" : "outline"} size="sm" onClick={() => setTab("buy")}>
              Buy
            </Button>
            <Button variant={tab === "sell" ? "default" : "outline"} size="sm" onClick={() => setTab("sell")}>
              Sell
            </Button>
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Coin:</span>
            <Button
              variant={selectedCoin === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCoin("all")}
            >
              All
            </Button>
            <Button
              variant={selectedCoin === "KZC" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCoin("KZC")}
            >
              KZC
            </Button>
            <Button
              variant={selectedCoin === "USDT" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCoin("USDT")}
            >
              USDT
            </Button>
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded-lg bg-background text-sm"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>

        {offersLoading ? (
          <div className="text-center py-8">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No {tab} offers available</div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <Link key={offer._id} href={`/p2p/trade/${offer._id}`}>
                <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{offer.username}</h3>
                      <Badge className="mt-1">{offer.coin}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{offer.price}</div>
                      <div className="text-sm text-muted-foreground">{offer.coin}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-medium">
                        {offer.available} {offer.coin}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Limits:</span>
                      <span className="font-medium">
                        {offer.minLimit} - {offer.maxLimit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-medium">{offer.rating}</span>
                        <span className="text-xs text-muted-foreground">({offer.completionRate}%)</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
