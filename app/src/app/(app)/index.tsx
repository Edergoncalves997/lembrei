import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, type Item } from '@/lib/supabase';
import { cor } from '@/lib/tema';

const buscarItens = () =>
  supabase
    .from('items')
    .select('*')
    .eq('status', 'aberto')
    .order('remind_at', { ascending: true, nullsFirst: false })
    .order('criado_em', { ascending: false });

const formatoData =new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

export default function Lista() {
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(
    () =>
      buscarItens().then(({ data, error }) => {
        setCarregando(false);
        setErro(error ? 'Não consegui carregar seus itens.' : '');
        if (data) setItens(data as Item[]);
      }),
    [],
  );

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <SafeAreaView style={s.tela}>
      <View style={s.topo}>
        <Text style={s.titulo}>Lembrinha</Text>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={s.sair}>Sair</Text>
        </Pressable>
      </View>

      {!!erro && <Text style={s.erro}>{erro}</Text>}

      <FlatList
        data={itens}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => { setCarregando(true); carregar(); }} />}
        contentContainerStyle={s.lista}
        ListEmptyComponent={carregando ? undefined : <Text style={s.vazio}>Nada por aqui ainda.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.tipo}>{item.tipo}</Text>
            <Text style={s.itemTitulo}>{item.titulo}</Text>
            {item.remind_at && <Text style={s.data}>{formatoData.format(new Date(item.remind_at))}</Text>}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  titulo: { fontSize: 24, fontWeight: '800', color: cor.primaria },
  sair: { color: cor.tintaSuave, fontSize: 15 },
  lista: { padding: 16, gap: 12, flexGrow: 1 },
  vazio: { textAlign: 'center', color: cor.tintaSuave, marginTop: 48 },
  erro: { color: cor.erro, textAlign: 'center' },
  card: { backgroundColor: cor.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: cor.contorno },
  tipo: { fontSize: 12, textTransform: 'uppercase', color: cor.tintaSuave, letterSpacing: 1 },
  itemTitulo: { fontSize: 16, color: cor.tinta, marginTop: 4 },
  data: { fontSize: 14, color: cor.primaria, marginTop: 6 },
});
