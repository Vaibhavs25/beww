import React, { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react-native';
import {
  appendBreadcrumb,
  buildSentryEventPayload,
  parseSentryDsn,
  type MonitoringBreadcrumb,
  type MonitoringSeverity,
  type SentryEventPayload,
} from './domain';
import { Button, C, Card, Chip, S, T } from './components/ui';

const MONITORING_STORAGE_KEY = 'closer.errorMonitoring.v1';
const MAX_STORED_REPORTS = 20;

export type StoredCrashReport = {
  id: string;
  timestamp: string;
  level: MonitoringSeverity;
  title: string;
  mechanism: string;
  handled: boolean;
  deliveredToSentry: boolean;
  environment: string;
};

export type MonitoringSnapshot = {
  enabled: boolean;
  dsnConfigured: boolean;
  dsnHost: string | null;
  environment: string;
  release: string;
  breadcrumbs: MonitoringBreadcrumb[];
  reports: StoredCrashReport[];
  lastEventAt: string | null;
};

let initialized = false;
let monitoringEnabled = true;
let activeUserId: string | null = null;
let breadcrumbs: MonitoringBreadcrumb[] = [];
let reports: StoredCrashReport[] = [];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch {
      // Ignore subscriber errors
    }
  });
}

async function persistMonitoringState() {
  try {
    await AsyncStorage.setItem(
      MONITORING_STORAGE_KEY,
      JSON.stringify({
        enabled: monitoringEnabled,
        reports: reports.slice(0, MAX_STORED_REPORTS),
      })
    );
  } catch {
    // Ignore storage persistence errors
  }
}

