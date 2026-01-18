import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { type, coin, pricePerCoin, minAmount, maxAmount, paymentMethods } = await request.json()

    if (!type || !coin || !pricePerCoin || !minAmount || !maxAmount || !paymentMethods?.length) {
      return Response.json({ message: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const agent = await db.collection("p2pAgents").findOne({
      userId: new ObjectId(session.userId),
      status: "approved",
    })

    if (!agent) {
      return Response.json({ message: "You must be an approved agent to create offers" }, { status: 403 })
    }

    const result = await db.collection("p2pOffers").insertOne({
      userId: new ObjectId(session.userId),
      agentId: agent._id,
      type,
      coin,
      pricePerCoin,
      minAmount,
      maxAmount,
      paymentMethods,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return Response.json({ message: "Offer created successfully", offerId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating offer:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
