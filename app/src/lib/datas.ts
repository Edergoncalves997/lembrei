// Datas no fuso do usuário. shortcut: fuso fixo de SP (padrão do plano); ler profiles.fuso quando houver outros.
export const FUSO = 'America/Sao_Paulo';
export const HORA_PADRAO = '09:00';

const fmtData = new Intl.DateTimeFormat('sv-SE', { timeZone: FUSO, dateStyle: 'short' }); // YYYY-MM-DD
const fmtHora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fmtSemana = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' });

export const dataLocal = (d: Date) => fmtData.format(d);
export const horaLocal = (d: Date) => fmtHora.format(d);

function deslocamento(t: number): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: FUSO, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(t)).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t;
}

/** Mesma regra do backend (functions/capturar/decidir.ts). null se a data/hora não existe. */
export function localParaUtc(data: string, hora: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const h = /^(\d{1,2}):(\d{2})$/.exec(hora);
  if (!d || !h) return null;
  const [ano, mes, dia, hh, mm] = [+d[1], +d[2], +d[3], +h[1], +h[2]];
  if (hh > 23 || mm > 59) return null;
  const ingenuo = Date.UTC(ano, mes - 1, dia, hh, mm);
  const c = new Date(ingenuo);
  if (c.getUTCMonth() !== mes - 1 || c.getUTCDate() !== dia) return null;
  let t = ingenuo - deslocamento(ingenuo);
  t = ingenuo - deslocamento(t);
  return new Date(t);
}

/** 'YYYY-MM-DD' ↔ 'DD/MM/AAAA' (o que o usuário digita). */
export const isoParaBr = (iso: string) => iso.split('-').reverse().join('/');
export function brParaIso(br: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(br.trim());
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
}

export function somarDias(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export type Dia = 'atrasado' | 'hoje' | 'amanha' | 'depois';
export function qualDia(remindAt: string, agora = new Date()): Dia {
  const quando = new Date(remindAt);
  const hoje = dataLocal(agora);
  const dia = dataLocal(quando);
  if (quando.getTime() < agora.getTime()) return 'atrasado';
  if (dia === hoje) return 'hoje';
  if (dia === somarDias(hoje, 1)) return 'amanha';
  return 'depois';
}

/** "hoje 15:00", "amanhã 08:00", "sex., 06/11 15:00". */
export function rotulo(remindAt: string, agora = new Date()): string {
  const d = new Date(remindAt);
  const hoje = dataLocal(agora);
  const dia = dataLocal(d);
  const prefixo = dia === hoje ? 'hoje' : dia === somarDias(hoje, 1) ? 'amanhã' : fmtSemana.format(d);
  return `${prefixo} ${horaLocal(d)}`;
}