async function sendPayloadToSentry(payload: SentryEventPayload): Promise<boolean> {
  const parsed = parseSentryDsn(process.env.EXPO_PUBLIC_SENTRY_DSN);
  if (!parsed || typeof fetch !== 'function') return false;

  try {
    const authHeader = `Sentry sentry_version=7, sentry_client=closer-sentry-sdk/1.0.0, sentry_key=${parsed.publicKey}`;
    const response = await fetch(parsed.storeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': authHeader,
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function addBreadcrumb(
  crumb: Omit<MonitoringBreadcrumb, 'timestamp'> & { timestamp?: string }
): void {
  if (!monitoringEnabled) return;
  breadcrumbs = appendBreadcrumb(breadcrumbs, crumb, 35);
  notifyListeners();
}

export function setMonitoringUser(userId: string | null): void {
  activeUserId = userId;
}

export async function captureException(
  error: unknown,
  context?: {
    level?: MonitoringSeverity;
    handled?: boolean;
    mechanism?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<SentryEventPayload | null> {
  if (!monitoringEnabled) return null;

  const payload = buildSentryEventPayload({
    error,
    level: context?.level ?? 'error',
    handled: context?.handled ?? true,
    mechanismType: context?.mechanism ?? 'handled',
    userId: activeUserId,
    tags: {
      platform: Platform.OS,
      ...(context?.tags ?? {}),
    },
    extra: context?.extra,
    breadcrumbs,
  });

  const delivered = await sendPayloadToSentry(payload);
  const exc = payload.exception?.values?.[0];
  const report: StoredCrashReport = {
    id: payload.event_id,
    timestamp: payload.timestamp,
    level: payload.level,
    title: exc ? `${exc.type}: ${exc.value}` : 'Runtime exception',
    mechanism: exc?.mechanism.type ?? 'handled',
    handled: exc?.mechanism.handled ?? true,
    deliveredToSentry: delivered,
    environment: payload.environment,
  };

  reports = [report, ...reports].slice(0, MAX_STORED_REPORTS);
  await persistMonitoringState();
  notifyListeners();
  return payload;
}

export async function captureMessage(
  message: string,
  level: MonitoringSeverity = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<SentryEventPayload | null> {
  if (!monitoringEnabled) return null;

  const payload = buildSentryEventPayload({
    message,
    level,
    handled: true,
    mechanismType: 'message',
    userId: activeUserId,
    tags: {
      platform: Platform.OS,
      ...(context?.tags ?? {}),
    },
    extra: context?.extra,
    breadcrumbs,
  });

  const delivered = await sendPayloadToSentry(payload);
  const report: StoredCrashReport = {
    id: payload.event_id,
    timestamp: payload.timestamp,
    level: payload.level,
    title: payload.message?.formatted || message,
    mechanism: 'message',
    handled: true,
    deliveredToSentry: delivered,
    environment: payload.environment,
  };

  reports = [report, ...reports].slice(0, MAX_STORED_REPORTS);
  await persistMonitoringState();
  notifyListeners();
  return payload;
}

export async function setMonitoringEnabled(enabled: boolean): Promise<void> {
  monitoringEnabled = enabled;
  await persistMonitoringState();
  notifyListeners();
}

export async function clearMonitoringLogs(): Promise<void> {
  reports = [];
  breadcrumbs = [];
  await persistMonitoringState();
  notifyListeners();
}

export async function sendTestMonitoringEvent(): Promise<StoredCrashReport | null> {
  addBreadcrumb({
    category: 'lifecycle',
    level: 'info',
    message: 'User triggered diagnostic test event from Just Us settings',
  });
  await captureMessage('Closer production monitoring diagnostic check', 'info', {
    tags: { check: 'manual-diagnostic' },
  });
  return reports[0] ?? null;
}

export function getMonitoringSnapshot(): MonitoringSnapshot {
  const parsed = parseSentryDsn(process.env.EXPO_PUBLIC_SENTRY_DSN);
  return {
    enabled: monitoringEnabled,
    dsnConfigured: Boolean(parsed),
    dsnHost: parsed?.host ?? null,
    environment: (process.env.EXPO_PUBLIC_APP_ENV || 'production').trim(),
    release: 'closer@1.0.0',
    breadcrumbs,
    reports,
    lastEventAt: reports[0]?.timestamp ?? null,
  };
}

export function initErrorMonitoring(): void {
  if (initialized) return;
  initialized = true;

  void (async () => {
    try {
      const raw = await AsyncStorage.getItem(MONITORING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.enabled === 'boolean') {
          monitoringEnabled = parsed.enabled;
        }
        if (Array.isArray(parsed?.reports)) {
          reports = parsed.reports.slice(0, MAX_STORED_REPORTS);
        }
        notifyListeners();
      }
    } catch {
      // Ignore storage read errors
    }
  })();

  addBreadcrumb({
    category: 'lifecycle',
    level: 'info',
    message: `Closer initialized on ${Platform.OS}`,
  });

  // React Native global uncaught JS exception hook (ErrorUtils)
  const g = globalThis as unknown as {
    ErrorUtils?: {
      getGlobalHandler?: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
      setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
    };
  };
  if (g.ErrorUtils?.getGlobalHandler && g.ErrorUtils?.setGlobalHandler) {
    const previousHandler = g.ErrorUtils.getGlobalHandler();
    g.ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      void captureException(error, {
        level: isFatal ? 'fatal' : 'error',
        handled: false,
        mechanism: 'react-native-error-utils',
      });
      if (typeof previousHandler === 'function') {
        previousHandler(error, isFatal);
      }
    });
  }

  // Browser / Web global error and unhandledrejection listeners
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('error', event => {
      void captureException(event.error ?? event.message ?? 'Uncaught window error', {
        level: 'error',
        handled: false,
        mechanism: 'window.onerror',
      });
    });
    window.addEventListener('unhandledrejection', event => {
      void captureException(event.reason ?? 'Unhandled promise rejection', {
        level: 'error',
        handled: false,
        mechanism: 'window.onunhandledrejection',
      });
    });
  }
}

export function useErrorMonitoring(): MonitoringSnapshot {
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot>(getMonitoringSnapshot);
  useEffect(() => {
    const update = () => setSnapshot(getMonitoringSnapshot());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return snapshot;
}

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

function renderCrashFallback(onReset: () => void) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 440, width: '100%', gap: 16, alignItems: 'center', paddingVertical: 32 }}>
        <AlertTriangle size={32} color={C.green} />
        <T kind="serif" style={{ textAlign: 'center' }}>
          A quiet hiccup on this screen.
        </T>
        <T style={{ textAlign: 'center', color: C.muted }}>
          Your shared memories, notes, and milestones are completely safe. We’ve logged a privacy-scrubbed crash report so we can keep Closer smooth.
        </T>
        <Button title="Return to our space" icon={RefreshCw} onPress={onReset} />
      </Card>
    </View>
  );
}

