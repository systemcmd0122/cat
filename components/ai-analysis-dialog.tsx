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

      if (!response.ok) {
        throw new Error("分析に失敗しました")
      }

      const data = await response.json()
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
            <Button onClick={handleAnalyze} size="lg" className="h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base">
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2" />
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
            <div className="bg-muted/50 rounded-lg p-2.5 sm:p-3 md:p-4 text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-headings:text-base prose-headings:font-bold prose-ul:my-2 prose-li:my-0 overflow-auto">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h2 className="text-sm sm:text-base md:text-lg font-bold mt-3 sm:mt-4 mb-1.5 sm:mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h3 className="text-xs sm:text-sm md:text-base font-bold mt-2.5 sm:mt-3 mb-1.5 sm:mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h4 className="text-xs font-bold mt-2 mb-1" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-0.5 sm:space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-0.5 sm:space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="ml-0 text-xs sm:text-sm" {...props} />,
                  p: ({ node, ...props }) => <p className="my-1 sm:my-2 text-xs sm:text-sm" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-2 sm:my-4" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-2 sm:pl-4 italic my-1 sm:my-2 text-xs sm:text-sm" {...props} />,
                  code: ({ node, inline, ...props }: any) => (
                    inline ? (
                      <code className="bg-muted px-1 sm:px-1.5 py-0.5 rounded text-xs" {...props} />
                    ) : (
                      <code className="block bg-muted p-1.5 sm:p-2 rounded text-xs overflow-x-auto" {...props} />
                    )
                  ),
                  pre: ({ node, ...props }) => <pre className="bg-muted p-1.5 sm:p-2 rounded overflow-x-auto text-xs" {...props} />,
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
