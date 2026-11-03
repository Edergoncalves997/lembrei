import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase, type Item } from './supabase';

// Espelha o retorno de backend/supabase/functions/capturar.
export type Confirmar = 'sem_data' | 'passado' | 'ambiguo';
export type Aviso = 'sem_hora' | 'recorrencia' | 'ia_indisponivel' | 'limite_diario';
export type Sugestao = {
  tipo: Item['tipo'];
  titulo: string;
  remind_at: string | null;
  confirmar: Confirmar | null;
  avisos: Aviso[];
  texto_original: string;
};

/** Pede a leitura da IA. Se a função falhar (fora do ar, sem crédito, limite), vira nota: nada se perde. */
export async function capturar(texto: string): Promise<Sugestao> {
  const { data, error } = await supabase.functions.invoke<Sugestao>('capturar', { body: { texto } });
  if (!error && data) return data;
  const limite = error instanceof FunctionsHttpError && error.context?.status === 429;
  return {
    tipo: 'nota',
    titulo: texto.slice(0, 200),
    remind_at: null,
    confirmar: null,
    avisos: [limite ? 'limite_diario' : 'ia_indisponivel'],
    texto_original: texto,
  };
}
