import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ArrowLeftRight, Check, Heart, Pencil, Sparkles } from 'lucide-react-native';
import { BackLink, Button, C, Card, Field, Page, S, T } from '../components/ui';
import { PetPortrait } from '../components/pet-portrait';
import { FeatureNotice } from '../components/feature-notice';
import { usePeople, useSpace } from '../store';
import { sharedDay, type PetKind } from '../domain';
import { CARE_ACTIONS, PET_KINDS, petGrowth } from '../shared-features';
import { useNow } from '../use-now';

export default function PetHome() {
  const { space, userId, demo, busy, run, adoptPet, carePet, renamePet, switchPartner } = useSpace(); const { me, partner } = usePeople();
  const [kind, setKind] = useState<PetKind>('bear'); const [name, setName] = useState('Mochi'); const [renaming, setRenaming] = useState(false);
  const now = useNow(); const day = sharedDay(space.timeZone, new Date(now)); const pet = space.pet;
  const today = space.petCare.filter(c => c.day === day); const growth = petGrowth(pet?.points ?? 0);
  const lastCare = [...space.petCare].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const resting = lastCare?.day === day && lastCare.action === 'rest';
  return <Page title={pet ? `A little home for ${pet.name}.` : 'Someone small. Loved by two.'} subtitle={pet ? 'Raised with little moments of care, from both of you.' : 'Choose a little friend to raise together.'} eyebrow="OUR SHARED PET"><BackLink /><FeatureNotice />{demo && <Button title={`Care as ${partner?.name ?? 'your partner'}`} compact secondary icon={ArrowLeftRight} onPress={switchPartner} />}
    <View style={{ width: '100%', maxWidth: 730, alignSelf: 'center', gap: 22 }}>
      {!pet ? <><View style={{ flexDirection: 'row', gap: 10 }}>{PET_KINDS.map(option => <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: kind === option.id }} onPress={() => setKind(option.id)} style={{ flex: 1, alignItems: 'center', paddingVertical: 15, borderRadius: 20, borderWidth: 1.5, borderColor: kind === option.id ? C.green : C.line, backgroundColor: kind === option.id ? C.pale : C.paper }}><PetPortrait kind={option.id} size={65} /><T>{option.label}</T>{kind === option.id && <Check size={14} color={C.green} />}</Pressable>)}</View>
        <Card style={{ alignItems: 'center', backgroundColor: C.yellow, gap: 8 }}><PetPortrait kind={kind} /><T kind="serif">{PET_KINDS.find(p => p.id === kind)?.description}</T><T kind="small" style={{ textAlign: 'center' }}>One shared pet. Two favorite people.</T></Card>
        <Field label="What shall we call them?" value={name} onChangeText={setName} maxLength={24} placeholder="Mochi" />
        <Button title="Adopt our pet" icon={Heart} loading={busy} disabled={!name.trim() || !space.featuresReady} onPress={() => { void run(() => adoptPet(name, kind)); }} />
        <T kind="small" style={{ textAlign: 'center' }}>Feed, play, and tuck them in to help them grow. Your progress stays, even on days when life gets busy.</T>
      </> : <>
        <Card style={{ backgroundColor: C.purple, alignItems: 'center', gap: 10, overflow: 'hidden' }}><View style={[S.between, { width: '100%' }]}><T kind="label" style={{ color: C.green }}>LEVEL {growth.level} · {growth.stage.toUpperCase()}</T><Sparkles size={18} color={C.green} /></View><PetPortrait kind={pet.kind} resting={resting} grown={pet.points >= 30} size={260} /><T kind="serif">{resting ? 'Dreaming of our next adventure.' : today.length ? 'My favorite people are here.' : 'A new day for little adventures.'}</T><T kind="small">{pet.name} · loved by {me.name} & {partner?.name ?? 'your person'}</T><View style={{ width: '100%', height: 8, backgroundColor: '#D6C4E6', borderRadius: 8, overflow: 'hidden', marginTop: 12 }}><View style={{ width: `${growth.progress / 30 * 100}%`, height: 8, backgroundColor: C.green }} /></View><T kind="small">{pet.points} care points · {30 - growth.progress} to level {growth.level + 1}</T></Card>
        <View style={{ gap: 12 }}><T kind="sub">A little care from each of you</T><View style={{ flexDirection: 'row', gap: 9 }}>{CARE_ACTIONS.map(action => { const done = today.some(c => c.authorId === userId && c.action === action.id); return <View key={action.id} style={{ flex: 1, gap: 8 }}><Button title={done ? 'Done' : action.label} compact secondary icon={done ? Check : undefined} loading={busy && !done} disabled={busy || done || !space.featuresReady} onPress={() => { void run(() => carePet(action.id)); }} /><T kind="small" style={{ textAlign: 'center' }}>{action.emoji} {done ? 'Your care is saved' : '+5 care points'}</T></View>; })}</View><T kind="small">Each of you can feed, play, and tuck in once per day. Your shared day uses {space.timeZone.replace(/_/g, ' ')}.</T></View>
        <Card style={{ gap: 18 }}><T kind="sub">Today, from both of us</T>{space.profiles.map(person => <View key={person.id} style={[S.between, { flexWrap: 'wrap' }]}><T>{person.name}</T><View style={S.row}>{CARE_ACTIONS.map(action => { const done = today.some(c => c.authorId === person.id && c.action === action.id); return <View key={action.id} accessible accessibilityLabel={`${person.name}: ${action.label} ${done ? 'done' : 'not yet'}`} style={{ padding: 9, backgroundColor: done ? C.pale : C.bg, borderRadius: 13 }}><T style={{ opacity: done ? 1 : 0.4 }}>{action.emoji}{done ? ' ✓' : ''}</T></View>; })}</View></View>)}</Card>
        {renaming ? <Card style={{ gap: 12 }}><Field label="Their new name" value={name} onChangeText={setName} maxLength={24} /><View style={S.row}><Button title="Save name" compact loading={busy} disabled={!name.trim()} onPress={() => { void run(async () => { await renamePet(name); setRenaming(false); }); }} /><Button title="Cancel" compact secondary onPress={() => setRenaming(false)} /></View></Card> : <Button title="Change their name" icon={Pencil} secondary compact onPress={() => { setName(pet.name); setRenaming(true); }} />}
        <T kind="small" style={{ textAlign: 'center' }}>No lost progress or punishment for a missed day. Just a little friend waiting for you.</T>
      </>}
    </View>
  </Page>;
}
