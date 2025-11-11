import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const priceConfig = await db.collection("coinprice").findOne({}, { sort: { timestamp: -1 } })

    if (!priceConfig) {
      return NextResponse.json({
        price: 1.25,
        trend: "stable",
        changePercentage: 0,
      })
    }

    const now = new Date()
    const phaseStartTime = new Date(priceConfig.phaseStartTime)
    const phaseEndTime = new Date(priceConfig.phaseEndTime)

    // Calculate elapsed time in the current phase
    const totalPhaseDuration = phaseEndTime.getTime() - phaseStartTime.getTime()
    const elapsedTime = now.getTime() - phaseStartTime.getTime()
    const progress = Math.min(elapsedTime / totalPhaseDuration, 1) // 0 to 1

    let currentPrice = priceConfig.basePrice

    if (priceConfig.trend === "rising") {
      const priceDiff = priceConfig.targetPrice - priceConfig.basePrice
      const trendPrice = priceConfig.basePrice + priceDiff * progress

      // Add random fluctuation around the trend line (±2% volatility)
      const volatilityRange = trendPrice * 0.02
      const randomFactor = (Math.random() - 0.5) * 2 // -1 to 1
      const volatility = volatilityRange * randomFactor
      currentPrice = trendPrice + volatility
    } else if (priceConfig.trend === "falling") {
      const priceDiff = priceConfig.basePrice - priceConfig.targetPrice
      const trendPrice = priceConfig.basePrice - priceDiff * progress

      // Add random fluctuation around the trend line (±2% volatility)
      const volatilityRange = trendPrice * 0.02
      const randomFactor = (Math.random() - 0.5) * 2 // -1 to 1
      const volatility = volatilityRange * randomFactor
      currentPrice = trendPrice + volatility
    } else if (priceConfig.trend === "stable") {
      // Random fluctuation within range
      const fluctuationRange = priceConfig.stableFluctuationRange || 0.5
      const randomFactor = (Math.random() - 0.5) * 2 // -1 to 1
      const fluctuation = ((priceConfig.basePrice * fluctuationRange) / 100) * randomFactor
      currentPrice = priceConfig.basePrice + fluctuation
    }

    // Calculate change percentage from base price
    const changePercentage = ((currentPrice - priceConfig.basePrice) / priceConfig.basePrice) * 100

    // Calculate time remaining in current phase
    const timeRemaining = Math.max(0, phaseEndTime.getTime() - now.getTime())
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

    return NextResponse.json({
      price: currentPrice,
      basePrice: priceConfig.basePrice,
      targetPrice: priceConfig.targetPrice,
      trend: priceConfig.trend,
      changePercentage,
      progress: progress * 100,
      timeRemaining: {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        total: timeRemaining,
      },
    })
  } catch (error) {
    console.error("[v0] Get current price error:", error)
    return NextResponse.json({ error: "Failed to get current price" }, { status: 500 })
  }
}
