"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
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
import { Check, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  catId: string
  catName: string
}

export function ShareDialog({ open, onClose, catId, catName }: ShareDialogProps) {
  const { toast } = useToast()
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      loadOrGenerateToken()
    }
  }, [open, catId])

  const loadOrGenerateToken = async () => {
    setLoading(true)
    try {
      const catDoc = await getDoc(doc(db, "cats", catId))

      if (catDoc.exists()) {
        let token = catDoc.data().shareToken

        if (!token) {
          token = generateToken()
          await updateDoc(doc(db, "cats", catId), {
            shareToken: token,
          })
        }

        setShareToken(token)
      }
    } catch (error) {
      console.error("Error loading/generating token:", error)
      toast({
        title: "エラーが発生しました",
        description: "共有URLの生成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const getShareUrl = () => {
    if (!shareToken) return ""
    return `${window.location.origin}/share/${shareToken}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setCopied(true)
      toast({
        title: "コピーしました",
        description: "共有URLをクリップボードにコピーしました",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "エラーが発生しました",
        description: "クリップボードへのコピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{catName}の記録を共有</DialogTitle>
          <DialogDescription>このURLを知っている人は誰でも体重記録を閲覧できます</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>共有URL</Label>
                <div className="flex gap-2">
                  <Input value={getShareUrl()} readOnly className="flex-1" />
                  <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0 bg-transparent">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>注意:</strong> このURLを知っている人は誰でも{catName}の体重記録を見ることができます。
                  ただし、新しい記録を追加することはできません。
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
