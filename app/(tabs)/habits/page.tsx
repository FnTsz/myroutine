"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Flame, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HabitHeatmap } from "@/components/habit-heatmap";

interface Habit {
  id: number;
  name: string;
  frequency: string;
  frequencyDays: number;
  color: string;
  completedToday: boolean;
  streak: number;
}

interface HabitLog {
  date: string;
  completed: boolean;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<number, HabitLog[]>>({});
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", frequency: "daily", frequencyDays: "1", color: COLORS[0] });

  async function load() {
    const res = await fetch("/api/habits");
    const data = await res.json();
    setHabits(data);
  }

  async function loadLogs(id: number) {
    if (logs[id]) return;
    const res = await fetch(`/api/habits/${id}/logs`);
    const data = await res.json();
    setLogs((prev) => ({ ...prev, [id]: data }));
  }

  useEffect(() => { load(); }, []);

  async function toggle(id: number) {
    await fetch(`/api/habits/${id}/toggle`, { method: "POST" });
    load();
  }

  async function create() {
    if (!form.name.trim()) return;
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        frequency: form.frequency,
        frequencyDays: Number(form.frequencyDays),
        color: form.color,
      }),
    });
    setForm({ name: "", frequency: "daily", frequencyDays: "1", color: COLORS[0] });
    setOpen(false);
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    load();
  }

  function handleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadLogs(id);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Hábitos</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {habits.filter((h) => h.completedToday).length}/{habits.length} feitos hoje
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> Novo hábito</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar hábito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Meditar, Ler, Beber água..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && create()}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.frequency === "weekly" && (
                <div className="space-y-2">
                  <Label>Vezes por semana</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={form.frequencyDays}
                    onChange={(e) => setForm({ ...form, frequencyDays: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={create}>Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {habits.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p>Nenhum hábito criado ainda.</p>
            <p className="text-sm mt-1">Clique em &ldquo;Novo hábito&rdquo; para começar.</p>
          </div>
        )}
        {habits.map((habit) => (
          <Card key={habit.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: habit.color }} />
                <button
                  onClick={() => toggle(habit.id)}
                  className="flex-shrink-0 transition-transform hover:scale-110"
                >
                  {habit.completedToday ? (
                    <CheckCircle2 className="w-6 h-6" style={{ color: habit.color }} />
                  ) : (
                    <Circle className="w-6 h-6 text-zinc-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-medium ${habit.completedToday ? "line-through text-zinc-500" : "text-zinc-100"}`}
                  >
                    {habit.name}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
                    <span>{habit.frequency === "daily" ? "diário" : `${habit.frequencyDays}x/semana`}</span>
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-1" style={{ color: habit.color }}>
                        <Flame className="w-3 h-3" /> {habit.streak} dias
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 text-xs"
                    onClick={() => handleExpand(habit.id)}
                  >
                    {expandedId === habit.id ? "ocultar" : "histórico"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-600 hover:text-red-400"
                    onClick={() => remove(habit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {expandedId === habit.id && (
                <div className="px-4 pb-4 border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500 mb-3">Últimos 365 dias</p>
                  <HabitHeatmap logs={logs[habit.id] ?? []} color={habit.color} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
