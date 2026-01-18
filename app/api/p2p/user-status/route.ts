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
    const agent = await db.collection("p2pAgents").findOne({
      userId: new ObjectId(session.userId),
    })

    return Response.json(
      {
        isAgent: !!agent,
        agentStatus: agent?.status || "none",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error fetching user status:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
