"use client"

import type React from "react"
import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target } from "lucide-react"

import { useToast } from "@/hooks/use-toast"

interface SetTargetDialogProps {
  open: boolean
  onClose: () => void
  catId: string
  currentTarget?: number
  onSuccess: () => void
}

export function SetTargetDialog({ open, onClose, catId, currentTarget, onSuccess }: SetTargetDialogProps) {
  const { toast } = useToast()
  const [targetWeight, setTargetWeight] = useState(currentTarget?.toString() || "")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const weightValue = targetWeight.trim() ? Number.parseFloat(targetWeight) : null
    if (weightValue !== null && (isNaN(weightValue) || weightValue <= 0)) {
      toast({
        title: "入力エラー",
        description: "正しい体重を入力してください",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      await updateDoc(doc(db, "cats", catId), {
        targetWeight: weightValue,
      })

      toast({
        title: "目標体重を設定しました",
        description: weightValue ? `${weightValue}kgに設定しました` : "目標体重を解除しました",
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error setting target:", error)
      toast({
        title: "エラーが発生しました",
        description: "目標体重の設定に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              目標体重を設定
            </DialogTitle>
            <DialogDescription>目標体重を設定すると、グラフに目標線が表示されます</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target">目標体重 (kg)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="例: 4.5（空白で解除）"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "設定中..." : "設定"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
