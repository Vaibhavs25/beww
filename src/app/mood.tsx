import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Heart, Check, Flame } from 'lucide-react-native';
import { usePeople, useSpace } from '../store';
import { coupleMoodTimeline, moodFor, MOODS, NEEDS, sharedDay } from '../domain';
import { Avatar, Button, C, Card, Chip, F, Field, FormPage, S, T } from '../components/ui';
import { useNow } from '../use-now';

export default function MoodScreen() {
  const { me, partner } = usePeople();
  const { space, userId, run, setMood, busy } = useSpace();
  const [mood, chooseMood] = useState(me.mood);
  const [note, setNote] = useState(me.moodNote);
  const [need, setNeed] = useState(me.need);
  const todayKey = sharedDay(space.timeZone, new Date(useNow()));
  const timeline = coupleMoodTimeline(space.moodLogs, space.profiles, space.timeZone, todayKey, userId);
  const recentNotes = [...timeline.logs]
    .filter(item => item.note)
    .reverse()
    .slice(0, 3);

  return (
    <FormPage title="How’s your little world?" subtitle="Every kind of day belongs here. Share only what you want to.">
      <Card style={{ backgroundColor: C.paper, gap: 14 }}>
        <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
          <View style={[S.row, { gap: 7 }]}>
            <Flame size={17} color={C.green} />
            <T kind="sub" style={{ fontSize: 16 }}>
              {timeline.combinedStreak}-day daily check-in streak
            </T>
          </View>
          <T kind="small">
            {me.name.slice(0, 12)}: {timeline.myStreak}d · {(partner?.name ?? 'Partner').slice(0, 12)}: {timeline.partnerStreak}d
          </T>
        </View>

        <View style={{ flexDirection: 'row', gap: 5 }}>
          {timeline.days.map(slot => {
            const myMood = slot.mine ? moodFor(slot.mine.mood) : null;
            const theirMood = slot.theirs ? moodFor(slot.theirs.mood) : null;
            return (
              <View
                key={slot.day}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 2,
                  borderRadius: 12,
                  backgroundColor: slot.isToday ? C.pale : C.bg,
                  borderWidth: 1,
                  borderColor: slot.isToday ? C.green : C.line,
                  gap: 5,
                }}
              >
                <T kind="small" style={{ fontSize: 10, fontFamily: slot.isToday ? F.bold : F.medium, color: slot.isToday ? C.green : C.muted }}>
                  {slot.weekday}
                </T>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: myMood ? myMood.background : C.paper,
                    borderWidth: 1,
                    borderColor: myMood ? myMood.color : C.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <T style={{ fontSize: 12 }}>{myMood ? myMood.emoji : '·'}</T>
                </View>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theirMood ? theirMood.background : C.paper,
                    borderWidth: 1,
                    borderColor: theirMood ? theirMood.color : C.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <T style={{ fontSize: 12 }}>{theirMood ? theirMood.emoji : '·'}</T>
                </View>
                <T kind="small" style={{ fontSize: 9 }}>
                  {slot.dayNum}
                </T>
              </View>
            );
          })}
        </View>

        {recentNotes.length > 0 && (
          <View style={{ gap: 8, paddingTop: 4 }}>
            <T kind="label" style={{ color: C.muted }}>
              RECENT CHECK-IN NOTES
            </T>
            {recentNotes.map(entry => {
              const authorName = space.profiles.find(p => p.id === entry.authorId)?.name ?? 'Partner';
              const entryMood = moodFor(entry.mood);
              return (
                <View key={`${entry.authorId}-${entry.day}`} style={[S.row, { alignItems: 'flex-start', gap: 10 }]}>
                  <Avatar name={authorName} size={26} color={entry.authorId === userId ? C.rose : C.pale} />
                  <View style={{ flex: 1 }}>
                    <T kind="small" style={{ color: C.ink }}>
                      <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                        {authorName}
                      </T>{' '}
                      · {entryMood.emoji} {entryMood.label} · {entry.day}
                    </T>
                    <T kind="small" style={{ fontFamily: F.italic }}>
                      “{entry.note}”
                    </T>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <View style={S.wrap}>
        {MOODS.map(m => (
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={m.label}
            accessibilityState={{ checked: mood === m.id }}
            key={m.id}
            onPress={() => chooseMood(m.id)}
            style={{
              width: '30%',
              flexGrow: 1,
              padding: 18,
              gap: 8,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: mood === m.id ? m.color : C.line,
              borderRadius: 16,
              backgroundColor: mood === m.id ? m.background : C.paper,
            }}
          >
            <T style={{ fontSize: 26 }}>{m.emoji}</T>
            <T style={{ fontSize: 13, fontFamily: mood === m.id ? F.medium : F.body }}>{m.label}</T>
            {mood === m.id && <Check size={13} color={m.color} />}
          </Pressable>
        ))}
      </View>

      <Field
        label="A little context (optional)"
        multiline
        placeholder="What’s on your mind?"
        value={note}
        onChangeText={setNote}
        maxLength={200}
      />

      <T kind="sub">What would feel good right now?</T>
      <View style={S.wrap}>
        {NEEDS.map(n => (
          <Chip key={n} title={n} selected={n === need} onPress={() => setNeed(need === n ? '' : n)} />
        ))}
      </View>

      <T kind="small">
        Your partner will see this check-in for the next 24 hours, and it will be added to your daily mood rhythm.
      </T>

      <Button
        title="Share how I’m feeling"
        icon={Heart}
        loading={busy}
        onPress={() => {
          void run(async () => {
            await setMood(mood, note, need);
            router.back();
          });
        }}
      />
    </FormPage>
  );
}
