import { randomBytes } from "crypto"

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
