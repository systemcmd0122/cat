"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface AddCatDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCatDialog({ open, onClose, onSuccess }: AddCatDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "">("")
  const [birthDate, setBirthDate] = useState("")
  const [isNeutered, setIsNeutered] = useState<"yes" | "no" | "">("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !name.trim()) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, "cats"), {
        name: name.trim(),
        breed: breed.trim() || null,
        gender: gender || null,
        birthDate: birthDate || null,
        isNeutered: isNeutered === "yes",
        ownerId: user.uid,
        collaborators: [],
        createdAt: Timestamp.now(),
      })

      toast({
        title: "猫を追加しました",
        description: `${name.trim()}の記録を開始しました`,
      })

      setName("")
      setBreed("")
      setGender("")
      setBirthDate("")
      setIsNeutered("")
      onSuccess()
    } catch (error) {
      console.error("Error adding cat:", error)
      toast({
        title: "エラーが発生しました",
        description: "猫の追加に失敗しました。もう一度お試しください。",
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
            <DialogTitle className="text-base sm:text-lg md:text-xl">猫を追加</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">新しい猫ちゃんの情報を入力してください</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">
                名前 *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: たま"
                required
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="breed" className="text-xs sm:text-sm">
                品種（任意）
              </Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="例: スコティッシュフォールド"
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="gender" className="text-xs sm:text-sm">
                性別（任意）
              </Label>
              <Select value={gender} onValueChange={(value) => setGender(value as "male" | "female" | "")}>
                <SelectTrigger id="gender" className="text-sm sm:text-base h-9 sm:h-10">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent className="text-sm sm:text-base">
                  <SelectItem value="male">オス</SelectItem>
                  <SelectItem value="female">メス</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="birthDate" className="text-xs sm:text-sm">
                生年月日（任意）
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="isNeutered" className="text-xs sm:text-sm">
                避妊・去勢手術（任意）
              </Label>
              <Select value={isNeutered} onValueChange={(value) => setIsNeutered(value as "yes" | "no" | "")}>
                <SelectTrigger id="isNeutered" className="text-sm sm:text-base h-9 sm:h-10">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent className="text-sm sm:text-base">
                  <SelectItem value="yes">済み</SelectItem>
                  <SelectItem value="no">未実施</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-none bg-transparent text-xs sm:text-sm h-9 sm:h-10"
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()} className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10">
              {submitting ? "追加中..." : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
