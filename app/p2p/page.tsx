"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Link from "next/link"

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

export default function P2PPage() {
  const [tab, setTab] = useState<"buy" | "sell">("buy")
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<"KZC" | "USDT" | "all">("all")

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`/api/p2p/offers?type=${tab}&coin=${selectedCoin}`)
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

    fetchOffers()
  }, [tab, selectedCoin])

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">P2P Trading</h1>
          <p className="text-muted-foreground">Buy and sell KZC and USDT with verified agents</p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as "buy" | "sell")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="flex gap-2 mb-4">
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

            {loading ? (
              <div className="text-center py-8">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No buy offers available</div>
            ) : (
              offers.map((offer) => (
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
              ))
            )}
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="flex gap-2 mb-4">
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

            {loading ? (
              <div className="text-center py-8">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No sell offers available</div>
            ) : (
              offers.map((offer) => (
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
