import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { send2FAEmail } from "@/lib/email/smtp"
import { generate6DigitCode, storeVerificationCode, verifyCode } from "@/lib/email/tokens"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    const { action, code } = body

    if (action === "send-code") {
      const db = await getDb()
      const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })

      if (!user?.email) {
        return new Response(JSON.stringify({ error: "User email not found" }), { status: 400 })
      }

      const verificationCode = generate6DigitCode()
      await storeVerificationCode(session.userId, verificationCode, "disable_2fa")

      // Send email
      await send2FAEmail(user.email, verificationCode)

      return new Response(JSON.stringify({ success: true, message: "Verification code sent to your email" }), {
        status: 200,
      })
    } else if (action === "verify-code") {
      if (!code) {
        return new Response(JSON.stringify({ error: "Verification code is required" }), { status: 400 })
      }

      // Verify the code
      const isValid = await verifyCode(session.userId, code, "disable_2fa")

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid or expired verification code" }), { status: 400 })
      }

      return new Response(JSON.stringify({ success: true, message: "Code verified successfully" }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 })
  } catch (error) {
    console.error("[v0] Verify 2FA disable error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to verify 2FA disable: " + (error instanceof Error ? error.message : String(error)),
      }),
      { status: 500 },
    )
  }
}
