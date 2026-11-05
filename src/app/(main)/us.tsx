import React, { useState } from 'react';
import { Modal, Platform, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeftRight, BookHeart, CalendarDays, Check, Download, Heart, KeyRound, Link2, LogOut, MapPin, Plane, RotateCcw, ShieldCheck } from 'lucide-react-native';
import { Button, C, Card, Chip, CoupleAvatars, Field, Page, S, T } from '../../components/ui';
import { daysTogether, sharedDay } from '../../domain';
import { usePeople, useSpace } from '../../store';
import { useI18n } from '../../localization';
import { LanguageSettings } from '../../components/language-settings';
import { RelationshipClockCard } from '../../components/relationship-clock';
import { PartnerNotificationCenterCard } from '../../components/partner-notifications';
import { CrashMonitoringCard } from '../../monitoring';

export default function Us() {
  const { space, userId } = useSpace(); const { me } = usePeople();
  return <UsDetails key={`${userId}:${me.name}:${space.startedOn}`} />;
}
function UsDetails() {
  const { space, demo, busy, run, notify, updateProfile, setMode, switchPartner, resetDemo, signOut, session } = useSpace();
  const { me, partner } = usePeople(); const { t } = useI18n();
  const [name, setName] = useState(me.name); const [start, setStart] = useState(space.startedOn); const [confirm, setConfirm] = useState(false);
  const { width } = useWindowDimensions();
  const partnerDisplay = partner?.nickname || space.originStory?.partnerNickname || partner?.name || t('settings.person');
  const isLinked = Boolean(session && space.profiles.length === 2 && space.profiles.every(profile => profile.id !== 'partner'));

  const exportKeepsake = () => {
    const payload = {
      app: 'Closer', version: '1.0.0', exportedAt: new Date().toISOString(), startedOn: space.startedOn,
      originStory: space.originStory, mode: space.mode, timeZone: space.timeZone,
      partners: space.profiles.map(p => ({ name: p.name, nickname: p.nickname, gender: p.gender, mood: p.mood, language: p.language })),
      counts: { moments: space.moments.length, quickNotes: (space.quickNotes ?? []).length, journalEntries: (space.journal ?? []).length, adventures: (space.adventures ?? []).length, plans: space.plans.length, trivia: (space.trivia ?? []).length },
      quickNotes: space.quickNotes ?? [], journal: space.journal ?? [], adventures: space.adventures ?? [], plans: space.plans, answers: space.answers,
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `closer-keepsake-${sharedDay(space.timeZone)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); notify(t('settings.exported'));
    } else notify(t('settings.exportNative', { moments: payload.counts.moments, notes: payload.counts.quickNotes, entries: payload.counts.journalEntries }));
  };

  return <Page title={t('settings.title')} subtitle={t('settings.subtitle')} eyebrow={t('settings.eyebrow')}>
    <View style={{ flexDirection: width > 1150 ? 'row' : 'column', gap: 24, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, width: '100%', gap: 24 }}>
        <LanguageSettings />
        <Card style={{ alignItems: 'center', gap: 13, paddingVertical: 32 }}>
          <CoupleAvatars names={[me.name, partnerDisplay]} avatars={[me.avatar, partner?.avatar]} size={70} />
          <T kind="serif">{me.name} & {partnerDisplay}</T>
          <View style={S.row}><Heart size={16} color={C.green} /><T kind="small">{space.startedOn ? t('settings.days', { count: daysTogether(space.startedOn, sharedDay(space.timeZone)) }) : t('settings.storyStarts')}</T></View>
          <Chip title={t(isLinked ? 'settings.linkedBadge' : 'settings.setupBadge')} />
        </Card>
        <RelationshipClockCard startedAt={space.originStory?.relationshipStartedAt || space.startedOn} mode={space.mode} myName={me.name} partnerName={partner?.name ?? t('settings.person')} partnerNickname={partnerDisplay} myAvatar={me.avatar} partnerAvatar={partner?.avatar} />
        <Card style={{ gap: 20 }}>
          <T kind="sub">{t('settings.details')}</T>
          <Field label={t('settings.name')} value={name} onChangeText={setName} maxLength={30} />
          <Field label={t('settings.startDate')} value={start} onChangeText={setStart} maxLength={10} placeholder={t('settings.datePlaceholder')} keyboardType="numbers-and-punctuation" />
          <Button title={t('settings.save')} icon={Check} loading={busy} disabled={!name.trim()} onPress={() => { void run(() => updateProfile(name, start)); }} />
        </Card>
      </View>
      <View style={{ flex: 1, width: '100%', gap: 24 }}>
        <PartnerNotificationCenterCard />
        <Card style={{ gap: 18 }}>
          <T kind="sub">{t('settings.how')}</T><T kind="small">{t('settings.modeDescription')}</T>
          <View style={S.wrap}><Chip title={t('settings.nearby')} icon={MapPin} selected={space.mode === 'nearby'} onPress={() => { void run(() => setMode('nearby')); }} /><Chip title={t('settings.distance')} icon={Plane} selected={space.mode === 'distance'} onPress={() => { void run(() => setMode('distance')); }} /></View>
          <View style={S.line} /><T kind="small">{t('settings.timeZone', { zone: space.timeZone })}</T>
          <View style={[S.row, { gap: 10, flexWrap: 'wrap' }]}><Button title={t('settings.memories')} secondary compact icon={BookHeart} onPress={() => router.push('/story')} /><Button title={t('settings.plans')} secondary compact icon={CalendarDays} onPress={() => router.push('/plans')} /></View>
        </Card>
        <Card style={{ gap: 16, backgroundColor: C.pale }}>
          <Link2 color={C.green} size={23} /><T kind="sub">{t(isLinked ? 'settings.linked' : 'settings.linkTitle')}</T>
          <T>{t(isLinked ? 'settings.linkedDescription' : 'settings.linkDescription', { me: me.name, partner: partnerDisplay })}</T>
          {!isLinked && <Button title={t('settings.link')} icon={KeyRound} onPress={() => router.push('/connect')} />}
          {demo && <Button title={t('settings.switchPartner')} secondary icon={ArrowLeftRight} onPress={switchPartner} />}
        </Card>
        <CrashMonitoringCard />
        <Card style={{ gap: 14 }}><View style={[S.row, { gap: 8 }]}><ShieldCheck color={C.green} size={20} /><T kind="sub">{t('settings.privacy')}</T></View><T kind="small">{t('settings.privacyDescription')}</T><View style={[S.row, { gap: 10, flexWrap: 'wrap' }]}><Button title={t('settings.terms')} secondary compact icon={ShieldCheck} onPress={() => router.push('/legal')} /><Button title={t('settings.export')} secondary compact icon={Download} onPress={exportKeepsake} /></View></Card>
        {!session ? <Button title={t('settings.resetDevice')} secondary compact icon={RotateCcw} onPress={() => setConfirm(true)} /> : <View style={{ gap: 10 }}><T kind="small">{t('settings.signedIn', { email: session.user.email ?? '' })}</T><Button title={t('settings.signOut')} secondary compact icon={LogOut} onPress={() => { void run(signOut); }} /></View>}
      </View>
    </View>
    <Modal transparent visible={confirm} animationType="fade" onRequestClose={() => setConfirm(false)}>
      <View style={{ flex: 1, backgroundColor: '#1D2C2866', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Card style={{ maxWidth: 420, width: '100%', gap: 18 }}><T kind="serif">{t('settings.resetTitle')}</T><T>{t('settings.resetDescription')}</T><Button title={t('settings.keep')} onPress={() => setConfirm(false)} /><Button title={t('settings.reset')} secondary icon={RotateCcw} onPress={() => { void run(async () => { await resetDemo(); setConfirm(false); router.replace('/welcome'); }); }} /></Card>
      </View>
    </Modal>
  </Page>;
}
