"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/training", label: "Visão geral" },
  { href: "/training/musculacao", label: "Musculação" },
  { href: "/training/mobilidade", label: "Mobilidade/Fortalecimento" },
];

export function TrainingTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-zinc-800">
      {tabs.map(({ href, label }) => {
        const active = href === "/training" ? pathname === "/training" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              active
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-100"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
