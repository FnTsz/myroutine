import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MusculacaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Musculação</h1>
        <p className="text-sm text-zinc-500 mt-1">Suas opções de treino de musculação</p>
      </div>

      <Card>
        <CardContent className="py-12 flex flex-col items-center text-center gap-2">
          <Dumbbell className="w-8 h-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">Nenhum treino adicionado ainda.</p>
          <p className="text-xs text-zinc-600">Em breve você poderá adicionar suas opções de treino aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
