import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coins, TrendingUp, Shield, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Konza Coin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Mine, Trade & Manage <span className="text-primary">Konza Coin</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            A modern, secure cryptocurrency platform. Mine KZC before launch, send and receive tokens, and swap between
            KZC and USDT.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start Mining Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Mine KZC</h3>
            <p className="text-muted-foreground">
              Start mining Konza Coin before the official launch and build your balance.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Swap Tokens</h3>
            <p className="text-muted-foreground">Exchange KZC for USDT seamlessly with our integrated swap feature.</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-chart-3" />
            </div>
            <h3 className="text-xl font-semibold">Secure Wallet</h3>
            <p className="text-muted-foreground">Your own KZC wallet with PIN protection and transaction history.</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-chart-5" />
            </div>
            <h3 className="text-xl font-semibold">Earn Referrals</h3>
            <p className="text-muted-foreground">
              Invite friends and earn bonus KZC when they complete KYC verification.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-chart-3/10 border border-border rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Mining?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of miners building their KZC portfolio before the official launch.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-12">
              Create Your Wallet
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Konza Coin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
