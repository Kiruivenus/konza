"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (requires2FA) {
        const response = await fetch("/api/auth/verify-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            code: formData.twoFactorCode,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Invalid 2FA code")
          return
        }

        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        return
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      if (data.requires2FA) {
        setRequires2FA(true)
        setError("")
        return
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-lg bg-white dark:bg-slate-900 rounded-3xl">
      <CardHeader className="pb-3">
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">Login</div>
          <CardTitle className="text-4xl font-bold">Welcome Back!</CardTitle>
          <CardDescription className="text-base mt-2">
            {requires2FA
              ? "Enter the 6-digit code sent to your email"
              : "Please enter your email and password to continue"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {registered && (
            <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200 px-4 py-3 rounded-xl text-sm">
              Account created successfully! Please login.
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {!requires2FA && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-emerald-700 dark:text-emerald-300 font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-emerald-700 dark:text-emerald-300 font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          )}

          {requires2FA && (
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode" className="text-emerald-700 dark:text-emerald-300 font-semibold">
                Verification Code
              </Label>
              <Input
                id="twoFactorCode"
                type="text"
                placeholder="000000"
                value={formData.twoFactorCode}
                onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value.slice(0, 6) })}
                maxLength={6}
                required
                className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">Check your email for the code</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {requires2FA ? "Verifying..." : "Logging in..."}
              </>
            ) : requires2FA ? (
              "Verify Code"
            ) : (
              "Login"
            )}
          </Button>

          {!requires2FA && (
            <p className="text-center text-sm text-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
