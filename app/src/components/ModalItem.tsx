import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Confirmar } from '@/lib/captura';
import { brParaIso, dataLocal, HORA_PADRAO, horaLocal, isoParaBr, localParaUtc, somarDias } from '@/lib/datas';
import type { Item } from '@/lib/supabase';
import { cor } from '@/lib/tema';

export type Rascunho = {
  id?: string; // presente = editando um item salvo
  tipo: Item['tipo'];
  titulo: string;
  remind_at: string | null;
  texto_original: string;
};

const TIPOS: { valor: Item['tipo']; rotulo: string }[] = [
  { valor: 'lembrete', rotulo: 'Lembrete' },
  { valor: 'tarefa', rotulo: 'Tarefa' },
  { valor: 'nota', rotulo: 'Nota' },
  { valor: 'link', rotulo: 'Link' },
];

const PERGUNTA: Record<Confirmar, string> = {
  sem_data: 'Quando você quer ser lembrado?',
  passado: 'Esse horário já passou. Para quando fica?',
  ambiguo: 'Confere a data?',
};

type Props = {
  rascunho: Rascunho;
  motivo: Confirmar | null;
  onSalvar: (r: Rascunho) => void;
  onCancelar: () => void;
};

// Monte com key={...} a cada rascunho novo: o estado inicial vem das props.
export function ModalItem({ rascunho, motivo, onSalvar, onCancelar }: Props) {
  const hoje = dataLocal(new Date());
  const inicial = rascunho.remind_at ? new Date(rascunho.remind_at) : null;
  const [tipo, setTipo] = useState<Item['tipo']>(motivo ? 'lembrete' : rascunho.tipo);
  const [titulo, setTitulo] = useState(rascunho.titulo);
  const [data, setData] = useState(isoParaBr(inicial ? dataLocal(inicial) : hoje));
  const [hora, setHora] = useState(inicial ? horaLocal(inicial) : HORA_PADRAO);
  const [erro, setErro] = useState('');

  function salvar() {
    if (!titulo.trim()) return setErro('Dá um título.');
    if (tipo !== 'lembrete') return onSalvar({ ...rascunho, tipo, titulo: titulo.trim(), remind_at: null });
    const iso = brParaIso(data);
    const quando = iso && localParaUtc(iso, hora.trim() || HORA_PADRAO);
    if (!quando) return setErro('Data ou hora inválida. Use DD/MM/AAAA e HH:MM.');
    if (quando.getTime() <= Date.now()) return setErro('Escolha um horário no futuro.');
    onSalvar({ ...rascunho, tipo, titulo: titulo.trim(), remind_at: quando.toISOString() });
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={s.fundo}>
        <View style={s.caixa}>
          <Text style={s.titulo}>{motivo ? PERGUNTA[motivo] : rascunho.id ? 'Editar' : 'Novo item'}</Text>

          <TextInput style={s.campo} value={titulo} onChangeText={setTitulo} placeholder="Título" />

          <View style={s.linha}>
            {TIPOS.map((t) => (
              <Chip key={t.valor} rotulo={t.rotulo} ativo={tipo === t.valor} onPress={() => setTipo(t.valor)} />
            ))}
          </View>

          {tipo === 'lembrete' && (
            <>
              <View style={s.linha}>
                <Chip rotulo="Hoje" ativo={data === isoParaBr(hoje)} onPress={() => setData(isoParaBr(hoje))} />
                <Chip rotulo="Amanhã" ativo={data === isoParaBr(somarDias(hoje, 1))} onPress={() => setData(isoParaBr(somarDias(hoje, 1)))} />
                <Chip rotulo="Depois de amanhã" ativo={data === isoParaBr(somarDias(hoje, 2))} onPress={() => setData(isoParaBr(somarDias(hoje, 2)))} />
              </View>
              <View style={s.linha}>
                <TextInput style={[s.campo, s.metade]} value={data} onChangeText={setData} placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" />
                <TextInput style={[s.campo, s.metade]} value={hora} onChangeText={setHora} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
              </View>
              <View style={s.linha}>
                {['09:00', '12:00', '18:00', '20:00'].map((h) => (
                  <Chip key={h} rotulo={h} ativo={hora === h} onPress={() => setHora(h)} />
                ))}
              </View>
            </>
          )}

          {!!erro && <Text style={s.erro}>{erro}</Text>}

          <View style={s.botoes}>
            <Pressable onPress={onCancelar} style={s.secundario}><Text style={s.secundarioTexto}>Cancelar</Text></Pressable>
            <Pressable onPress={salvar} style={s.primario}><Text style={s.primarioTexto}>Salvar</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function Chip({ rotulo, ativo, onPress }: { rotulo: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, ativo && s.chipAtivo]} accessibilityState={{ selected: ativo }}>
      <Text style={[s.chipTexto, ativo && s.chipTextoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(26,26,42,0.45)', justifyContent: 'center', padding: 16 },
  caixa: { backgroundColor: cor.card, borderRadius: 16, padding: 20, gap: 12, maxWidth: 520, width: '100%', alignSelf: 'center' },
  titulo: { fontSize: 18, fontWeight: '700', color: cor.tinta },
  campo: { borderWidth: 1, borderColor: cor.contorno, borderRadius: 12, padding: 12, fontSize: 16, color: cor.tinta },
  metade: { flex: 1 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: cor.contorno, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipAtivo: { backgroundColor: cor.primaria, borderColor: cor.primaria },
  chipTexto: { color: cor.tinta, fontSize: 14 },
  chipTextoAtivo: { color: '#fff', fontWeight: '600' },
  erro: { color: cor.erro },
  botoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  secundario: { paddingVertical: 12, paddingHorizontal: 16 },
  secundarioTexto: { color: cor.tintaSuave, fontSize: 16 },
  primario: { backgroundColor: cor.primaria, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  primarioTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
