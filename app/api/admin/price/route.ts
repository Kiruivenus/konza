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
    const coinPrice = await db.collection("coinprice").findOne({}, { sort: { timestamp: -1 } })

    return NextResponse.json({ coinPrice })
  } catch (error) {
    console.error("Get price error:", error)
    return NextResponse.json({ error: "Failed to get price" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { basePrice, targetPrice, trend, risingDuration, fallingDuration, stableDuration, stableFluctuationRange } =
      await request.json()

    console.log("[v0] Price update request:", {
      basePrice,
      targetPrice,
      trend,
      risingDuration,
      fallingDuration,
      stableDuration,
      stableFluctuationRange,
    })

    if (!basePrice || basePrice <= 0) {
      return NextResponse.json({ error: "Invalid base price" }, { status: 400 })
    }

    if (!["rising", "falling", "stable"].includes(trend)) {
      return NextResponse.json({ error: "Invalid trend" }, { status: 400 })
    }

    const db = await getDb()

    // Get previous price to calculate change
    const previousPrice = await db.collection("coinprice").findOne({}, { sort: { timestamp: -1 } })
    const changePercentage = previousPrice ? ((basePrice - previousPrice.price) / previousPrice.price) * 100 : 0

    const now = new Date()
    let phaseDuration = stableDuration || 24 // Default 24 hours for stable

    if (trend === "rising") {
      phaseDuration = risingDuration || 24
    } else if (trend === "falling") {
      phaseDuration = fallingDuration || 24
    }

    const phaseEndTime = new Date(now.getTime() + phaseDuration * 60 * 60 * 1000)

    const newPrice = {
      price: basePrice,
      basePrice,
      targetPrice: targetPrice || basePrice,
      trend,
      changePercentage,
      risingDuration: risingDuration || 24,
      fallingDuration: fallingDuration || 24,
      stableDuration: stableDuration || 24,
      stableFluctuationRange: stableFluctuationRange || 0.5,
      phaseStartTime: now,
      phaseEndTime,
      timestamp: now,
      updatedBy: session.userId,
    }

    console.log("[v0] Inserting new price:", newPrice)

    await db.collection("coinprice").insertOne(newPrice)

    return NextResponse.json({ success: true, coinPrice: newPrice })
  } catch (error) {
    console.error("[v0] Update price error:", error)
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 })
  }
}
