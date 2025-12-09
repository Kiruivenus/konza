import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/db/collections"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enabled } = body

    const usersCollection = await getUsersCollection()
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.userId) },
      { $set: { twoFactorEnabled: enabled, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `2FA ${enabled ? "enabled" : "disabled"} successfully`,
    })
  } catch (error) {
    console.error("[v0] Toggle 2FA error:", error)
    return NextResponse.json({ error: "Failed to update 2FA setting" }, { status: 500 })
  }
}
