"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Timestamp } from "firebase/firestore"

interface WeightRecord {
  id: string
  weight: number
  date: Timestamp
}

interface WeightChartProps {
  weights: WeightRecord[]
  targetWeight?: number
}

export function WeightChart({ weights, targetWeight }: WeightChartProps) {
  const chartData = [...weights].reverse().map((record) => ({
    date: record.date.toDate().toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    }),
    weight: record.weight,
    target: targetWeight,
  }))

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px]">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-[10px] sm:text-xs text-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis
              className="text-[10px] sm:text-xs text-muted-foreground"
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "14px",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
              name="体重"
            />
            {targetWeight && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="目標体重"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
