import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import {
  shouldSendPartnerAlert,
  type PartnerAlertPreferences,
  type PartnerNotificationItem,
} from './domain';

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

export const PARTNER_NOTIFICATION_CHANNEL_ID = 'partner-updates';

type ExpoNotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<ExpoNotificationsModule | null> | null = null;
let handlerConfigured = false;

async function getNotificationsModule(): Promise<ExpoNotificationsModule | null> {
  if (Platform.OS === 'web') return null;
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').catch(() => null);
  }
  return notificationsModulePromise;
}

export function configureExpoNotificationHandler(): void {
  if (Platform.OS === 'web' || handlerConfigured) return;
  handlerConfigured = true;
  void getNotificationsModule().then(mod => {
    if (typeof mod?.setNotificationHandler !== 'function') return;
    try {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {
      // Ignore native handler setup errors on unsupported runtimes
    }
  });
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const mod = await getNotificationsModule();
    if (typeof mod?.setNotificationChannelAsync !== 'function') return;
    await mod.setNotificationChannelAsync(PARTNER_NOTIFICATION_CHANNEL_ID, {
      name: 'Partner Updates',
      description:
        'Alerts when your partner posts a shared journal entry, shares an instant pic, or adds a quick note.',
      importance: mod.AndroidImportance?.HIGH ?? 4,
      vibrationPattern: [0, 220, 140, 220],
      lightColor: '#9E3B33',
      sound: 'default',
    });
  } catch {
    // Ignore channel setup errors on unsupported runtimes
  }
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionState> {
  if (Platform.OS !== 'web') {
    try {
      const mod = await getNotificationsModule();
      if (typeof mod?.getPermissionsAsync === 'function') {
        const settings = await mod.getPermissionsAsync();
        const provisional = mod.IosAuthorizationStatus?.PROVISIONAL ?? 3;
        if (settings?.granted || settings?.ios?.status === provisional) {
          return 'granted';
        }
        if (settings?.status === 'denied') return 'denied';
        if (settings?.status === 'undetermined') return 'undetermined';
      }
    } catch {
      // Fall back to Web Notification API check if available
    }
  }

  if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
    const webPerm = globalThis.Notification?.permission;
    if (webPerm === 'granted') return 'granted';
    if (webPerm === 'denied') return 'denied';
    return 'undetermined';
  }

  return 'undetermined';
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionState> {
  configureExpoNotificationHandler();
  await ensureAndroidNotificationChannel();

  if (Platform.OS !== 'web') {
    try {
      const mod = await getNotificationsModule();
      if (typeof mod?.getPermissionsAsync === 'function' && typeof mod?.requestPermissionsAsync === 'function') {
        const provisional = mod.IosAuthorizationStatus?.PROVISIONAL ?? 3;
        const existing = await mod.getPermissionsAsync();
        if (existing?.granted || existing?.ios?.status === provisional) {
          return 'granted';
        }
        const requested = await mod.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        if (requested?.granted || requested?.ios?.status === provisional) {
          return 'granted';
        }
        if (requested?.status === 'denied') return 'denied';
      }
    } catch {
      // Fall back to Web Notification API request when running on web
    }
  }

  if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
    try {
      const result = await globalThis.Notification.requestPermission();
      if (result === 'granted') return 'granted';
      if (result === 'denied') return 'denied';
    } catch {
      return 'undetermined';
    }
  }

  return 'undetermined';
}

export async function dispatchPartnerNotification(
  alert: PartnerNotificationItem,
  prefs: PartnerAlertPreferences
): Promise<string | null> {
  if (!shouldSendPartnerAlert(alert.kind, prefs)) {
    return null;
  }

  configureExpoNotificationHandler();
  await ensureAndroidNotificationChannel();

  if (Platform.OS !== 'web') {
    try {
      const mod = await getNotificationsModule();
      if (typeof mod?.scheduleNotificationAsync === 'function') {
        const identifier = await mod.scheduleNotificationAsync({
          content: {
            title: alert.title,
            body: alert.body,
            sound: 'default',
            data: {
              alertId: alert.id,
              sourceId: alert.sourceId,
              kind: alert.kind,
              targetRoute: alert.targetRoute,
              authorId: alert.authorId,
            },
            ...(Platform.OS === 'android' ? { channelId: PARTNER_NOTIFICATION_CHANNEL_ID } : {}),
          },
          trigger: null,
        });
        return identifier;
      }
    } catch {
      // Fall through to browser Notification API fallback
    }
  }

  if (
    typeof globalThis !== 'undefined' &&
    'Notification' in globalThis &&
    globalThis.Notification?.permission === 'granted'
  ) {
    try {
      const webNotif = new globalThis.Notification(alert.title, {
        body: alert.body,
        tag: alert.id,
      });
      webNotif.onclick = () => {
        if (alert.targetRoute) {
          router.push(alert.targetRoute as never);
        }
      };
      return alert.id;
    } catch {
      return null;
    }
  }

  return null;
}

export function subscribeToNotificationResponses(
  onNotificationTap?: (targetRoute: string, alertId?: string) => void
): () => void {
  if (Platform.OS === 'web') return () => {};
  let active = true;
  let removeSub: (() => void) | undefined;

  configureExpoNotificationHandler();
  void ensureAndroidNotificationChannel();

  void getNotificationsModule().then(mod => {
    if (!active || typeof mod?.addNotificationResponseReceivedListener !== 'function') return;
    try {
      const sub = mod.addNotificationResponseReceivedListener(response => {
        const data = response?.notification?.request?.content?.data as
          | { targetRoute?: string; alertId?: string }
          | undefined;
        const route = typeof data?.targetRoute === 'string' ? data.targetRoute : '/';
        const alertId = typeof data?.alertId === 'string' ? data.alertId : undefined;
        if (onNotificationTap) {
          onNotificationTap(route, alertId);
        } else if (route) {
          router.push(route as never);
        }
      });
      removeSub = () => {
        try {
          sub?.remove?.();
        } catch {
          // Ignore cleanup errors
        }
      };
    } catch {
      // Ignore listener errors
    }
  });

  return () => {
    active = false;
    removeSub?.();
  };
}

export function useNotificationResponseObserver(
  onNotificationTap?: (targetRoute: string, alertId?: string) => void
): void {
  useEffect(() => {
    return subscribeToNotificationResponses(onNotificationTap);
  }, [onNotificationTap]);
}
