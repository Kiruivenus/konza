import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const db = await getDb()

    // Don't allow updating sensitive fields
    const { password, pin, walletAddress, ...safeUpdates } = updates

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...safeUpdates,
          updatedAt: new Date(),
        },
      },
    )

    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0, pin: 0 } })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("[v0] Edit user error:", error)
    return NextResponse.json({ error: "Failed to edit user" }, { status: 500 })
  }
}