let cachedBoundaryClass: React.ComponentType<ErrorBoundaryProps> | null = null;

function getSafeErrorBoundaryClass(): React.ComponentType<ErrorBoundaryProps> | null {
  if (cachedBoundaryClass) return cachedBoundaryClass;
  const BaseClass = React?.Component;
  if (typeof BaseClass !== 'function') return null;

  class InnerErrorBoundary extends BaseClass<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
      const message = error instanceof Error ? error.message : 'An unexpected screen error occurred.';
      return { hasError: true, errorMessage: message };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo): void {
      void captureException(error, {
        level: 'fatal',
        handled: false,
        mechanism: 'react-error-boundary',
        extra: {
          componentStack: info?.componentStack ?? '',
        },
      });
    }

    handleReset = () => {
      addBreadcrumb({
        category: 'ui',
        level: 'info',
        message: 'User recovered from ErrorBoundary fallback screen',
      });
      this.setState({ hasError: false, errorMessage: '' });
    };

    render() {
      if (this.state.hasError) {
        return renderCrashFallback(this.handleReset);
      }
      return this.props.children;
    }
  }

  cachedBoundaryClass = InnerErrorBoundary;
  return cachedBoundaryClass;
}

const SafeBoundaryComponent = getSafeErrorBoundaryClass();

export function MonitoringErrorBoundary({ children }: ErrorBoundaryProps) {
  if (!SafeBoundaryComponent) {
    return <>{children}</>;
  }
  return <SafeBoundaryComponent>{children}</SafeBoundaryComponent>;
}

export function CrashMonitoringCard() {
  const snapshot = useErrorMonitoring();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await sendTestMonitoringEvent();
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card style={{ gap: 14 }}>
      <View style={[S.row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }]}>
        <View style={[S.row, { gap: 8 }]}>
          <ShieldAlert color={C.green} size={20} />
          <T kind="sub">Crash & error monitoring</T>
        </View>
        <Chip
          title={
            !snapshot.enabled
              ? 'Paused'
              : snapshot.dsnConfigured
                ? `Sentry Live (${snapshot.environment})`
                : `Active · ${snapshot.environment}`
          }
          selected={snapshot.enabled}
          onPress={() => {
            void setMonitoringEnabled(!snapshot.enabled);
          }}
        />
      </View>

      <T kind="small">
        Automatically tracks uncaught crashes, promise rejections, and sync exceptions to keep your launch experience smooth. Personal notes, emails, photos, and 6-digit invite codes are scrubbed on-device before any report is recorded.
      </T>

      <View style={[S.row, { gap: 14, flexWrap: 'wrap' }]}>
        <T kind="small" style={{ color: C.muted }}>
          Breadcrumbs: {snapshot.breadcrumbs.length}
        </T>
        <T kind="small" style={{ color: C.muted }}>
          Logged events: {snapshot.reports.length}
        </T>
        <T kind="small" style={{ color: C.muted }}>
          Transport: {snapshot.dsnConfigured ? snapshot.dsnHost : 'Local queue (Sentry-ready)'}
        </T>
      </View>

      {snapshot.reports.length > 0 && (
        <View
          style={{
            backgroundColor: C.pale,
            borderRadius: 14,
            padding: 12,
            gap: 6,
          }}
        >
          <T kind="small" style={{ fontWeight: '700' }}>
            Latest diagnostic event
          </T>
          <T kind="small" numberOfLines={2}>
            {snapshot.reports[0].title}
          </T>
          <T kind="small" style={{ color: C.muted, fontSize: 12 }}>
            {snapshot.reports[0].mechanism} · {snapshot.reports[0].level.toUpperCase()}
          </T>
        </View>
      )}

      <View style={[S.row, { gap: 10, flexWrap: 'wrap' }]}>
        <Button
          title="Send diagnostic check"
          secondary
          compact
          icon={CheckCircle2}
          loading={testing}
          disabled={!snapshot.enabled}
          onPress={() => {
            void handleTest();
          }}
        />
        {snapshot.reports.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear diagnostic logs"
            onPress={() => {
              void clearMonitoringLogs();
            }}
            style={[S.row, { gap: 6, paddingHorizontal: 10, paddingVertical: 8 }]}
          >
            <Trash2 size={15} color={C.muted} />
            <T kind="small">Clear logs</T>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
