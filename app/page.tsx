"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat, Scale, TrendingUp, Share2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CatLoader } from "@/components/cat-loader"

export default function HomePage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

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
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-block p-3 sm:p-4 bg-primary/10 rounded-full">
                <Cat className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                愛猫の体重を記録して
                <br className="hidden sm:block" />
                健康管理をサポート
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
                毎日の体重を記録して、グラフで変化を可視化。大切な猫の健康を見守りましょう。
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5">
              <Button size="lg" onClick={handleSignIn} className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" viewBox="0 0 24 24">
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
                Googleでログイン
              </Button>

              {authError && (
                <div className="flex items-start gap-2 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive max-w-md w-full sm:w-auto">
                  <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm">{authError}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-8 sm:mt-12 md:mt-16">
              <Card className="border-2 hover:shadow-lg hover:scale-105 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>簡単記録</CardTitle>
                  <CardDescription>毎日の体重を素早く記録。日付と体重を入力するだけ。</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg hover:scale-105 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>グラフ表示</CardTitle>
                  <CardDescription>体重の変化をグラフで可視化。増減トレンドを一目で確認。</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg hover:scale-105 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>共同編集</CardTitle>
                  <CardDescription>家族や友人を招待して一緒に記録を管理。</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Cat className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">猫の体重記録</h1>
                <p className="text-muted-foreground">ようこそ、{user.displayName}さん</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button size="lg">ダッシュボードへ</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>はじめに</CardTitle>
              <CardDescription>猫ちゃんの体重記録を開始しましょう</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ダッシュボードから新しい猫を追加して、体重の記録を始めることができます。
              </p>
              <Link href="/dashboard">
                <Button>今すぐ始める</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
