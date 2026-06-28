"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { today, formatShortDate } from "@/lib/utils";

interface SleepLog {
  id: number;
  date: string;
  score: number;
  notes: string | null;
}

type RangeKey = "30" | "60" | "90";

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
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={scoreColor(payload.score)}
      stroke="transparent"
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as SleepLog;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs">
      <p className="text-zinc-400 mb-1">{formatShortDate(d.date)}</p>
      <p className="font-bold text-lg" style={{ color: scoreColor(d.score) }}>
        {d.score} <span className="text-sm font-normal text-zinc-400">— {scoreLabel(d.score)}</span>
      </p>
      {d.notes && <p className="text-zinc-400 mt-1 max-w-[180px]">{d.notes}</p>}
    </div>
  );
}

export default function SleepPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [range, setRange] = useState<RangeKey>("30");
  const [form, setForm] = useState({ date: today(), score: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  async function load() {
    const res = await fetch(`/api/sleep?days=${range}`);
    const data = await res.json();
    setLogs(data);
  }

  useEffect(() => { load(); }, [range]);

  async function save() {
    const score = Number(form.score);
    if (!form.date || isNaN(score) || score < 0 || score > 100) return;
    setSaving(true);
    await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: form.date, score, notes: form.notes || null }),
    });
    setSaving(false);
    setForm((f) => ({ ...f, score: "", notes: "" }));
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/sleep?id=${id}`, { method: "DELETE" });
    load();
  }

  function startEditNote(log: SleepLog) {
    setEditingId(log.id);
    setNoteDraft(log.notes ?? "");
  }

  function cancelEditNote() {
    setEditingId(null);
    setNoteDraft("");
  }

  async function saveNote(log: SleepLog) {
    setSavingNote(true);
    const res = await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: log.date, score: log.score, notes: noteDraft.trim() || null }),
    });
    setSavingNote(false);
    if (!res.ok) {
      alert("Erro ao salvar observação");
      return;
    }
    cancelEditNote();
    load();
  }

  const avg = logs.length ? Math.round(logs.reduce((s, l) => s + l.score, 0) / logs.length) : null;
  const todayLog = logs.find((l) => l.date === today());

  const chartData = logs.map((l) => ({ ...l, dateLabel: formatShortDate(l.date) }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Sono</h1>
        <p className="text-sm text-zinc-500 mt-1">Nota diária de 0 a 100</p>
      </div>

      {/* Input card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {todayLog ? `Hoje: ${todayLog.score} — ${scoreLabel(todayLog.score)}` : "Registrar sono de hoje"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-36"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nota (0–100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="75"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="w-24"
              />
            </div>
            <Button onClick={save} disabled={saving} className="mb-0">
              {saving ? "Salvando..." : todayLog ? "Atualizar" : "Salvar"}
            </Button>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Observações (opcional)</Label>
            <Textarea
              placeholder="Acordei às 3h, dormi tarde..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-baseline gap-3">
            <CardTitle>Histórico</CardTitle>
            {avg !== null && (
              <span className="text-sm text-zinc-400">
                média:{" "}
                <span className="font-semibold" style={{ color: scoreColor(avg) }}>
                  {avg}
                </span>
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {(["30", "60", "90"] as RangeKey[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? "secondary" : "ghost"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setRange(r)}
              >
                {r}d
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {logs.length < 2 ? (
            <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
              Registre pelo menos 2 noites para ver o gráfico.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={60} stroke="#3f3f46" strokeDasharray="4 4" />
                <ReferenceLine y={80} stroke="#3f3f46" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: "#6366f1", stroke: "#09090b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          {logs.length >= 2 && (
            <div className="flex gap-4 mt-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 80–100 excelente</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 70–79 bom</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 50–69 regular</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 0–49 ruim</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log list */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registros</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: scoreColor(log.score) }}
                    />
                    <span className="text-sm text-zinc-400 w-20 flex-shrink-0">{formatShortDate(log.date)}</span>
                    <span className="font-semibold tabular-nums" style={{ color: scoreColor(log.score) }}>
                      {log.score}
                    </span>
                    <span className="text-xs text-zinc-500">{scoreLabel(log.score)}</span>
                    {log.notes && editingId !== log.id && (
                      <span className="text-xs text-zinc-600 flex-1 truncate">{log.notes}</span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => (editingId === log.id ? cancelEditNote() : startEditNote(log))}
                        className="text-zinc-700 hover:text-zinc-300 transition-colors"
                        title={log.notes ? "Editar observação" : "Adicionar observação"}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => remove(log.id)}
                        className="text-zinc-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {editingId === log.id && (
                    <div className="mt-2 pl-6 space-y-2">
                      <Textarea
                        placeholder="Acordei às 3h, dormi tarde..."
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs" onClick={() => saveNote(log)} disabled={savingNote}>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          {savingNote ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelEditNote} disabled={savingNote}>
                          <X className="w-3.5 h-3.5 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
