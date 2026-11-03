import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import type { LeituraIA } from './decidir.ts';

export const MODELO = 'claude-haiku-5-5';

const Esquema = z.object({
  tipo: z.enum(['nota', 'link', 'tarefa', 'lembrete']),
  titulo: z.string(),
  data: z.string().nullable(),
  hora: z.string().nullable(),
  recorrente: z.boolean(),
  ambiguo: z.boolean(),
});

// Fixo (sem data/hora dentro) para não variar entre chamadas; o "agora" vai na mensagem do usuário.
const SISTEMA = `Você interpreta anotações rápidas em português do Brasil para o app Lembrinha.
Devolva só os campos pedidos. Datas e horas são LOCAIS do usuário.

tipo:
- "lembrete": o texto cita um dia, data, horário ou prazo, ou pede explicitamente para ser lembrado ("me lembra de...").
- "link": o texto é principalmente uma URL.
- "tarefa": algo a fazer, sem data nem horário.
- "nota": ideia, informação, indicação ou qualquer outra coisa. Na dúvida entre tarefa e nota, use "nota".

titulo: frase curta (até 60 caracteres) do que deve ser feito ou lembrado, sem a data/hora, começando com maiúscula. Ex.: "dentista sexta 15h" → "Dentista".

data ("YYYY-MM-DD") e hora ("HH:MM", 24h), resolvidas a partir do "agora" informado:
- NUNCA invente data. Sem nenhuma indicação de dia → data null. "me lembra de ligar pro banco" → tipo "lembrete", data null.
- Só horário, sem dia ("às 18h") → data de hoje, mesmo que esse horário já tenha passado.
- "amanhã", "depois de amanhã", "daqui N dias/horas/minutos", "daqui uma semana" → calcule a partir do agora.
- Dia da semana ("sexta", "segunda") → a próxima ocorrência; se for hoje, use hoje. "que vem"/"próxima" → a próxima ocorrência depois de hoje.
- "dia N" sem mês → este mês se o dia ainda não passou; senão, o mês seguinte. "DD/MM" sem ano → este ano se ainda não passou; senão, o ano seguinte. Datas no passado explícito ("ontem") ficam no passado.
- "fim de semana" → o próximo sábado.
- "5 da tarde" = 17:00; "8 da noite" = 20:00; "meio-dia" = 12:00. "de manhã" sem hora = 09:00; "à tarde" sem hora = 14:00; "à noite" sem hora = 20:00.
- Sem horário → hora null (o app aplica o padrão).
- Data que não existe (ex.: 31 de novembro) → devolva assim mesmo, o app trata.

recorrente: true se o texto pede repetição ("todo dia 10", "toda segunda", "diariamente"); nesse caso data/hora = a próxima ocorrência.
ambiguo: true quando há duas leituras razoáveis de data/hora (ex.: só um mês, "semana que vem" sem dia). Não marque ambiguo só porque falta a hora.`;

const cliente = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente

/** Chama a IA. Lança erro em falha de rede/API, recusa ou JSON inválido; quem chama decide o fallback. */
export async function interpretar(texto: string, agora: string, fuso: string): Promise<LeituraIA> {
  const resposta = await cliente.messages.parse({
    model: MODELO,
    max_tokens: 2000,
    output_config: { effort: 'low', format: zodOutputFormat(Esquema) },
    system: SISTEMA,
    messages: [{ role: 'user', content: `Agora: ${agora}, fuso ${fuso}.\nTexto: ${texto}` }],
  });
  if (resposta.stop_reason === 'refusal') throw new Error('IA recusou');
  if (!resposta.parsed_output) throw new Error(`IA sem JSON válido (${resposta.stop_reason})`);
  return resposta.parsed_output;
}
