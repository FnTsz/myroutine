"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/entertainment/filmes", label: "Filmes" },
  { href: "/entertainment/series", label: "Séries" },
  { href: "/entertainment/livros", label: "Livros" },
];

export function EntertainmentTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-zinc-800">
      {tabs.map(({ href, label }) => {
        const active = pathname.startsWith(href);
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
