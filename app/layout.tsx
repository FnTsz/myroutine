import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "FnTs's life",
  description: "Controle de rotina pessoal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-100">
        <Nav />
        <main className="ml-56 min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
