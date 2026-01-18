import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const admin = await db.collection("users").findOne({ _id: new ObjectId(session.userId), role: "admin" })
    if (!admin) {
      return Response.json({ message: "Admin access required" }, { status: 403 })
    }

    const { userId } = await request.json()

    await db.collection("p2pAgents").deleteOne({ userId: new ObjectId(userId) })
    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { isP2PAgent: false } })

    return Response.json({ message: "Agent status updated" })
  } catch (error) {
    console.error("Error toggling agent status:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
