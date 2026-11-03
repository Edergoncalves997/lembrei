import { Pressable, StyleSheet, Text, View } from 'react-native';
import { qualDia, rotulo } from '@/lib/datas';
import type { Item } from '@/lib/supabase';
import { cor } from '@/lib/tema';

type Props = { item: Item; onAbrir: () => void; onFeito: () => void; onApagar: () => void };

export function CartaoItem({ item, onAbrir, onFeito, onApagar }: Props) {
  const atrasado = item.remind_at && qualDia(item.remind_at) === 'atrasado';
  return (
    <Pressable style={s.card} onPress={onAbrir} accessibilityRole="button" accessibilityLabel={`Editar ${item.titulo}`}>
      <View style={s.corpo}>
        <Text style={s.tipo}>{item.tipo}</Text>
        <Text style={s.titulo}>{item.titulo}</Text>
        {item.remind_at && <Text style={[s.data, atrasado && s.atrasado]}>{atrasado ? 'Atrasado · ' : ''}{rotulo(item.remind_at)}</Text>}
      </View>
      <View style={s.acoes}>
        <Pressable onPress={onFeito} hitSlop={8} accessibilityLabel="Marcar como feito"><Text style={s.feito}>✓ Feito</Text></Pressable>
        <Pressable onPress={onApagar} hitSlop={8} accessibilityLabel="Apagar"><Text style={s.apagar}>Apagar</Text></Pressable>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: cor.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: cor.contorno, flexDirection: 'row', gap: 12 },
  corpo: { flex: 1 },
  tipo: { fontSize: 12, textTransform: 'uppercase', color: cor.tintaSuave, letterSpacing: 1 },
  titulo: { fontSize: 16, color: cor.tinta, marginTop: 4 },
  data: { fontSize: 14, color: cor.primaria, marginTop: 6 },
  atrasado: { color: cor.erro },
  acoes: { justifyContent: 'space-between', alignItems: 'flex-end' },
  feito: { color: cor.primaria, fontWeight: '700' },
  apagar: { color: cor.tintaSuave, fontSize: 13 },
});
