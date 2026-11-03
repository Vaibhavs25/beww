import React, { useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Plane, Heart, ArrowRight, Check } from 'lucide-react-native';

import { Brand, Bloom, Button, C, F, Field, S, T } from '../components/ui';
import { useSpace } from '../store';

export default function Welcome() {
  const { width } = useWindowDimensions(); const wide = width > 850;
  const { setup, run, busy } = useSpace(); const [mode, setMode] = useState<'nearby' | 'distance'>('distance'); const [name, setName] = useState(''); const [partnerName, setPartnerName] = useState('');
  return <View style={{ flex: 1, backgroundColor: C.bg }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: wide ? 50 : 25, maxWidth: 1180, alignSelf: 'center', width: '100%', justifyContent: 'center' }}><Brand /><View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 80 : 30, alignItems: 'center', marginTop: wide ? 50 : 30 }}>
    <View style={{ flex: 1, width: '100%', gap: 23 }}><T kind="label" style={{ color: C.green }}>FOR ALL YOUR LITTLE MOMENTS</T><T kind="title" style={{ fontSize: wide ? 58 : 43, lineHeight: wide ? 69 : 54 }}>A little world.{ '\n' }Just for two.</T><T style={{ color: C.muted, maxWidth: 400, fontSize: 17, lineHeight: 27 }}>Share your day. Make a little art. Get wonderfully competitive. Feel closer, wherever life finds you.</T>{wide && <View style={{ backgroundColor: C.pale, borderRadius: 150, alignItems: 'center', width: 310, height: 250, marginTop: 12 }}><Bloom size={245} /></View>}<View style={S.row}><Heart size={16} color={C.green} /><T kind="small">A private space for your everyday kind of love.</T></View></View>
    <View style={[S.card, { flex: 1, width: '100%', maxWidth: 470, padding: wide ? 32 : 23, gap: 23 }]}><View style={{ gap: 7 }}><T kind="serif">Let’s make it yours.</T><T kind="small">Are you usually nearby or long-distance?</T></View>
      <View style={{ gap: 10 }}>{([{ id: 'nearby' as const, icon: MapPin, title: 'Close by', desc: 'Same city, same couch, still so much to share.' }, { id: 'distance' as const, icon: Plane, title: 'Miles apart', desc: 'A little less distance. A lot more together.' }]).map(({ id, icon: Icon, title, desc }) => <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: mode === id }} onPress={() => setMode(id)} style={{ borderRadius: 16, borderWidth: 1.5, borderColor: mode === id ? C.green : C.line, backgroundColor: mode === id ? C.pale : C.paper, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Icon size={24} color={C.green} strokeWidth={1.4} /><View style={{ flex: 1 }}><T style={{ fontFamily: F.medium }}>{title}</T><T kind="small">{desc}</T></View>{mode === id && <Check size={17} color={C.green} />}</Pressable>)}</View>
      <View style={S.row}><View style={S.flex}><Field label="Your name (optional)" placeholder="Alex" value={name} onChangeText={setName} maxLength={30} autoComplete="name" /></View><View style={S.flex}><Field label="Their name (optional)" placeholder="Jamie" value={partnerName} onChangeText={setPartnerName} maxLength={30} /></View></View>
      <Button title="Explore our little world" icon={ArrowRight} loading={busy} onPress={() => { void run(async () => { await setup(mode, name, partnerName); router.replace('/'); }); }} />
      <T kind="small" style={{ textAlign: 'center' }}>Start with a demo on this device. Connect real accounts in Us when you’re ready. You can change your distance setting anytime.</T>
    </View></View><T kind="small" style={{ marginTop: 40, textAlign: 'center', letterSpacing: 1 }}>MADE FOR CONNECTION. ROOM FOR EVERY KIND OF DAY.</T></ScrollView></View>;
}

