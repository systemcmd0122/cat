"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat, ArrowLeft, Trash2, LogOut } from "lucide-react"
import Link from "next/link"
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
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { deleteUser } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { CatLoader } from "@/components/cat-loader"

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "ログアウトしました",
        description: "またのご利用をお待ちしております",
      })
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "エラーが発生しました",
        description: "ログアウトに失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      const catsRef = collection(db, "cats")
      const catsQuery = query(catsRef, where("ownerId", "==", user.uid))
      const catsSnapshot = await getDocs(catsQuery)

      for (const catDoc of catsSnapshot.docs) {
        const catId = catDoc.id

        const weightsRef = collection(db, "weights")
        const weightsQuery = query(weightsRef, where("catId", "==", catId))
        const weightsSnapshot = await getDocs(weightsQuery)

        for (const weightDoc of weightsSnapshot.docs) {
          await deleteDoc(doc(db, "weights", weightDoc.id))
        }

        await deleteDoc(doc(db, "cats", catId))
      }

      await deleteUser(user)

      toast({
        title: "アカウントを削除しました",
        description: "ご利用ありがとうございました",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)

      if (error.code === "auth/requires-recent-login") {
        toast({
          title: "再ログインが必要です",
          description: "セキュリティのため、再度ログインしてからアカウント削除を行ってください。",
          variant: "destructive",
        })
      } else {
        toast({
          title: "エラーが発生しました",
          description: "アカウントの削除に失敗しました。もう一度お試しください。",
          variant: "destructive",
        })
      }
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CatLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-base sm:text-lg">戻る</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
              <Cat className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">アカウント設定</h1>
              <p className="text-sm md:text-base text-muted-foreground">アカウント情報と設定</p>
            </div>
          </div>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">アカウント情報</CardTitle>
              <CardDescription className="text-xs md:text-sm">ログイン中のアカウント情報</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">名前</p>
                <p className="text-sm md:text-base font-medium">{user.displayName || "未登録"}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">メールアドレス</p>
                <p className="text-sm md:text-base font-medium break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">ユーザーID</p>
                <p className="text-xs md:text-sm font-mono bg-muted px-2 py-1 rounded break-all">{user.uid}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">アカウント管理</CardTitle>
              <CardDescription className="text-xs md:text-sm">ログアウトまたはアカウントの削除</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                アカウントを削除
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
            <AlertDialogDescription>本当にログアウトしてもよろしいですか？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>ログアウト</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アカウントを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。アカウントに関連するすべてのデータ（猫の情報、体重記録など）が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
