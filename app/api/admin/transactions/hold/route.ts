import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transactionId } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const db = await getDb()

    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          status: "Held",
          heldAt: new Date(),
          heldBy: session.username,
        },
      },
    )

    return NextResponse.json({ success: true, message: "Transaction held successfully" })
  } catch (error) {
    console.error("[v0] Hold transaction error:", error)
    return NextResponse.json({ error: "Failed to hold transaction" }, { status: 500 })
  }
}
