import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SessaoProvider, useSessao } from '@/lib/sessao';

function Navegacao() {
  const { session, carregando } = useSessao();
  if (carregando) return null; // a splash continua visível enquanto lê a sessão salva

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="entrar" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessaoProvider>
      <StatusBar style="dark" />
      <Navegacao />
    </SessaoProvider>
  );
}
