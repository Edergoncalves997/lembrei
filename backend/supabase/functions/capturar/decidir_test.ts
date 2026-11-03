import { assertEquals } from 'jsr:@std/assert@1';
import { agoraLocal, decidir, type LeituraIA, localParaUtc, semIA } from './decidir.ts';

const SP = 'America/Sao_Paulo';
const AGORA = new Date('2026-11-03T19:20:00Z'); // terça 03/11/2026 16:20 em SP
const base: LeituraIA = { tipo: 'lembrete', titulo: 'Dentista', data: null, hora: null, recorrente: false, ambiguo: false };

Deno.test('converte horário local de SP para UTC (UTC-3)', () => {
  assertEquals(localParaUtc('2026-11-06', '15:00', SP)?.toISOString(), '2026-11-06T18:00:00.000Z');
});

Deno.test('respeita horário de verão em outros fusos', () => {
  assertEquals(localParaUtc('2026-07-01', '09:00', 'Europe/Lisbon')?.toISOString(), '2026-07-01T08:00:00.000Z');
  assertEquals(localParaUtc('2026-12-01', '09:00', 'Europe/Lisbon')?.toISOString(), '2026-12-01T09:00:00.000Z');
});

Deno.test('rejeita data ou hora que não existe', () => {
  assertEquals(localParaUtc('2026-11-31', '09:00', SP), null);
  assertEquals(localParaUtc('2026-11-10', '25:00', SP), null);
  assertEquals(localParaUtc('10/11/2026', '09:00', SP), null);
});

Deno.test('agoraLocal mostra data, dia da semana e hora no fuso', () => {
  assertEquals(agoraLocal(AGORA, SP), '2026-11-03 (terça-feira) 16:20');
});

Deno.test('data e hora claras no futuro: salva direto', () => {
  assertEquals(decidir({ ...base, data: '2026-11-06', hora: '15:00' }, AGORA, SP), {
    tipo: 'lembrete', titulo: 'Dentista', remind_at: '2026-11-06T18:00:00.000Z', confirmar: null, avisos: [],
  });
});

Deno.test('dia sem hora: usa 9h e avisa', () => {
  const s = decidir({ ...base, data: '2026-11-06' }, AGORA, SP);
  assertEquals([s.remind_at, s.confirmar, s.avisos], ['2026-11-06T12:00:00.000Z', null, ['sem_hora']]);
});

Deno.test('lembrete sem data: pede confirmação, nunca inventa', () => {
  const s = decidir(base, AGORA, SP);
  assertEquals([s.remind_at, s.confirmar], [null, 'sem_data']);
});

Deno.test('horário que já passou: pede confirmação com o palpite preenchido', () => {
  const s = decidir({ ...base, data: '2026-11-03', hora: '10:00' }, AGORA, SP);
  assertEquals([s.remind_at, s.confirmar], ['2026-11-03T13:00:00.000Z', 'passado']);
});

Deno.test('ambíguo: pede confirmação', () => {
  assertEquals(decidir({ ...base, data: '2027-03-01', ambiguo: true }, AGORA, SP).confirmar, 'ambiguo');
});

Deno.test('data impossível vira ambíguo sem palpite', () => {
  const s = decidir({ ...base, data: '2026-11-31', hora: '10:00' }, AGORA, SP);
  assertEquals([s.remind_at, s.confirmar], [null, 'ambiguo']);
});

Deno.test('recorrência: cria o único e avisa', () => {
  const s = decidir({ ...base, data: '2026-11-10', recorrente: true }, AGORA, SP);
  assertEquals([s.confirmar, s.avisos], [null, ['recorrencia', 'sem_hora']]);
});

Deno.test('tarefa com data vira lembrete', () => {
  assertEquals(decidir({ ...base, tipo: 'tarefa', data: '2026-11-10', hora: '08:00' }, AGORA, SP).tipo, 'lembrete');
});

Deno.test('nota e link não têm data', () => {
  const s = decidir({ ...base, tipo: 'nota', titulo: '  Ideia de app  ' }, AGORA, SP);
  assertEquals(s, { tipo: 'nota', titulo: 'Ideia de app', remind_at: null, confirmar: null, avisos: [] });
});

Deno.test('sem IA: guarda como nota com o texto original', () => {
  assertEquals(semIA(' comprar pão ').titulo, 'comprar pão');
  assertEquals(semIA('x').avisos, ['ia_indisponivel']);
});
