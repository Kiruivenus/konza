import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getPasswordResetCollection } from "@/lib/db/collections"
import { generateResetToken } from "@/lib/email/tokens"
import { sendPasswordResetEmail } from "@/lib/email/smtp"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ email })

    if (!user) {
      // Return generic message for security
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link has been sent",
      })
    }

    const resetToken = generateResetToken()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const passwordResetCollection = await getPasswordResetCollection()
    await passwordResetCollection.insertOne({
      userId: user._id,
      email,
      token: resetToken,
      expiresAt,
      createdAt: new Date(),
    })

    try {
      await sendPasswordResetEmail(email, resetToken)
      console.log("[v0] Password reset email sent successfully to:", email)
    } catch (emailError) {
      console.error("[v0] Failed to send password reset email to:", email, emailError)
      // Continue anyway - the token is stored and user can request another email
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
