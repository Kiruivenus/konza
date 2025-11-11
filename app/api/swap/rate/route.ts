import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const settings = await db.collection("settings").findOne({})

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 })
    }

    const priceRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/price/current`)
    const priceData = await priceRes.json()

    if (!priceRes.ok || !priceData.price) {
      console.error("[v0] Failed to fetch live price:", priceData)
      return NextResponse.json({ error: "Failed to fetch current price" }, { status: 500 })
    }

    const livePrice = priceData.price

    return NextResponse.json({
      swapEnabled: settings.swapEnabled,
      minSwapAmount: settings.minSwapAmount,
      kzcToUsdt: livePrice,
      usdtToKzc: 1 / livePrice,
      swapFee: settings.swapFee || 0.01,
      priceInfo: {
        trend: priceData.trend,
        changePercentage: priceData.changePercentage,
        progress: priceData.progress,
      },
    })
  } catch (error) {
    console.error("[v0] Get swap rate error:", error)
    return NextResponse.json({ error: "Failed to get swap rate" }, { status: 500 })
  }
}
