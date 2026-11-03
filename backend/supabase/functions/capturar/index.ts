// POST /functions/v1/capturar  { texto }  → Sugestao (não salva: o app salva depois de confirmar).
import { createClient } from '@supabase/supabase-js';
import { agoraLocal, decidir, localParaUtc, semIA } from './decidir.ts';
import { interpretar } from './interpretar.ts';

const LIMITE_DIA = 50;
const FUSO_PADRAO = 'America/Sao_Paulo';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ erro: 'metodo' }, 405);

  const jwt = req.headers.get('Authorization')?.replace(/^Bearer /, '');
  const { data: auth } = jwt ? await admin.auth.getUser(jwt) : { data: { user: null } };
  const usuario = auth.user;
  if (!usuario) return json({ erro: 'nao_autenticado' }, 401);

  const corpo = await req.json().catch(() => null);
  const texto = typeof corpo?.texto === 'string' ? corpo.texto.trim() : '';
  if (!texto || texto.length > 2000) return json({ erro: 'texto_invalido' }, 400);

  const { data: perfil } = await admin.from('profiles').select('fuso').eq('id', usuario.id).maybeSingle();
  const fuso = perfil?.fuso ?? FUSO_PADRAO;
  const agora = new Date();

  // Limite diário (dia no fuso do usuário). Conta tentativas, inclusive as que falharem na IA.
  const hoje = new Intl.DateTimeFormat('sv-SE', { timeZone: fuso, dateStyle: 'short' }).format(agora);
  const inicioDoDia = localParaUtc(hoje, '00:00', fuso)!.toISOString();
  const { count } = await admin
    .from('capturas').select('id', { count: 'exact', head: true })
    .eq('user_id', usuario.id).gte('criado_em', inicioDoDia);
  if ((count ?? 0) >= LIMITE_DIA) return json({ erro: 'limite_diario' }, 429);
  await admin.from('capturas').insert({ user_id: usuario.id });

  try {
    const leitura = await interpretar(texto, agoraLocal(agora, fuso), fuso);
    return json({ ...decidir(leitura, agora, fuso), texto_original: texto });
  } catch (e) {
    console.error('capturar: IA falhou', e);
    return json({ ...semIA(texto), texto_original: texto });
  }
});
