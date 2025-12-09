"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.")
      setIsCheckingToken(false)
    } else {
      setIsValidToken(true)
      setIsCheckingToken(false)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Password reset failed. Please try again.")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err) {
      setError("Failed to reset password. Please try again.")
      console.error("[v0] Reset password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 pt-2">
        <Card className="w-full max-w-md border-teal-200 bg-white/95 backdrop-blur shadow-lg">
          <CardContent className="pt-6 text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-teal-600 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600 font-medium">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 pt-2">
        <Card className="w-full max-w-md border-red-200 bg-white/95 backdrop-blur shadow-lg">
          <CardHeader className="text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Link Expired or Invalid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              The reset link has expired or is invalid. Password reset links are valid for 10 minutes for security
              reasons.
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
                Request New Reset Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
            <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-700 font-medium mb-3">Your password has been successfully reset.</p>
              <p className="text-sm text-gray-600">You'll be redirected to the login page in 3 seconds...</p>
            </div>
            <p className="text-xs text-gray-500">You can now log in with your new password.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex flex-col items-center justify-center p-4 pt-4 sm:pt-2">
      <Card className="w-full max-w-md border-teal-200 bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="text-center space-y-2">
          <Link
            href="/auth/forgot-password"
            className="inline-flex text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <CardTitle className="text-3xl font-bold text-gray-900">Reset Password</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Enter a new password to secure your account. Make sure it's something only you know.
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
              <label className="block text-sm font-semibold text-teal-700 mb-2">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-teal-200 bg-teal-50/50 focus:border-teal-500 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-2">Confirm Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-teal-200 bg-teal-50/50 focus:border-teal-500"
                disabled={isLoading}
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs text-blue-800">
              <p className="font-semibold mb-1">Password Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>At least 6 characters long</li>
                <li>Mix of uppercase and lowercase letters</li>
                <li>Include numbers and special characters for better security</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
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
                  Resetting Password...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 mt-8 max-w-md text-center">
        This reset link is valid for 10 minutes. For your security, the link will expire after this time.
      </p>
    </div>
  )
}
