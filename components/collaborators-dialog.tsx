"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
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
import { UserPlus, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CollaboratorsDialogProps {
  open: boolean
  onClose: () => void
  catId: string
  catName: string
}

interface Collaborator {
  userId: string
  email: string
  addedAt: string
}

export function CollaboratorsDialog({ open, onClose, catId, catName }: CollaboratorsDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [newUserId, setNewUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadCollaborators()
    }
  }, [open, catId])

  const loadCollaborators = async () => {
    setLoading(true)
    try {
      const catDoc = await getDoc(doc(db, "cats", catId))

      if (catDoc.exists()) {
        const data = catDoc.data()
        setCollaborators(data.collaborators || [])
      }
    } catch (error) {
      console.error("Error loading collaborators:", error)
      toast({
        title: "エラーが発生しました",
        description: "共同編集者の読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUserId.trim() || !user) return

    setSubmitting(true)

    try {
      const newCollaborator: Collaborator = {
        userId: newUserId.trim(),
        email: newUserId.trim(),
        addedAt: new Date().toISOString(),
      }

      await updateDoc(doc(db, "cats", catId), {
        collaborators: arrayUnion(newCollaborator),
      })

      setCollaborators([...collaborators, newCollaborator])
      setNewUserId("")
      toast({
        title: "共同編集者を追加しました",
        description: `${newUserId.trim()}を共同編集者として招待しました`,
      })
    } catch (error) {
      console.error("Error adding collaborator:", error)
      toast({
        title: "エラーが発生しました",
        description: "共同編集者の追加に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveCollaboratorClick = (userId: string) => {
    setRemovingUserId(userId)
    setShowRemoveDialog(true)
  }

  const handleRemoveCollaborator = async () => {
    if (!removingUserId) return

    try {
      const collaboratorToRemove = collaborators.find((c) => c.userId === removingUserId)
      if (!collaboratorToRemove) return

      await updateDoc(doc(db, "cats", catId), {
        collaborators: arrayRemove(collaboratorToRemove),
      })

      setCollaborators(collaborators.filter((c) => c.userId !== removingUserId))
      toast({
        title: "削除しました",
        description: "共同編集者を削除しました",
      })
    } catch (error) {
      console.error("Error removing collaborator:", error)
      toast({
        title: "エラーが発生しました",
        description: "共同編集者の削除に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setShowRemoveDialog(false)
      setRemovingUserId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{catName}の共同編集者</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              共同編集者は体重記録を追加・削除できます。ユーザーIDまたはメールアドレスで招待してください。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <form onSubmit={handleAddCollaborator} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm">
                  ユーザーID / メールアドレス
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="userId"
                    type="email"
                    inputMode="email"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    placeholder="例: user@example.com"
                    className="flex-1 text-base h-11"
                  />
                  <Button type="submit" disabled={submitting || !newUserId.trim()} className="w-full sm:w-auto h-11">
                    <UserPlus className="w-4 h-4 mr-2" />
                    追加
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              <Label className="text-sm">現在の共同編集者</Label>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : collaborators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">まだ共同編集者がいません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.userId}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-sm md:text-base break-words">{collaborator.email}</p>
                        <p className="text-xs text-muted-foreground">
                          追加日: {new Date(collaborator.addedAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaboratorClick(collaborator.userId)}
                        className="flex-shrink-0 h-10 w-10 p-0"
                      >
                        <X className="w-5 h-5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 md:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs md:text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                <strong>注意:</strong>{" "}
                共同編集者は体重記録を追加・削除できますが、猫の情報を変更したり削除することはできません。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} className="w-full sm:w-auto h-11">
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">共同編集者を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              本当にこの共同編集者を削除してもよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto h-11 m-0">キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveCollaborator} className="w-full sm:w-auto h-11 bg-destructive">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
