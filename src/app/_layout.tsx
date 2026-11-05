import React, { useCallback, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Lora_400Regular } from '@expo-google-fonts/lora/400Regular';
import { Lora_400Regular_Italic } from '@expo-google-fonts/lora/400Regular_Italic';
import { SpaceProvider, useSpace } from '../store';
import { Notices } from '../components/shell';
import { C } from '../components/ui';
import { CallBanner, CallProvider } from '../calls';
import { CallAudio } from '../components/call-audio';
import { addBreadcrumb, initErrorMonitoring, MonitoringErrorBoundary } from '../monitoring';
import { LocalizationProvider } from '../localization';

// Guard globalThis.expo base constructor classes so third-party Expo web modules
// never encounter `Class extends value undefined` during module evaluation.
function ensureExpoBaseClasses() {
  const g = globalThis as Record<string, any>;
  if (!g.expo || typeof g.expo !== 'object') {
    g.expo = {};
  }
  if (typeof g.expo.EventEmitter !== 'function') {
    g.expo.EventEmitter = class EventEmitter {
      addListener() {
        return { remove: () => {} };
      }
      removeListener() {}
      removeAllListeners() {}
      emit() {}
      listenerCount() {
        return 0;
      }
    };
  }
  if (typeof g.expo.NativeModule !== 'function') {
    const BaseEmitter = g.expo.EventEmitter;
    g.expo.NativeModule = class NativeModule extends BaseEmitter {};
  }
  if (typeof g.expo.SharedObject !== 'function') {
    const BaseEmitter = g.expo.EventEmitter;
    g.expo.SharedObject = class SharedObject extends BaseEmitter {
      release() {}
    };
  }
  if (typeof g.expo.SharedRef !== 'function') {
    const BaseShared = g.expo.SharedObject;
    g.expo.SharedRef = class SharedRef extends BaseShared {
      nativeRefType = 'unknown';
    };
  }
  if (!g.expo.modules || typeof g.expo.modules !== 'object') {
    g.expo.modules = {};
  }
}

ensureExpoBaseClasses();
initErrorMonitoring();

if (typeof window !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (desc && desc.get && !desc.set && desc.configurable !== false) {
      const getter = desc.get;
      let customFetch: typeof window.fetch | null = null;
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: desc.enumerable !== false,
        get() {
          return customFetch ?? getter.call(window);
        },
        set(fn) {
          if (typeof fn === 'function') customFetch = fn;
        },
      });
    }
  } catch {
    // Ignore read-only descriptor errors in restricted environments
  }
}

const SafeProvider: React.ComponentType<{ children: React.ReactNode }> =
  typeof SafeAreaProvider === 'function'
    ? SafeAreaProvider
    : ({ children }) => <View style={{ flex: 1 }}>{children}</View>;

const SafeView: React.ComponentType<{ style?: any; children: React.ReactNode }> =
  typeof SafeAreaView === 'function'
    ? SafeAreaView
    : ({ style, children }) => <View style={style}>{children}</View>;

const SafeStatusBar: React.ComponentType<{ style?: 'auto' | 'inverted' | 'light' | 'dark' }> =
  typeof StatusBar === 'function' ? StatusBar : () => null;

const SafeErrorBoundary: React.ComponentType<{ children: React.ReactNode }> =
  typeof MonitoringErrorBoundary === 'function'
    ? MonitoringErrorBoundary
    : ({ children }) => <>{children}</>;

export default function RootLayout() {
  const useFontsHook = typeof useFonts === 'function' ? useFonts : () => [true, null] as const;
  const [loaded, error] = useFontsHook({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Lora_400Regular,
    Lora_400Regular_Italic,
  });
  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={C.green} />
      </View>
    );
  }
  return (
    <SafeErrorBoundary>
      <SafeProvider>
        <SpaceProvider>
          <LocalizedScreens />
        </SpaceProvider>
      </SafeProvider>
    </SafeErrorBoundary>
  );
}

function LocalizedScreens() {
  const { language } = useSpace();
  return <LocalizationProvider language={language}><Screens /></LocalizationProvider>;
}

function Screens() {
  const { ready, session, userId, space, markNotificationRead } = useSpace();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      addBreadcrumb({ category: 'navigation', level: 'info', message: `Navigated to ${pathname}` });
    }
  }, [pathname]);

  const handleNotificationTap = useCallback(
    (route: string, alertId?: string) => {
      if (alertId) markNotificationRead(alertId);
      if (route) router.push(route as never);
    },
    [markNotificationRead]
  );

  // Dynamically register native notification tap listener only on native platforms
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    let cleanup: (() => void) | undefined;
    void import('../notifications')
      .then(mod => {
        if (!active || typeof mod?.subscribeToNotificationResponses !== 'function') return;
        cleanup = mod.subscribeToNotificationResponses(handleNotificationTap);
      })
      .catch(() => {
        // Ignore notification listener setup errors on unsupported runtimes
      });
    return () => {
      active = false;
      cleanup?.();
    };
  }, [handleNotificationTap]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={C.green} />
      </View>
    );
  }

  // Reset private drafts and media as well as the data cache when the authenticated account changes.
  return (
    <CallProvider key={`${session?.user.id ?? 'auth'}:${userId}:${space.id}`}>
      <SafeStatusBar style="dark" />
      <SafeView style={{ flex: 1, backgroundColor: C.bg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }} />
        <CallAudio />
        <CallBanner />
        <Notices />
      </SafeView>
    </CallProvider>
  );
}
