import Link from "next/link";
import { site } from "@/lib/site";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="16" fill="#5b5bd6" />
      <path
        d="M20 22h24M20 32h16M20 42h10"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="45" cy="42" r="7" fill="#fdc74b" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${site.name}, página inicial`}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-primary-500">{site.name}</span>
    </Link>
  );
}
