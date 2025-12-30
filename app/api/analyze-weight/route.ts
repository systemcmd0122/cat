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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const weightsText = weights
      .map((w: any) => `${new Date(w.date.seconds * 1000).toLocaleDateString("ja-JP")}: ${w.weight}kg`)
      .join("\n")

    const catInfo = `
猫の名前: ${catData.name}
品種: ${catData.breed || "不明"}
性別: ${catData.gender === "male" ? "オス" : catData.gender === "female" ? "メス" : "不明"}
年齢: ${catData.birthDate ? `${new Date().getFullYear() - new Date(catData.birthDate).getFullYear()}歳` : "不明"}
避妊去勢: ${catData.isNeutered ? "済" : catData.isNeutered === false ? "未" : "不明"}
目標体重: ${catData.targetWeight ? `${catData.targetWeight}kg` : "未設定"}
    `

    const prompt = `あなたは猫の健康管理の専門家です。以下の猫の情報と体重データを分析し、健康状態と推奨事項を提供してください。

${catInfo}

体重記録:
${weightsText}

# 猫の健康に関する基礎知識

## 平均体重
- 大型猫種を除くと、オスでは4～5kg、メスでは3～4kgが平均的
- 小型猫は2～3.5kg、大型猫は4.5~9kg

## 体重の計り方
- 猫を抱っこしながら体重計に乗り、その後飼い主だけの体重を測って差し引く

## 体形チェックポイント
- お腹に脂肪がたまっていないか
- ウエストにくびれがあるか
- 背骨を感じられるか
- 肋骨を感じるか

## 太りやすい猫
- 去勢、避妊手術をした後は、体内の代謝が変わり太りやすくなる
- 中高齢を迎えると1日に必要なエネルギーが若いころと比べて低下するので、同じ量のご飯だと太ることも

# 分析項目

以下の観点から分析してください：
1. 体重の傾向（増加、減少、安定など）
2. 猫種、性別、年齢、避妊去勢状況を考慮した適正体重との比較
3. 体形チェックポイントに基づく評価
4. 避妊去勢後や中高齢猫の特性を考慮したアドバイス
5. 具体的な健康アドバイス（食事管理、運動など）
6. 目標体重が設定されている場合、その達成に向けた具体的なステップ

簡潔で分かりやすく、実用的なアドバイスを日本語でお願いします。`

    const result = await model.generateContent(prompt)
    const response = result.response
    const analysis = response.text()

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing weight:", error)
    return NextResponse.json({ error: "分析に失敗しました" }, { status: 500 })
  }
}
