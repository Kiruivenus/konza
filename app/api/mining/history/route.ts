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

    // Get mining history
    const history = await db
      .collection("mining")
      .find({ userId: new ObjectId(session.userId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Mining history error:", error)
    return NextResponse.json({ error: "Failed to get mining history" }, { status: 500 })
  }
}
