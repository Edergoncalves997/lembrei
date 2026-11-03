import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-sm font-semibold text-ink-soft">
          <Link href="/#como-funciona" className="hidden rounded-full px-3 py-2 hover:text-primary sm:block">
            Como funciona
          </Link>
          <Link href="/#perguntas" className="hidden rounded-full px-3 py-2 hover:text-primary sm:block">
            Perguntas
          </Link>
          <Link
            href="/#lista"
            className="ml-2 rounded-2xl bg-primary-500 px-4 py-2.5 text-white soft-shadow transition hover:brightness-105 active:scale-[0.98]"
          >
            Quero testar
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-soft/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2">{site.slogan}.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
          <Link href="/privacidade" className="hover:text-primary">Política de privacidade</Link>
          <Link href="/termos" className="hover:text-primary">Termos de uso</Link>
          <a href={`mailto:${site.contactEmail}`} className="hover:text-primary">{site.contactEmail}</a>
        </nav>
        <p className="text-outline">© 2026 {site.name}</p>
      </div>
    </footer>
  );
}
