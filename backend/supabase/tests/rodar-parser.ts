// Roda as frases de parser-casos.json contra a IA de verdade (custa centavos) e mostra a precisão.
// Uso (em backend/): deno task parser   — precisa de ANTHROPIC_API_KEY no ambiente.
import { agoraLocal, decidir, localParaUtc, type Sugestao } from '../functions/capturar/decidir.ts';
import { interpretar } from '../functions/capturar/interpretar.ts';

const FUSO = 'America/Sao_Paulo';
type Valor = string | null | string[];
type Caso = { texto: string; agora?: string; esperado: Record<string, Valor> };

const arquivo = JSON.parse(await Deno.readTextFile(new URL('./parser-casos.json', import.meta.url)));
const casos: Caso[] = arquivo.casos;

function local(iso: string | null) {
  if (!iso) return { data: null, hora: null };
  const d = new Date(iso);
  const data = new Intl.DateTimeFormat('sv-SE', { timeZone: FUSO, dateStyle: 'short' }).format(d);
  const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  return { data, hora };
}

function confere(s: Sugestao, esperado: Caso['esperado']): string[] {
  const obtido: Record<string, unknown> = { tipo: s.tipo, confirmar: s.confirmar, ...local(s.remind_at) };
  const erros: string[] = [];
  for (const [campo, quer] of Object.entries(esperado)) {
    if (campo === 'avisos') {
      for (const a of quer as string[]) if (!s.avisos.includes(a as never)) erros.push(`avisos sem ${a}`);
      continue;
    }
    const ok = Array.isArray(quer) ? quer.includes(obtido[campo] as string) : obtido[campo] === quer;
    if (!ok) erros.push(`${campo}: esperava ${JSON.stringify(quer)}, veio ${JSON.stringify(obtido[campo])}`);
  }
  return erros;
}

let acertos = 0;
const resultados = await Promise.all(casos.map(async (c) => {
  const [d, h] = (c.agora ?? arquivo.agora_padrao).split('T');
  const agora = localParaUtc(d, h, FUSO)!;
  try {
    const leitura = await interpretar(c.texto, agoraLocal(agora, FUSO), FUSO);
    return { c, erros: confere(decidir(leitura, agora, FUSO), c.esperado), leitura };
  } catch (e) {
    return { c, erros: [`falhou: ${(e as Error).message}`], leitura: null };
  }
}));

for (const { c, erros, leitura } of resultados) {
  if (erros.length === 0) { acertos++; continue; }
  console.log(`✗ "${c.texto}"\n    ${erros.join('\n    ')}\n    IA: ${JSON.stringify(leitura)}`);
}
const pct = Math.round((acertos / casos.length) * 100);
console.log(`\n${acertos}/${casos.length} corretos (${pct}%). Meta do beta: 85%.`);
if (pct < 85) Deno.exit(1);
