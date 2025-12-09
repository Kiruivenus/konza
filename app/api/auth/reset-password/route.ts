import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getPasswordResetCollection } from "@/lib/db/collections"
import { hashPassword } from "@/lib/auth/password"
import { isTokenExpired } from "@/lib/email/tokens"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const passwordResetCollection = await getPasswordResetCollection()
    const resetRecord = await passwordResetCollection.findOne({ token })

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    if (isTokenExpired(resetRecord.expiresAt)) {
      await passwordResetCollection.deleteOne({ _id: resetRecord._id })
      return NextResponse.json({ error: "Reset link has expired" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password
    const usersCollection = await getUsersCollection()
    await usersCollection.updateOne(
      { _id: resetRecord.userId },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
    )

    // Delete reset record
    await passwordResetCollection.deleteOne({ _id: resetRecord._id })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
