import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { type, accountName, accountNumber } = await request.json()

    if (!type || !accountName || !accountNumber) {
      return Response.json({ message: "Missing required fields" }, { status: 400 })
    }

    const validTypes = ["M-PESA", "Bank", "PayPal", "Airtel Money", "Crypto"]
    if (!validTypes.includes(type)) {
      return Response.json({ message: "Invalid payment method type" }, { status: 400 })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $push: {
          paymentMethods: {
            _id: new ObjectId(),
            type,
            accountName,
            accountNumber,
            isDefault: false,
            createdAt: new Date(),
          },
        },
      },
    )

    if (result.modifiedCount === 0) {
      return Response.json({ message: "Failed to add payment method" }, { status: 400 })
    }

    return Response.json({ message: "Payment method added successfully" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding payment method:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
