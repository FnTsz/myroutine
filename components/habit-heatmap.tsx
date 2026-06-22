"use client";
import { useMemo } from "react";
import { eachDayOfInterval, subDays, format, getDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Log {
  date: string;
  completed: boolean;
}

interface Props {
  logs: Log[];
  color?: string;
}

export function HabitHeatmap({ logs, color = "#6366f1" }: Props) {
  const { weeks, logMap } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 364);
    const days = eachDayOfInterval({ start, end });

    const logMap = new Map<string, boolean>();
    logs.forEach((l) => logMap.set(l.date, l.completed));

    // Pad start to Sunday
    const firstDow = getDay(start);
    const padded = Array(firstDow).fill(null).concat(days);

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    return { weeks, logMap };
  }, [logs]);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const rgb = hexToRgb(color);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="w-3 h-3" />;
              const dateStr = format(day, "yyyy-MM-dd");
              const done = logMap.get(dateStr) ?? false;
              const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

              return (
                <Tooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 rounded-sm cursor-default transition-colors ${isToday ? "ring-1 ring-offset-1 ring-offset-zinc-900" : ""}`}
                      style={{
                        backgroundColor: done
                          ? `rgba(${rgb}, 0.85)`
                          : "rgb(39, 39, 42)",
                        outline: isToday ? `1px solid ${color}` : undefined,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs">
                    {format(day, "dd/MM/yyyy")} — {done ? "✓ feito" : "não feito"}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
