"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cat, ArrowRight } from "lucide-react"
import type { Timestamp } from "firebase/firestore"

interface CatData {
  id: string
  name: string
  breed?: string
  imageUrl?: string
  ownerId: string
  collaborators?: { userId: string; email: string }[]
  createdAt: Timestamp
}

interface RegisteredCatsBlockProps {
  cats: CatData[]
}

export function RegisteredCatsBlock({ cats }: RegisteredCatsBlockProps) {
  const displayedCats = cats.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle>登録済みの猫ちゃん</CardTitle>
        <CardDescription>登録されている猫ちゃんのリストです。ダッシュボードで詳細を確認できます。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {displayedCats.map((cat) => (
            <Link key={cat.id} href={`/cat/${cat.id}`} className="block">
              <div className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Cat className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.breed || "品種未登録"}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
        <Link href="/dashboard">
          <Button className="w-full">
            ダッシュボードで全ての猫を見る
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
