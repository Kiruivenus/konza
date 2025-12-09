import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/collections"
import { createSession } from "@/lib/session"
import { isTokenExpired } from "@/lib/tokens"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ email })

    if (!user || !user.twoFactorCode) {
      return NextResponse.json({ error: "Invalid 2FA session" }, { status: 400 })
    }

    if (isTokenExpired(user.twoFactorExpiresAt!)) {
      return NextResponse.json({ error: "2FA code has expired" }, { status: 400 })
    }

    if (user.twoFactorCode !== code) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 })
    }

    // Clear 2FA code
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { twoFactorCode: undefined, twoFactorExpiresAt: undefined } },
    )

    // Create session
    await createSession({
      userId: user._id!.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] 2FA verification error:", error)
    return NextResponse.json({ error: "Failed to verify 2FA code" }, { status: 500 })
  }
}
