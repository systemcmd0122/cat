"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AddWeightDialogProps {
  open: boolean
  onClose: () => void
  catId: string
  onSuccess: () => void
}

export function AddWeightDialog({ open, onClose, catId, onSuccess }: AddWeightDialogProps) {
  const { toast } = useToast()
  const [weight, setWeight] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const weightValue = Number.parseFloat(weight)
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "入力エラー",
        description: "正しい体重を入力してください",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const selectedDate = new Date(date)
      selectedDate.setHours(12, 0, 0, 0)

      await addDoc(collection(db, "weights"), {
        catId,
        weight: weightValue,
        date: Timestamp.fromDate(selectedDate),
        note: note.trim() || null,
        createdAt: Timestamp.now(),
      })

      toast({
        title: "体重を記録しました",
        description: `${weightValue.toFixed(2)} kg を記録しました`,
      })

      setWeight("")
      setDate(new Date().toISOString().split("T")[0])
      setNote("")
      onSuccess()
    } catch (error) {
      console.error("Error adding weight:", error)
      toast({
        title: "エラーが発生しました",
        description: "体重の記録に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl">体重を記録</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">今日の体重を入力してください</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="weight" className="text-xs sm:text-sm">
                体重 (kg) *
              </Label>
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例: 4.5"
                required
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="date" className="text-xs sm:text-sm">
                日付 *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="note" className="text-xs sm:text-sm">
                メモ（任意）
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例: 元気に遊んでいた"
                rows={3}
                className="text-sm sm:text-base resize-none text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-initial bg-transparent text-xs sm:text-sm h-9 sm:h-10"
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 sm:flex-initial text-xs sm:text-sm h-9 sm:h-10">
              {submitting ? "記録中..." : "記録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
