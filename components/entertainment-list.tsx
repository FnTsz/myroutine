"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/utils";

interface Item {
  id: number;
  type: string;
  name: string;
  author: string | null;
  date: string | null;
  rating: number | null;
}

const fmtRating = (r: number) => r.toFixed(1).replace(".", ",");

export function EntertainmentList({
  type,
  title,
  authorLabel,
  addLabel,
}: {
  type: string;
  title: string;
  authorLabel: string;
  addLabel: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", author: "", date: "", rating: 0 });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/entertainment?type=${type}`);
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => { load(); }, [type]);

  async function add() {
    if (!form.name.trim()) {
      setFormError("Adicione o nome.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/entertainment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: form.name.trim(),
          author: form.author.trim() || null,
          date: form.date || null,
          rating: form.rating || null,
        }),
      });
      if (!res.ok) {
        setFormError("Não foi possível salvar. Tente novamente.");
        return;
      }
      setForm({ name: "", author: "", date: "", rating: 0 });
      setOpen(false);
      load();
    } catch {
      setFormError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/entertainment?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); setFormError(""); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> {addLabel}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{addLabel}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Nome do título"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{authorLabel}</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nota</Label>
                <div className="flex items-center gap-3">
                  <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size={28} />
                  <span className="text-sm text-zinc-400 tabular-nums">
                    {form.rating ? `${fmtRating(form.rating)} / 5` : "—"}
                  </span>
                  {form.rating > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, rating: 0 })}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      limpar
                    </button>
                  )}
                </div>
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={add} disabled={saving}>{saving ? "Salvando..." : "Adicionar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600 italic">Nada por aqui ainda.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-100 font-medium truncate">{item.name}</p>
                  {(item.author || item.date) && (
                    <p className="text-sm text-zinc-500 truncate">
                      {item.author}
                      {item.author && item.date && " · "}
                      {item.date && formatDate(item.date)}
                    </p>
                  )}
                </div>
                {item.rating != null && (
                  <div className="flex items-center gap-2 shrink-0">
                    <StarRating value={item.rating} readOnly size={16} />
                    <span className="text-xs text-zinc-500 tabular-nums w-10">{fmtRating(item.rating)}/5</span>
                  </div>
                )}
                <button
                  onClick={() => remove(item.id)}
                  className="text-zinc-700 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
