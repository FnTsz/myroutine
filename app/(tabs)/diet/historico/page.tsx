"use client";
import { useEffect, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
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

export default function DietHistoryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
      const res = await fetch(`/api/diet?since=${since}`);
      const data = await res.json();
      setMeals(data.meals ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const todayStr = today();
  // Group by date, excluding the current logical day (still in progress)
  const byDate = meals
    .filter((m) => m.date < todayStr)
    .reduce<Record<string, Meal[]>>((acc, m) => {
      (acc[m.date] ??= []).push(m);
      return acc;
    }, {});

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Histórico</h1>
        <p className="text-sm text-zinc-500 mt-1">Dias anteriores arquivados automaticamente às 3h</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-600">Carregando...</p>
      ) : dates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-zinc-500">Nenhum dia arquivado ainda.</p>
            <p className="text-xs text-zinc-600 mt-1">Os registros de hoje aparecem aqui a partir das 3h da manhã.</p>
          </CardContent>
        </Card>
      ) : (
        dates.map((d) => {
          const dayMeals = byDate[d];
          const totals = dayMeals.reduce(
            (acc, m) => ({
              calories: acc.calories + (m.calories ?? 0),
              protein: acc.protein + (m.protein ?? 0),
              carbs: acc.carbs + (m.carbs ?? 0),
            }),
            { calories: 0, protein: 0, carbs: 0 }
          );
          return (
            <Card key={d}>
              <CardContent className="pt-5">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-semibold text-zinc-100 capitalize">
                    {format(parseISO(d), "EEEE, dd/MM/yyyy")}
                  </span>
                  <span className="flex gap-3 text-xs tabular-nums">
                    <span className="text-indigo-400">{totals.calories} kcal</span>
                    <span className="text-emerald-400">P {totals.protein}g</span>
                    <span className="text-amber-400">C {totals.carbs}g</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dayMeals.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-zinc-500 w-24 flex-shrink-0">{MEAL_LABELS[m.mealType] ?? m.mealType}</span>
                      <span className="flex-1 text-zinc-300 truncate">{m.description}</span>
                      {m.calories != null && <span className="text-xs text-zinc-500 tabular-nums">{m.calories} kcal</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
