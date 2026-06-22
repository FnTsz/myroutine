"use client";
import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { Plus, Trash2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { today, MEAL_LABELS } from "@/lib/utils";

interface Meal {
  id: number;
  date: string;
  mealType: string;
  description: string;
  calories: number | null;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_ORDER = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };

export default function DietPage() {
  const [date, setDate] = useState(today());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [form, setForm] = useState({ mealType: "breakfast", description: "", calories: "" });

  async function load() {
    const res = await fetch(`/api/diet?date=${date}`);
    const data = await res.json();
    setMeals(data.meals ?? []);
    setDailyGoal(data.dailyGoal ?? 2000);
  }

  useEffect(() => { load(); }, [date]);

  async function add() {
    if (!form.description.trim()) return;
    await fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        mealType: form.mealType,
        description: form.description,
        calories: form.calories ? Number(form.calories) : null,
      }),
    });
    setForm({ mealType: "breakfast", description: "", calories: "" });
    setOpen(false);
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/diet?id=${id}`, { method: "DELETE" });
    load();
  }

  async function saveGoal() {
    await fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "config", dailyGoal: Number(goalInput) }),
    });
    setConfigOpen(false);
    load();
  }

  const totalCal = meals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const pct = Math.min(100, Math.round((totalCal / dailyGoal) * 100));

  const byType = MEAL_TYPES.reduce<Record<string, Meal[]>>((acc, t) => {
    acc[t] = meals.filter((m) => m.mealType === t).sort((a, b) => a.id - b.id);
    return acc;
  }, {});

  function prevDay() { setDate(format(subDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd")); }
  function nextDay() {
    const next = format(new Date(new Date(date + "T12:00:00").getTime() + 86400000), "yyyy-MM-dd");
    if (next <= today()) setDate(next);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dieta</h1>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400" onClick={prevDay}>‹</Button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-zinc-400 border-none outline-none"
            />
            <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400" onClick={nextDay} disabled={date >= today()}>›</Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setGoalInput(String(dailyGoal))}>
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Meta calórica diária</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Calorias por dia</Label>
                  <Input type="number" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setConfigOpen(false)}>Cancelar</Button>
                  <Button onClick={saveGoal}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4" /> Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar refeição</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Refeição</Label>
                  <Select value={form.mealType} onValueChange={(v) => setForm({ ...form, mealType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((t) => <SelectItem key={t} value={t}>{MEAL_LABELS[t]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: 2 ovos mexidos com torrada"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Calorias estimadas (opcional)</Label>
                  <Input
                    type="number"
                    placeholder="350"
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={add}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calorie progress */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-zinc-400 text-sm">Calorias</span>
            <span className="text-zinc-400 text-sm">
              <span className="text-zinc-100 font-semibold text-lg">{totalCal}</span>
              {" / "}{dailyGoal} kcal
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#6366f1",
              }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1.5">
            {pct >= 100 ? `+${totalCal - dailyGoal} kcal acima da meta` : `${dailyGoal - totalCal} kcal restantes`}
          </p>
        </CardContent>
      </Card>

      {/* Meals by type */}
      {MEAL_TYPES.map((type) => (
        <Card key={type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              {MEAL_LABELS[type]}
              {byType[type].length > 0 && (
                <span className="ml-2 text-zinc-600 font-normal normal-case tracking-normal">
                  {byType[type].reduce((s, m) => s + (m.calories ?? 0), 0)} kcal
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byType[type].length === 0 ? (
              <p className="text-sm text-zinc-600 italic">Sem registro</p>
            ) : (
              <div className="space-y-2">
                {byType[type].map((meal) => (
                  <div key={meal.id} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-zinc-200">{meal.description}</span>
                    {meal.calories && (
                      <span className="text-xs text-zinc-500 tabular-nums">{meal.calories} kcal</span>
                    )}
                    <button onClick={() => remove(meal.id)} className="text-zinc-700 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
