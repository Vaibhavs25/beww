import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  resolveHapticProfile,
  shouldTriggerHaptic,
  type HapticIntent,
  type HapticProfile,
} from './domain';

export const HAPTICS_STORAGE_KEY = 'closer.hapticsEnabled.v1';

let hapticsEnabledState = true;
let hydrated = false;
const lastTriggeredMap: Partial<Record<HapticIntent, number>> = {};

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

function dispatchWebHaptic(profile: HapticProfile): boolean {
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

export async function triggerHaptic(intent: HapticIntent = 'tap'): Promise<boolean> {
  const nowMs = Date.now();
  const prevMs = lastTriggeredMap[intent] ?? 0;
  if (!shouldTriggerHaptic(intent, hapticsEnabledState, prevMs, nowMs)) {
    return false;
  }
  lastTriggeredMap[intent] = nowMs;
  const profile = resolveHapticProfile(intent);
  return dispatchWebHaptic(profile);
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
