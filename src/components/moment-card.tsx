import React, { useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { Heart, Trash2, X, Sparkles } from 'lucide-react-native';
import { relativeTime, type Moment } from '../domain';
import { useSpace } from '../store';
import { Avatar, Button, C, Card, DrawingPreview, F, IconButton, S, T } from './ui';

export function MomentCard({ moment }: { moment: Moment }) {
  const { space, userId, run, heart, deleteMoment, busy } = useSpace(); const [confirmDelete, setConfirmDelete] = useState(false);
  const person = space.profiles.find(p => p.id === moment.authorId); const mine = userId === moment.authorId; const liked = moment.hearts.includes(userId);
  return <Card style={{ padding: 18, gap: 16 }}><View style={S.between}><View style={[S.row, { flex: 1, minWidth: 0 }]}><Avatar size={34} name={person?.name ?? '?'} color={mine ? C.rose : C.pale} /><View style={{ flex: 1, minWidth: 0 }}><T numberOfLines={2} style={{ fontSize: 13, fontFamily: F.medium }}>{person?.name ?? 'Your partner'}{mine ? ' · you' : ''}</T><T kind="small" style={{ fontSize: 10 }}>{relativeTime(moment.createdAt)}</T></View></View>{mine && <IconButton icon={Trash2} label="Delete moment" onPress={() => setConfirmDelete(true)} color={C.muted} />}</View>
    {moment.image && <Image accessibilityLabel={moment.text || 'A shared photo'} source={{ uri: moment.image }} style={{ width: '100%', height: 270, borderRadius: 14 }} resizeMode="cover" />}
    {moment.kind === 'drawing' && <DrawingPreview strokes={moment.drawing ?? []} />}
    {moment.kind === 'note' || moment.kind === 'hug' ? <View style={{ backgroundColor: moment.kind === 'hug' ? C.pale : C.yellow, borderRadius: 13, padding: 24, minHeight: 125, justifyContent: 'center', gap: 13 }}>{moment.kind === 'hug' && <Heart color={C.green} size={28} strokeWidth={1.2} />}<T style={{ fontFamily: F.italic, fontSize: 20, lineHeight: 30 }}>{moment.text}</T><Sparkles color="#9F9B6C" size={15} style={{ alignSelf: 'flex-end' }} /></View> : !!moment.text && <T>{moment.text}</T>}
    <View style={S.between}><T kind="small">A little piece of your story</T><Pressable accessibilityRole="button" accessibilityLabel={liked ? 'Remove heart' : 'Send a heart'} accessibilityState={{ selected: liked }} disabled={busy} onPress={() => { void run(() => heart(moment.id)); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, borderRadius: 20, backgroundColor: liked ? '#F5E6E5' : C.bg }}><Heart size={17} fill={liked ? '#B97479' : 'transparent'} color={liked ? '#B97479' : C.muted} strokeWidth={1.5} /><T kind="small">{moment.hearts.length || 'Love this'}</T></Pressable></View>
    <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}><View style={{ flex: 1, backgroundColor: '#172B2866', justifyContent: 'center', alignItems: 'center', padding: 25 }}><Card style={{ maxWidth: 400, width: '100%', gap: 18 }}><View style={S.between}><T kind="serif">Delete this moment?</T><IconButton icon={X} label="Cancel deletion" onPress={() => setConfirmDelete(false)} /></View><T>It will be removed from your shared story. Copies already saved elsewhere can’t be removed.</T><Button title="Delete moment" icon={Trash2} loading={busy} onPress={() => { void run(async () => { await deleteMoment(moment.id); setConfirmDelete(false); }); }} /><Button title="Keep it" secondary icon={Heart} onPress={() => setConfirmDelete(false)} /></Card></View></Modal>
  </Card>;
}
