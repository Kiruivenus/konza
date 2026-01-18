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

    // Update application status
    await db
      .collection("agentApplications")
      .updateOne({ userId: new ObjectId(userId) }, { $set: { status: "approved", updatedAt: new Date() } })

    // Create agent record
    await db.collection("p2pAgents").insertOne({
      userId: new ObjectId(userId),
      status: "active",
      rating: 5,
      completionRate: 0,
      totalTrades: 0,
      createdAt: new Date(),
    })

    // Update user as agent
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { isP2PAgent: true, p2pAgentStatus: "approved" } })

    return Response.json({ message: "Agent approved successfully" })
  } catch (error) {
    console.error("Error approving agent:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
