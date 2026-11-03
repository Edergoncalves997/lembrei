import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Check,
  CircleHelp,
  Link2,
  ListTodo,
  Lock,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import { Footer, Header } from "@/components/SiteChrome";
import { PhoneChat } from "@/components/PhoneChat";
import { Waitlist } from "@/components/Waitlist";

const passos = [
  {
    icon: MessageCircle,
    titulo: "Mande do seu jeito",
    texto: "Escreva no WhatsApp como se fosse pra você mesmo. Sem formulário, sem escolher pasta.",
  },
  {
    icon: Sparkles,
    titulo: "A Lembrinha entende",
    texto: "Ela percebe se é lembrete, tarefa, nota ou link e entende datas como “sexta às 9h” ou “daqui 3 dias”.",
  },
  {
    icon: BellRing,
    titulo: "Ela te avisa na hora",
    texto: "O lembrete chega no seu WhatsApp, com botões pra marcar como feito ou adiar.",
  },
];

const tipos = [
  { icon: CalendarClock, nome: "Lembretes", ex: "“consulta sexta às 14h”", cor: "bg-primary-50 text-primary" },
  { icon: ListTodo, nome: "Tarefas", ex: "“comprar ração amanhã”", cor: "bg-mint-100 text-mint" },
  { icon: StickyNote, nome: "Notas", ex: "“ideia pro app: modo escuro”", cor: "bg-sun-100 text-sun-ink" },
  { icon: Link2, nome: "Links", ex: "aquele vídeo pra ver depois", cor: "bg-surface-high text-ink-soft" },
];

