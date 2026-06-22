"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Dumbbell, Utensils, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Hábitos", icon: CheckSquare },
  { href: "/training", label: "Treinos", icon: Dumbbell },
  { href: "/diet", label: "Dieta", icon: Utensils },
  { href: "/sleep", label: "Sono", icon: Moon },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 border-r border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="px-5 py-5 border-b border-zinc-800">
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">FnTs&apos;s life</h1>
        <p className="text-xs text-zinc-500 mt-0.5">controle pessoal</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">localhost:3000</p>
      </div>
    </aside>
  );
}
