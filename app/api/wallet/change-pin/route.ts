import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPin, newPin } = await request.json()

    if (!currentPin || !newPin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: "PIN must be exactly 4 digits" }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.walletPin) {
      return NextResponse.json({ error: "No PIN set" }, { status: 400 })
    }

    // Verify current PIN
    const isPinValid = await bcrypt.compare(currentPin, user.walletPin)
    if (!isPinValid) {
      return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 401 })
    }

    // Hash new PIN
    const hashedPin = await bcrypt.hash(newPin, 10)

    // Update PIN
    await db.collection("users").updateOne({ _id: new ObjectId(session.userId) }, { $set: { walletPin: hashedPin } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change PIN error:", error)
    return NextResponse.json({ error: "Failed to change PIN" }, { status: 500 })
  }
}
