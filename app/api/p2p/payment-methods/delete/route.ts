import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { methodId } = await request.json()

    if (!methodId) {
      return Response.json({ message: "Method ID required" }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $pull: {
          paymentMethods: { _id: new ObjectId(methodId) },
        },
      },
    )

    if (result.modifiedCount === 0) {
      return Response.json({ message: "Payment method not found" }, { status: 404 })
    }

    return Response.json({ message: "Payment method deleted" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error deleting payment method:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
