import React, { useState } from 'react';
import { Share, View } from 'react-native';
import { router } from 'expo-router';
import { Check, Heart, Link2, Mail, Share2 } from 'lucide-react-native';
import { Button, C, Card, Chip, CoupleAvatars, Field, FormPage, S, T } from '../components/ui';
import { usePeople, useSpace } from '../store';
import { client, supabase } from '../lib/supabase';
import { cleanText } from '../domain';

export default function Connect() {
  const { session, space, demo, run, busy, refresh, notify } = useSpace(); const { me, partner } = usePeople();
  const [signUp, setSignUp] = useState(true); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [code, setCode] = useState(''); const [invite, setInvite] = useState<{ code: string; expires_at: string } | null>(null);
  const auth = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
    if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
    if (signUp) {
      const { data, error } = await client().auth.signUp({ email: email.trim(), password, options: { data: { display_name: cleanText(name, 30) } } });
      if (error) throw error;
      setPassword('');
      if (!data.session) { notify('Check your email to confirm your account, then sign in here.'); setSignUp(false); }
    } else { const { error } = await client().auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error; setPassword(''); }
  };
  const createInvite = async () => {
    const { data, error } = await client().rpc('create_invite', { relationship_mode: space.mode, shared_time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' });
    if (error) throw error; setInvite(data); await refresh();
  };
  const join = async () => { const { data, error } = await client().rpc('join_couple', { invite_code: code.trim().toUpperCase().replace(/\s/g, '') }); if (error) throw error; if (data?.error) throw new Error(data.error); await refresh(); notify('Your little world is ready'); router.replace('/'); };
  return <FormPage title="Just the two of you." subtitle="One invitation starts your own little world."><View style={{ alignItems: 'center', padding: 10 }}><CoupleAvatars names={demo ? ['?', '?'] : [me.name, partner?.name ?? '?']} size={72} /></View>{!supabase ? <Card style={{ gap: 18 }}><Link2 color={C.green} size={28} /><T kind="sub">Live sharing is coming next</T><T>This version is a working demo saved on this device. Your own accounts and phone-to-phone sharing will be available once the live service is connected.</T><Button title="Keep exploring our demo" onPress={() => router.replace('/')} /><T kind="small">Demo moments stay in the demo when you connect an account.</T></Card> : !session ? <Card style={{ gap: 18 }}><View style={S.wrap}><Chip title="Create account" selected={signUp} onPress={() => setSignUp(true)} /><Chip title="Sign in" selected={!signUp} onPress={() => setSignUp(false)} /></View>{signUp && <Field label="Your first name" value={name} onChangeText={setName} maxLength={30} autoComplete="given-name" />}<Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" /><Field label="Password · at least 8 characters" value={password} onChangeText={setPassword} secureTextEntry autoComplete={signUp ? 'new-password' : 'current-password'} /><Button title={signUp ? 'Create my account' : 'Sign in'} icon={Mail} loading={busy} disabled={!email || !password || (signUp && !name.trim())} onPress={() => { void run(auth); }} /><T kind="small">Each partner uses their own account. Your demo moments won’t be copied into your live space.</T></Card> : partner ? <Card style={{ alignItems: 'center', gap: 18 }}><Check color={C.green} size={35} /><T kind="serif">You found each other.</T><T>{me.name} & {partner.name} are connected.</T><Button title="Go to our space" icon={Heart} onPress={() => router.replace('/')} /></Card> : <View style={{ gap: 20 }}><Card style={{ gap: 18 }}><T kind="sub">Invite your partner</T><T kind="small">Your private code works once and expires after 10 minutes. Share it only with your partner.</T>{invite && <View style={{ backgroundColor: C.pale, borderRadius: 16, padding: 20, gap: 10 }}><T selectable kind="serif" style={{ textAlign: 'center', letterSpacing: 3 }}>{invite.code}</T><T kind="small" style={{ textAlign: 'center' }}>Expires {new Date(invite.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</T><Button title="Share invitation" secondary icon={Share2} onPress={() => { void run(async () => { await Share.share({ message: `Let’s make a little space for us on Closer. Enter ${invite.code} in Connect our phones. The code expires in 10 minutes.` }); }); }} /></View>}<Button title={invite ? 'Make a new code' : 'Create our invitation'} icon={Link2} loading={busy} onPress={() => { void run(createInvite); }} /></Card><Card style={{ gap: 18 }}><T kind="sub">Already have their code?</T><Field label="Partner’s invitation code" value={code} onChangeText={setCode} maxLength={12} autoCapitalize="characters" autoCorrect={false} placeholder="A1B2C3D4E5" /><Button title="Join my partner" loading={busy} disabled={code.trim().length !== 10} onPress={() => { void run(join); }} /></Card>{!!space.id && <T kind="small">Keep this screen open while your partner joins. Their name will appear when you’re connected.</T>}</View>}</FormPage>;
}

