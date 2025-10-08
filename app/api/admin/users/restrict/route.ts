import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, restrictions } = await request.json()

    const db = await getDb()
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { restrictions, updatedAt: new Date() } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Restrict user error:", error)
    return NextResponse.json({ error: "Failed to update user restrictions" }, { status: 500 })
  }
}
