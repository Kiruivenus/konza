import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const userId = new ObjectId(session.userId)

    const offers = await db.collection("p2pOffers").countDocuments({ userId, status: "active" })

    const trades = await db
      .collection("p2pTrades")
      .find({ $or: [{ sellerId: userId }, { buyerId: userId }] })
      .toArray()

    const completedTrades = trades.filter((t) => t.status === "completed").length
    const totalEarnings = trades.reduce((sum, trade) => {
      if (trade.sellerId?.toString() === userId.toString()) {
        return sum + (trade.totalPrice || 0)
      }
      return sum
    }, 0)

    const completionRate = trades.length > 0 ? Math.round((completedTrades / trades.length) * 100) : 0

    return Response.json({
      activeOffers: offers,
      totalTrades: trades.length,
      completedTrades,
      pendingTrades: trades.length - completedTrades,
      completionRate,
      totalEarnings,
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
