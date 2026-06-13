"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat, Scale, TrendingUp, Share2, AlertCircle, Plus, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { CatLoader } from "@/components/cat-loader"
import { collection, query, where, getDocs, type Timestamp, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
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

interface CatData {
  id: string
  name: string
  breed?: string
  birthDate?: string
  imageUrl?: string
  ownerId: string
  collaborators?: { userId: string; email: string }[]
  createdAt: Timestamp
  lastWeight?: number
  lastWeightDate?: Timestamp
}

export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [authError, setAuthError] = useState<string | null>(null)
  const [cats, setCats] = useState<CatData[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    if (user) {
      loadCats()
    }
  }, [user])

  const loadCats = async () => {
    if (!user) return

    setLoadingCats(true)
    try {
      const catsRef = collection(db, "cats")

      // Get cats where user is owner
      const ownerQuery = query(catsRef, where("ownerId", "==", user.uid))
      const ownerSnapshot = await getDocs(ownerQuery)

      const catsData: CatData[] = []
      ownerSnapshot.forEach((doc) => {
        catsData.push({ id: doc.id, ...doc.data() } as CatData)
      })

      // Get cats where user is collaborator
      const collaboratorQuery = query(catsRef, where("collaboratorIds", "array-contains", user.uid))
      const collaboratorSnapshot = await getDocs(collaboratorQuery)

      collaboratorSnapshot.forEach((doc) => {
        if (!catsData.find((cat) => cat.id === doc.id)) {
          catsData.push({ id: doc.id, ...doc.data() } as CatData)
        }
      })

      // Fetch latest weight for each cat
      const catsWithWeight = await Promise.all(
        catsData.map(async (cat) => {
          const weightsRef = collection(db, "weights")
          const weightQuery = query(weightsRef, where("catId", "==", cat.id), orderBy("date", "desc"), limit(1))
          const weightSnapshot = await getDocs(weightQuery)

          if (!weightSnapshot.empty) {
            const weightDoc = weightSnapshot.docs[0]
            return {
              ...cat,
              lastWeight: weightDoc.data().weight,
              lastWeightDate: weightDoc.data().date,
            }
          }
          return cat
        }),
      )

      setCats(catsWithWeight)
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
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "エラーが発生しました",
        description: "ログアウトに失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  const handleSignIn = async () => {
    try {
      setAuthError(null)
      await signInWithGoogle()
    } catch (error: any) {
      console.error("Authentication error:", error)
      if (error.code === "auth/unauthorized-domain") {
        setAuthError(
          "このドメインは認証が許可されていません。Firebaseコンソールで現在のドメインを許可リストに追加してください。",
        )
      } else if (error.code === "auth/popup-closed-by-user") {
        setAuthError("ログインがキャンセルされました")
      } else {
        setAuthError("ログインに失敗しました。もう一度お試しください。")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CatLoader />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 sm:py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-block p-4 sm:p-5 bg-primary/10 rounded-3xl animate-bounce-slow">
                <Cat className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.1]">
                愛猫の健康を
                <br />
                <span className="text-primary">もっと身近に。</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
                毎日の体重を記録して、AIが健康状態を分析。
                大切な家族の小さな変化を見逃しません。
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <Button size="lg" onClick={handleSignIn} className="text-lg sm:text-xl px-10 sm:px-14 py-6 sm:py-8 h-auto rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleで今すぐ始める
              </Button>

              {authError && (
                <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive max-w-md animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{authError}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-24">
              {[
                { icon: Scale, title: "簡単記録", desc: "日付と体重を入れるだけ。一瞬で完了。" },
                { icon: TrendingUp, title: "AI分析", desc: "最新のGeminiが健康状態を的確に診断。" },
                { icon: Share2, title: "家族で共有", desc: "大切な情報をリアルタイムに共同管理。" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center p-6 bg-card rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard view for logged-in users
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
            <Card className="border-dashed border-2">
              <CardContent className="py-12 sm:py-16 md:py-24 text-center">
                <div className="inline-block p-4 sm:p-6 bg-primary/5 rounded-full mb-6 text-primary">
                  <Cat className="w-12 sm:w-16 h-12 sm:h-16" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">猫ちゃんを登録して始めましょう</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
                  愛猫の体重を定期的に記録することで、健康状態の変化にいち早く気づくことができます。まずは最初の1匹を登録しましょう。
                </p>
                <Button onClick={() => setShowAddDialog(true)} size="lg" className="px-8">
                  <Plus className="w-5 h-5 mr-2" />
                  <span>猫を登録する</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {cats.map((cat) => {
                const daysAgo = cat.lastWeightDate
                  ? Math.floor((Date.now() - cat.lastWeightDate.toDate().getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <Link key={cat.id} href={`/cat/${cat.id}`}>
                    <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full flex flex-col">
                      <CardHeader className="p-3 sm:p-4 md:p-6 flex-1">
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

                        <div className="mt-4 space-y-2">
                          {cat.lastWeight ? (
                            <div className="flex items-end justify-between">
                              <div className="space-y-0.5">
                                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                  最新の体重
                                </p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                                  {cat.lastWeight.toFixed(2)}
                                  <span className="text-xs sm:text-sm font-normal ml-1">kg</span>
                                </p>
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                                {daysAgo === 0 ? "今日" : daysAgo === 1 ? "昨日" : `${daysAgo}日前`}
                              </p>
                            </div>
                          ) : (
                            <div className="py-2">
                              <p className="text-xs text-muted-foreground italic">記録がありません</p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
                        <Button variant="outline" className="w-full bg-secondary/50 text-xs sm:text-sm md:text-base h-8 sm:h-10">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">体重記録を見る</span>
                          <span className="sm:hidden">記録を見る</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
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
