import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { offerId } = await request.json()

    if (!offerId) {
      return Response.json({ message: "Offer ID required" }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection("p2pOffers").deleteOne({
      _id: new ObjectId(offerId),
      userId: new ObjectId(session.userId),
    })

    if (result.deletedCount === 0) {
      return Response.json({ message: "Offer not found" }, { status: 404 })
    }

    return Response.json({ message: "Offer deleted" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error deleting offer:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
