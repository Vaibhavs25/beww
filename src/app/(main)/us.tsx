import React, { useState } from 'react';
import { Modal, Platform, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeftRight, BookHeart, CalendarDays, Check, Download, Heart, KeyRound, Link2, LogOut, MapPin, Plane, RotateCcw, ShieldCheck } from 'lucide-react-native';
import { Button, C, Card, Chip, CoupleAvatars, Field, Page, S, T } from '../../components/ui';
import { daysTogether, sharedDay } from '../../domain';
import { usePeople, useSpace } from '../../store';
import { RelationshipClockCard } from '../../components/relationship-clock';
import { PartnerNotificationCenterCard } from '../../components/partner-notifications';
import { CrashMonitoringCard } from '../../monitoring';

export default function Us() {
  const { space, userId } = useSpace(); const { me } = usePeople();
  return <UsDetails key={`${userId}:${me.name}:${space.startedOn}`} />;
}
function UsDetails() {
  const { space, demo, busy, run, notify, updateProfile, setMode, switchPartner, resetDemo, signOut, session } = useSpace(); const { me, partner } = usePeople();
  const [name, setName] = useState(me.name); const [start, setStart] = useState(space.startedOn); const [confirm, setConfirm] = useState(false); const { width } = useWindowDimensions();
  const partnerDisplay = partner?.nickname || space.originStory?.partnerNickname || partner?.name || 'your person';
  const isLinked = Boolean(space.originStory?.isLinked || space.originStory?.joinedCode);

  const exportKeepsake = () => {
    const payload = {
      app: 'Closer',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      startedOn: space.startedOn,
      originStory: space.originStory,
      mode: space.mode,
      timeZone: space.timeZone,
      partners: space.profiles.map(p => ({ name: p.name, nickname: p.nickname, gender: p.gender, mood: p.mood })),
      counts: {
        moments: space.moments.length,
        quickNotes: (space.quickNotes ?? []).length,
        journalEntries: (space.journal ?? []).length,
        adventures: (space.adventures ?? []).length,
        plans: space.plans.length,
        trivia: (space.trivia ?? []).length,
      },
      quickNotes: space.quickNotes ?? [],
      journal: space.journal ?? [],
      adventures: space.adventures ?? [],
      plans: space.plans,
      answers: space.answers,
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `closer-keepsake-${sharedDay(space.timeZone)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    notify('Your shared keepsake archive is ready ♡');
  };

  return <Page title="A space that’s ours." subtitle="However far apart, whatever chapter you’re in." eyebrow="JUST US"><View style={{ flexDirection: width > 1150 ? 'row' : 'column', gap: 24, alignItems: 'flex-start' }}><View style={{ flex: 1, width: '100%', gap: 24 }}><Card style={{ alignItems: 'center', gap: 13, paddingVertical: 32 }}><CoupleAvatars names={[me.name, partnerDisplay]} avatars={[me.avatar, partner?.avatar]} size={70} /><T kind="serif">{me.name} & {partnerDisplay}</T><View style={S.row}><Heart size={16} color={C.green} /><T kind="small">{space.startedOn ? `${daysTogether(space.startedOn, sharedDay(space.timeZone))} days of you & me` : 'Your story starts here'}</T></View><Chip title={isLinked ? 'Accounts linked ✓ (One-time setup complete)' : 'One-time story setup complete'} /></Card><RelationshipClockCard startedAt={space.originStory?.relationshipStartedAt || space.startedOn} mode={space.mode} myName={me.name} partnerName={partner?.name ?? 'Partner'} partnerNickname={partnerDisplay} myAvatar={me.avatar} partnerAvatar={partner?.avatar} /><Card style={{ gap: 20 }}><T kind="sub">The little details</T><Field label="Your name" value={name} onChangeText={setName} maxLength={30} /><Field label="Our start date · YYYY-MM-DD" value={start} onChangeText={setStart} maxLength={10} placeholder="The day it all began" keyboardType="numbers-and-punctuation" /><Button title="Save our details" icon={Check} loading={busy} disabled={!name.trim()} onPress={() => { void run(() => updateProfile(name, start)); }} /></Card></View><View style={{ flex: 1, width: '100%', gap: 24 }}><PartnerNotificationCenterCard /><Card style={{ gap: 18 }}><T kind="sub">How are we doing together?</T><T kind="small">Your space can change when life does. Both modes include every activity.</T><View style={S.wrap}><Chip title="Nearby" icon={MapPin} selected={space.mode === 'nearby'} onPress={() => { void run(() => setMode('nearby')); }} /><Chip title="Long distance" icon={Plane} selected={space.mode === 'distance'} onPress={() => { void run(() => setMode('distance')); }} /></View><View style={S.line} /><T kind="small">Our shared day follows {space.timeZone}. Questions and daily wins use the same day for both partners.</T><View style={[S.row, { gap: 10, flexWrap: 'wrap' }]}><Button title="Our First Chapter & Memories" secondary compact icon={BookHeart} onPress={() => router.push('/story')} /><Button title="Our dates & someday list" secondary compact icon={CalendarDays} onPress={() => router.push('/plans')} /></View></Card><Card style={{ gap: 16, backgroundColor: C.pale }}><Link2 color={C.green} size={23} /><T kind="sub">{isLinked ? 'Accounts permanently linked ✓' : 'One-time partner link'}</T><T>{isLinked ? `${me.name} & ${partnerDisplay} are connected in this private space. Your one-time connection code was used during setup and is now locked.` : `Need to finish linking accounts with ${partnerDisplay}? Connection codes are used once during initial partner setup.`}</T>{!isLinked && <Button title="Complete one-time partner link" icon={KeyRound} onPress={() => router.push('/connect')} />}{demo && <Button title="Switch partner view" secondary icon={ArrowLeftRight} onPress={switchPartner} />}</Card><CrashMonitoringCard /><Card style={{ gap: 14 }}><View style={[S.row, { gap: 8 }]}><ShieldCheck color={C.green} size={20} /><T kind="sub">Privacy & keepsake archive</T></View><T kind="small">Your moods, photos, sticky notes, and journal entries belong only to the two of you. Camera and microphone access are used strictly when you snap a photo or place a call—with zero ad trackers or public profiles.</T><View style={[S.row, { gap: 10, flexWrap: 'wrap' }]}><Button title="Terms & Privacy Policy" secondary compact icon={ShieldCheck} onPress={() => router.push('/legal')} /><Button title="Export our keepsake data" secondary compact icon={Download} onPress={exportKeepsake} /></View></Card>{!session ? <Button title="Reset device space" secondary compact icon={RotateCcw} onPress={() => setConfirm(true)} /> : <View style={{ gap: 10 }}><T kind="small">Signed in as {session?.user.email}</T><Button title="Sign out on this device" secondary compact icon={LogOut} onPress={() => { void run(signOut); }} /></View>}</View></View><Modal transparent visible={confirm} animationType="fade" onRequestClose={() => setConfirm(false)}><View style={{ flex: 1, backgroundColor: '#1D2C2866', alignItems: 'center', justifyContent: 'center', padding: 24 }}><Card style={{ maxWidth: 420, width: '100%', gap: 18 }}><T kind="serif">Start with a fresh space?</T><T>This resets the saved couple space on this device back to a fresh start.</T><Button title="Keep our moments" onPress={() => setConfirm(false)} /><Button title="Reset space" secondary icon={RotateCcw} onPress={() => { void run(async () => { await resetDemo(); setConfirm(false); router.replace('/welcome'); }); }} /></Card></View></Modal></Page>;
}

