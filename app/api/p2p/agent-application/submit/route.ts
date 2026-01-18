import { getDb } from "@/lib/mongodb"
import { verifySession } from "@/lib/auth/session"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { tradingExperience, businessDetails, paymentMethods } = await request.json()

    if (!tradingExperience || !businessDetails || !paymentMethods?.length) {
      return Response.json({ message: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const usersCollection = db.collection("users")
    const applicationsCollection = db.collection("agentApplications")

    // Check if user is KYC verified
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })
    if (!user || user.kycStatus !== "Approved") {
      return Response.json({ message: "KYC verification required to apply for agent status" }, { status: 403 })
    }

    if (!user.twoFactorEnabled) {
      return Response.json({ message: "2FA must be enabled to apply for agent status" }, { status: 403 })
    }

    const existingAgent = await db.collection("p2p_agents").findOne({ userId: new ObjectId(session.userId) })
    if (existingAgent) {
      return Response.json({ message: "You are already an agent" }, { status: 400 })
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(session.userId) },
      { $set: { p2pAgentStatus: "pending", p2pApplicationSubmittedAt: new Date() } },
    )

    // Create application
    const result = await applicationsCollection.insertOne({
      userId: new ObjectId(session.userId),
      username: user.username,
      email: user.email,
      tradingExperience: Number.parseInt(tradingExperience),
      businessDetails,
      paymentMethods,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return Response.json(
      { message: "Application submitted successfully", applicationId: result.insertedId },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error submitting agent application:", error)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}
