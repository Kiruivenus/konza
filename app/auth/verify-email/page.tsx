"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Verification failed. Please try again.")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      setError("Failed to verify email. Please try again.")
      console.error("[v0] Verify email error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 pt-2">
        <Card className="w-full max-w-md border-green-200 bg-white/95 backdrop-blur shadow-lg">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4 animate-bounce">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-700 font-medium mb-2">Welcome to Konza Coin!</p>
              <p className="text-sm text-gray-600">
                Your email has been successfully verified. Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex flex-col items-center justify-center p-4 pt-4 sm:pt-2">
      <Card className="w-full max-w-md border-teal-200 bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="inline-flex text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <CardTitle className="text-3xl font-bold text-gray-900">Verify Your Email</CardTitle>
          <CardDescription className="text-base text-gray-600">
            We've sent a 6-digit verification code to <strong>{email || "your email"}</strong>. Enter it below to
            complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 flex gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-3">Verification Code</label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 6).toUpperCase())}
                maxLength={6}
                className="border-teal-200 bg-teal-50/50 text-center text-3xl tracking-widest font-mono focus:border-teal-500"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code from your email</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">Didn't receive the code?</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Check your spam or promotions folder</li>
              <li>• Wait a few moments and refresh your email</li>
              <li>• Make sure you entered your email correctly during signup</li>
            </ul>
          </div>

          <p className="text-center text-xs text-gray-500 pt-2">Code expires in 15 minutes for security</p>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 mt-8 max-w-md text-center">
        By verifying your email, you confirm that you have access to this email address and agree to Konza Coin's terms
        of service.
      </p>
    </div>
  )
}
