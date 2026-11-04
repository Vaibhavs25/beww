import { useEffect } from 'react';
import { router } from 'expo-router';
import {
  shouldSendPartnerAlert,
  type PartnerAlertPreferences,
  type PartnerNotificationItem,
} from './domain';

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

export const PARTNER_NOTIFICATION_CHANNEL_ID = 'partner-updates';

export function configureExpoNotificationHandler(): void {
  // Web uses the browser Notification API directly; no native foreground handler needed.
}

export async function ensureAndroidNotificationChannel(): Promise<void> {
  // No-op on Web
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionState> {
  if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
    const webPerm = globalThis.Notification?.permission;
    if (webPerm === 'granted') return 'granted';
    if (webPerm === 'denied') return 'denied';
    return 'undetermined';
  }
  return 'undetermined';
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionState> {
  if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
    try {
      const existing = globalThis.Notification?.permission;
      if (existing === 'granted') return 'granted';
      if (existing === 'denied') return 'denied';
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
  _onNotificationTap?: (targetRoute: string, alertId?: string) => void
): () => void {
  return () => {};
}

export function useNotificationResponseObserver(
  onNotificationTap?: (targetRoute: string, alertId?: string) => void
): void {
  useEffect(() => {
    return subscribeToNotificationResponses(onNotificationTap);
  }, [onNotificationTap]);
}
