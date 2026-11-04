import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowUpRight, Camera, Heart, PenLine, Phone, CalendarDays, MessageCircle } from 'lucide-react-native';
import { usePeople, useSpace } from '../../store';
import { daysTogether, moodFor, relativeTime, sharedDay } from '../../domain';
import { Bloom, Button, C, CoupleAvatars, F, Page, S, T } from '../../components/ui';
import { DailyQuestion } from '../../components/daily-question';
import { MemoryLane } from '../../components/memory-lane';
import { MoodStreak } from '../../components/mood-streak';
import { PetPortrait } from '../../components/pet-portrait';
import { useNow } from '../../use-now';

export default function Today() {
  const { space, demo } = useSpace(); const { me, partner } = usePeople();
  const { width } = useWindowDimensions(); const wide = width > 1120; const small = width < 480;
  const now = useNow(space); const day = sharedDay(space.timeZone, new Date(now));
  const recentMood = partner && now >= Date.parse(partner.moodAt) && now - Date.parse(partner.moodAt) < 86400000;
  const mood = moodFor(recentMood ? partner.mood : 'calm');
  const quiet = recentMood && (partner.need === 'Quiet time' || partner.mood === 'space');
  const nextDate = space.plans.filter(plan => plan.kind === 'date' && !plan.done && plan.date >= day).sort((a, b) => a.date.localeCompare(b.date))[0];
  const today = new Date(now).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', timeZone: space.timeZone });
  const checkIns = <View style={{ backgroundColor: '#FFFCF8', padding: small ? 20 : 23, borderWidth: 1, borderColor: '#E8DCDD', borderRadius: 5 }}><MoodStreak history={space.moodHistory} profiles={[me, ...(partner ? [partner] : [])]} userId={me.id} today={day} onCheckIn={() => router.push('/mood')} /></View>;
  return <Page>
    <View style={[S.between, { alignItems: 'flex-start', paddingBottom: 23, borderBottomWidth: 1, borderBottomColor: '#E7D9DD' }]}>
      <View style={{ flex: 1, gap: 9 }}>
        <T kind="label" style={{ color: C.muted, letterSpacing: 1.5 }}>{today.toUpperCase()}</T>
        <T kind="title" style={{ fontSize: small ? 32 : 42, lineHeight: small ? 42 : 52 }}>A little closer, {me.name}.</T>
        <View style={[S.row, { gap: 8 }]}><Heart size={13} color={C.green} fill={C.rose} /><T style={{ color: C.muted, flex: 1, fontSize: 13 }}>For you & {partner?.name ?? 'your favorite person'}. For the everyday.</T></View>
      </View>
      {width > 700 && <View style={{ alignItems: 'center', gap: 5, paddingHorizontal: 18, borderLeftWidth: 1, borderLeftColor: C.line }}><CoupleAvatars names={[me.name, partner?.name ?? '?']} size={34} /><T style={{ color: C.green, fontFamily: F.serif, fontSize: 29, lineHeight: 37 }}>{space.startedOn ? daysTogether(space.startedOn, day) : '♡'}</T><T kind="small" style={{ fontSize: 10 }}>days of us</T></View>}
    </View>
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 34 : 28, alignItems: 'stretch' }}>
      <View style={{ flex: wide ? 1.6 : undefined, minWidth: 0, gap: 28 }}>
        <View style={{ backgroundColor: recentMood ? mood.background : '#F4E5E9', borderRadius: 5, borderTopRightRadius: 42, padding: small ? 22 : 27, gap: 18 }}>
          <View style={[S.row, { gap: 7 }]}><View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: mood.color }} /><T kind="label" style={{ color: mood.color, flex: 1, letterSpacing: 1.5 }}>{partner ? `${partner.name.toUpperCase()}’S LITTLE WORLD` : 'YOUR LITTLE WORLD'}</T></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ flex: 1, gap: 10 }}>
              <T kind="serif" style={{ fontSize: small ? 27 : 32, lineHeight: small ? 37 : 42, color: mood.color }}>{recentMood ? `${mood.emoji} ${mood.id === 'space' ? 'A little quiet time.' : mood.id === 'missing' ? 'Missing you.' : `Feeling ${mood.label.toLowerCase()}.`}` : 'A little hello, just for you.'}</T>
              <T style={{ fontFamily: F.italic, fontSize: 14, lineHeight: 23, color: mood.color }}>{recentMood ? partner.moodNote || mood.subtitle : 'A small check-in can make an ordinary day feel more like ours.'}</T>
            </View>
            <View style={{ marginRight: -12, marginLeft: -8 }}><Bloom size={small ? 105 : 155} calm={!!quiet || mood.id === 'low'} color={C.lavender} /></View>
          </View>
          {recentMood && <T kind="small" style={{ fontSize: 11, color: mood.color }}>{partner.need || 'Shared a feeling'} · {relativeTime(partner.moodAt)}</T>}
          <Button compact title={quiet ? 'Leave a gentle note' : 'Send a little love'} icon={Heart} secondary onPress={() => router.push({ pathname: '/compose', params: { kind: 'note', text: quiet ? 'Take the time you need. No reply needed. I’m here.' : mood.note } })} style={{ alignSelf: 'flex-start' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', gap: 8, paddingBottom: 4 }}>
          {[
            { title: 'Photo', label: 'Send a photo', icon: Camera, path: '/compose?kind=photo', color: C.rose },
            { title: 'Doodle', label: 'Send a doodle', icon: PenLine, path: '/draw', color: C.pale },
            { title: 'Call', label: 'Call your partner', icon: Phone, path: '/call', color: '#F3E9E0' },
            { title: 'Chat', label: 'Chat with your partner', icon: MessageCircle, path: '/chat', color: '#E9E0EF' },
          ].map(({ title, label, icon: Icon, path, color }) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={label} onPress={() => router.push(path as '/draw')} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, opacity: pressed ? 0.6 : 1 })}><View style={{ width: 46, height: 46, borderRadius: 17, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}><Icon size={21} color={C.ink} strokeWidth={1.4} /></View><T style={{ fontFamily: F.medium, fontSize: 11 }}>{title}</T></Pressable>)}
        </View>
        {!wide && checkIns}
        <MemoryLane now={now} />
        <DailyQuestion day={day} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/story')} style={[S.between, { paddingVertical: 15, borderTopWidth: 1, borderTopColor: C.line }]}><View style={{ flex: 1, gap: 3 }}><T style={{ fontFamily: F.serif, fontSize: 19 }}>The rest of our story</T><T kind="small">Notes, doodles & moments worth keeping.</T></View><ArrowUpRight size={22} color={C.green} strokeWidth={1.4} /></Pressable>
      </View>
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0, gap: 28 }}>
        {wide && checkIns}
        <View style={{ padding: 23, backgroundColor: '#F7ECE9', borderRadius: 5, gap: 17, borderTopWidth: 3, borderTopColor: '#C9899B' }}>
          <View style={[S.row, { gap: 8 }]}><CalendarDays size={16} color={C.green} /><T kind="label" style={{ color: C.green }}>OUR NEXT DATE</T></View>
          <T kind="serif" style={{ fontSize: 25, lineHeight: 35 }}>{nextDate?.title ?? 'Time for just the two of us.'}</T>
          <T kind="small">{nextDate ? new Date(`${nextDate.date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }) : space.mode === 'distance' ? 'Same movie, two sofas? Put it on the calendar.' : 'A walk, a coffee, a whole afternoon. Make it yours.'}</T>
          <Button title={nextDate ? 'View our plans' : 'Plan a date'} compact secondary onPress={() => router.push('/plans')} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={space.pet ? `Visit ${space.pet.name}` : 'Meet your shared pet'} onPress={() => router.push('/pet')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, opacity: pressed ? 0.65 : 1 })}>
          <PetPortrait kind={space.pet?.kind ?? 'bear'} size={80} />
          <View style={{ flex: 1, gap: 5 }}><T style={{ fontFamily: F.serif, fontSize: 21 }}>{space.pet ? `${space.pet.name} says hello.` : 'Room for one more?'}</T><T kind="small">{space.pet ? 'A little care, from both of you.' : 'A tiny companion to raise together.'}</T></View><ArrowUpRight size={18} color={C.green} />
        </Pressable>
        <View style={{ alignItems: 'center', paddingTop: 9, gap: 10 }}><Heart size={18} color="#B78B9E" strokeWidth={1.2} /><T style={{ textAlign: 'center', fontFamily: F.italic, color: C.muted, fontSize: 13 }}>A home for our ordinary days.</T></View>
      </View>
    </View>
    <T kind="small" style={{ textAlign: 'center', fontSize: 10, marginTop: 12 }}>{demo ? 'Your demo stays on this device. Switch partners using the badge above.' : 'Your shared space. Just the two of you.'}</T>
  </Page>;
}
