"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSuccess: boolean
  title: string
  description: string
  autoClose?: boolean
}

export function SuccessModal({
  open,
  onOpenChange,
  isSuccess,
  title,
  description,
  autoClose = true,
}: SuccessModalProps) {
  useEffect(() => {
    if (open && autoClose && isSuccess) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [open, autoClose, isSuccess, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <div className="rounded-full bg-green-100 p-4 animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-4 animate-pulse">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {isSuccess ? "✓ " : "✗ "}
            {title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
