import { getDb } from "@/lib/mongodb"
import { sendAdminEmail } from "@/lib/email/smtp"
import { verifySession } from "@/lib/auth/session"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId || !session?.user?.role || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    const { type, recipients, subject, message } = body

    if (!type || !subject || !message) {
      console.log("[v0] Missing fields - type:", type, "subject:", subject, "message:", message)
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")
    let emails: string[] = []

    if (type === "single") {
      if (!recipients?.username) {
        return new Response(JSON.stringify({ error: "Username is required for single recipient" }), { status: 400 })
      }
      const user = await usersCollection.findOne({ username: recipients.username })
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
      }
      if (!user.email) {
        console.log("[v0] User has no email:", user.username)
        return new Response(JSON.stringify({ error: "User does not have an email address" }), { status: 400 })
      }
      emails = [user.email]
    } else if (type === "all") {
      const users = await usersCollection.find({}).toArray()
      emails = users.filter((u) => u.email).map((u) => u.email)
      console.log("[v0] Fetched", emails.length, "users with valid emails out of", users.length, "total users")
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 })
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients with valid email addresses found" }), { status: 404 })
    }

    console.log("[v0] Starting to send emails to", emails.length, "recipients")
    const emailResults = await Promise.allSettled(
      emails.map(async (email) => {
        try {
          await sendAdminEmail(email, subject, message)
          return { email, success: true }
        } catch (error) {
          console.error("[v0] Failed to send email to", email, ":", error)
          return { email, success: false, error: error instanceof Error ? error.message : String(error) }
        }
      }),
    )

    const successful = emailResults.filter((r) => r.status === "fulfilled" && r.value.success).length
    const failed = emailResults.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success),
    ).length

    console.log("[v0] Email sending complete - Successful:", successful, "Failed:", failed)

    // Log email sending activity
    const logsCollection = db.collection("email_logs")
    await logsCollection.insertOne({
      sentBy: session.userId,
      sentByUsername: session.user?.username,
      type: type,
      recipientCount: emails.length,
      successfulCount: successful,
      failedCount: failed,
      subject: subject,
      messagePreview: message.substring(0, 200),
      sentAt: new Date(),
    })

    if (failed > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Sent ${successful} email${successful !== 1 ? "s" : ""}, ${failed} failed. Check server logs for details.`,
          stats: { successful, failed },
        }),
        { status: 200 },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully to ${emails.length} recipient${emails.length !== 1 ? "s" : ""}`,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Send email error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to send email: " + (error instanceof Error ? error.message : String(error)) }),
      { status: 500 },
    )
  }
}
