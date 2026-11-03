import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Aviso, type Acao, type AvisoDados } from '@/components/Aviso';
import { CartaoItem } from '@/components/CartaoItem';
import { Chip, ModalItem, type Rascunho } from '@/components/ModalItem';
import { capturar, type Confirmar, type Sugestao } from '@/lib/captura';
import { qualDia, rotulo } from '@/lib/datas';
import { pedirAlarmeExato, prepararNotificacoes, sincronizarNotificacoes, temAlarmeExato } from '@/lib/notificacoes';
import { supabase, type Item } from '@/lib/supabase';
import { cor } from '@/lib/tema';

type Aba = 'hoje' | 'amanha' | 'proximos' | 'tudo';
const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'hoje', rotulo: 'Hoje' },
  { valor: 'amanha', rotulo: 'Amanhã' },
  { valor: 'proximos', rotulo: 'Próximos' },
  { valor: 'tudo', rotulo: 'Tudo' },
];
const TIPOS: { valor: Item['tipo'] | null; rotulo: string }[] = [
  { valor: null, rotulo: 'Todos' },
  { valor: 'lembrete', rotulo: 'Lembretes' },
  { valor: 'tarefa', rotulo: 'Tarefas' },
  { valor: 'nota', rotulo: 'Notas' },
  { valor: 'link', rotulo: 'Links' },
];

const buscarItens = () =>
  supabase
    .from('items')
    .select('*')
    .eq('status', 'aberto')
    .order('remind_at', { ascending: true, nullsFirst: false })
    .order('criado_em', { ascending: false });

// Mesma ordem da consulta: com data primeiro (mais cedo antes), depois os sem data (mais novos antes).
function ordenar(itens: Item[]): Item[] {
  return [...itens].sort((a, b) => {
    if (a.remind_at && b.remind_at) return a.remind_at.localeCompare(b.remind_at);
    if (a.remind_at) return -1;
    if (b.remind_at) return 1;
    return b.criado_em.localeCompare(a.criado_em);
  });
}

