import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const settings = await db.collection("settings").findOne({})

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    console.log("[v0] Updating settings with:", updates)

    const db = await getDb()

    const processedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (typeof value === "string" && !isNaN(Number(value))) {
        acc[key] = Number(value)
      } else {
        acc[key] = value
      }
      return acc
    }, {} as any)

    console.log("[v0] Processed updates:", processedUpdates)

    await db.collection("settings").updateOne(
      {},
      {
        $set: {
          ...processedUpdates,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    const settings = await db.collection("settings").findOne({})
    console.log("[v0] Updated settings:", settings)

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("[v0] Update settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
