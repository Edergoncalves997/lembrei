import { Footer, Header } from "./SiteChrome";
import { site } from "@/lib/site";

export function LegalPage({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{titulo}</h1>
        <p className="mt-2 text-sm text-outline">Última atualização: {site.legalUpdatedAt}</p>
        <div className="mt-8 flex flex-col gap-4 leading-relaxed text-ink-soft [&_a]:font-semibold [&_a]:text-primary [&_b]:text-ink [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
