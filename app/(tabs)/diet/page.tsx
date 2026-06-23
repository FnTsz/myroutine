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
  protein: number | null;
  carbs: number | null;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function DietPage() {
  const [date, setDate] = useState(today());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState({ calories: 2000, protein: 150, carbs: 250 });
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [goalInput, setGoalInput] = useState({ calories: "", protein: "", carbs: "" });
  const [form, setForm] = useState({ mealType: "breakfast", description: "", calories: "", protein: "", carbs: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/diet?date=${date}`);
    const data = await res.json();
    setMeals(data.meals ?? []);
    setGoals({
      calories: data.dailyGoal ?? 2000,
      protein: data.proteinGoal ?? 150,
      carbs: data.carbsGoal ?? 250,
    });
  }

  useEffect(() => { load(); }, [date]);

  async function add() {
    if (!form.description.trim()) {
      setFormError("Adicione uma descrição.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          mealType: form.mealType,
          description: form.description.trim(),
          calories: form.calories ? Number(form.calories) : null,
          protein: form.protein ? Number(form.protein) : null,
          carbs: form.carbs ? Number(form.carbs) : null,
        }),
      });
      if (!res.ok) {
        setFormError("Não foi possível salvar. Tente novamente.");
        return;
      }
      setForm({ mealType: "breakfast", description: "", calories: "", protein: "", carbs: "" });
      setOpen(false);
      load();
    } catch {
      setFormError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/diet?id=${id}`, { method: "DELETE" });
    load();
  }

  async function saveGoal() {
    await fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "config",
        dailyGoal: Number(goalInput.calories),
        proteinGoal: Number(goalInput.protein),
        carbsGoal: Number(goalInput.carbs),
      }),
    });
    setConfigOpen(false);
    load();
  }

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.protein ?? 0),
      carbs: acc.carbs + (m.carbs ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0 }
  );

  const byType = MEAL_TYPES.reduce<Record<string, Meal[]>>((acc, t) => {
    acc[t] = meals.filter((m) => m.mealType === t).sort((a, b) => a.id - b.id);
    return acc;
  }, {});

  function prevDay() { setDate(format(subDays(new Date(date + "T12:00:00"), 1), "yyyy-MM-dd")); }
  function nextDay() {
    const next = format(new Date(new Date(date + "T12:00:00").getTime() + 86400000), "yyyy-MM-dd");
    if (next <= today()) setDate(next);
  }

  const macros = [
    { key: "calories" as const, label: "Calorias", unit: "kcal", color: "#6366f1" },
    { key: "protein" as const, label: "Proteína", unit: "g", color: "#10b981" },
    { key: "carbs" as const, label: "Carboidrato", unit: "g", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGoalInput({ calories: String(goals.calories), protein: String(goals.protein), carbs: String(goals.carbs) })}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Metas diárias</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Calorias (kcal)</Label>
                  <Input type="number" value={goalInput.calories} onChange={(e) => setGoalInput({ ...goalInput, calories: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Proteína (g)</Label>
                  <Input type="number" value={goalInput.protein} onChange={(e) => setGoalInput({ ...goalInput, protein: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Carboidrato (g)</Label>
                  <Input type="number" value={goalInput.carbs} onChange={(e) => setGoalInput({ ...goalInput, carbs: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setConfigOpen(false)}>Cancelar</Button>
                  <Button onClick={saveGoal}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); setFormError(""); }}>
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Calorias</Label>
                    <Input type="number" placeholder="350" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Proteína (g)</Label>
                    <Input type="number" placeholder="20" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Carbo (g)</Label>
                    <Input type="number" placeholder="40" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
                  </div>
                </div>
                {formError && <p className="text-sm text-red-400">{formError}</p>}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={add} disabled={saving}>{saving ? "Salvando..." : "Adicionar"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Macro progress */}
      <div className="grid grid-cols-3 gap-4">
        {macros.map(({ key, label, unit, color }) => {
          const total = totals[key];
          const goal = goals[key];
          const pct = Math.min(100, Math.round((total / goal) * 100));
          return (
            <Card key={key}>
              <CardContent className="pt-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-zinc-400 text-sm">{label}</span>
                  <span className="text-xs text-zinc-500 tabular-nums">{pct}%</span>
                </div>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {total}<span className="text-sm text-zinc-500 font-normal"> / {goal} {unit}</span>
                </p>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: total > goal ? "#ef4444" : color }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">
                  {total > goal ? `+${total - goal} ${unit} acima` : `${goal - total} ${unit} restantes`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                    <span className="flex gap-2 text-xs text-zinc-500 tabular-nums">
                      {meal.calories != null && <span>{meal.calories} kcal</span>}
                      {meal.protein != null && <span className="text-emerald-500/70">P {meal.protein}g</span>}
                      {meal.carbs != null && <span className="text-amber-500/70">C {meal.carbs}g</span>}
                    </span>
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
