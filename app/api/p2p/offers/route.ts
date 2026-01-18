import { getP2POffersCollection, getP2PAgentsCollection } from "@/lib/db/collections"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") as "buy" | "sell"
    const coin = req.nextUrl.searchParams.get("coin")

    const offersCollection = await getP2POffersCollection()
    const agentsCollection = await getP2PAgentsCollection()

    const filter: any = {
      type,
      status: "active",
    }

    if (coin && coin !== "all") {
      filter.coin = coin
    }

    const offers = await offersCollection.find(filter).sort({ createdAt: -1 }).limit(50).toArray()

    // Enrich offers with agent info
    const enrichedOffers = await Promise.all(
      offers.map(async (offer) => {
        const agent = await agentsCollection.findOne({ _id: offer.agentId })
        return {
          ...offer,
          rating: agent?.rating || 0,
          completionRate: agent?.completionRate || 0,
        }
      }),
    )

    return NextResponse.json(enrichedOffers)
  } catch (error) {
    console.error("[v0] Error fetching P2P offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}
