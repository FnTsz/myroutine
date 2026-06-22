import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(date: string): string {
  return format(parseISO(date), "dd/MM/yyyy");
}

export function formatShortDate(date: string): string {
  return format(parseISO(date), "dd/MM");
}

export function metersToKm(meters: number): string {
  return (meters / 1000).toFixed(2);
}

export function secondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

export function paceLabel(paceMinPerKm: number): string {
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}/km`;
}

export const MEAL_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  run: "Corrida",
  ride: "Ciclismo",
  swim: "Natação",
  strength: "Musculação",
  other: "Outro",
};