const perguntas = [
  {
    q: "Quanto custa?",
    a: "Nada durante o beta. Depois haverá um plano gratuito e um Premium opcional, com mais recursos.",
  },
  {
    q: "Preciso instalar algum app?",
    a: "Não. Tudo começa pelo WhatsApp. O app (Android, no beta) é opcional, pra ver e buscar tudo que você salvou.",
  },
  {
    q: "Funciona no iPhone?",
    a: "Pelo WhatsApp, sim, em qualquer celular. O app para iPhone chega depois do beta.",
  },
  {
    q: "Entende áudio? E lembretes que se repetem?",
    a: "Ainda não. Por enquanto só texto e lembretes únicos. Os dois são as próximas novidades.",
  },
  {
    q: "Posso guardar senhas?",
    a: "Não pelo WhatsApp, e a Lembrinha vai te avisar se você tentar. Senha não é coisa pra mandar em conversa.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative overflow-x-clip">
        {/* Brilhos de fundo, como no protótipo */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary-100 opacity-50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-64 size-96 rounded-full bg-sun-100 opacity-50 blur-3xl" />

        {/* Hero */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary subtle-border">
              <span className="size-2 rounded-full bg-sun" /> Beta fechado · grátis
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Manda pra Lembrinha.{" "}
              <span className="text-primary-500">Ela lembra por você.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
              Lembretes, tarefas, notas e links: é só mandar uma mensagem no WhatsApp. A Lembrinha entende,
              organiza e te avisa na hora certa. Sua segunda memória.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="#lista"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-6 font-semibold text-white soft-shadow transition hover:brightness-105 active:scale-[0.98]"
              >
                Entrar na lista de espera <ArrowRight className="size-4" />
              </a>
              <a
                href="#como-funciona"
                className="flex h-12 items-center justify-center rounded-2xl bg-card px-6 font-semibold text-ink-soft subtle-border transition hover:text-primary"
              >
                Ver como funciona
              </a>
            </div>
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Check className="size-4 text-mint" /> Não precisa baixar nada pra começar
            </p>
          </div>
          <PhoneChat />
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="relative scroll-mt-20 bg-card/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Você já manda coisas pra si mesmo no WhatsApp. Agora alguém organiza.
            </h2>
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {passos.map((p, i) => (
                <li key={p.titulo} className="flex flex-col gap-4 rounded-3xl bg-card p-6 subtle-border soft-shadow">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary-500 text-white">
                      <p.icon className="size-5" />
                    </span>
                    <span className="text-4xl font-extrabold text-surface-high">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold">{p.titulo}</h3>
                  <p className="leading-relaxed text-ink-soft">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pergunta antes de inventar */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ela pergunta antes de inventar.</h2>
            <p className="text-lg leading-relaxed text-ink-soft">
              Lembrete com data errada é pior do que nenhum lembrete. Quando falta o dia, ou a data já passou, a
              Lembrinha pergunta. Quando dá pra entender, ela só salva e confirma.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { voce: "entrevista dia 5 do 10 às 5 da tarde", ela: "5/10 já passou este ano. Você quis dizer 5 de outubro do ano que vem, às 17h?" },
              { voce: "dentista às 15h", ela: "Pra qual dia é o dentista das 15h? 🙂" },
            ].map((c) => (
              <div key={c.voce} className="flex flex-col gap-2 rounded-3xl bg-chat-bg p-4">
                <p className="max-w-[85%] self-end rounded-xl rounded-tr-sm bg-chat-out px-3 py-2 text-sm shadow-sm">{c.voce}</p>
                <p className="max-w-[85%] self-start rounded-xl rounded-tl-sm bg-card px-3 py-2 text-sm shadow-sm">{c.ela}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tipos + app */}
        <section className="bg-card/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Tudo num lugar só. E fácil de achar.</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink-soft">
              O que você manda vira um item organizado. No app, você vê tudo, marca como feito e busca por qualquer
              palavra.
            </p>
            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
              <ul className="grid gap-4 sm:grid-cols-2">
                {tipos.map((t) => (
                  <li key={t.nome} className="flex items-start gap-4 rounded-3xl bg-card p-5 subtle-border soft-shadow">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${t.cor}`}>
                      <t.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-bold">{t.nome}</span>
                      <span className="block text-sm text-ink-soft">{t.ex}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Card "Hoje", como na tela inicial do protótipo */}
              <div className="rounded-3xl bg-card p-5 subtle-border soft-shadow">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-primary-500" />
                  <span className="text-lg font-bold">Hoje</span>
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">3 pendentes</span>
                </div>
                <ul className="mt-4 divide-y divide-surface-high">
                  {[
                    { t: "Pagar a internet", h: "10:00", c: "bg-sun" },
                    { t: "Reunião", h: "17:00", c: "bg-primary-500" },
                    { t: "Comprar ração", h: "sem hora", c: "bg-outline-soft" },
                  ].map((i) => (
                    <li key={i.t} className="flex items-center gap-3 py-3">
                      <span className="size-5 rounded-md border-2 border-outline-soft" />
                      <span className={`size-2 rounded-full ${i.c}`} />
                      <span className="flex-1 text-sm font-medium">{i.t}</span>
                      <span className="text-xs text-outline">{i.h}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-low px-3 py-2 text-xs text-ink-soft">
                  <Smartphone className="size-4 text-primary" /> App Android no beta · iPhone em breve
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacidade */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-[2rem] bg-ink p-8 text-white sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sua memória é sua.</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: ShieldCheck, t: "Não vendemos seus dados", d: "Nem pra anúncio, nem pra ninguém." },
                { icon: Sparkles, t: "IA só vê o necessário", d: "Só a mensagem que precisa ser entendida, e nada vira treino de modelo." },
                { icon: Lock, t: "Senha não é aqui", d: "Não guardamos senhas pelo WhatsApp." },
                { icon: Trash2, t: "Apague quando quiser", d: "Mande “apagar minha conta” e tudo some." },
              ].map((p) => (
                <li key={p.t} className="flex flex-col gap-2">
                  <p.icon className="size-6 text-sun" />
                  <span className="font-bold">{p.t}</span>
                  <span className="text-sm leading-relaxed text-white/70">{p.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Perguntas */}
        <section id="perguntas" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6">
          <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <CircleHelp className="size-7 text-primary-500" /> Perguntas
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {perguntas.map((p) => (
              <details key={p.q} className="group rounded-2xl bg-card p-5 subtle-border open:soft-shadow">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {p.q}
                    <span className="text-xl text-primary-500 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{p.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Lista de espera */}
        <section id="lista" className="scroll-mt-20 bg-primary-50/70 py-20">
          <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Quer testar antes de todo mundo?</h2>
              <p className="mt-3 text-lg text-ink-soft">
                O beta é pequeno e as vagas abrem aos poucos. Deixe seu WhatsApp que a Lembrinha te chama.
              </p>
            </div>
            <Waitlist />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
