import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 })
    }

    const paymentMethods = user.paymentMethods || []
    return Response.json(paymentMethods, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching payment methods:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
