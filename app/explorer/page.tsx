import { TransactionSearch } from "@/components/explorer/transaction-search"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Coins } from "lucide-react"
import Link from "next/link"

export default function ExplorerPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Konza Coin</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Transaction Explorer</h1>
            <p className="text-muted-foreground">Search and verify any Konza Coin transaction on the blockchain</p>
          </div>

          <TransactionSearch />
        </div>
      </main>
    </div>
  )
}
