"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

type Status = "idle" | "sending" | "ok" | "dup" | "error";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Aceita "(11) 91234-5678", "11912345678" ou "+55 11 9...". Devolve "55DDDNUMERO" ou null. */
function normalizarWhatsapp(valor: string): string | null {
  let d = valor.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  return "55" + d;
}

export function Waitlist() {
  const [status, setStatus] = useState<Status>("idle");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("site")) return; // honeypot: bots preenchem, pessoas não veem

    const nome = String(form.get("nome") ?? "").trim();
    const whatsapp = normalizarWhatsapp(String(form.get("whatsapp") ?? ""));
    if (!nome) return setErro("Diz seu nome pra gente 🙂");
    if (!whatsapp) return setErro("Confere o número: DDD + número, ex.: (11) 91234-5678.");
    if (!form.get("consentimento")) return setErro("Marque a caixinha de consentimento pra gente poder te avisar.");
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setStatus("error");
      return setErro("A lista ainda não está configurada. Tente de novo em breve.");
    }

    setErro(null);
    setStatus("sending");
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ nome, whatsapp, origem: "landing" }),
      });
      if (res.status === 409) return setStatus("dup");
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
    } catch {
      setStatus("error");
      setErro("Não consegui salvar agora. Tenta de novo daqui a pouco?");
    }
  }

  if (status === "ok" || status === "dup") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-card p-8 text-center subtle-border soft-shadow">
        <span className="grid size-12 place-items-center rounded-2xl bg-mint text-white">
          <Check className="size-6" />
        </span>
        <p className="text-xl font-bold">
          {status === "ok" ? "Você está na lista!" : "Você já estava na lista 😉"}
        </p>
        <p className="max-w-sm text-ink-soft">
          Quando abrir uma vaga no beta, a Lembrinha te chama no WhatsApp. Até lá, pode esquecer, que a gente lembra.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4 rounded-3xl bg-card p-6 subtle-border soft-shadow sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Seu nome
          <input
            name="nome"
            autoComplete="given-name"
            maxLength={80}
            required
            className="h-12 rounded-2xl border border-outline-soft bg-surface px-4 text-base font-normal outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Ana"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Seu WhatsApp
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            className="h-12 rounded-2xl border border-outline-soft bg-surface px-4 text-base font-normal outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="(11) 91234-5678"
          />
        </label>
      </div>

      {/* honeypot */}
      <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input name="consentimento" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-primary-500" />
        <span>
          Quero ser avisado(a) no WhatsApp quando abrir vaga no beta e li a{" "}
          <Link href="/privacidade" className="font-semibold text-primary underline-offset-2 hover:underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

      {erro && (
        <p role="alert" className="rounded-xl bg-[#ffdad6] px-4 py-2.5 text-sm font-medium text-[#93000a]">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-500 font-semibold text-white soft-shadow transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Entrar na lista de espera"}
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
