import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  resolveHapticProfile,
  shouldTriggerHaptic,
  type HapticIntent,
  type HapticProfile,
} from './domain';

export const HAPTICS_STORAGE_KEY = 'closer.hapticsEnabled.v1';

type ExpoHapticsModule = typeof import('expo-haptics');

let hapticsModulePromise: Promise<ExpoHapticsModule | null> | null = null;
let hapticsEnabledState = true;
let hydrated = false;
const lastTriggeredMap: Partial<Record<HapticIntent, number>> = {};

async function getExpoHapticsModule(): Promise<ExpoHapticsModule | null> {
  if (!hapticsModulePromise) {
    hapticsModulePromise = import('expo-haptics').catch(() => null);
  }
  return hapticsModulePromise;
}

export async function hydrateHapticsPreference(): Promise<boolean> {
  if (hydrated) return hapticsEnabledState;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(HAPTICS_STORAGE_KEY);
    if (raw !== null) {
      hapticsEnabledState = raw !== 'false';
    }
  } catch {
    // Keep default enabled state if storage is unavailable
  }
  return hapticsEnabledState;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabledState;
}

export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  hapticsEnabledState = enabled;
  hydrated = true;
  try {
    await AsyncStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage persistence errors
  }
  if (enabled) {
    void triggerHaptic('selection');
  }
}

async function dispatchExpoHaptic(profile: HapticProfile): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (
      typeof globalThis !== 'undefined' &&
      'navigator' in globalThis &&
      typeof globalThis.navigator?.vibrate === 'function'
    ) {
      try {
        return Boolean(globalThis.navigator.vibrate(profile.vibrationPattern));
      } catch {
        return false;
      }
    }
    return false;
  }

  const mod = await getExpoHapticsModule();
  if (!mod) return false;

  try {
    if (profile.method === 'selection' && typeof mod.selectionAsync === 'function') {
      await mod.selectionAsync();
      return true;
    }

    if (profile.method === 'notification' && typeof mod.notificationAsync === 'function') {
      const notifEnum = mod.NotificationFeedbackType;
      const notifType =
        profile.notificationType === 'Warning'
          ? notifEnum?.Warning
          : profile.notificationType === 'Error'
            ? notifEnum?.Error
            : notifEnum?.Success;
      await mod.notificationAsync(notifType);
      return true;
    }

    if (typeof mod.impactAsync === 'function') {
      const impactEnum = mod.ImpactFeedbackStyle;
      const style =
        profile.impactStyle === 'Heavy'
          ? impactEnum?.Heavy
          : profile.impactStyle === 'Medium'
            ? impactEnum?.Medium
            : profile.impactStyle === 'Soft'
              ? (impactEnum?.Soft ?? impactEnum?.Light)
              : profile.impactStyle === 'Rigid'
                ? (impactEnum?.Rigid ?? impactEnum?.Medium)
                : impactEnum?.Light;
      await mod.impactAsync(style);
      return true;
    }
  } catch {
    // Ignore unsupported device haptic engine errors
  }

  return false;
}

export async function triggerHaptic(intent: HapticIntent = 'tap'): Promise<boolean> {
  const nowMs = Date.now();
  const prevMs = lastTriggeredMap[intent] ?? 0;
  if (!shouldTriggerHaptic(intent, hapticsEnabledState, prevMs, nowMs)) {
    return false;
  }
  lastTriggeredMap[intent] = nowMs;
  const profile = resolveHapticProfile(intent);
  return dispatchExpoHaptic(profile);
}

export function hapticTap(): void {
  void triggerHaptic('tap');
}

export function hapticSelection(): void {
  void triggerHaptic('selection');
}

export function hapticTaskToggle(completed: boolean): void {
  void triggerHaptic(completed ? 'task-check' : 'task-uncheck');
}

export function hapticInstantPic(): void {
  void triggerHaptic('instant-pic');
}

export function hapticQuickNote(): void {
  void triggerHaptic('quick-note');
}

export function hapticHeart(): void {
  void triggerHaptic('heart');
}

export function hapticSuccess(): void {
  void triggerHaptic('success');
}

export function hapticWarning(): void {
  void triggerHaptic('warning');
}

export function hapticError(): void {
  void triggerHaptic('error');
}
