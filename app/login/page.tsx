import { LoginForm } from "@/components/auth/login-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function LoginFormSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Login to your Konza Coin account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-emerald-50 to-emerald-100 dark:via-emerald-950 dark:to-emerald-900 relative overflow-hidden flex flex-col justify-start pt-2 p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/30 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 dark:bg-emerald-800/20 rounded-full blur-3xl -ml-40 -mb-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-4">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
