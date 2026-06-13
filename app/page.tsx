"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat, Scale, TrendingUp, Share2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { CatLoader } from "@/components/cat-loader"

export default function HomePage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
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

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null
  }
}
