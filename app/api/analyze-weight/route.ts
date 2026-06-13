import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { weights, catData } = await req.json()

    if (!weights || weights.length === 0) {
      return NextResponse.json({ error: "体重データがありません" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      tools: [{ googleSearchRetrieval: {} } as any],
    })

    const weightsText = weights
      .map((w: any) => `${new Date(w.date.seconds * 1000).toLocaleDateString("ja-JP")}: ${w.weight}kg`)
      .join("\n")

    const catInfo = `
猫の名前: ${catData.name}
品種: ${catData.breed || "不明"}
性別: ${catData.gender === "male" ? "オス" : catData.gender === "female" ? "メス" : "不明"}
年齢: ${catData.birthDate ? `${new Date().getFullYear() - new Date(catData.birthDate).getFullYear()}歳` : "不明"}
避妊去勢: ${catData.isNeutered ? "済" : "未"}
目標体重: ${catData.targetWeight ? `${catData.targetWeight}kg` : "未設定"}
    `

    const prompt = `あなたは猫の健康管理の専門家です。
Google検索を活用して、最新の猫の健康管理ガイドラインや、品種特有の注意点（特にかかりやすい病気や適正体重）を調査した上で、以下の情報を元にスマホでも読みやすい簡潔で視覚的な健康診断レポートを作成してください。

# 猫の情報
${catInfo}

# 体重記録
${weightsText}

# 依頼内容
以下の4つのセクションで構成してください。絵文字は一切使用しないでください。
Markdown形式で出力し、表や箇条書きを活用して視覚的に分かりやすくしてください。

1. **現在の状態評価** (適正体重との比較、最近の傾向)
2. **体形チェックのポイント** (飼い主が自宅で確認すべき点)
3. **具体的なアドバイス** (食事量、運動、生活環境など)
4. **専門家からのメッセージ** (励ましや注意点)

※ 回答は長くなりすぎないよう、要点を絞って簡潔に(スマホ1画面に収まる程度が理想)まとめてください。`

    const result = await model.generateContent(prompt)
    const response = result.response
    const analysis = response.text()

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing weight:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "分析に失敗しました" },
      { status: 500 },
    )
  }
}
