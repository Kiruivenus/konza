import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getEmailVerificationCollection } from "@/lib/db/collections"
import { isTokenExpired } from "@/lib/email/tokens"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const emailVerificationCollection = await getEmailVerificationCollection()
    const verification = await emailVerificationCollection.findOne({ email, code })

    if (!verification) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    if (isTokenExpired(verification.expiresAt)) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 })
    }

    // Mark email as verified
    const usersCollection = await getUsersCollection()
    await usersCollection.updateOne({ email }, { $set: { emailVerified: true, updatedAt: new Date() } })

    // Delete verification record
    await emailVerificationCollection.deleteOne({ _id: verification._id })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
