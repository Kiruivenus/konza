import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"
import { hashPin, verifyPin } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { pin, currentPin } = body

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 })
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user already has a PIN, verify current PIN
    if (user.walletPin && currentPin) {
      const isValid = await verifyPin(currentPin, user.walletPin)
      if (!isValid) {
        return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 401 })
      }
    }

    const hashedPin = await hashPin(pin)

    await usersCollection.updateOne({ _id: user._id }, { $set: { walletPin: hashedPin } })

    return NextResponse.json({
      success: true,
      message: user.walletPin ? "PIN updated successfully" : "PIN set successfully",
    })
  } catch (error) {
    console.error("[v0] Set PIN error:", error)
    return NextResponse.json({ error: "Failed to set PIN" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      hasPin: !!user.walletPin,
    })
  } catch (error) {
    console.error("[v0] Check PIN error:", error)
    return NextResponse.json({ error: "Failed to check PIN" }, { status: 500 })
  }
}
