"use client";
import { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { CheckCircle2, Circle, Flame, Moon, Utensils, Dumbbell, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { today, MEAL_LABELS, metersToKm, secondsToTime, formatShortDate } from "@/lib/utils";
import { HabitMonthlyGrid } from "@/components/habit-monthly-grid";
import { SleepMiniChart } from "@/components/sleep-mini-chart";

interface Habit { id: number; name: string; color: string; completedToday: boolean; streak: number; }
interface Meal { id: number; mealType: string; description: string; calories: number | null; }
interface SleepLog { id: number; date: string; score: number; notes: string | null; }
interface Activity { id: number; date: string; name: string; type: string; distance: number | null; duration: number | null; avgHeartRate: number | null; }
interface Plan { id: number; date: string; title: string; type: string; plannedDistance: number | null; }

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [sleepLog, setSleepLog] = useState<SleepLog | null>(null);
  const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
  const [todayPlan, setTodayPlan] = useState<Plan | null>(null);
  const [hydrationMl, setHydrationMl] = useState(0);
  const [gridKey, setGridKey] = useState(0);
  const todayStr = today();
  const HYDRATION_GOAL = 3000;

  useEffect(() => {
    async function loadAll() {
      const [habitsRes, dietRes, sleepRes, trainingRes, hydrationRes] = await Promise.all([
        fetch("/api/habits"),
        fetch(`/api/diet?date=${todayStr}`),
        fetch("/api/sleep?days=1"),
        fetch(`/api/training?from=${todayStr}&to=${todayStr}`),
        fetch(`/api/hydration?date=${todayStr}`),
      ]);

      const [habitsData, dietData, sleepData, trainingData, hydrationData] = await Promise.all([
        habitsRes.json(),
        dietRes.json(),
        sleepRes.json(),
        trainingRes.json(),
        hydrationRes.json(),
      ]);

      setHabits(habitsData);
      setMeals(dietData.meals ?? []);
      setDailyGoal(dietData.dailyGoal ?? 2000);
      setSleepLog(sleepData.find((l: SleepLog) => l.date === todayStr) ?? null);
      setTodayActivity(trainingData.activities?.[0] ?? null);
      setTodayPlan(trainingData.plans?.[0] ?? null);
      setHydrationMl(hydrationData.amountMl ?? 0);
    }
    loadAll();
  }, []);

  async function toggleHabit(id: number) {
    await fetch(`/api/habits/${id}/toggle`, { method: "POST" });
    setHabits((prev) =>
      prev.map((h) => h.id === id ? { ...h, completedToday: !h.completedToday } : h)
    );
    setGridKey((k) => k + 1);
  }

  const completedHabits = habits.filter((h) => h.completedToday).length;
  const totalCal = meals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const calPct = Math.min(100, Math.round((totalCal / dailyGoal) * 100));

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">{format(new Date(), "EEEE, d 'de' MMMM", { locale: undefined })}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* Habits summary */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Hábitos
            </div>
            <p className="text-3xl font-bold text-zinc-100">{completedHabits}<span className="text-lg text-zinc-500">/{habits.length}</span></p>
            <p className="text-xs text-zinc-500 mt-1">{completedHabits === habits.length && habits.length > 0 ? "Tudo feito! 🎉" : "concluídos hoje"}</p>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Moon className="w-4 h-4" />
              Sono
            </div>
            {sleepLog ? (
              <>
                <p className="text-3xl font-bold" style={{ color: scoreColor(sleepLog.score) }}>{sleepLog.score}</p>
                <p className="text-xs text-zinc-500 mt-1">{sleepLog.notes ?? "nota de hoje"}</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-zinc-600">—</p>
                <p className="text-xs text-zinc-600 mt-1">sem registro</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Calories */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Utensils className="w-4 h-4" />
              Calorias
            </div>
            <p className="text-3xl font-bold text-zinc-100">{totalCal}<span className="text-sm text-zinc-500"> kcal</span></p>
            <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${calPct}%`,
                  backgroundColor: calPct >= 100 ? "#ef4444" : "#6366f1",
                }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">{calPct}% da meta</p>
          </CardContent>
        </Card>

        {/* Hydration */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Droplets className="w-4 h-4" />
              Hidratação
            </div>
            <p className="text-3xl font-bold text-zinc-100">
              {hydrationMl >= 1000 ? `${(hydrationMl / 1000).toFixed(1)}L` : `${hydrationMl}ml`}
            </p>
            <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((hydrationMl / HYDRATION_GOAL) * 100))}%`,
                  backgroundColor: hydrationMl >= HYDRATION_GOAL ? "#10b981" : "#3b82f6",
                }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {Math.min(100, Math.round((hydrationMl / HYDRATION_GOAL) * 100))}% da meta (3L)
            </p>
          </CardContent>
        </Card>

        {/* Training */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Dumbbell className="w-4 h-4" />
              Treino
            </div>
            {todayActivity ? (
              <>
                <p className="text-sm font-semibold text-emerald-400 truncate">{todayActivity.name}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {todayActivity.distance ? metersToKm(todayActivity.distance) + "km" : ""}
                  {todayActivity.duration ? " · " + secondsToTime(todayActivity.duration) : ""}
                </p>
              </>
            ) : todayPlan ? (
              <>
                <p className="text-sm font-medium text-indigo-400 truncate">{todayPlan.title}</p>
                <p className="text-xs text-zinc-500 mt-1">planejado{todayPlan.plannedDistance ? ` · ${todayPlan.plannedDistance}km` : ""}</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-zinc-600">—</p>
                <p className="text-xs text-zinc-600 mt-1">descanso</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <HabitMonthlyGrid refreshKey={gridKey} />
      <SleepMiniChart />

      <div className="grid grid-cols-2 gap-4">
        {/* Habits list */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Hábitos de hoje</CardTitle></CardHeader>
          <CardContent className="p-0">
            {habits.length === 0 ? (
              <p className="px-5 pb-4 text-sm text-zinc-600">Nenhum hábito criado.</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {habits.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    {h.completedToday ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: h.color }} />
                    ) : (
                      <Circle className="w-4 h-4 flex-shrink-0 text-zinc-700" />
                    )}
                    <span className={`text-sm flex-1 ${h.completedToday ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                      {h.name}
                    </span>
                    {h.streak > 0 && (
                      <span className="text-xs flex items-center gap-0.5" style={{ color: h.color }}>
                        <Flame className="w-3 h-3" />{h.streak}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meals today */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Refeições hoje</CardTitle></CardHeader>
          <CardContent className="p-0">
            {meals.length === 0 ? (
              <p className="px-5 pb-4 text-sm text-zinc-600">Nenhum registro ainda.</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {meals.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="text-xs text-zinc-500 w-20 flex-shrink-0">{MEAL_LABELS[m.mealType]}</span>
                    <span className="text-sm text-zinc-200 flex-1 truncate">{m.description}</span>
                    {m.calories && <span className="text-xs text-zinc-500 tabular-nums">{m.calories}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
