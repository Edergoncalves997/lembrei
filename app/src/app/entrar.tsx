import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { cor } from '@/lib/tema';

// URL da landing (termos e privacidade). Vem do .env.local até existir domínio próprio.
const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://lembrinha.vercel.app';

export default function Entrar() {
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function enviarCodigo() {
    const limpo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) return setErro('Confere o e-mail.');
    if (!aceitou) return setErro('Para continuar, aceite os termos e a privacidade.');
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.signInWithOtp({ email: limpo });
    setCarregando(false);
    if (error) return setErro('Não consegui enviar o código. Tenta de novo em 1 minuto.');
    setEmail(limpo);
    setEtapa('codigo');
  }

  async function verificar() {
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo.trim(), type: 'email' });
    setCarregando(false);
    if (error) setErro('Código inválido ou vencido.');
    // Com sucesso, a sessão muda e o _layout leva para a lista sozinho.
  }

  return (
    <SafeAreaView style={s.tela}>
      <Text style={s.marca}>Lembrinha</Text>
      <Text style={s.slogan}>Sua segunda memória.</Text>

      {etapa === 'email' ? (
        <View style={s.form}>
          <TextInput
            style={s.campo}
            placeholder="seu@email.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Pressable style={s.aceite} onPress={() => setAceitou(!aceitou)} accessibilityRole="checkbox" accessibilityState={{ checked: aceitou }}>
            <View style={[s.caixa, aceitou && s.caixaMarcada]}>{aceitou && <Text style={s.check}>✓</Text>}</View>
            <Text style={s.texto}>
              Li e aceito os{' '}
              <Text style={s.link} onPress={() => Linking.openURL(`${SITE}/termos`)}>termos</Text> e a{' '}
              <Text style={s.link} onPress={() => Linking.openURL(`${SITE}/privacidade`)}>privacidade</Text>.
            </Text>
          </Pressable>
          <Botao titulo="Receber código" onPress={enviarCodigo} carregando={carregando} />
        </View>
      ) : (
        <View style={s.form}>
          <Text style={s.texto}>Mandei um código para {email}.</Text>
          <TextInput
            style={[s.campo, s.campoCodigo]}
            placeholder="000000"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={8}
            value={codigo}
            onChangeText={setCodigo}
          />
          <Botao titulo="Entrar" onPress={verificar} carregando={carregando} />
          <Pressable onPress={() => { setEtapa('email'); setCodigo(''); setErro(''); }}>
            <Text style={[s.link, s.centro]}>Usar outro e-mail</Text>
          </Pressable>
        </View>
      )}

      {!!erro && <Text style={s.erro}>{erro}</Text>}
    </SafeAreaView>
  );
}

function Botao({ titulo, onPress, carregando }: { titulo: string; onPress: () => void; carregando: boolean }) {
  return (
    <Pressable style={s.botao} onPress={onPress} disabled={carregando}>
      {carregando ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTexto}>{titulo}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, padding: 24, justifyContent: 'center' },
  marca: { fontSize: 36, fontWeight: '800', color: cor.primaria },
  slogan: { fontSize: 16, color: cor.tintaSuave, marginBottom: 32 },
  form: { gap: 16 },
  campo: { backgroundColor: cor.card, borderWidth: 1, borderColor: cor.contorno, borderRadius: 12, padding: 14, fontSize: 16, color: cor.tinta },
  campoCodigo: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  aceite: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  caixa: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: cor.primaria, alignItems: 'center', justifyContent: 'center' },
  caixaMarcada: { backgroundColor: cor.primaria },
  check: { color: '#fff', fontWeight: '800' },
  texto: { flex: 1, fontSize: 15, color: cor.tinta },
  link: { color: cor.primaria, fontWeight: '600', textDecorationLine: 'underline' },
  centro: { textAlign: 'center' },
  botao: { backgroundColor: cor.primaria, borderRadius: 12, padding: 16, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  erro: { color: cor.erro, marginTop: 16, textAlign: 'center' },
});
