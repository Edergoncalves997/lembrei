import { BellRing, Check } from "lucide-react";
import { LogoMark } from "./Logo";

type Msg = { from: "me" | "bot"; text: React.ReactNode; time: string };

const conversa: Msg[] = [
  { from: "me", text: "me lembra amanhã às 10h de pagar a internet", time: "21:14" },
  {
    from: "bot",
    text: (
      <>
        Prontinho! ⏰ Amanhã às 10h te lembro de <b>pagar a internet</b>.
      </>
    ),
    time: "21:14",
  },
  { from: "me", text: "tenho reunião às 17h", time: "21:15" },
  { from: "bot", text: "Pra qual dia é a reunião das 17h? 🙂", time: "21:15" },
  { from: "me", text: "segunda", time: "21:15" },
  {
    from: "bot",
    text: (
      <>
        Anotado: <b>reunião</b> segunda às 17h. Te aviso antes!
      </>
    ),
    time: "21:15",
  },
];

export function PhoneChat() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* Cartões flutuantes, como no protótipo */}
      <div className="float-slow absolute -right-3 -top-5 z-20 flex rotate-3 items-center gap-2 rounded-2xl bg-card/95 p-2.5 pr-4 subtle-border soft-shadow backdrop-blur sm:-right-12">
        <span className="grid size-8 place-items-center rounded-xl bg-sun text-sun-ink">
          <BellRing className="size-4" />
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-bold">Amanhã, 10:00</span>
          <span className="block text-[11px] text-ink-soft">Pagar a internet</span>
        </span>
      </div>
      <div className="float-slower absolute -left-3 bottom-4 z-20 flex -rotate-3 items-center gap-2 rounded-2xl bg-card/95 p-2.5 pr-4 subtle-border soft-shadow backdrop-blur sm:-left-12">
        <span className="grid size-7 place-items-center rounded-lg bg-mint text-white">
          <Check className="size-4" />
        </span>
        <span className="text-xs font-semibold">Salvo no app</span>
      </div>

      {/* Celular */}
      <div className="relative rounded-[2.5rem] bg-ink p-2.5 soft-shadow">
        <div className="overflow-hidden rounded-[2rem] bg-chat-bg">
          <div className="flex items-center gap-3 bg-card px-4 pb-3 pt-6">
            <LogoMark className="size-9" />
            <div className="leading-tight">
              <p className="text-sm font-bold">Lembrinha</p>
              <p className="text-[11px] text-mint">online</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2 px-3 py-4" aria-label="Exemplo de conversa com a Lembrinha no WhatsApp">
            {conversa.map((m, i) => (
              <li
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-snug shadow-sm ${
                  m.from === "me"
                    ? "self-end rounded-tr-sm bg-chat-out"
                    : "self-start rounded-tl-sm bg-card"
                }`}
              >
                <span className="sr-only">{m.from === "me" ? "Você: " : "Lembrinha: "}</span>
                {m.text}
                <span className="ml-2 inline-block translate-y-0.5 text-[10px] text-outline">{m.time}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 bg-chat-bg px-3 pb-5">
            <div className="flex-1 rounded-full bg-card px-4 py-2.5 text-[13px] text-outline">Mensagem</div>
          </div>
        </div>
      </div>
    </div>
  );
}
