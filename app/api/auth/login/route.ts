import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/db/collections"
import { verifyPassword } from "@/lib/auth/password"
import { createSession } from "@/lib/auth/session"
import { send2FAEmail } from "@/lib/email/smtp"
import { generate6DigitCode } from "@/lib/email/tokens"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()

    const user = await usersCollection.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 403 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (user.twoFactorEnabled) {
      const twoFactorCode = generate6DigitCode()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      await usersCollection.updateOne({ _id: user._id }, { $set: { twoFactorCode, twoFactorExpiresAt: expiresAt } })

      await send2FAEmail(email, twoFactorCode)

      return NextResponse.json({
        success: false,
        requires2FA: true,
        message: "2FA code sent to your email",
      })
    }

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
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
