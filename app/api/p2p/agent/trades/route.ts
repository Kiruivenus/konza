import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status") // "pending" or "completed"

    const db = await getDb()
    const userId = new ObjectId(session.userId)

    const query: any = {
      $or: [{ sellerId: userId }, { buyerId: userId }],
    }

    if (status === "pending") {
      query.status = { $in: ["waiting_for_payment", "payment_confirmed"] }
    } else if (status === "completed") {
      query.status = "completed"
    }

    const trades = await db.collection("p2pTrades").find(query).sort({ createdAt: -1 }).toArray()

    return Response.json(trades, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching trades:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
