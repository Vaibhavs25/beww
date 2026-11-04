import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Heart, Phone, Send } from 'lucide-react-native';
import { Avatar, Button, C, Empty, F, IconButton, S, T } from '../../components/ui';
import { FeatureNotice } from '../../components/feature-notice';
import { usePeople, useSpace } from '../../store';
import type { ChatMessage } from '../../domain';

export default function Chat() {
  const { userId, space } = useSpace();
  return <Conversation key={`${space.id}:${userId}`} />;
}
function Conversation() {
  const { space, userId, sendMessage, loadEarlierMessages, busy, run } = useSpace();
  const { partner } = usePeople(); const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(''); const [failed, setFailed] = useState(false);
  const attempt = useRef<{ id: string; body: string } | null>(null);
  const list = useRef<FlatList<ChatMessage>>(null);
  const send = async () => {
    const body = draft.trim(); if (!body || busy) return;
    if (attempt.current?.body !== body) attempt.current = { id: Crypto.randomUUID(), body };
    const id = attempt.current.id;
    const sent = await run(() => sendMessage(body, id));
    if (sent) { setDraft(''); setFailed(false); attempt.current = null; list.current?.scrollToOffset({ offset: 0, animated: true }); }
    else setFailed(true);
  };
  return <KeyboardAvoidingView style={{ flex: 1, minHeight: 0 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled={Platform.OS !== 'web'} keyboardVerticalOffset={67 + insets.top}>
    <View style={{ flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center', minHeight: 0 }}>
      <View style={[S.between, { padding: 20, borderBottomWidth: 1, borderColor: C.line }]}><View style={[S.row, { flex: 1, minWidth: 0 }]}><Avatar name={partner?.name ?? '?'} color={C.pale} size={44} /><View style={{ flex: 1, minWidth: 0 }}><T numberOfLines={2} kind="sub">{partner?.name ?? 'Your person'}</T><T kind="small">A little space to talk</T></View></View><IconButton icon={Phone} label="Call from chat" onPress={() => router.push('/call')} /></View>
      {!space.featuresReady && <View style={{ padding: 18 }}><FeatureNotice /></View>}
      <FlatList ref={list} inverted data={[...space.messages].reverse()} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 14, flexGrow: 1 }} maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListEmptyComponent={<Empty title="It starts with a little hello." text="Share a thought, make a plan, or just say you miss them." icon={Heart} />}
        ListFooterComponent={space.hasOlderMessages ? <Button title="Earlier messages" secondary compact loading={busy} onPress={() => { void run(loadEarlierMessages); }} /> : <T kind="small" style={{ textAlign: 'center', paddingVertical: 14 }}>Your conversation, just the two of you.</T>}
        renderItem={({ item }) => { const mine = item.authorId === userId; return <View style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}><View style={{ maxWidth: '88%', minWidth: 115, backgroundColor: mine ? C.green : C.paper, borderWidth: mine ? 0 : 1, borderColor: C.line, borderRadius: 20, borderBottomRightRadius: mine ? 5 : 20, borderBottomLeftRadius: mine ? 20 : 5, paddingHorizontal: 17, paddingVertical: 13 }}><T selectable style={{ color: mine ? '#FFFFFF' : C.ink }}>{item.text}</T><T kind="small" style={{ color: mine ? '#F5D5E2' : C.muted, fontSize: 10, textAlign: 'right', marginTop: 5 }}>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</T></View></View>; }} />
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: C.paper, borderTopWidth: 1, borderColor: C.line, gap: 7 }}>
        {failed && <T kind="small" style={{ color: '#8D4C60' }}>Your message hasn’t been confirmed. It’s still here to retry.</T>}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}><TextInput accessibilityLabel="Message your partner" value={draft} onChangeText={setDraft} placeholder="A little hello…" placeholderTextColor={C.muted} multiline maxLength={2000} editable={!busy && space.featuresReady} style={{ flex: 1, fontFamily: F.body, color: C.ink, fontSize: 15, lineHeight: 22, backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 13, minHeight: 49, maxHeight: 130 }} /><Button title={failed ? 'Retry' : 'Send'} icon={Send} compact loading={busy} disabled={!draft.trim() || !space.featuresReady} onPress={() => { void send(); }} /></View>
        <T kind="small" style={{ fontSize: 10 }}>{draft.length}/2000 · Private messages between the two of you</T>
      </View>
    </View>
  </KeyboardAvoidingView>;
}

