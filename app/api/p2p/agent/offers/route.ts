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
    const offers = await db
      .collection("p2pOffers")
      .find({ userId: new ObjectId(session.userId) })
      .toArray()

    return Response.json(offers, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching offers:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
