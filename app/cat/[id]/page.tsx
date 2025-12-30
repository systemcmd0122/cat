"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, orderBy, getDocs, type Timestamp, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cat, Plus, ArrowLeft, Share2, Trash2, Target, Sparkles, Users } from "lucide-react"
import Link from "next/link"
import { AddWeightDialog } from "@/components/add-weight-dialog"
import { WeightChart } from "@/components/weight-chart"
import { ShareDialog } from "@/components/share-dialog"
import { CollaboratorsDialog } from "@/components/collaborators-dialog"
import { SetTargetDialog } from "@/components/set-target-dialog"
import { AIAnalysisDialog } from "@/components/ai-analysis-dialog"
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
  gender?: "male" | "female"
  birthDate?: string
  isNeutered?: boolean
  ownerId: string
  shareToken?: string
  collaborators?: Array<{ userId: string; email: string; addedAt: string }>
  targetWeight?: number
}

interface WeightRecord {
  id: string
  catId: string
  weight: number
  date: Timestamp
  note?: string
}

export default function CatDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const catId = params.id as string
  const { toast } = useToast()

  const [cat, setCat] = useState<CatData | null>(null)
  const [weights, setWeights] = useState<WeightRecord[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false)
  const [showTargetDialog, setShowTargetDialog] = useState(false)
  const [showAIAnalysisDialog, setShowAIAnalysisDialog] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isCollaborator, setIsCollaborator] = useState(false)
  const [showDeleteCatDialog, setShowDeleteCatDialog] = useState(false)
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null)
  const [showDeleteWeightDialog, setShowDeleteWeightDialog] = useState(false)
  const [deletingWeightId, setDeletingWeightId] = useState<string | null>(null)

  useEffect(() => {
    loadCatData()
  }, [catId, user])

  const loadCatData = async () => {
    try {
      const catDoc = await getDoc(doc(db, "cats", catId))

      if (!catDoc.exists()) {
        toast({
          title: "エラー",
          description: "猫が見つかりませんでした",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }

      const catData = { id: catDoc.id, ...catDoc.data() } as CatData
      setCat(catData)

      const owner = user?.uid === catData.ownerId
      setIsOwner(owner)

      const collaborator = user
        ? (catData.collaborators?.some((c) => c.userId === user.uid || c.email === user.email) ?? false)
        : false
      setIsCollaborator(collaborator)

      const weightsRef = collection(db, "weights")
      const q = query(weightsRef, where("catId", "==", catId), orderBy("date", "desc"))
      const querySnapshot = await getDocs(q)

      const weightsData: WeightRecord[] = []
      querySnapshot.forEach((doc) => {
        weightsData.push({ id: doc.id, ...doc.data() } as WeightRecord)
      })

      setWeights(weightsData)
    } catch (error) {
      console.error("Error loading cat data:", error)
      toast({
        title: "エラーが発生しました",
        description: "データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const handleDeleteWeightClick = (weightId: string) => {
    setDeletingWeightId(weightId)
    setShowDeleteWeightDialog(true)
  }

  const handleDeleteWeight = async () => {
    if (!deletingWeightId) return

    try {
      await deleteDoc(doc(db, "weights", deletingWeightId))
      toast({
        title: "削除しました",
        description: "体重記録を削除しました",
      })
      await loadCatData()
    } catch (error) {
      console.error("Error deleting weight:", error)
      toast({
        title: "エラーが発生しました",
        description: "削除に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setShowDeleteWeightDialog(false)
      setDeletingWeightId(null)
    }
  }

  const handleDeleteCatClick = () => {
    setDeletingCatId(catId)
    setShowDeleteCatDialog(true)
  }

  const handleDeleteCat = async () => {
    if (!deletingCatId) return

    try {
      const weightsRef = collection(db, "weights")
      const weightsQuery = query(weightsRef, where("catId", "==", deletingCatId))
      const weightsSnapshot = await getDocs(weightsQuery)

      for (const weightDoc of weightsSnapshot.docs) {
        await deleteDoc(doc(db, "weights", weightDoc.id))
      }

      await deleteDoc(doc(db, "cats", deletingCatId))

      toast({
        title: "削除しました",
        description: "猫のデータを削除しました",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting cat:", error)
      toast({
        title: "エラーが発生しました",
        description: "削除に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setShowDeleteCatDialog(false)
      setDeletingCatId(null)
    }
  }

  const canEdit = isOwner || isCollaborator

  const latestWeight = weights.length > 0 ? weights[0].weight : null
  const previousWeight = weights.length > 1 ? weights[1].weight : null
  const weightDiff = latestWeight && previousWeight ? latestWeight - previousWeight : null

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CatLoader />
      </div>
    )
  }

  if (!cat) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-base sm:text-lg">戻る</span>
            </Link>
            {isOwner && (
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteCatClick}
                  className="sm:hidden text-destructive hover:text-destructive bg-transparent w-8 h-8"
                  aria-label="猫を削除"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteCatClick}
                  className="hidden sm:inline-flex text-destructive hover:text-destructive bg-transparent text-xs"
                >
                  <Trash2 className="w-3 h-3 sm:mr-1" />
                  <span>削除</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCollaboratorsDialog(true)}
                  className="sm:hidden w-8 h-8"
                  aria-label="共同編集者"
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCollaboratorsDialog(true)}
                  className="hidden sm:inline-flex text-xs"
                >
                  <Users className="w-3 h-3 sm:mr-1" />
                  <span>共同編集者</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowShareDialog(true)}
                  className="sm:hidden w-8 h-8"
                  aria-label="共有"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className="hidden sm:inline-flex text-xs"
                >
                  <Share2 className="w-3 h-3 sm:mr-1" />
                  <span>共有</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Cat className="w-6 sm:w-8 h-6 sm:h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold break-words">{cat.name}</h1>
                <div className="space-y-1 mt-2">
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{cat.breed || "品種：未登録"}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
                    {cat.gender ? (
                      <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded text-xs">{cat.gender === "male" ? "オス" : "メス"}</span>
                    ) : (
                      <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded text-xs">性別：未登録</span>
                    )}
                    {cat.birthDate ? (
                      <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded text-xs">
                        {new Date().getFullYear() - new Date(cat.birthDate).getFullYear()}歳
                      </span>
                    ) : (
                      <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded text-xs">年齢：未登録</span>
                    )}
                    {cat.isNeutered !== undefined ? (
                      <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded text-xs">{cat.isNeutered ? "避妊・去勢済" : "未手術"}</span>
                    ) : (
                      <span className="bg-muted px-1.5 sm:px-2 py-0.5 rounded text-xs">避妊・去勢：未登録</span>
                    )}
                  </div>
                </div>
                {isCollaborator && !isOwner && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-2 bg-muted px-1.5 sm:px-2 py-0.5 rounded inline-block">
                    共同編集者
                  </p>
                )}
              </div>
            </div>
            {canEdit && (
              <Button
                size="sm"
                className="md:size-lg w-full sm:w-auto flex-shrink-0 text-xs sm:text-sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-3 sm:w-4 h-3 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                体重を記録
              </Button>
            )}
          </div>

          {latestWeight && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <Card>
                <CardHeader className="p-2 sm:p-3 md:p-6">
                  <CardDescription className="text-xs md:text-sm">最新体重</CardDescription>
                  <CardTitle className="text-base sm:text-lg md:text-3xl mt-1">{latestWeight.toFixed(2)} kg</CardTitle>
                </CardHeader>
              </Card>
              {weightDiff !== null && (
                <Card>
                  <CardHeader className="p-2 sm:p-3 md:p-6">
                    <CardDescription className="text-xs md:text-sm">前回比</CardDescription>
                    <CardTitle
                      className={`text-base sm:text-lg md:text-3xl mt-1 ${weightDiff > 0 ? "text-orange-600" : weightDiff < 0 ? "text-blue-600" : ""}`}
                    >
                      {weightDiff > 0 ? "+" : ""}
                      {weightDiff.toFixed(2)} kg
                    </CardTitle>
                  </CardHeader>
                </Card>
              )}
              <Card>
                <CardHeader className="p-2 sm:p-3 md:p-6">
                  <CardDescription className="text-xs md:text-sm">記録数</CardDescription>
                  <CardTitle className="text-base sm:text-lg md:text-3xl mt-1">{weights.length}</CardTitle>
                </CardHeader>
              </Card>
              {cat.targetWeight ? (
                <Card>
                  <CardHeader className="p-2 sm:p-3 md:p-6">
                    <CardDescription className="text-xs md:text-sm">目標体重</CardDescription>
                    <CardTitle className="text-base sm:text-lg md:text-3xl mt-1">{cat.targetWeight.toFixed(2)} kg</CardTitle>
                  </CardHeader>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="p-2 sm:p-3 md:p-6">
                    <CardDescription className="text-xs md:text-sm">目標体重</CardDescription>
                    <CardTitle className="text-base sm:text-lg md:text-3xl mt-1 text-muted-foreground">未設定</CardTitle>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}

          {weights.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                variant="outline"
                className="gap-1.5 sm:gap-2 flex-1 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20 text-xs sm:text-sm"
                onClick={() => setShowAIAnalysisDialog(true)}
              >
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4" />
                AI健康分析
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  className="gap-1.5 sm:gap-2 flex-1 bg-transparent text-xs sm:text-sm"
                  onClick={() => setShowTargetDialog(true)}
                >
                  <Target className="w-3 sm:w-4 h-3 sm:h-4" />
                  目標体重設定
                </Button>
              )}
            </div>
          )}

          {weights.length > 0 && (
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">体重の推移</CardTitle>
                <CardDescription className="text-xs md:text-sm">過去の記録をグラフで表示</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 md:p-6 overflow-x-auto">
                <div >
                  <WeightChart weights={weights} targetWeight={cat.targetWeight} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">記録一覧</CardTitle>
              <CardDescription className="text-xs md:text-sm">{weights.length}件の記録</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              {weights.length === 0 ? (
                <div className="text-center py-6 sm:py-8 md:py-12">
                  <div className="inline-block mb-3 sm:mb-4">
                    <div className="w-14 sm:w-16 h-14 sm:h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center">
                      <Cat className="w-7 sm:w-8 h-7 sm:h-8 md:w-10 md:h-10 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4">まだ体重記録がありません</p>
                  {canEdit && (
                    <Button onClick={() => setShowAddDialog(true)} className="text-xs sm:text-sm">
                      <Plus className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                      最初の記録を追加
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {weights.map((weight) => (
                    <div
                      key={weight.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-base md:text-lg">{weight.weight.toFixed(2)} kg</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {weight.date.toDate().toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {weight.note && <p className="text-xs md:text-sm text-muted-foreground mt-1">{weight.note}</p>}
                      </div>
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteWeightClick(weight.id)}>
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {canEdit && (
        <AddWeightDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          catId={catId}
          onSuccess={() => {
            setShowAddDialog(false)
            loadCatData()
          }}
        />
      )}

      {isOwner && (
        <>
          <ShareDialog
            open={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            catId={catId}
            catName={cat.name}
          />
          <CollaboratorsDialog
            open={showCollaboratorsDialog}
            onClose={() => setShowCollaboratorsDialog(false)}
            catId={catId}
            catName={cat.name}
          />
          <SetTargetDialog
            open={showTargetDialog}
            onClose={() => setShowTargetDialog(false)}
            catId={catId}
            currentTarget={cat.targetWeight}
            onSuccess={loadCatData}
          />
        </>
      )}

      {weights.length > 0 && cat && (
        <AIAnalysisDialog
          open={showAIAnalysisDialog}
          onClose={() => setShowAIAnalysisDialog(false)}
          weights={weights}
          catData={cat}
        />
      )}

      <AlertDialog open={showDeleteCatDialog} onOpenChange={setShowDeleteCatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この猫を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。{cat?.name}に関連するすべてのデータ（体重記録など）が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCat} className="bg-destructive">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteWeightDialog} onOpenChange={setShowDeleteWeightDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。本当に削除してもよろしいですか？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWeight} className="bg-destructive">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
