"use client";
import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { Droplets, RotateCcw, Plus, Pencil, Check, X, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { today, formatShortDate } from "@/lib/utils";

interface HydrationLog {
  id: number;
  date: string;
  amountMl: number;
}

const GOAL = 3000;
const QUICK_AMOUNTS = [150, 200, 250, 300, 500];

function mlLabel(ml: number) {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1).replace(".0", "")}L` : `${ml}ml`;
}

function progressColor(pct: number) {
  if (pct >= 100) return "#10b981";
  if (pct >= 60) return "#3b82f6";
  return "#6366f1";
}

export default function HydrationPage() {
  const [todayMl, setTodayMl] = useState(0);
  const [history, setHistory] = useState<HydrationLog[]>([]);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editMl, setEditMl] = useState("");
  const [showAddPast, setShowAddPast] = useState(false);
  const [pastDate, setPastDate] = useState(format(subDays(new Date(), 1), "yyyy-MM-dd"));
  const [pastMl, setPastMl] = useState("");
  const todayStr = today();

  async function load() {
    const [todayRes, histRes] = await Promise.all([
      fetch(`/api/hydration?date=${todayStr}`),
      fetch(`/api/hydration?days=14`),
    ]);
    const [todayData, histData] = await Promise.all([todayRes.json(), histRes.json()]);
    setTodayMl(todayData.amountMl ?? 0);
    setHistory(histData.filter((l: HydrationLog) => l.date !== todayStr));
  }

  useEffect(() => { load(); }, []);

  async function add(ml: number) {
    if (ml <= 0 || loading) return;
    setLoading(true);
    await fetch("/api/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: todayStr, amountMl: ml }),
    });
    setLoading(false);
    setCustom("");
    load();
  }

  async function reset() {
    setLoading(true);
    await fetch("/api/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: todayStr, amountMl: 0, set: true }),
    });
    setLoading(false);
    load();
  }

  // Define o total de um dia (cria ou sobrescreve). Usado para editar histórico.
  async function setDay(date: string, ml: number): Promise<boolean> {
    if (isNaN(ml) || ml < 0 || loading) return false;
    setLoading(true);
    const res = await fetch("/api/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, amountMl: ml, set: true }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Erro ao salvar");
      return false;
    }
    load();
    return true;
  }

  function startEdit(log: HydrationLog) {
    setEditingDate(log.date);
    setEditMl(String(log.amountMl));
  }

  function cancelEdit() {
    setEditingDate(null);
    setEditMl("");
  }

  async function saveEdit(date: string) {
    const ok = await setDay(date, Number(editMl));
    if (ok) cancelEdit();
  }

  async function addPast() {
    if (!pastDate) return;
    const ok = await setDay(pastDate, Number(pastMl));
    if (ok) {
      setShowAddPast(false);
      setPastMl("");
    }
  }

  const pct = Math.min(100, Math.round((todayMl / GOAL) * 100));
  const remaining = Math.max(0, GOAL - todayMl);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Hidratação</h1>
        <p className="text-sm text-zinc-500 mt-1">Meta diária: {mlLabel(GOAL)}</p>
      </div>

      {/* Today's progress */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Droplets className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-4xl font-bold text-zinc-100">{mlLabel(todayMl)}</p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {pct >= 100
                    ? "Meta atingida!"
                    : `faltam ${mlLabel(remaining)}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: progressColor(pct) }}>{pct}%</p>
              <p className="text-xs text-zinc-600 mt-0.5">de {mlLabel(GOAL)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: progressColor(pct) }}
            />
          </div>

          {/* Milestones */}
          <div className="flex justify-between mt-1.5 text-xs text-zinc-600">
            <span>0</span>
            <span>1L</span>
            <span>1.5L</span>
            <span>2L</span>
            <span>3L</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick add */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Adicionar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((ml) => (
              <Button
                key={ml}
                variant="secondary"
                onClick={() => add(ml)}
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {mlLabel(ml)}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              placeholder="Quantidade em ml"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-48"
              onKeyDown={(e) => e.key === "Enter" && add(Number(custom))}
            />
            <Button
              onClick={() => add(Number(custom))}
              disabled={!custom || Number(custom) <= 0 || loading}
            >
              Adicionar
            </Button>
          </div>

          {todayMl > 0 && (
            <div className="pt-1 border-t border-zinc-800">
              <button
                onClick={reset}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Zerar hoje
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Últimos 14 dias</CardTitle>
          <button
            onClick={() => setShowAddPast((s) => !s)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Registrar dia anterior
          </button>
        </CardHeader>
        <CardContent className="p-0">
          {showAddPast && (
            <div className="flex flex-wrap items-end gap-3 px-5 py-4 border-b border-zinc-800 bg-zinc-900/40">
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={pastDate}
                  max={todayStr}
                  onChange={(e) => setPastDate(e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Total do dia (ml)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="3000"
                  value={pastMl}
                  onChange={(e) => setPastMl(e.target.value)}
                  className="w-28"
                  onKeyDown={(e) => e.key === "Enter" && addPast()}
                />
              </div>
              <Button onClick={addPast} disabled={loading || !pastDate || pastMl === ""}>
                Salvar
              </Button>
            </div>
          )}

          {history.length === 0 && !showAddPast ? (
            <p className="px-5 py-6 text-sm text-zinc-600 text-center">Sem registros anteriores.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {history.map((log) => {
                const p = Math.min(100, Math.round((log.amountMl / GOAL) * 100));
                const isEditing = editingDate === log.date;
                return (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-sm text-zinc-400 w-20 flex-shrink-0">{formatShortDate(log.date)}</span>
                    {isEditing ? (
                      <>
                        <Input
                          type="number"
                          min="0"
                          value={editMl}
                          onChange={(e) => setEditMl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(log.date);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="w-28 h-8"
                        />
                        <span className="text-xs text-zinc-600">ml</span>
                        <div className="ml-auto flex items-center gap-1.5">
                          <button
                            onClick={() => saveEdit(log.date)}
                            disabled={loading}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${p}%`, backgroundColor: progressColor(p) }}
                          />
                        </div>
                        <span className="text-sm font-medium text-zinc-300 w-16 text-right tabular-nums">
                          {mlLabel(log.amountMl)}
                        </span>
                        <span className="text-xs text-zinc-600 w-8 text-right tabular-nums">{p}%</span>
                        <button
                          onClick={() => startEdit(log)}
                          className="text-zinc-700 hover:text-zinc-300 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
