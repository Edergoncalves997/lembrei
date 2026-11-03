import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cor } from '@/lib/tema';

export type Acao = { rotulo: string; onPress: () => void };
export type AvisoDados = { id: number; texto: string; acoes: Acao[] };

/** Barra no rodapé com ações ("Editar", "Desfazer"). Some sozinha depois de 6 s. */
export function Aviso({ aviso, onFechar }: { aviso: AvisoDados; onFechar: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFechar, 6000);
    return () => clearTimeout(t);
  }, [aviso.id, onFechar]);

  return (
    <View style={s.barra} accessibilityLiveRegion="polite">
      <Text style={s.texto}>{aviso.texto}</Text>
      {aviso.acoes.map((a) => (
        <Pressable key={a.rotulo} onPress={() => { onFechar(); a.onPress(); }} hitSlop={8}>
          <Text style={s.acao}>{a.rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  barra: {
    position: 'absolute', left: 16, right: 16, bottom: 16,
    backgroundColor: cor.tinta, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap',
  },
  texto: { color: '#fff', flex: 1, minWidth: 160, fontSize: 15, lineHeight: 21 },
  acao: { color: '#fdc74b', fontWeight: '700', fontSize: 15 },
});
