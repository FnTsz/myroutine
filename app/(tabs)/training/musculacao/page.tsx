"use client";
import { useState } from "react";
import { Dumbbell, PlayCircle, Repeat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Exercise {
  reps: string;
  name: string;
}

interface MuscleWorkout {
  id: string;
  name: string;
  rounds?: string;
  exercises: Exercise[];
  videoUrl: string;
}

// Treinos de musculação. Para adicionar um novo, basta incluir um objeto aqui.
const WORKOUTS: MuscleWorkout[] = [
  {
    id: "single-kettbell-funcional-i",
    name: "Single Kettbell Funcional I",
    rounds: "6 a 8 rounds",
    exercises: [
      { reps: "5", name: "Swings" },
      { reps: "5", name: "Row" },
      { reps: "5", name: "Kneeling Press" },
      { reps: "5", name: "Goblet Squat" },
      { reps: "5", name: "Horn Curl" },
      { reps: "5", name: "Pushup" },
    ],
    videoUrl: "https://www.instagram.com/p/DaA4vwqOzmj/",
  },
];

export default function MusculacaoPage() {
  const [activeId, setActiveId] = useState(WORKOUTS[0]?.id);
  const active = WORKOUTS.find((w) => w.id === activeId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Musculação</h1>
        <p className="text-sm text-zinc-500 mt-1">Suas opções de treino de musculação</p>
      </div>

      {WORKOUTS.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center gap-2">
            <Dumbbell className="w-8 h-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Nenhum treino adicionado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Sub-abas: uma por treino */}
          <div className="flex flex-wrap gap-1 border-b border-zinc-800">
            {WORKOUTS.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveId(w.id)}
                className={cn(
                  "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  w.id === activeId
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-100"
                )}
              >
                {w.name}
              </button>
            ))}
          </div>

          {active && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">{active.name}</h2>
                    {active.rounds && (
                      <p className="flex items-center gap-1.5 text-sm text-amber-400/80 mt-1">
                        <Repeat className="w-3.5 h-3.5" />
                        {active.rounds}
                      </p>
                    )}
                  </div>
                  <a
                    href={active.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors flex-shrink-0"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Ver vídeo
                  </a>
                </div>

                <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 overflow-hidden">
                  {active.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50">
                      <span className="flex items-center justify-center w-9 h-9 rounded-md bg-amber-600/15 text-amber-300 text-sm font-semibold tabular-nums flex-shrink-0">
                        {ex.reps}
                      </span>
                      <span className="text-sm text-zinc-200">{ex.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
