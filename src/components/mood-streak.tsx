import React from 'react';
import { View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { moodFor, type MoodHistory, type Profile } from '../domain';
import { currentMoodStreak, offsetDay } from '../dashboard';
import { Button, C, F, S, T } from './ui';

export function MoodStreak({ history, profiles, userId, today, onCheckIn }: {
  history: MoodHistory | null; profiles: Profile[]; userId: string; today: string; onCheckIn?: () => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => offsetDay(today, i - 6));
  const checkedIn = history?.entries.some(entry => entry.authorId === userId && entry.day === today);
  return <View testID="mood-streak" style={{ gap: 20 }}>
    <View style={[S.between, { alignItems: 'flex-start' }]}>
      <View style={{ flex: 1, gap: 3 }}><T kind="serif" style={{ fontSize: 24 }}>Our daily check-ins</T><T kind="small">A little space for every feeling.</T></View>
      <Heart size={23} strokeWidth={1.4} color={C.green} style={{ marginTop: 5 }} />
    </View>
    {history ? profiles.map((person, index) => {
      const count = currentMoodStreak(history, person.id, today);
      return <View key={person.id} style={{ gap: 10 }}>
        <View style={S.between}><T numberOfLines={1} style={{ flex: 1, fontFamily: F.medium, fontSize: 13 }}>{person.name}{person.id === userId ? ' · you' : ''}</T><T kind="small" style={{ color: index ? '#6C5485' : C.green }}>{count ? `${count} day${count === 1 ? '' : 's'} in a row` : 'A fresh start'}</T></View>
        <View style={{ flexDirection: 'row', gap: 5 }}>{days.map(day => {
          const entry = history.entries.find(row => row.authorId === person.id && row.day === day);
          const mood = entry ? moodFor(entry.mood) : null;
          const date = new Date(`${day}T12:00:00Z`);
          const label = date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
          return <View key={day} accessible accessibilityLabel={`${person.name}, ${label}: ${mood?.label ?? 'No check-in'}${day === today ? ', today' : ''}`} style={{ flex: 1, gap: 5, alignItems: 'center' }}>
            <T kind="small" style={{ fontSize: 10, color: day === today ? C.ink : C.muted }}>{date.toLocaleDateString('en', { weekday: 'narrow', timeZone: 'UTC' })}</T>
            <View style={{ width: '100%', maxWidth: 42, aspectRatio: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: mood ? index ? C.pale : C.rose : '#F5F0F0', borderWidth: day === today ? 1.5 : 1, borderColor: day === today ? index ? C.lavender : C.green : 'transparent' }}>
              {mood ? <T style={{ fontSize: 18 }}>{mood.emoji}</T> : <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#C8BBC4' }} />}
            </View>
          </View>;
        })}</View>
      </View>;
    }) : <T kind="small">Your mood history is unavailable right now. Reconnect to see your check-ins.</T>}
    {onCheckIn && <Button compact title={checkedIn ? 'Update today’s mood' : 'Check in'} onPress={onCheckIn} icon={Heart} />}
    <T kind="small" style={{ fontSize: 11, lineHeight: 17 }}>Every mood counts. One check-in a day, in your shared time zone.</T>
  </View>;
}
