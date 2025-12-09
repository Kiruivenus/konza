export function generateQRCodeUrl(walletAddress: string): string {
  return `/api/qrcode?address=${encodeURIComponent(walletAddress)}`
}
