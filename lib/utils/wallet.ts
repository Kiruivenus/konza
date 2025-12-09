export function generateWalletAddress(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let address = "KZC"
  for (let i = 0; i < 9; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return address
}

export function generateTransactionHash(): string {
  const chars = "ABCDEF0123456789"
  let hash = "0xKZC"
  for (let i = 0; i < 14; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return hash
}

export function generateReferralCode(username: string): string {
  const randomNum = Math.floor(Math.random() * 9999)
  return `${username}${randomNum}`
}
