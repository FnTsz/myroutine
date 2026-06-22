"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";

interface SleepLog {
  id: number;
  date: string;
  score: number;
  notes: string | null;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "excelente";
  if (score >= 70) return "bom";
  if (score >= 50) return "regular";
  return "ruim";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={3} fill={scoreColor(payload.score)} stroke="transparent" />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as SleepLog;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs">
      <p className="text-zinc-400 mb-1">{formatShortDate(d.date)}</p>
      <p className="font-bold" style={{ color: scoreColor(d.score) }}>
        {d.score} <span className="font-normal text-zinc-400">— {scoreLabel(d.score)}</span>
      </p>
      {d.notes && <p className="text-zinc-500 mt-1 max-w-[160px] truncate">{d.notes}</p>}
    </div>
  );
}

export function SleepMiniChart() {
  const [logs, setLogs] = useState<SleepLog[]>([]);

  useEffect(() => {
    fetch("/api/sleep?days=30")
      .then((r) => r.json())
      .then(setLogs);
  }, []);

  const avg = logs.length
    ? Math.round(logs.reduce((s, l) => s + l.score, 0) / logs.length)
    : null;

  const chartData = logs.map((l) => ({ ...l, dateLabel: formatShortDate(l.date) }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">Histórico de sono</CardTitle>
          {avg !== null && (
            <span className="text-xs text-zinc-400">
              média:{" "}
              <span className="font-semibold" style={{ color: scoreColor(avg) }}>
                {avg}
              </span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {logs.length < 2 ? (
          <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">
            Registre pelo menos 2 noites para ver o gráfico.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 6, right: 6, bottom: 0, left: -28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 50, 70, 80, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={70} stroke="#3f3f46" strokeDasharray="4 4" />
                <ReferenceLine y={80} stroke="#3f3f46" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 5, fill: "#6366f1", stroke: "#09090b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-2 text-[10px] text-zinc-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> ≥80 excelente</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 70–79 bom</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 50–69 regular</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;50 ruim</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
