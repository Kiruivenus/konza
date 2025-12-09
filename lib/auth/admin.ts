import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getUsersCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function getAdminUser(req: NextRequest) {
  try {
    const session = await verifySession()

    if (!session || session.role !== "admin") {
      return null
    }

    const usersCollection = await getUsersCollection()
    const admin = await usersCollection.findOne({
      _id: new ObjectId(session.userId),
      role: "admin",
    })

    return admin
  } catch (error) {
    console.error("[v0] Get admin user error:", error)
    return null
  }
}
