import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get swap history
    const history = await db
      .collection("swaps")
      .find({ userId: new ObjectId(session.userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Swap history error:", error)
    return NextResponse.json({ error: "Failed to get swap history" }, { status: 500 })
  }
}
