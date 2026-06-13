"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

interface AIAnalysisDialogProps {
  open: boolean
  onClose: () => void
  weights: any[]
  catData: any
}

export function AIAnalysisDialog({ open, onClose, weights, catData }: AIAnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analyze-weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weights, catData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "分析に失敗しました")
      }

      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing:", error)
      toast({
        title: "エラーが発生しました",
        description: "分析に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAnalysis(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
            <span>AI健康分析</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Gemini AIが猫の体重データを分析し、健康アドバイスを提供します
          </DialogDescription>
        </DialogHeader>

        {!analysis && !loading && (
          <div className="py-4 sm:py-6 md:py-8 text-center">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-primary" />
              </div>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 px-2 sm:px-4">
              AIが体重データを分析し、健康状態と推奨事項を提供します
            </p>
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2" />
              )}
              分析を開始
            </Button>
          </div>
        )}

        {loading && (
          <div className="py-6 sm:py-8 text-center">
            <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-primary" />
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">分析中...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-card border rounded-xl p-4 sm:p-6 text-sm leading-relaxed prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground overflow-auto shadow-inner">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold mt-6 mb-4 pb-2 border-b flex items-center gap-2" {...props} />,
                  h2: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-bold mt-5 mb-3 text-primary" {...props} />,
                  h3: ({ node, ...props }) => <h4 className="text-sm sm:text-base font-bold mt-4 mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 my-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 my-4" {...props} />,
                  li: ({ node, ...props }) => <li className="text-sm sm:text-base" {...props} />,
                  p: ({ node, ...props }) => <p className="my-3 text-sm sm:text-base leading-relaxed" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-6 border-muted" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 bg-primary/5 py-2 rounded-r-lg text-sm" {...props} />,
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-border text-sm" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => <th className="border border-border bg-muted/50 p-2 text-left font-bold" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-border p-2" {...props} />,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                onClick={() => handleAnalyze()}
                variant="outline"
                className="w-full sm:w-auto h-9 sm:h-10 bg-transparent text-xs sm:text-sm"
              >
                再分析
              </Button>
              <Button onClick={() => handleOpenChange(false)} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
                閉じる
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
