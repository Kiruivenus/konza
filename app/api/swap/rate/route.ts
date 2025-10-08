import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const settings = await db.collection("settings").findOne({})
    const coinPrice = await db.collection("coinprice").findOne({}, { sort: { timestamp: -1 } })

    if (!settings || !coinPrice) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 })
    }

    return NextResponse.json({
      swapEnabled: settings.swapEnabled,
      minSwapAmount: settings.minSwapAmount,
      kzcToUsdt: coinPrice.price,
      usdtToKzc: 1 / coinPrice.price,
      swapFee: settings.swapFee || 0.01, // 1% default fee
    })
  } catch (error) {
    console.error("Get swap rate error:", error)
    return NextResponse.json({ error: "Failed to get swap rate" }, { status: 500 })
  }
}
