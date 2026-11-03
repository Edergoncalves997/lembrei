-- Lista de espera da landing (web/). Inserção pública, leitura só pelo painel/service role.
create table public.waitlist (
  id            bigint generated always as identity primary key,
  nome          text not null check (char_length(nome) between 1 and 80),
  whatsapp      text not null unique check (whatsapp ~ '^55[0-9]{10,11}$'),
  origem        text check (char_length(origem) <= 40),
  consentiu_em  timestamptz not null default now(),
  criado_em     timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- O site só pode inserir estas colunas; não pode ler, alterar nem apagar.
revoke all on public.waitlist from anon, authenticated;
grant insert (nome, whatsapp, origem) on public.waitlist to anon;

create policy "site pode entrar na lista"
  on public.waitlist for insert to anon
  with check (true);
