import { Card, CardContent } from "@/components/ui/card";

interface ExerciseGuide {
  name: string;
  muscle: string;
  steps: string;
}

// Descrição de execução dos exercícios que aparecem nos treinos de musculação.
const GUIDES: ExerciseGuide[] = [
  {
    name: "Swing",
    muscle: "Posterior · glúteos · core",
    steps:
      "Pés na largura dos ombros, kettlebell à frente. Leve o quadril para trás (hip hinge) mantendo as costas neutras, projete o kettlebell entre as pernas e use a explosão do quadril e dos glúteos para balançá-lo até a altura do peito/ombros. Os braços ficam relaxados — a força vem do quadril, não dos ombros. Core firme o tempo todo.",
  },
  {
    name: "Row / Bent Over Row",
    muscle: "Costas · bíceps",
    steps:
      "Incline o tronco à frente levando o quadril para trás, costas retas. Segure o kettlebell e puxe em direção à costela, mantendo o cotovelo junto ao corpo e apertando a escápula no topo. Desça de forma controlada. Com um kettlebell, alterne os lados.",
  },
  {
    name: "Lawn Mower Row",
    muscle: "Costas · core (rotação)",
    steps:
      "Posição escalonada (um pé à frente), tronco inclinado e mão livre apoiada na coxa. Puxe o kettlebell do chão até o quadril num movimento diagonal — como dar partida num cortador de grama — girando levemente o tronco. Controle a descida. Alterne os lados.",
  },
  {
    name: "Kneeling Press",
    muscle: "Ombros · tríceps · core",
    steps:
      "Ajoelhado (um ou dois joelhos no chão), kettlebell na posição de rack (junto ao ombro, apoiado no antebraço). Pressione acima da cabeça até estender o braço, sem arquear a lombar — glúteos e core firmes para estabilizar. Retorne à rack devagar.",
  },
  {
    name: "HN Press (meio-ajoelhado)",
    muscle: "Ombros · tríceps · core anti-rotação",
    steps:
      "Posição meio-ajoelhada (um joelho no chão, o outro pé à frente, ângulos de 90°). Kettlebell em rack no lado do joelho de baixo. Pressione acima da cabeça mantendo o tronco ereto e resistindo à rotação. Desça à rack. Alterne os lados.",
  },
  {
    name: "Goblet Squat",
    muscle: "Pernas · glúteos · core",
    steps:
      "Segure o kettlebell junto ao peito pelas laterais da alça (como uma taça). Pés na largura dos ombros, agache descendo o quadril entre os joelhos, peito erguido e calcanhares no chão. Suba empurrando o chão com os pés.",
  },
  {
    name: "Suitcase Lunge",
    muscle: "Pernas · glúteos · core (anti-flexão lateral)",
    steps:
      "Segure o kettlebell ao lado do corpo, como uma mala. Dê um passo à frente (ou para trás) e desça em afundo até o joelho de trás quase tocar o chão, mantendo o tronco ereto e resistindo a tombar para o lado do peso. Volte à posição inicial. Alterne os lados.",
  },
  {
    name: "Thruster",
    muscle: "Corpo inteiro (pernas + ombros)",
    steps:
      "Kettlebell em rack (ou goblet). Faça um agachamento e, ao subir, aproveite o impulso das pernas para pressionar o kettlebell acima da cabeça num movimento contínuo. Desça à rack e repita. É agachamento + desenvolvimento numa única explosão.",
  },
  {
    name: "Horn Curl",
    muscle: "Bíceps · antebraço",
    steps:
      "Segure o kettlebell de cabeça para baixo pelos dois lados da alça (os 'chifres'), cotovelos junto ao corpo. Faça a flexão de cotovelo (rosca) levando o peso até os ombros e desça de forma controlada, sem balançar o tronco.",
  },
  {
    name: "Halo",
    muscle: "Ombros · core · mobilidade",
    steps:
      "Segure o kettlebell de cabeça para baixo pelos chifres, junto ao peito. Circule-o ao redor da cabeça, perto e controlado, mantendo o core firme e o quadril imóvel. Faça nos dois sentidos.",
  },
  {
    name: "Devil's Halo",
    muscle: "Ombros · core",
    steps:
      "Variação mais intensa do Halo: circule o kettlebell ao redor da cabeça mantendo-o um pouco mais afastado e com controle total, alternando as direções. Mantenha o core firme e o quadril estável para não compensar com a lombar.",
  },
  {
    name: "Chop",
    muscle: "Core (rotação) · oblíquos",
    steps:
      "Segure o kettlebell com as duas mãos e leve-o na diagonal, de cima de um ombro até o quadril oposto, girando o tronco e usando o core como motor do movimento. Controle a volta. Alterne os lados/direções.",
  },
  {
    name: "Around the World",
    muscle: "Core · estabilidade",
    steps:
      "Segure o kettlebell pela alça e circule-o ao redor da cintura, passando de uma mão para a outra na frente e atrás do corpo, mantendo o tronco estável e sem mexer o quadril. Faça nos dois sentidos.",
  },
  {
    name: "Pushup",
    muscle: "Peito · tríceps · core",
    steps:
      "Mãos um pouco mais largas que os ombros, corpo alinhado em prancha. Desça o peito até perto do chão com os cotovelos a ~45° do tronco e empurre de volta. Core firme e quadril alinhado — não deixe o quadril cair nem subir.",
  },
];

export default function ExerciciosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Como executar</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Descrição de execução dos exercícios usados nos treinos de musculação.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {GUIDES.map((g) => (
              <div key={g.name} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 className="text-base font-semibold text-zinc-100">{g.name}</h2>
                  <span className="text-xs text-amber-400/80">{g.muscle}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mt-1.5">{g.steps}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
