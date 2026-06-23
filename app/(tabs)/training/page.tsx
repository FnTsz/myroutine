"use client";
import { useEffect, useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Plus, RefreshCw, Zap, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { metersToKm, secondsToTime, paceLabel, ACTIVITY_LABELS } from "@/lib/utils";

interface Plan {
  id: number;
  date: string;
  title: string;
  description: string | null;
  type: string;
  plannedDistance: number | null;
  plannedDuration: number | null;
}

interface Activity {
  id: number;
  stravaId: string;
  date: string;
  name: string;
  type: string;
  distance: number | null;
  duration: number | null;
  avgHeartRate: number | null;
  avgPace: number | null;
  elevationGain: number | null;
}

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ACTIVITY_TYPES = ["run", "ride", "swim", "strength", "other"];

export default function TrainingPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stravaStatus, setStravaStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");
  const [syncing, setSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: format(new Date(), "yyyy-MM-dd"), title: "", description: "", type: "run", plannedDistance: "", plannedDuration: "" });

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  async function load() {
    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(weekEnd, "yyyy-MM-dd");
    const res = await fetch(`/api/training?from=${from}&to=${to}`);
    const data = await res.json();
    setPlans(data.plans ?? []);
    setActivities(data.activities ?? []);
  }

  useEffect(() => { load(); }, [weekStart]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("strava");
    if (s === "connected") setStravaStatus("connected");
    else if (s === "denied" || s === "error") setStravaStatus("disconnected");
  }, []);

  async function syncStrava() {
    setSyncing(true);
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setStravaStatus("disconnected");
      } else {
        setStravaStatus("connected");
        load();
      }
    } catch {
      setStravaStatus("disconnected");
    }
    setSyncing(false);
  }

  async function addPlan() {
    if (!form.title.trim() || !form.date) return;
    await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        title: form.title,
        description: form.description || null,
        type: form.type,
        plannedDistance: form.plannedDistance ? Number(form.plannedDistance) : null,
        plannedDuration: form.plannedDuration ? Number(form.plannedDuration) : null,
      }),
    });
    setOpen(false);
    setForm({ date: format(new Date(), "yyyy-MM-dd"), title: "", description: "", type: "run", plannedDistance: "", plannedDuration: "" });
    load();
  }

  async function removePlan(id: number) {
    await fetch(`/api/training?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Treinos</h1>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>‹</Button>
            <span className="text-sm text-zinc-400">{format(weekStart, "dd/MM")} – {format(weekEnd, "dd/MM/yyyy")}</span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-400" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>›</Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 text-xs" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>hoje</Button>
          </div>
        </div>
        <div className="flex gap-2">
          {stravaStatus !== "connected" ? (
            <Button variant="outline" size="sm" asChild>
              <a href="/api/strava/auth"><Zap className="w-3.5 h-3.5 mr-1" /> Conectar Strava</a>
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={syncStrava} disabled={syncing}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando..." : "Sync Strava"}
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4" /> Planejar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Planejar treino</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Data</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{ACTIVITY_LABELS[t] ?? t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Título</Label>
                  <Input placeholder="Ex: Long run, Intervalado 5x1km..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição (opcional)</Label>
                  <Input placeholder="Detalhes do treino..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Distância planejada (km)</Label>
                    <Input type="number" placeholder="10" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duração planejada (min)</Label>
                    <Input type="number" placeholder="60" value={form.plannedDuration} onChange={(e) => setForm({ ...form, plannedDuration: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={addPlan}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week calendar */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayPlans = plans.filter((p) => p.date === dateStr);
          const dayActs = activities.filter((a) => a.date === dateStr);
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

          return (
            <div key={dateStr} className={`rounded-xl border p-3 min-h-36 space-y-2 ${isToday ? "border-indigo-600/50 bg-indigo-600/5" : "border-zinc-800 bg-zinc-900"}`}>
              <div className="text-center">
                <p className="text-xs text-zinc-500">{DAYS_PT[day.getDay()]}</p>
                <p className={`text-sm font-semibold ${isToday ? "text-indigo-400" : "text-zinc-300"}`}>{format(day, "d")}</p>
              </div>

              {dayPlans.map((p) => (
                <div key={p.id} className="group relative bg-indigo-600/10 border border-indigo-600/20 rounded-md p-1.5">
                  <p className="text-xs text-indigo-300 font-medium leading-tight">{p.title}</p>
                  {p.plannedDistance && <p className="text-xs text-indigo-400/60">{p.plannedDistance}km</p>}
                  <button
                    onClick={() => removePlan(p.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {dayActs.map((a) => (
                <div key={a.id} className="bg-emerald-600/10 border border-emerald-600/20 rounded-md p-1.5">
                  <p className="text-xs text-emerald-300 font-medium leading-tight truncate">{a.name}</p>
                  <div className="text-xs text-emerald-400/60 space-y-0.5 mt-0.5">
                    {a.distance && <p>{metersToKm(a.distance)}km</p>}
                    {a.duration && <p>{secondsToTime(a.duration)}</p>}
                    {a.avgHeartRate && <p>♥ {a.avgHeartRate}bpm</p>}
                    {a.avgPace && <p>{paceLabel(a.avgPace)}</p>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Recent activities list */}
      {activities.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Atividades da semana</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{a.name}</p>
                    <p className="text-xs text-zinc-500">{ACTIVITY_LABELS[a.type] ?? a.type} · {a.date}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-400 tabular-nums">
                    {a.distance && <span>{metersToKm(a.distance)} km</span>}
                    {a.duration && <span>{secondsToTime(a.duration)}</span>}
                    {a.avgHeartRate && <span>♥ {a.avgHeartRate}</span>}
                    {a.avgPace && <span>{paceLabel(a.avgPace)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
