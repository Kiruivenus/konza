"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Camera, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export function KYCForm() {
  const [step, setStep] = useState<"upload" | "success">("upload")
  const [documentFrontImage, setDocumentFrontImage] = useState<string>("")
  const [documentBackImage, setDocumentBackImage] = useState<string>("")
  const [selfieImage, setSelfieImage] = useState<string>("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const documentFrontInputRef = useRef<HTMLInputElement>(null)
  const documentBackInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (file: File, type: "documentFront" | "documentBack" | "selfie") => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError(`Image is too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    console.log("[v0] Uploading image:", {
      type,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type,
    })

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      console.log("[v0] Image converted to base64, length:", base64String.length)
      if (type === "documentFront") {
        setDocumentFrontImage(base64String)
      } else if (type === "documentBack") {
        setDocumentBackImage(base64String)
      } else {
        setSelfieImage(base64String)
      }
      setError("") // Clear any previous errors
    }
    reader.onerror = () => {
      console.error("[v0] Failed to read image file")
      setError("Failed to read image file. Please try again.")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!documentFrontImage || !documentBackImage || !selfieImage) {
      setError("Please upload document front, back, and selfie images")
      return
    }

    console.log("[v0] Submitting KYC:", {
      documentFrontLength: documentFrontImage.length,
      documentBackLength: documentBackImage.length,
      selfieLength: selfieImage.length,
    })

    setLoading(true)

    try {
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentImage: documentFrontImage,
          documentBackImage: documentBackImage,
          selfieImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] KYC submission failed:", data)
        setError(data.error || "Failed to submit KYC")
        return
      }

      console.log("[v0] KYC submitted successfully")
      setStep("success")
    } catch (err) {
      console.error("[v0] KYC submission error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">KYC Submitted Successfully!</h3>
              <p className="text-muted-foreground">
                Your KYC documents have been submitted for review. You will be notified once the review is complete.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">KYC Verification</CardTitle>
        <CardDescription>Complete your identity verification to unlock all features</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Document Front Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 1: Upload ID Document (Front)</Label>
            <p className="text-sm text-muted-foreground">
              Upload a clear photo of the front of your passport, national ID, or driver's license
            </p>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
              {documentFrontImage ? (
                <div className="space-y-3">
                  <div className="relative w-full h-48">
                    <Image
                      src={documentFrontImage || "/placeholder.svg"}
                      alt="Document Front"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => documentFrontInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-primary" />
                  <Button type="button" variant="outline" onClick={() => documentFrontInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document Front
                  </Button>
                </div>
              )}
              <input
                ref={documentFrontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "documentFront")
                }}
              />
            </div>
          </div>

          {/* Document Back Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 2: Upload ID Document (Back)</Label>
            <p className="text-sm text-muted-foreground">Upload a clear photo of the back of your ID document</p>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
              {documentBackImage ? (
                <div className="space-y-3">
                  <div className="relative w-full h-48">
                    <Image
                      src={documentBackImage || "/placeholder.svg"}
                      alt="Document Back"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => documentBackInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-primary" />
                  <Button type="button" variant="outline" onClick={() => documentBackInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document Back
                  </Button>
                </div>
              )}
              <input
                ref={documentBackInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "documentBack")
                }}
              />
            </div>
          </div>

          {/* Selfie Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 3: Take a Selfie</Label>
            <p className="text-sm text-muted-foreground">Take a clear selfie holding your ID document</p>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
              {selfieImage ? (
                <div className="space-y-3">
                  <div className="relative w-full h-48">
                    <Image
                      src={selfieImage || "/placeholder.svg"}
                      alt="Selfie"
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => selfieInputRef.current?.click()}>
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Camera className="h-12 w-12 mx-auto text-primary" />
                  <Button type="button" variant="outline" onClick={() => selfieInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4" />
                    Take Selfie
                  </Button>
                </div>
              )}
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, "selfie")
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !documentFrontImage || !documentBackImage || !selfieImage}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
