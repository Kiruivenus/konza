import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify admin role
    const db = await getDb()
    const admin = await db.collection("users").findOne({ _id: new ObjectId(session.userId), role: "admin" })
    if (!admin) {
      return Response.json({ message: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    const query = status === "all" ? {} : { status }

    const agents = await db.collection("agentApplications").find(query).sort({ createdAt: -1 }).toArray()

    return Response.json(agents)
  } catch (error) {
    console.error("[v0] Error fetching agents:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
