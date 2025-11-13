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

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref") || ""

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: referralCode,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          phone: formData.phone,
          password: formData.password,
          referralCode: formData.referralCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      // Redirect to login
      router.push("/login?registered=true")
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
          <div className="text-sm text-muted-foreground mb-2">Sign Up</div>
          <CardTitle className="text-4xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-base mt-2">Enter the details below to create an account</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-emerald-700 dark:text-emerald-300 font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-emerald-700 dark:text-emerald-300 font-semibold">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Donnie"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-emerald-700 dark:text-emerald-300 font-semibold">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254712345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-emerald-700 dark:text-emerald-300 font-semibold">
              Referral code(Optional)
            </Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="EXF6SD"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-emerald-700 dark:text-emerald-300 font-semibold">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 rounded-xl h-12 text-base pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            By pressing continue you agree to our{" "}
            <Link href="/terms" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              privacy policy
            </Link>
          </p>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-base transition-all duration-200 hover:shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Continue"
            )}
          </Button>

          <p className="text-center text-sm text-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
