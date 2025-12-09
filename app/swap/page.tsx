import { SwapInterface } from "@/components/swap/swap-interface"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SwapPage() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Swap</h1>
        <p className="text-muted-foreground">Exchange between KZC and USDT</p>
      </div>

      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription>
          KYC verification is required to use the swap feature. Complete your verification in Settings.
        </AlertDescription>
      </Alert>

      <SwapInterface />
    </div>
  )
}
