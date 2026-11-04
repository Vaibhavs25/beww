import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeftRight, CheckCircle2, Lock, MessageCircle, PenLine, RefreshCw } from 'lucide-react-native';
import { dailyQuestionItemFor, sharedDay, visibleAnswers } from '../domain';
import { usePeople, useSpace } from '../store';
import { useNow } from '../use-now';
import { Avatar, Button, C, Card, F, Field, S, T } from './ui';

export function DailyQuestion({
  day,
  allowInlineAnswer = true,
  showOpenScreenButton = true,
}: {
  day?: string;
  allowInlineAnswer?: boolean;
  showOpenScreenButton?: boolean;
}) {
  const { space, userId, demo, switchPartner, run, answer, busy } = useSpace();
  const { me, partner } = usePeople();
  const now = useNow();
  const todayKey = day ?? sharedDay(space.timeZone, new Date(now));

  const [offset, setOffset] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const item = dailyQuestionItemFor(todayKey, offset);
  const myAnswer = space.answers.find(a => a.authorId === userId && a.day === todayKey);
  const partnerAnswer = space.answers.find(a => a.authorId !== userId && a.day === todayKey);
  const visible = visibleAnswers(space.answers, todayKey, userId);

  const handleSubmit = () => {
    if (!draft.trim()) return;
    void run(async () => {
      await answer(draft);
      setDraft('');
      setComposerOpen(false);
    });
  };

  return (
    <Card style={{ backgroundColor: C.yellow, gap: 16 }}>
      <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
        <View style={[S.row, { gap: 8, flexShrink: 1 }]}>
          <MessageCircle size={18} color={C.green} strokeWidth={1.6} />
          <T kind="label" style={{ color: C.green }}>
            {item.tag} · {item.index + 1}/{item.total}
          </T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Shuffle daily question prompt"
          onPress={() => setOffset(prev => prev + 1)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: C.paper,
            borderWidth: 1,
            borderColor: C.line,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <RefreshCw size={13} color={C.ink} strokeWidth={1.6} />
          <T style={{ fontSize: 12, fontFamily: F.medium, color: C.ink }}>
            {offset === 0 ? 'Shuffle prompt' : 'Next prompt'}
          </T>
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        <T kind="serif" style={{ fontSize: 22, lineHeight: 31, color: C.ink }}>
          “{item.prompt}”
        </T>
        <T kind="small" style={{ color: C.muted, fontFamily: F.italic }}>
          {item.hint}
        </T>
      </View>

      {!myAnswer && partnerAnswer && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            backgroundColor: C.paper,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.line,
            paddingHorizontal: 13,
            paddingVertical: 10,
          }}
        >
          <Lock size={14} color={C.green} />
          <T kind="small" style={{ flex: 1, color: C.ink }}>
            <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
              {partner?.name ?? 'Your partner'}
            </T>{' '}
            already shared an answer for today. Share yours to unlock both.
          </T>
        </View>
      )}

      {myAnswer ? (
        <View style={{ gap: 12 }}>
          <View style={[S.row, { gap: 7 }]}>
            <CheckCircle2 size={15} color={C.green} />
            <T kind="small" style={{ color: C.green, fontFamily: F.medium }}>
              {visible.length >= 2
                ? 'Both of you answered today’s prompt'
                : `Your answer is saved · waiting for ${partner?.name ?? 'your partner'}`}
            </T>
          </View>

          <View style={{ gap: 10 }}>
            {visible.map(ans => {
              const authorName = space.profiles.find(p => p.id === ans.authorId)?.name ?? '?';
              return (
                <View
                  key={ans.id}
                  style={{
                    backgroundColor: C.paper,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: C.line,
                    padding: 14,
                    gap: 8,
                  }}
                >
                  <View style={[S.row, { gap: 8 }]}>
                    <Avatar name={authorName} size={28} />
                    <T style={{ fontSize: 13, fontFamily: F.bold }}>{authorName}</T>
                  </View>
                  <T style={{ fontSize: 14, lineHeight: 21, color: C.ink }}>{ans.text}</T>
                </View>
              );
            })}
          </View>

          <View style={[S.row, { flexWrap: 'wrap', gap: 10 }]}>
            {showOpenScreenButton && (
              <Button
                title="Answer today’s question"
                secondary
                compact
                onPress={() => router.push('/question')}
              />
            )}
            {demo && visible.length < 2 && (
              <Button
                title={`Answer as ${partner?.name ?? 'partner'}`}
                secondary
                compact
                icon={ArrowLeftRight}
                onPress={() => {
                  switchPartner();
                  setDraft('');
                }}
              />
            )}
          </View>
        </View>
      ) : composerOpen && allowInlineAnswer ? (
        <View style={{ gap: 12 }}>
          <Field
            label={`Your answer as ${me.name}`}
            multiline
            value={draft}
            onChangeText={setDraft}
            placeholder="Write the first little thing that comes to mind…"
            maxLength={500}
          />
          <View style={[S.row, { flexWrap: 'wrap', gap: 10 }]}>
            <Button
              title="Share my answer"
              compact
              icon={MessageCircle}
              disabled={!draft.trim()}
              loading={busy}
              onPress={handleSubmit}
            />
            <Button
              title="Cancel"
              secondary
              compact
              onPress={() => {
                setComposerOpen(false);
                setDraft('');
              }}
            />
          </View>
        </View>
      ) : (
        <View style={[S.row, { flexWrap: 'wrap', gap: 10 }]}>
          {allowInlineAnswer && (
            <Button
              title="Write my answer"
              compact
              icon={PenLine}
              onPress={() => setComposerOpen(true)}
            />
          )}
          {showOpenScreenButton && (
            <Button
              title="Answer today’s question"
              secondary
              compact
              onPress={() => router.push('/question')}
            />
          )}
        </View>
      )}
    </Card>
  );
}
