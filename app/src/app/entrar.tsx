import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { cor } from '@/lib/tema';

// URL da landing (termos e privacidade). Vem do .env.local até existir domínio próprio.
const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://lembrinha.vercel.app';
const SENHA_MIN = 8;

type Modo = 'entrar' | 'criar' | 'confirmar';

// Cadastro: e-mail + senha → o Supabase manda um link de confirmação (uma vez só).
// Depois de confirmar, o login é sempre e-mail + senha.
export default function Entrar() {
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const limpo = email.trim().toLowerCase();

  function trocar(m: Modo) {
    setModo(m);
    setErro('');
    setAviso('');
  }

  async function entrar() {
    if (!limpo || !senha) return setErro('Preencha e-mail e senha.');
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: limpo, password: senha });
    setCarregando(false);
    if (!error) return; // a sessão muda e o _layout leva para a lista
    if (error.code === 'email_not_confirmed') {
      setEmail(limpo);
      return trocar('confirmar');
    }
    setErro(error.code === 'invalid_credentials' ? 'E-mail ou senha incorretos.' : 'Não consegui entrar. Tenta de novo.');
  }

  async function criarConta() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) return setErro('Confere o e-mail.');
    if (senha.length < SENHA_MIN) return setErro(`A senha precisa de pelo menos ${SENHA_MIN} caracteres.`);
    if (!aceitou) return setErro('Para continuar, aceite os termos e a privacidade.');
    setErro('');
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({ email: limpo, password: senha });
    setCarregando(false);
    if (error) {
      if (error.code === 'weak_password') return setErro('Senha fraca demais, tenta outra.');
      if (error.code === 'over_email_send_rate_limit') return setErro('Muitos e-mails enviados na última hora. Tenta de novo mais tarde.');
      return setErro(`Não consegui criar a conta (${error.code ?? error.status ?? 'erro'}).`);
    }
    // E-mail já confirmado: o Supabase finge sucesso, não manda e-mail e devolve identities vazio.
    if (data.user?.identities?.length === 0) {
      setModo('entrar');
      return setErro('Esse e-mail já tem conta. Entre com sua senha.');
    }
    setEmail(limpo);
    trocar('confirmar');
  }

  async function reenviar() {
    setErro('');
    setCarregando(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: limpo });
    setCarregando(false);
    if (error) setErro('Espera 1 minuto e tenta reenviar de novo.');
    else setAviso('Link reenviado.');
  }

  return (
    <SafeAreaView style={s.tela}>
      <Text style={s.marca}>Lembrinha</Text>
      <Text style={s.slogan}>Sua segunda memória.</Text>

      {modo === 'confirmar' ? (
        <View style={s.form}>
          <Text style={s.texto}>
            Mandei um link para <Text style={s.forte}>{limpo}</Text>. Abra o e-mail, toque no link para confirmar e volte aqui para entrar.
          </Text>
          <Botao titulo="Já confirmei, entrar" onPress={() => trocar('entrar')} carregando={false} />
          <Pressable onPress={reenviar} disabled={carregando}>
            <Text style={[s.link, s.centro]}>Reenviar link</Text>
          </Pressable>
        </View>
      ) : (
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
          <TextInput
            style={s.campo}
            placeholder={modo === 'criar' ? `Senha (mín. ${SENHA_MIN} caracteres)` : 'Senha'}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
            value={senha}
            onChangeText={setSenha}
            onSubmitEditing={modo === 'criar' ? criarConta : entrar}
          />

          {modo === 'criar' && (
            <Pressable style={s.aceite} onPress={() => setAceitou(!aceitou)} accessibilityRole="checkbox" accessibilityState={{ checked: aceitou }}>
              <View style={[s.caixa, aceitou && s.caixaMarcada]}>{aceitou && <Text style={s.check}>✓</Text>}</View>
              <Text style={s.texto}>
                Li e aceito os{' '}
                <Text style={s.link} onPress={() => Linking.openURL(`${SITE}/termos`)}>termos</Text> e a{' '}
                <Text style={s.link} onPress={() => Linking.openURL(`${SITE}/privacidade`)}>privacidade</Text>.
              </Text>
            </Pressable>
          )}

          {modo === 'criar' ? (
            <Botao titulo="Criar conta" onPress={criarConta} carregando={carregando} />
          ) : (
            <Botao titulo="Entrar" onPress={entrar} carregando={carregando} />
          )}

          <Pressable onPress={() => trocar(modo === 'criar' ? 'entrar' : 'criar')}>
            <Text style={[s.link, s.centro]}>{modo === 'criar' ? 'Já tenho conta' : 'Criar conta'}</Text>
          </Pressable>
        </View>
      )}

      {!!erro && <Text style={s.erro}>{erro}</Text>}
      {!!aviso && <Text style={s.aviso}>{aviso}</Text>}
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
  aceite: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  caixa: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: cor.primaria, alignItems: 'center', justifyContent: 'center' },
  caixaMarcada: { backgroundColor: cor.primaria },
  check: { color: '#fff', fontWeight: '800' },
  texto: { flex: 1, fontSize: 15, color: cor.tinta, lineHeight: 22 },
  forte: { fontWeight: '700' },
  link: { color: cor.primaria, fontWeight: '600', textDecorationLine: 'underline' },
  centro: { textAlign: 'center' },
  botao: { backgroundColor: cor.primaria, borderRadius: 12, padding: 16, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  erro: { color: cor.erro, marginTop: 16, textAlign: 'center' },
  aviso: { color: cor.primaria, marginTop: 16, textAlign: 'center' },
});
