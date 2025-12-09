import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection, getTransactionsCollection, getSettingsCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"
import { generateTransactionHash } from "@/lib/utils/wallet"
import { verifyPin } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      console.log("[v0] Send failed: Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { receiverAddress, amount, pin, currency = "KZC" } = body

    console.log("[v0] Send request:", {
      userId: session.userId,
      receiverAddress,
      amount,
      currency,
      hasPin: !!pin,
    })

    if (!receiverAddress || !amount || !pin) {
      console.log("[v0] Send failed: Missing fields")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (amount <= 0) {
      console.log("[v0] Send failed: Invalid amount")
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const transactionsCollection = await getTransactionsCollection()
    const settingsCollection = await getSettingsCollection()

    // Get sender
    const sender = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (!sender) {
      console.log("[v0] Send failed: User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (sender.status === "banned") {
      console.log("[v0] Send failed: User banned")
      return NextResponse.json({ error: "Your account has been banned" }, { status: 403 })
    }

    if (sender.status === "suspended") {
      console.log("[v0] Send failed: User suspended")
      return NextResponse.json({ error: "Your account has been suspended" }, { status: 403 })
    }

    if (Array.isArray(sender.restrictions) && sender.restrictions.includes("transfer")) {
      console.log("[v0] Send failed: Transfer restricted")
      return NextResponse.json({ error: "Transfer feature is restricted for your account" }, { status: 403 })
    }

    // Verify PIN
    if (!sender.walletPin) {
      console.log("[v0] Send failed: No PIN set")
      return NextResponse.json({ error: "Please set up your wallet PIN first" }, { status: 400 })
    }

    const isPinValid = await verifyPin(pin, sender.walletPin)

    if (!isPinValid) {
      console.log("[v0] Send failed: Invalid PIN")
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }

    // Get receiver
    const receiver = await usersCollection.findOne({ walletAddress: receiverAddress })

    if (!receiver) {
      console.log("[v0] Send failed: Receiver not found")
      return NextResponse.json({ error: "Receiver wallet address not found" }, { status: 404 })
    }

    if (sender.walletAddress === receiverAddress) {
      console.log("[v0] Send failed: Cannot send to self")
      return NextResponse.json({ error: "Cannot send to yourself" }, { status: 400 })
    }

    // Get transaction fee
    const settings = await settingsCollection.findOne({})
    const fee = settings?.transferFee || 1.5

    const totalAmount = amount + fee

    if (currency === "USDT") {
      const senderUsdtBalance = sender.usdtBalance || 0
      console.log("[v0] USDT balance check:", { senderUsdtBalance, totalAmount })
      if (senderUsdtBalance < totalAmount) {
        return NextResponse.json({ error: "Insufficient USDT balance" }, { status: 400 })
      }
    } else {
      console.log("[v0] KZC balance check:", { senderBalance: sender.balance, totalAmount })
      if (sender.balance < totalAmount) {
        return NextResponse.json({ error: "Insufficient KZC balance" }, { status: 400 })
      }
    }

    // Generate transaction hash
    const hash = generateTransactionHash()

    // Create transaction
    await transactionsCollection.insertOne({
      hash,
      type: "send",
      sender: sender.walletAddress,
      receiver: receiverAddress,
      amount,
      fee,
      currency,
      status: "Success",
      timestamp: new Date(),
    })

    if (currency === "USDT") {
      await usersCollection.updateOne({ _id: sender._id }, { $inc: { usdtBalance: -totalAmount } })
      await usersCollection.updateOne({ _id: receiver._id }, { $inc: { usdtBalance: amount } })
    } else {
      await usersCollection.updateOne({ _id: sender._id }, { $inc: { balance: -totalAmount } })
      await usersCollection.updateOne({ _id: receiver._id }, { $inc: { balance: amount } })
    }

    console.log("[v0] Send successful:", { hash, amount, currency })

    return NextResponse.json({
      success: true,
      message: "Transaction successful",
      hash,
      amount,
      fee,
      currency,
      receiver: receiver.username,
    })
  } catch (error) {
    console.error("[v0] Send transaction error:", error)
    return NextResponse.json({ error: "Failed to send transaction" }, { status: 500 })
  }
}
