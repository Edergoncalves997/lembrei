// Lembretes por notificação LOCAL, agendada no próprio aparelho (PLANO.md §3).
// O identificador da notificação é o id do item: reagendar substitui, cancelar é direto.
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { horaLocal } from './datas';
import type { Item } from './supabase';

const CANAL = 'lembretes'; // mesmo nome do defaultChannel em app.json
const ativo = Platform.OS !== 'web'; // a web não agenda notificações locais

if (ativo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Cria o canal (no Android 13+ o pedido de permissão só aparece depois disso) e pede permissão. */
export async function prepararNotificacoes(): Promise<boolean> {
  if (!ativo) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembretes',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Alarme exato (Android 12+). Sem ele, o Android pode atrasar o lembrete alguns minutos. */
export async function temAlarmeExato(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    return (await Notifications.getExactAlarmPermissionsAsync()).granted;
  } catch {
    return false; // ex.: Expo Go, que não declara SCHEDULE_EXACT_ALARM
  }
}

/** Abre a tela do sistema para permitir alarmes exatos. */
export async function pedirAlarmeExato(): Promise<boolean> {
  try {
    return (await Notifications.requestExactAlarmPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

const deveAvisar = (i: Item, agora: number) =>
  i.status === 'aberto' && i.tipo === 'lembrete' && !!i.remind_at && new Date(i.remind_at).getTime() > agora;

let fila: Promise<void> = Promise.resolve();

/**
 * Deixa os agendamentos do aparelho iguais à lista: agenda os lembretes futuros e cancela o resto.
 * Chamado ao abrir o app e a cada mudança (cobre reinstalação, edição em outro aparelho, etc.).
 * Em fila, para duas chamadas seguidas não se misturarem.
 */
export function sincronizarNotificacoes(itens: Item[]): Promise<void> {
  if (!ativo) return Promise.resolve();
  fila = fila.then(() => sincronizar(itens)).catch((e) => console.warn('notificações:', e));
  return fila;
}

async function sincronizar(itens: Item[]) {
  const agora = Date.now();
  const desejados = itens.filter((i) => deveAvisar(i, agora));
  const ids = new Set(desejados.map((i) => i.id));

  const agendados = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    agendados.filter((n) => !ids.has(n.identifier)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  const exato = await temAlarmeExato();
  for (const item of desejados) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: { title: item.titulo, body: `⏰ Lembrete das ${horaLocal(new Date(item.remind_at!))}`, data: { id: item.id } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(item.remind_at!),
        channelId: CANAL,
        delivery: exato ? 'alarmClock' : 'bestEffort',
      },
    });
  }
}
