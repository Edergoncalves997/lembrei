// "O código decide, a IA só sugere" (PLANO.md §4). Função pura: sem rede, testada em decidir_test.ts.

export type Tipo = 'nota' | 'link' | 'tarefa' | 'lembrete';

/** O que a IA devolve: datas e horas LOCAIS (no fuso do usuário), nunca UTC. */
export type LeituraIA = {
  tipo: Tipo;
  titulo: string;
  data: string | null; // 'YYYY-MM-DD'
  hora: string | null; // 'HH:MM' (24h)
  recorrente: boolean;
  ambiguo: boolean;
};

/** Por que o app precisa abrir o seletor de data antes de salvar. */
export type Confirmar = 'sem_data' | 'passado' | 'ambiguo';
export type Aviso = 'sem_hora' | 'recorrencia' | 'ia_indisponivel';

export type Sugestao = {
  tipo: Tipo;
  titulo: string;
  remind_at: string | null; // ISO UTC; quando confirmar != null é só o palpite para preencher o seletor
  confirmar: Confirmar | null;
  avisos: Aviso[];
};

export const HORA_PADRAO = '09:00';

/** Diferença (ms) entre o relógio local em `fuso` e UTC no instante `t`. */
function deslocamento(t: number, fuso: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: fuso, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(t)).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t;
}

/** 'YYYY-MM-DD' + 'HH:MM' no fuso → Date (UTC). null se a data/hora não existe (ex.: 31/11). */
export function localParaUtc(data: string, hora: string, fuso: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const h = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!d || !h) return null;
  const [ano, mes, dia, hh, mm] = [+d[1], +d[2], +d[3], +h[1], +h[2]];
  if (hh > 23 || mm > 59) return null;
  const ingenuo = Date.UTC(ano, mes - 1, dia, hh, mm);
  const conferido = new Date(ingenuo);
  if (conferido.getUTCMonth() !== mes - 1 || conferido.getUTCDate() !== dia) return null;
  // Duas passadas cobrem a troca de horário de verão em fusos que ainda têm.
  let t = ingenuo - deslocamento(ingenuo, fuso);
  t = ingenuo - deslocamento(t, fuso);
  return new Date(t);
}

/** Texto de "agora" que vai para a IA, no fuso do usuário. */
export function agoraLocal(agora: Date, fuso: string): string {
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, ...o }).format(agora);
  const iso = new Intl.DateTimeFormat('sv-SE', { timeZone: fuso, dateStyle: 'short' }).format(agora); // YYYY-MM-DD
  return `${iso} (${f({ weekday: 'long' })}) ${f({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}`;
}

export function decidir(ia: LeituraIA, agora: Date, fuso: string): Sugestao {
  const avisos: Aviso[] = [];
  const titulo = ia.titulo.trim().slice(0, 200) || 'Sem título';

  // Tem data → é lembrete, mesmo que a IA tenha dito "tarefa".
  const tipo: Tipo = ia.data ? 'lembrete' : ia.tipo;
  if (tipo !== 'lembrete') return { tipo, titulo, remind_at: null, confirmar: null, avisos };

  if (ia.recorrente) avisos.push('recorrencia');
  if (!ia.data) return { tipo, titulo, remind_at: null, confirmar: 'sem_data', avisos };

  if (!ia.hora) avisos.push('sem_hora');
  const quando = localParaUtc(ia.data, ia.hora ?? HORA_PADRAO, fuso);
  if (!quando) return { tipo, titulo, remind_at: null, confirmar: 'ambiguo', avisos };

  const remind_at = quando.toISOString();
  if (quando.getTime() <= agora.getTime()) return { tipo, titulo, remind_at, confirmar: 'passado', avisos };
  if (ia.ambiguo) return { tipo, titulo, remind_at, confirmar: 'ambiguo', avisos };
  return { tipo, titulo, remind_at, confirmar: null, avisos };
}

/** Quando a IA falha: salva como nota com o texto original, nada se perde. */
export function semIA(texto: string): Sugestao {
  return { tipo: 'nota', titulo: texto.trim().slice(0, 200), remind_at: null, confirmar: null, avisos: ['ia_indisponivel'] };
}
