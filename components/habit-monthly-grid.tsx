"use client";
import { useEffect, useState } from "react";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { today } from "@/lib/utils";

interface HabitMonth {
  id: number;
  name: string;
  color: string | null;
  logs: Record<number, boolean>;
}

interface MonthData {
  habits: HabitMonth[];
  daysInMonth: number;
}

function toMonthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export function HabitMonthlyGrid({ refreshKey }: { refreshKey?: number }) {
  const [monthDate, setMonthDate] = useState(() => {
    const todayStr = today();
    return parseISO(todayStr.slice(0, 7) + "-01");
  });
  const [data, setData] = useState<MonthData | null>(null);

  const monthKey = toMonthKey(monthDate);
  const todayStr = today();
  const [todayYear, todayMon, todayDay] = todayStr.split("-").map(Number);
  const [viewYear, viewMon] = monthKey.split("-").map(Number);
  const isCurrentMonth = todayYear === viewYear && todayMon === viewMon;
  const isPastMonth = new Date(viewYear, viewMon - 1) < new Date(todayYear, todayMon - 1);

  async function load() {
    const res = await fetch(`/api/habits/monthly?month=${monthKey}`);
    const json = await res.json();
    setData(json);
  }

  useEffect(() => { load(); }, [monthKey, refreshKey]);

  function dayStatus(habit: HabitMonth, day: number): "done" | "missed" | "pending" | "future" {
    const isFuture = isCurrentMonth ? day > todayDay : !isPastMonth;
    if (isFuture) return "future";

    const logged = habit.logs[day];
    if (logged === true) return "done";
    if (isCurrentMonth && day === todayDay) return "pending";
    return "missed";
  }

  const days = data ? Array.from({ length: data.daysInMonth }, (_, i) => i + 1) : [];
  // Show abbreviated day labels (1, 5, 10, 15, 20, 25, 31)
  const labelDays = new Set([1, 5, 10, 15, 20, 25, data?.daysInMonth ?? 31]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Hábitos do mês</CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMonthDate((d) => subMonths(d, 1))}
              className="p-1 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-zinc-400 w-28 text-center capitalize">
              {format(monthDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, 1))}
              className="p-1 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.habits.length === 0 ? (
          <p className="text-sm text-zinc-600 py-2">Nenhum hábito cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {/* Day number labels */}
            <div className="flex items-center gap-1.5">
              <span className="w-32 flex-shrink-0" />
              <div className="flex gap-1">
                {days.map((d) => (
                  <div key={d} className="w-4 flex-shrink-0 text-center">
                    {labelDays.has(d) && (
                      <span className="text-[9px] text-zinc-600 leading-none">{d}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Habit rows */}
            {data.habits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-1.5">
                <div className="w-32 flex-shrink-0 flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habit.color ?? "#6366f1" }}
                  />
                  <span className="text-xs text-zinc-400 truncate">{habit.name}</span>
                </div>
                <div className="flex gap-1">
                  {days.map((d) => {
                    const status = dayStatus(habit, d);
                    return (
                      <div
                        key={d}
                        title={`Dia ${d} — ${status === "done" ? "concluído" : status === "missed" ? "perdido" : status === "pending" ? "pendente" : "futuro"}`}
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        style={{
                          backgroundColor:
                            status === "done"
                              ? (habit.color ?? "#6366f1")
                              : status === "missed"
                              ? "#ef4444"
                              : status === "pending"
                              ? "transparent"
                              : "transparent",
                          border:
                            status === "pending"
                              ? `1px solid ${habit.color ?? "#6366f1"}`
                              : status === "future"
                              ? "1px solid #27272a"
                              : "none",
                          opacity: status === "future" ? 0.4 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex gap-4 pt-2 border-t border-zinc-800 text-xs text-zinc-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> concluído
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> perdido
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border border-indigo-500 inline-block" /> pendente (hoje)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
