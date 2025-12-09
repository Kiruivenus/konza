"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send reset link")
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Forgot password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex flex-col items-center justify-center p-4 pt-4 sm:pt-2">
      <Card className="w-full max-w-md border-teal-200 bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="text-center space-y-2">
          <Link href="/login" className="inline-flex text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <CardTitle className="text-3xl font-bold text-gray-900">Forgot Password?</CardTitle>
          <CardDescription className="text-base text-gray-600">
            No worries! We'll help you reset your password. Enter your email address and we'll send you a secure reset
            link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Check Your Email</h3>
                    <p className="text-sm text-green-800 mt-1">
                      We've sent a password reset link to <strong>{email}</strong>. The link will expire in 10 minutes
                      for security.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">What to do next:</p>
                <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>Check your email inbox and spam folder</li>
                  <li>Click the password reset link</li>
                  <li>Enter your new password (minimum 6 characters)</li>
                  <li>Log in with your new password</li>
                </ul>
              </div>

              <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
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
                <label className="block text-sm font-semibold text-teal-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-teal-200 bg-teal-50/50 focus:border-teal-500"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending Link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 pt-2">
                Remember your password?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Login Here
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 mt-8 max-w-md text-center">
        For security reasons, password reset links expire after 10 minutes. If your link has expired, simply request a
        new one.
      </p>
    </div>
  )
}
