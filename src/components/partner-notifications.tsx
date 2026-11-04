import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  BellOff,
  BookOpen,
  Camera,
  CheckCheck,
  ChevronRight,
  Sparkles,
  StickyNote,
} from 'lucide-react-native';
import { usePeople, useSpace } from '../store';
import {
  buildPartnerAlertForJournal,
  buildPartnerAlertForQuickNote,
  relativeTime,
  type PartnerAlertKind,
  type PartnerNotificationItem,
} from '../domain';
import { Button, C, Card, F, S, T } from './ui';

function alertKindMeta(kind: PartnerAlertKind) {
  if (kind === 'journal') {
    return {
      label: 'SHARED JOURNAL',
      icon: BookOpen,
      accent: C.rose,
      bg: '#F5DFDA',
    };
  }
  if (kind === 'instant-pic') {
    return {
      label: 'INSTANT PIC',
      icon: Camera,
      accent: '#8C4A27',
      bg: '#F6E8D5',
    };
  }
  return {
    label: 'QUICK NOTE',
    icon: StickyNote,
    accent: C.green,
    bg: C.pale,
  };
}

export function PartnerNotificationCenterCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    space,
    userId,
    notifications,
    notificationPrefs,
    notificationPermission,
    enableNotifications,
    updateNotificationPrefs,
    markNotificationRead,
    markAllNotificationsRead,
    triggerPartnerAlertPreview,
  } = useSpace();
  const { partner } = usePeople();
  const [showSettings, setShowSettings] = useState(!compact);

  const partnerName =
    partner?.nickname ||
    space.originStory?.partnerNickname ||
    partner?.name ||
    space.originStory?.partnerName ||
    'Your partner';

  // Combine persisted notifications with any existing space activity so the feed is never blank when partner items exist
  const combinedFeed = useMemo<PartnerNotificationItem[]>(() => {
    const map = new Map<string, PartnerNotificationItem>();
    for (const item of notifications) {
      map.set(item.id, item);
    }
    for (const entry of (space.journal ?? []).slice(0, 3)) {
      const built = buildPartnerAlertForJournal(
        entry,
        entry.authorId === userId ? 'You' : partnerName
      );
      if (!map.has(built.id)) {
        map.set(built.id, { ...built, read: true });
      }
    }
    for (const note of (space.quickNotes ?? []).slice(0, 4)) {
      const built = buildPartnerAlertForQuickNote(
        note,
        note.authorId === userId ? 'You' : partnerName
      );
      if (!map.has(built.id)) {
        map.set(built.id, { ...built, read: true });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, compact ? 4 : 8);
  }, [notifications, space.journal, space.quickNotes, userId, partnerName, compact]);

  const unreadCount = notifications.filter(item => !item.read).length;

  const toggleItems: {
    key: 'journal' | 'instantPic' | 'quickNote';
    kind: PartnerAlertKind;
    title: string;
    subtitle: string;
    active: boolean;
  }[] = [
    {
      key: 'journal',
      kind: 'journal',
      title: 'Shared Journal Entries',
      subtitle: `Alert when ${partnerName} writes a reflection, gratitude, or memory`,
      active: notificationPrefs.enabled && notificationPrefs.journal,
    },
    {
      key: 'instantPic',
      kind: 'instant-pic',
      title: 'Instant Pics',
      subtitle: `Alert when ${partnerName} snaps a 1-click photo to your widget`,
      active: notificationPrefs.enabled && notificationPrefs.instantPic,
    },
    {
      key: 'quickNote',
      kind: 'quick-note',
      title: 'Dashboard Quick Notes',
      subtitle: `Alert when ${partnerName} pins a sticky note on your board`,
      active: notificationPrefs.enabled && notificationPrefs.quickNote,
    },
  ];

  return (
    <Card style={{ gap: 16 }}>
      <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
        <View style={{ flex: 1, minWidth: 200, gap: 4 }}>
          <View style={[S.row, { gap: 8 }]}>
            {notificationPrefs.enabled ? (
              <Bell size={16} color={C.rose} />
            ) : (
              <BellOff size={16} color={C.muted} />
            )}
            <T kind="label" style={{ color: C.rose }}>
              PARTNER EXPO NOTIFICATIONS
              {unreadCount > 0 ? ` · ${unreadCount} NEW` : ''}
            </T>
          </View>
          <T kind="sub">Instant alerts from {partnerName}</T>
        </View>

        <View style={[S.row, { gap: 10 }]}>
          {unreadCount > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications read"
              onPress={markAllNotificationsRead}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: C.bg,
                borderWidth: 1,
                borderColor: C.line,
              }}
            >
              <CheckCheck size={14} color={C.green} />
              <T kind="small" style={{ color: C.green, fontFamily: F.medium }}>
                Mark read
              </T>
            </Pressable>
          )}
          {compact && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showSettings ? 'Hide alert settings' : 'Configure alert settings'}
              onPress={() => setShowSettings(s => !s)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: showSettings ? C.pale : C.bg,
                borderWidth: 1,
                borderColor: showSettings ? C.green : C.line,
              }}
            >
              <T
                kind="small"
                style={{
                  color: showSettings ? C.green : C.ink,
                  fontFamily: F.medium,
                }}
              >
                {showSettings ? 'Done' : 'Alert rules'}
              </T>
            </Pressable>
          )}
        </View>
      </View>

      <T kind="small">
        Get alerted immediately when {partnerName} posts a new Shared Journal entry, shares an Instant Pic, or leaves a Quick Note on your dashboard.
      </T>

      {notificationPermission !== 'granted' && (
        <View
          style={{
            backgroundColor: '#F6E8D5',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#E5CFAF',
            padding: 14,
            gap: 10,
          }}
        >
          <T kind="small" style={{ color: '#6E4E3A', fontFamily: F.medium }}>
            Enable Expo Push & Local Notifications so {partnerName}’s notes and photos chime right away.
          </T>
          <View style={[S.row, { flexWrap: 'wrap', gap: 10 }]}>
            <Button
              compact
              title="Enable Expo Notifications"
              icon={Bell}
              onPress={() => {
                void enableNotifications();
              }}
            />
          </View>
        </View>
      )}

      {showSettings && (
        <View
          style={{
            backgroundColor: C.bg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.line,
            padding: 14,
            gap: 12,
          }}
        >
          <View style={[S.between, { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.line }]}>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: F.bold, fontSize: 14 }}>All Partner Alerts</T>
              <T kind="small" style={{ fontSize: 12 }}>
                Master switch for Expo Notifications
              </T>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: notificationPrefs.enabled }}
              accessibilityLabel="Toggle all partner notifications"
              onPress={() => {
                void updateNotificationPrefs({ enabled: !notificationPrefs.enabled });
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 10,
                backgroundColor: notificationPrefs.enabled ? C.green : C.paper,
                borderWidth: 1,
                borderColor: notificationPrefs.enabled ? C.green : C.line,
              }}
            >
              <T
                kind="small"
                style={{
                  color: notificationPrefs.enabled ? '#FFFDF9' : C.muted,
                  fontFamily: F.bold,
                  fontSize: 12,
                }}
              >
                {notificationPrefs.enabled ? 'ON' : 'PAUSED'}
              </T>
            </Pressable>
          </View>

          {toggleItems.map(item => {
            const meta = alertKindMeta(item.kind);
            const Icon = meta.icon;
            return (
              <View
                key={item.key}
                style={[
                  S.between,
                  {
                    gap: 10,
                    paddingVertical: 4,
                  },
                ]}
              >
                <View style={[S.row, { flex: 1, gap: 10 }]}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: meta.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={meta.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T style={{ fontFamily: F.medium, fontSize: 14 }}>{item.title}</T>
                    <T kind="small" style={{ fontSize: 12 }}>
                      {item.subtitle}
                    </T>
                  </View>
                </View>

                <View style={[S.row, { gap: 6 }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Send test ${item.title} notification`}
                    onPress={() => {
                      void triggerPartnerAlertPreview(item.kind);
                    }}
                    style={{
                      paddingHorizontal: 9,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: C.paper,
                      borderWidth: 1,
                      borderColor: C.line,
                    }}
                  >
                    <T kind="small" style={{ fontSize: 11, color: C.ink, fontFamily: F.medium }}>
                      Test
                    </T>
                  </Pressable>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: item.active }}
                    accessibilityLabel={`Toggle ${item.title} alerts`}
                    onPress={() => {
                      void updateNotificationPrefs({
                        enabled: true,
                        [item.key]: !notificationPrefs[item.key],
                      });
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: item.active ? C.pale : C.paper,
                      borderWidth: 1,
                      borderColor: item.active ? C.green : C.line,
                    }}
                  >
                    <T
                      kind="small"
                      style={{
                        fontSize: 11,
                        fontFamily: F.bold,
                        color: item.active ? C.green : C.muted,
                      }}
                    >
                      {item.active ? 'Active' : 'Off'}
                    </T>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <View style={S.between}>
          <T kind="label">RECENT PARTNER ACTIVITY ALERTS</T>
          <View style={[S.row, { gap: 6 }]}>
            <Sparkles size={13} color={C.muted} />
            <T kind="small" style={{ fontSize: 11 }}>
              Tap any alert to open
            </T>
          </View>
        </View>

        {combinedFeed.length === 0 ? (
          <View
            style={{
              padding: 16,
              borderRadius: 14,
              backgroundColor: C.bg,
              borderWidth: 1,
              borderColor: C.line,
            }}
          >
            <T kind="small">
              No partner alerts yet. When {partnerName} posts a journal entry, shares an instant pic, or adds a quick note, it will appear right here.
            </T>
          </View>
        ) : (
          combinedFeed.map(item => {
            const meta = alertKindMeta(item.kind);
            const Icon = meta.icon;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}: ${item.body}`}
                onPress={() => {
                  markNotificationRead(item.id);
                  if (item.targetRoute) {
                    router.push(item.targetRoute as never);
                  }
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: item.read ? C.bg : '#FDF9F3',
                  borderWidth: 1,
                  borderColor: item.read ? C.line : C.rose,
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    backgroundColor: meta.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={17} color={meta.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <View style={[S.between, { gap: 8 }]}>
                    <T
                      kind="label"
                      style={{
                        fontSize: 10,
                        color: meta.accent,
                      }}
                    >
                      {meta.label}
                      {!item.read ? ' · NEW' : ''}
                    </T>
                    <T kind="small" style={{ fontSize: 11 }}>
                      {relativeTime(item.createdAt)}
                    </T>
                  </View>
                  <T
                    numberOfLines={1}
                    style={{
                      fontFamily: item.read ? F.medium : F.bold,
                      fontSize: 13.5,
                      color: C.ink,
                    }}
                  >
                    {item.title}
                  </T>
                  <T numberOfLines={2} kind="small" style={{ fontSize: 12.5 }}>
                    {item.body}
                  </T>
                </View>
                <ChevronRight size={16} color={C.muted} />
              </Pressable>
            );
          })
        )}
      </View>
    </Card>
  );
}