function naAba(item: Item, aba: Aba): boolean {
  if (aba === 'tudo') return true;
  if (!item.remind_at) return false;
  const dia = qualDia(item.remind_at);
  if (aba === 'hoje') return dia === 'hoje' || dia === 'atrasado';
  if (aba === 'amanha') return dia === 'amanha';
  return dia === 'depois';
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Lista() {
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState<Aba>('tudo');
  const [tipo, setTipo] = useState<Item['tipo'] | null>(null);
  const [busca, setBusca] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [modal, setModal] = useState<{ rascunho: Rascunho; motivo: Confirmar | null; chave: number } | null>(null);
  const [aviso, setAviso] = useState<AvisoDados | null>(null);
  const contador = useRef(0);
  const carregouOk = useRef(false); // só sincroniza notificações depois de ler a lista de verdade
  const pediuExato = useRef(false);

  const carregar = useCallback(
    () =>
      buscarItens().then(({ data, error }) => {
        setCarregando(false);
        setErro(error ? 'Não consegui carregar seus itens.' : '');
        if (data) {
          carregouOk.current = true;
          setItens(data as Item[]);
        }
      }),
    [],
  );
  useEffect(() => { carregar(); }, [carregar]);

  const avisar = useCallback((texto: string, acoes: Acao[] = []) => setAviso({ id: ++contador.current, texto, acoes }), []);
  const fecharAviso = useCallback(() => setAviso(null), []);

  // Permissão de notificação ao abrir (no Android 13+ o sistema pergunta uma vez).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    prepararNotificacoes().then((ok) => {
      if (!ok) avisar('Notificações desligadas: ative nas configurações do Android para receber os lembretes.');
    });
  }, [avisar]);

  // Agendamentos do aparelho sempre iguais à lista. Se há lembrete futuro e falta o alarme exato, sugere uma vez.
  useEffect(() => {
    if (Platform.OS === 'web' || !carregouOk.current) return;
    sincronizarNotificacoes(itens).then(async () => {
      const temFuturo = itens.some((i) => i.tipo === 'lembrete' && i.remind_at && new Date(i.remind_at).getTime() > Date.now());
      if (!temFuturo || pediuExato.current || (await temAlarmeExato())) return;
      pediuExato.current = true;
      avisar('Para o lembrete tocar na hora exata, permita "Alarmes e lembretes".', [
        { rotulo: 'Permitir', onPress: () => pedirAlarmeExato().then(() => sincronizarNotificacoes(itens)) },
      ]);
    });
  }, [itens, avisar]);
  const abrirModal = (rascunho: Rascunho, motivo: Confirmar | null = null) =>
    setModal({ rascunho, motivo, chave: ++contador.current });

  const visiveis = useMemo(() => {
    const termo = semAcento(busca.trim());
    return itens.filter(
      (i) => naAba(i, aba) && (!tipo || i.tipo === tipo) &&
        (!termo || semAcento(`${i.titulo} ${i.texto_original}`).includes(termo)),
    );
  }, [itens, aba, tipo, busca]);

  // ---- ações -------------------------------------------------------------

  async function criar(r: Rascunho, s?: Sugestao) {
    const { data, error } = await supabase
      .from('items')
      .insert({ tipo: r.tipo, titulo: r.titulo, texto_original: r.texto_original, remind_at: r.remind_at })
      .select()
      .single();
    if (error || !data) {
      setTexto(r.texto_original); // devolve o texto para não perder
      return avisar('Não consegui salvar. Tenta de novo.');
    }
    const item = data as Item;
    setItens((atual) => ordenar([...atual, item]));

    const partes: string[] = [];
    if (item.tipo === 'lembrete' && item.remind_at) {
      partes.push(`Lembrete · ${item.titulo} · ${rotulo(item.remind_at)}`);
      if (s?.avisos.includes('sem_hora')) partes.push('Usei 9h, o horário padrão.');
      if (s?.avisos.includes('recorrencia')) partes.push('Por enquanto só lembretes únicos: criei o próximo.');
    } else {
      partes.push(`Salvei como ${item.tipo}.`);
      if (s?.avisos.includes('ia_indisponivel')) partes.push('(IA indisponível agora.)');
      if (s?.avisos.includes('limite_diario')) partes.push('(Limite diário da IA atingido.)');
    }
    if (/senha/i.test(item.texto_original)) partes.push('Dica: o Lembrinha não é lugar para guardar senhas.');

    const acoes: Acao[] = [];
    if (item.tipo === 'nota') acoes.push({ rotulo: 'Virar lembrete', onPress: () => abrirModal({ ...item, tipo: 'lembrete' }, 'sem_data') });
    else acoes.push({ rotulo: 'Editar', onPress: () => abrirModal(item) });
    acoes.push({ rotulo: 'Desfazer', onPress: () => apagarDeVez(item.id) });
    avisar(partes.join(' '), acoes);
  }

  async function aoCapturar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    const s = await capturar(t);
    setEnviando(false);
    setTexto('');
    const rascunho: Rascunho = { tipo: s.tipo, titulo: s.titulo, remind_at: s.remind_at, texto_original: s.texto_original };
    if (s.confirmar) abrirModal(rascunho, s.confirmar);
    else criar(rascunho, s);
  }

  async function salvarModal(r: Rascunho) {
    setModal(null);
    if (!r.id) return criar(r);
    const mudancas = { tipo: r.tipo, titulo: r.titulo, remind_at: r.remind_at };
    const { error } = await supabase.from('items').update(mudancas).eq('id', r.id);
    if (error) return avisar('Não consegui salvar a edição.');
    setItens((atual) => ordenar(atual.map((i) => (i.id === r.id ? { ...i, ...mudancas } : i))));
    avisar('Alterações salvas.');
  }

  function cancelarModal() {
    // Cancelar uma captura nova devolve o texto ao campo, para não perder o que foi digitado.
    if (modal && !modal.rascunho.id) setTexto(modal.rascunho.texto_original);
    setModal(null);
  }

  async function apagarDeVez(id: string) {
    setItens((atual) => atual.filter((i) => i.id !== id));
    await supabase.from('items').delete().eq('id', id);
  }

  async function apagar(item: Item) {
    setItens((atual) => atual.filter((i) => i.id !== item.id));
    const { error } = await supabase.from('items').delete().eq('id', item.id);
    if (error) {
      setItens((atual) => ordenar([...atual, item]));
      return avisar('Não consegui apagar.');
    }
    avisar('Apagado.', [{
      rotulo: 'Desfazer',
      onPress: async () => {
        const { error: e } = await supabase.from('items').insert(item);
        if (!e) setItens((atual) => ordenar([...atual, item]));
      },
    }]);
  }

  async function marcarFeito(item: Item) {
    setItens((atual) => atual.filter((i) => i.id !== item.id));
    const { error } = await supabase.from('items').update({ status: 'feito' }).eq('id', item.id);
    if (error) {
      setItens((atual) => ordenar([...atual, item]));
      return avisar('Não consegui marcar como feito.');
    }
    avisar('Feito ✓', [{
      rotulo: 'Desfazer',
      onPress: async () => {
        const { error: e } = await supabase.from('items').update({ status: 'aberto' }).eq('id', item.id);
        if (!e) setItens((atual) => ordenar([...atual, item]));
      },
    }]);
  }

  // ---- tela --------------------------------------------------------------

  return (
    <SafeAreaView style={s.tela}>
      <View style={s.topo}>
        <Text style={s.marca}>Lembrinha</Text>
        <Pressable onPress={() => supabase.auth.signOut()} hitSlop={8}><Text style={s.sair}>Sair</Text></Pressable>
      </View>

      <View style={s.captura}>
        <TextInput
          style={s.campoCaptura}
          placeholder='Ex.: "dentista sexta 15h"'
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={aoCapturar}
          returnKeyType="send"
          editable={!enviando}
          maxLength={2000}
        />
        <Pressable style={[s.enviar, (!texto.trim() || enviando) && s.enviarInativo]} onPress={aoCapturar} disabled={!texto.trim() || enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={s.enviarTexto}>Salvar</Text>}
        </Pressable>
      </View>

      <View style={s.filtros}>
        <View style={s.linha}>
          {ABAS.map((a) => <Chip key={a.valor} rotulo={a.rotulo} ativo={aba === a.valor} onPress={() => setAba(a.valor)} />)}
        </View>
        <View style={s.linha}>
          {TIPOS.map((t) => <Chip key={t.rotulo} rotulo={t.rotulo} ativo={tipo === t.valor} onPress={() => setTipo(t.valor)} />)}
        </View>
        <TextInput style={s.busca} placeholder="Buscar" value={busca} onChangeText={setBusca} />
      </View>

      {!!erro && <Text style={s.erro}>{erro}</Text>}

      <FlatList
        data={visiveis}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => { setCarregando(true); carregar(); }} />}
        contentContainerStyle={s.lista}
        ListEmptyComponent={carregando ? undefined : (
          <Text style={s.vazio}>{itens.length ? 'Nada aqui com esse filtro.' : 'Escreva acima o que você não quer esquecer.'}</Text>
        )}
        renderItem={({ item }) => (
          <CartaoItem item={item} onAbrir={() => abrirModal(item)} onFeito={() => marcarFeito(item)} onApagar={() => apagar(item)} />
        )}
      />

      {modal && (
        <ModalItem key={modal.chave} rascunho={modal.rascunho} motivo={modal.motivo} onSalvar={salvarModal} onCancelar={cancelarModal} />
      )}
      {aviso && <Aviso aviso={aviso} onFechar={fecharAviso} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  marca: { fontSize: 24, fontWeight: '800', color: cor.primaria },
  sair: { color: cor.tintaSuave, fontSize: 15 },
  captura: { flexDirection: 'row', gap: 8, padding: 16 },
  campoCaptura: { flex: 1, backgroundColor: cor.card, borderWidth: 1, borderColor: cor.contorno, borderRadius: 12, padding: 14, fontSize: 16, color: cor.tinta },
  enviar: { backgroundColor: cor.primaria, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center', minWidth: 80, alignItems: 'center' },
  enviarInativo: { opacity: 0.5 },
  enviarTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  filtros: { paddingHorizontal: 16, gap: 8 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  busca: { backgroundColor: cor.card, borderWidth: 1, borderColor: cor.contorno, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: cor.tinta },
  lista: { padding: 16, gap: 12, flexGrow: 1, paddingBottom: 96 },
  vazio: { textAlign: 'center', color: cor.tintaSuave, marginTop: 48 },
  erro: { color: cor.erro, textAlign: 'center', marginTop: 8 },
});
