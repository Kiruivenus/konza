import { randomBytes } from "crypto"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface TokenData {
  code: string
  expiresAt: Date
}

// Generate random code
export function generateVerificationCode(): string {
  return randomBytes(3).toString("hex").toUpperCase().slice(0, 6)
}

// Generate 6-digit code for easier input
export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Check if token is expired
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function generateResetToken(): string {
  return randomBytes(32).toString("hex")
}

export async function storeVerificationCode(
  userId: string,
  code: string,
  type: "disable_2fa" | "email_verification" | "password_reset" = "email_verification",
): Promise<void> {
  try {
    const db = await getDb()
    const verificationCodesCollection = db.collection("verification_codes")

    // Set expiration: 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await verificationCodesCollection.updateOne(
      { userId: new ObjectId(userId), type },
      {
        $set: {
          userId: new ObjectId(userId),
          code,
          type,
          expiresAt,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )
  } catch (error) {
    console.error("[v0] Failed to store verification code:", error)
    throw new Error("Failed to store verification code")
  }
}

export async function verifyCode(
  userId: string,
  code: string,
  type: "disable_2fa" | "email_verification" | "password_reset" = "email_verification",
): Promise<boolean> {
  try {
    const db = await getDb()
    const verificationCodesCollection = db.collection("verification_codes")

    const record = await verificationCodesCollection.findOne({
      userId: new ObjectId(userId),
      code,
      type,
    })

    if (!record) {
      return false
    }

    // Check if code is expired
    if (isTokenExpired(record.expiresAt)) {
      // Delete expired code
      await verificationCodesCollection.deleteOne({ _id: record._id })
      return false
    }

    // Delete the code after successful verification
    await verificationCodesCollection.deleteOne({ _id: record._id })

    return true
  } catch (error) {
    console.error("[v0] Failed to verify code:", error)
    return false
  }
}
