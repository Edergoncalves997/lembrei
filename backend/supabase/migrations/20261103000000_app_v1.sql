-- v1 só app (PLANO.md §7). Login por e-mail e senha (Supabase Auth); auth.users é a conta.

create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  fuso              text not null default 'America/Sao_Paulo',
  -- O app só deixa criar a conta depois de marcar o aceite, então criar a conta = aceitar.
  termos_aceitos_em timestamptz not null default now(),
  telefone          text unique check (telefone ~ '^55[0-9]{10,11}$'), -- vinculado quando o bot chegar
  criado_em         timestamptz not null default now()
);

create function public.criar_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_profile();

create table public.items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo           text not null check (tipo in ('nota', 'link', 'tarefa', 'lembrete')),
  titulo         text not null check (char_length(titulo) between 1 and 200),
  texto_original text not null check (char_length(texto_original) <= 2000),
  remind_at      timestamptz,
  status         text not null default 'aberto' check (status in ('aberto', 'feito')),
  criado_em      timestamptz not null default now(),
  check (tipo <> 'lembrete' or remind_at is not null)
);

create index items_user_status_remind on public.items (user_id, status, remind_at);

-- Uma linha por chamada à IA: conta o limite de 50 por dia. Só a Edge Function escreve aqui.
create table public.capturas (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

create index capturas_user_dia on public.capturas (user_id, criado_em);

alter table public.profiles enable row level security;
alter table public.items    enable row level security;
alter table public.capturas enable row level security;

create policy "dono lê o próprio perfil"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "dono altera o próprio perfil" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "dono lê"     on public.items for select to authenticated using (user_id = (select auth.uid()));
create policy "dono cria"   on public.items for insert to authenticated with check (user_id = (select auth.uid()));
create policy "dono altera" on public.items for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "dono apaga"  on public.items for delete to authenticated using (user_id = (select auth.uid()));

-- O perfil só pode mudar fuso e telefone; o aceite dos termos não é editável pelo app.
revoke update on public.profiles from authenticated;
grant update (fuso, telefone) on public.profiles to authenticated;

-- capturas: sem policy para authenticated (só a service role da Edge Function acessa).
