"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat } from "lucide-react"
import { WeightChart } from "@/components/weight-chart"
import Link from "next/link"

interface CatData {
  id: string
  name: string
  breed?: string
}

interface WeightRecord {
  id: string
  catId: string
  weight: number
  date: any
  note?: string
}

export default function SharePage() {
  const params = useParams()
  const token = params.token as string

  const [cat, setCat] = useState<CatData | null>(null)
  const [weights, setWeights] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadSharedData()
  }, [token])

  const loadSharedData = async () => {
    try {
      // Find cat by share token
      const catsRef = collection(db, "cats")
      const q = query(catsRef, where("shareToken", "==", token))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError(true)
        setLoading(false)
        return
      }

      const catDoc = querySnapshot.docs[0]
      const catData = { id: catDoc.id, ...catDoc.data() } as CatData
      setCat(catData)

      // Load weight records
      const weightsRef = collection(db, "weights")
      const weightsQuery = query(weightsRef, where("catId", "==", catDoc.id), orderBy("date", "desc"))
      const weightsSnapshot = await getDocs(weightsQuery)

      const weightsData: WeightRecord[] = []
      weightsSnapshot.forEach((doc) => {
        weightsData.push({ id: doc.id, ...doc.data() } as WeightRecord)
      })

      setWeights(weightsData)
    } catch (error) {
      console.error("Error loading shared data:", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !cat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>記録が見つかりません</CardTitle>
            <CardDescription>このURLは無効か、削除された可能性があります</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="text-primary hover:underline">
              ホームに戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Cat className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base sm:text-lg font-bold">猫の体重記録</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
              <Cat className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">{cat.name}</h1>
              {cat.breed && <p className="text-md sm:text-lg text-muted-foreground mt-1">{cat.breed}</p>}
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">この記録は共有されています（閲覧のみ）</p>
            </div>
          </div>

          {weights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>体重の推移</CardTitle>
                <CardDescription>過去の記録をグラフで表示</CardDescription>
              </CardHeader>
              <CardContent>
                <WeightChart weights={weights} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>記録一覧</CardTitle>
              <CardDescription>{weights.length}件の記録</CardDescription>
            </CardHeader>
            <CardContent>
              {weights.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">まだ体重記録がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weights.map((weight) => (
                    <div
                      key={weight.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 sm:p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-md sm:text-lg">{weight.weight.toFixed(2)} kg</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {weight.date.toDate().toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {weight.note && <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0 sm:text-right">{weight.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
