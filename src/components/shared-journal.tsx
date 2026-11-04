import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowDownUp, BookOpen, Feather, Heart, Plus } from 'lucide-react-native';
import {
  JOURNAL_TAGS,
  journalTagMeta,
  relativeTime,
  sortJournalEntries,
  type JournalTag,
} from '../domain';
import { usePeople, useSpace } from '../store';
import { Avatar, Button, C, Card, F, Field, S, T } from './ui';

export function SharedJournal({
  maxItems,
  showFullLink = true,
}: {
  maxItems?: number;
  showFullLink?: boolean;
}) {
  const { space, userId, addJournalEntry, heartJournalEntry, run, busy } = useSpace();
  const { me } = usePeople();

  const [writing, setWriting] = useState(false);
  const [tag, setTag] = useState<JournalTag>('reflection');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const [authorFilter, setAuthorFilter] = useState<string>('all');

  const entries = sortJournalEntries(space.journal, order, authorFilter);
  const displayed = maxItems ? entries.slice(0, maxItems) : entries;
  const currentTag = journalTagMeta(tag);

  const handleSave = () => {
    if (!body.trim()) return;
    void run(async () => {
      await addJournalEntry(body, title, tag);
      setTitle('');
      setBody('');
      setWriting(false);
    });
  };

  return (
    <Card style={{ gap: 16 }}>
      <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
        <View style={[S.row, { gap: 8 }]}>
          <BookOpen size={17} color={C.green} strokeWidth={1.6} />
          <T kind="label" style={{ color: C.green }}>
            SHARED JOURNAL · CHRONOLOGICAL PAGES
          </T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={writing ? 'Close journal entry form' : 'Write a daily journal entry'}
          onPress={() => setWriting(prev => !prev)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: writing ? C.pale : C.bg,
            borderWidth: 1,
            borderColor: writing ? C.green : C.line,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          {writing ? (
            <Plus size={13} color={C.green} strokeWidth={1.8} />
          ) : (
            <Feather size={13} color={C.ink} strokeWidth={1.6} />
          )}
          <T style={{ fontSize: 12, fontFamily: F.medium, color: writing ? C.green : C.ink }}>
            {writing ? 'Close' : 'Write entry'}
          </T>
        </Pressable>
      </View>

      <View style={{ gap: 4 }}>
        <T kind="serif" style={{ fontSize: 22, lineHeight: 30 }}>
          Daily notes & quiet reflections.
        </T>
        <T kind="small">
          Leave a page for each other at the end of the day and read back through your story in order.
        </T>
      </View>

      {writing && (
        <View
          style={{
            backgroundColor: C.bg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.line,
            padding: 15,
            gap: 12,
          }}
        >
          <T kind="label" style={{ color: C.muted }}>
            ENTRY KIND · WRITING AS {me.name.toUpperCase()}
          </T>
          <View style={[S.wrap, { gap: 8 }]}>
            {JOURNAL_TAGS.map(item => {
              const selected = tag === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Journal tag ${item.label}`}
                  onPress={() => setTag(item.id)}
                  style={{
                    paddingHorizontal: 11,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: selected ? item.bg : C.paper,
                    borderWidth: 1,
                    borderColor: selected ? item.accent : C.line,
                  }}
                >
                  <T
                    style={{
                      fontSize: 12,
                      fontFamily: selected ? F.bold : F.medium,
                      color: selected ? item.accent : C.ink,
                    }}
                  >
                    {item.label}
                  </T>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Entry title (optional)"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            placeholder="A small headline for today’s page…"
          />

          <Field
            label="Your reflection or note"
            multiline
            value={body}
            onChangeText={setBody}
            maxLength={1500}
            placeholder={currentTag.prompt}
          />

          <Button
            title="Save to our journal"
            compact
            icon={Feather}
            disabled={!body.trim()}
            loading={busy}
            onPress={handleSave}
          />
        </View>
      )}

      {/* Chronological & Author Filter Bar */}
      <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
        <View style={[S.wrap, { gap: 6 }]}>
          {[
            { id: 'all', label: `All (${(space.journal ?? []).length})` },
            ...space.profiles.map(p => ({ id: p.id, label: p.name })),
          ].map(tab => {
            const active = authorFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityLabel={`Filter journal by ${tab.label}`}
                onPress={() => setAuthorFilter(tab.id)}
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: active ? C.ink : C.bg,
                  borderWidth: 1,
                  borderColor: active ? C.ink : C.line,
                }}
              >
                <T
                  style={{
                    fontSize: 12,
                    fontFamily: active ? F.bold : F.medium,
                    color: active ? C.paper : C.ink,
                  }}
                >
                  {tab.label}
                </T>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            order === 'newest' ? 'Sort journal oldest first' : 'Sort journal newest first'
          }
          onPress={() => setOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'))}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: C.bg,
            borderWidth: 1,
            borderColor: C.line,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <ArrowDownUp size={12} color={C.ink} strokeWidth={1.7} />
          <T style={{ fontSize: 11, fontFamily: F.medium, color: C.ink }}>
            {order === 'newest' ? 'Newest first' : 'Oldest first'}
          </T>
        </Pressable>
      </View>

      {/* Chronological Entries */}
      <View style={{ gap: 12 }}>
        {displayed.length ? (
          displayed.map(entry => {
            const meta = journalTagMeta(entry.tag);
            const authorName = space.profiles.find(p => p.id === entry.authorId)?.name ?? 'Partner';
            const hearted = entry.hearts.includes(userId);
            const dateFormatted = new Date(entry.createdAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <View
                key={entry.id}
                style={{
                  backgroundColor: C.bg,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: C.line,
                  padding: 15,
                  gap: 10,
                }}
              >
                <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
                  <View style={[S.row, { gap: 8 }]}>
                    <Avatar name={authorName} size={28} />
                    <View>
                      <T style={{ fontSize: 13, fontFamily: F.bold, color: C.ink }}>
                        {authorName}
                      </T>
                      <T kind="small" style={{ fontSize: 11 }}>
                        {dateFormatted} · {relativeTime(entry.createdAt)}
                      </T>
                    </View>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: meta.bg,
                    }}
                  >
                    <T
                      style={{
                        fontSize: 10,
                        fontFamily: F.bold,
                        color: meta.accent,
                        letterSpacing: 0.6,
                      }}
                    >
                      {meta.badge}
                    </T>
                  </View>
                </View>

                {!!entry.title && (
                  <T kind="serif" style={{ fontSize: 19, lineHeight: 26, color: C.ink }}>
                    {entry.title}
                  </T>
                )}

                <T style={{ fontSize: 14, lineHeight: 22, color: C.ink }}>{entry.body}</T>

                <View style={[S.between, { flexWrap: 'wrap', gap: 8, marginTop: 2 }]}>
                  <T kind="small" style={{ fontSize: 11 }}>
                    Page from {entry.day}
                  </T>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      hearted
                        ? `Remove heart from ${entry.title || 'journal entry'}`
                        : `Hold close ${entry.title || 'journal entry'}`
                    }
                    onPress={() => {
                      void run(() => heartJournalEntry(entry.id));
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 9,
                      backgroundColor: hearted ? C.pale : C.paper,
                      borderWidth: 1,
                      borderColor: hearted ? C.green : C.line,
                      opacity: pressed ? 0.72 : 1,
                    })}
                  >
                    <Heart
                      size={12}
                      color={C.green}
                      fill={hearted ? C.green : 'none'}
                      strokeWidth={1.7}
                    />
                    <T
                      style={{
                        fontSize: 11,
                        fontFamily: F.medium,
                        color: hearted ? C.green : C.ink,
                      }}
                    >
                      {hearted ? 'Held close' : 'Hold close'}
                      {entry.hearts.length ? ` · ${entry.hearts.length}` : ''}
                    </T>
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          <View
            style={{
              padding: 18,
              borderRadius: 14,
              backgroundColor: C.bg,
              borderWidth: 1,
              borderColor: C.line,
              alignItems: 'center',
              gap: 6,
            }}
          >
            <T style={{ fontFamily: F.medium, fontSize: 14 }}>No journal entries yet.</T>
            <T kind="small" style={{ textAlign: 'center' }}>
              Tap “Write entry” above to leave a reflection, gratitude note, or love letter.
            </T>
          </View>
        )}
      </View>

      {showFullLink && (
        <Button
          title="Open full shared journal"
          secondary
          compact
          onPress={() => router.push('/journal' as '/story')}
        />
      )}
    </Card>
  );
}
