import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Heart, Check } from 'lucide-react-native';
import { usePeople, useSpace } from '../store';
import { MOODS, NEEDS, sharedDay } from '../domain';
import { Button, C, Chip, Field, FormPage, S, T } from '../components/ui';
import { MoodStreak } from '../components/mood-streak';
import { useNow } from '../use-now';

export default function MoodScreen() {
  const { me, partner } = usePeople(); const { space, run, setMood, busy } = useSpace();
  const [mood, chooseMood] = useState(me.mood); const [note, setNote] = useState(me.moodNote); const [need, setNeed] = useState(me.need);
  const day = sharedDay(space.timeZone, new Date(useNow()));
  return <FormPage title="How’s your little world?" subtitle="Every kind of day belongs here. Share only what you want to.">
    <View style={S.wrap}>{MOODS.map(m => <Pressable accessibilityRole="radio" accessibilityLabel={m.label} accessibilityState={{ checked: mood === m.id }} key={m.id} onPress={() => chooseMood(m.id)} style={{ width: '30%', flexGrow: 1, padding: 19, gap: 9, alignItems: 'center', borderWidth: 1.5, borderColor: mood === m.id ? m.color : C.line, borderRadius: 18, backgroundColor: mood === m.id ? m.background : C.paper }}><T style={{ fontSize: 27 }}>{m.emoji}</T><T style={{ fontSize: 13 }}>{m.label}</T>{mood === m.id && <Check size={13} color={m.color} />}</Pressable>)}</View>
    <Field label="A little context (optional)" multiline placeholder="What’s on your mind?" value={note} onChangeText={setNote} maxLength={200} />
    <T kind="sub">What would feel good right now?</T>
    <View style={S.wrap}>{NEEDS.map(n => <Chip key={n} title={n} selected={n === need} onPress={() => setNeed(need === n ? '' : n)} />)}</View>
    <T kind="small">Your partner’s home reflects this check-in for 24 hours. Today’s mood stays in your shared history; notes and support requests aren’t added to the history. You can update today’s mood anytime.</T>
    <Button title="Share how I’m feeling" icon={Heart} loading={busy} onPress={() => { void run(async () => { await setMood(mood, note, need); if (router.canGoBack()) router.back(); else router.replace('/'); }); }} />
    <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: 25 }}><MoodStreak history={space.moodHistory} profiles={[me, ...(partner ? [partner] : [])]} userId={me.id} today={day} /></View>
  </FormPage>;
}
