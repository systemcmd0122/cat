"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat, Plus, TrendingUp, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { AddCatDialog } from "@/components/add-cat-dialog"
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
import { useToast } from "@/hooks/use-toast"
import { CatLoader } from "@/components/cat-loader"

interface CatData {
  id: string
  name: string
  breed?: string
  birthDate?: string
  imageUrl?: string
  ownerId: string
  collaborators?: { userId: string; email: string }[]
  createdAt: Timestamp
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [cats, setCats] = useState<CatData[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadCats()
    }
  }, [user])

  const loadCats = async () => {
    if (!user) return

    try {
      const catsRef = collection(db, "cats")
      const ownerQuery = query(catsRef, where("ownerId", "==", user.uid))
      const ownerSnapshot = await getDocs(ownerQuery)

      const catsData: CatData[] = []
      ownerSnapshot.forEach((doc) => {
        catsData.push({ id: doc.id, ...doc.data() } as CatData)
      })

      const allCatsSnapshot = await getDocs(catsRef)
      allCatsSnapshot.forEach((doc) => {
        const data = doc.data() as CatData
        const isCollaborator = data.collaborators?.some((c) => c.userId === user.uid || c.email === user.email)
        if (isCollaborator && !catsData.find((cat) => cat.id === doc.id)) {
            catsData.push({ ...doc.data(), id: doc.id } as CatData)
        }
      })

      setCats(catsData)
    } catch (error) {
      console.error("Error loading cats:", error)
    } finally {
      setLoadingCats(false)
    }
  }

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
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Cat className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base sm:text-lg font-bold">猫の体重記録</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="icon" asChild className="sm:hidden w-9 h-9">
                <Link href="/settings" aria-label="設定">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>設定</span>
                </Link>
              </Button>

              <Button variant="outline" size="icon" onClick={() => setShowLogoutDialog(true)} className="sm:hidden w-9 h-9">
                <LogOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLogoutDialog(true)} className="hidden sm:inline-flex">
                <LogOut className="w-4 h-4 mr-2" />
                <span>ログアウト</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">ダッシュボード</h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">登録している猫ちゃんの一覧</p>
            </div>
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              <span>猫を追加</span>
            </Button>
          </div>

          {loadingCats ? (
            <div className="flex justify-center py-12">
              <CatLoader />
            </div>
          ) : cats.length === 0 ? (
            <Card>
              <CardContent className="py-6 sm:py-8 md:py-12 text-center">
                <div className="inline-block p-2 sm:p-3 md:p-4 bg-muted rounded-full mb-3 sm:mb-4">
                  <Cat className="w-8 sm:w-10 h-8 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">猫を追加しましょう</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
                  まだ猫が登録されていません。最初の猫を追加して記録を始めましょう
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
                  <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">最初の猫を追加</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {cats.map((cat) => (
                <Link key={cat.id} href={`/cat/${cat.id}`}>
                  <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg md:text-2xl truncate">{cat.name}</CardTitle>
                          <CardDescription className="mt-1 text-xs sm:text-sm truncate">
                            {cat.breed || "品種：未登録"}
                          </CardDescription>
                        </div>
                        <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <Cat className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-primary" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
                      <Button variant="outline" className="w-full bg-secondary/50 text-xs sm:text-sm md:text-base">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">体重記録を見る</span>
                        <span className="sm:hidden">記録を見る</span>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddCatDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => {
          setShowAddDialog(false)
          loadCats()
        }}
      />

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
    </div>
  )
}
