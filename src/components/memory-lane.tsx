import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Camera, Heart, Plus, X } from 'lucide-react-native';
import type { Moment } from '../domain';
import { recentPhotos } from '../dashboard';
import { readMemoryPhotos } from '../lib/supabase';
import { useSpace } from '../store';
import { Button, C, F, IconButton, S, T } from './ui';

export function MemoryLane({ now }: { now: number }) {
  const { space, demo, userId } = useSpace();
  const photos = recentPhotos(demo ? space.moments : space.memoryPhotos, now);
  // Remove any private photo pages or open image when the account/feed changes.
  return <PhotoStrip key={`${userId}:${space.id}:${photos.map(photo => photo.id).join(',')}`} photos={photos} now={now} />;
}

function PhotoStrip({ photos, now }: { photos: Moment[]; now: number }) {
  const { space, demo, run, busy } = useSpace(); const { width } = useWindowDimensions(); const insets = useSafeAreaInsets();
  const [extra, setExtra] = useState<Moment[]>([]); const [more, setMore] = useState(space.hasMoreMemories);
  const [selectedId, setSelected] = useState<string | null>(null);
  const alive = useRef(true); const list = useRef<FlatList<Moment>>(null); const scrollX = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const all = recentPhotos([...photos, ...extra], now); const selected = all.find(photo => photo.id === selectedId);
  const author = (photo: Moment) => space.profiles.find(person => person.id === photo.authorId)?.name ?? 'Your partner';
  const date = (photo: Moment) => new Date(photo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: space.timeZone });
  const add = () => router.push({ pathname: '/compose', params: { kind: 'photo' } });
  const loadMore = () => { void run(async () => {
    const cursor = all.at(-1); if (!cursor || demo) return;
    const page = await readMemoryPhotos(space.id, cursor);
    if (!alive.current) return;
    setExtra(previous => [...new Map([...previous, ...page.photos].map(photo => [photo.id, photo])).values()]); setMore(page.hasMore);
  }); };
  return <View testID="memory-lane" style={{ gap: 12, minWidth: 0 }}>
    <View style={S.between}><View style={{ flex: 1 }}><T kind="serif" style={{ fontSize: 28 }}>Memory lane</T><T kind="small">The last 30 days, little by little.</T></View><IconButton icon={Plus} label="Add a photo to Memory Lane" onPress={add} background={C.rose} color={C.green} /></View>
    {all.length ? <>
      <FlatList ref={list} horizontal data={all} keyExtractor={photo => photo.id} showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 5, paddingTop: 15, paddingBottom: 14, gap: 17 }}
        onScroll={event => { scrollX.current = event.nativeEvent.contentOffset.x; }} scrollEventThrottle={100}
        initialNumToRender={5} windowSize={3}
        getItemLayout={(_data, index) => ({ length: 205, offset: 205 * index, index })}
        renderItem={({ item, index }) => <Pressable accessibilityRole="button" accessibilityLabel={`Open photo: ${item.text || 'A shared moment'}, ${date(item)}, from ${author(item)}`} onPress={() => setSelected(item.id)} style={({ pressed }) => ({ width: 188, padding: 9, paddingBottom: 13, borderWidth: 1, borderColor: '#E6DCD8', backgroundColor: '#FFFEFA', borderRadius: 3, transform: [{ rotate: `${index % 2 ? 1.5 : -1.5}deg` }], opacity: pressed ? 0.7 : 1 })}>
          <View style={{ position: 'absolute', top: -7, width: 50, height: 17, backgroundColor: index % 2 ? '#C9B6DEAA' : '#E8B2BD99', zIndex: 1, alignSelf: 'center', transform: [{ rotate: '4deg' }] }} />
          <PhotoImage key={item.image} photo={item} height={155} />
          <T numberOfLines={1} style={{ fontFamily: F.italic, fontSize: 14, marginTop: 10 }}>{item.text || 'A little piece of us'}</T>
          <T kind="small" numberOfLines={1} style={{ fontSize: 10 }}>{date(item)} · {author(item)}</T>
        </Pressable>}
        ListFooterComponent={more && !demo ? <View style={{ width: 160, justifyContent: 'center', height: 222 }}><Button title="More memories" compact secondary loading={busy} onPress={loadMore} /></View> : null}
      />
      <View style={S.between}><T kind="small" style={{ fontSize: 11 }}>A few ordinary moments. All ours.</T><View style={{ flexDirection: 'row' }}><IconButton icon={ArrowLeft} label="Previous memories" onPress={() => list.current?.scrollToOffset({ offset: Math.max(0, scrollX.current - 205), animated: true })} /><IconButton icon={ArrowRight} label="Next memories" onPress={() => list.current?.scrollToOffset({ offset: scrollX.current + 205, animated: true })} /></View></View>
    </> : <View style={{ borderWidth: 1, borderColor: '#E5D8D6', borderStyle: 'dashed', borderRadius: 5, padding: 24, paddingVertical: 28, alignItems: 'center', gap: 16, backgroundColor: '#FBF1ED' }}>
      <View style={{ width: 113, height: 85, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 72, height: 80, backgroundColor: '#DED0EC', borderWidth: 5, borderColor: '#FFFEFA', transform: [{ rotate: '-13deg' }], left: 7, top: 0 }} />
        <View style={{ width: 72, height: 80, backgroundColor: '#F2D4DD', borderWidth: 5, borderBottomWidth: 18, borderColor: '#FFFEFA', transform: [{ rotate: '8deg' }], marginLeft: 30, alignItems: 'center', justifyContent: 'center' }}><Heart size={28} color={C.green} strokeWidth={1.2} /></View>
      </View>
      <View style={{ gap: 5 }}><T style={{ fontFamily: F.italic, fontSize: 20, textAlign: 'center' }}>This month is still a blank page.</T><T kind="small" style={{ textAlign: 'center', maxWidth: 280 }}>Your coffee, the sunset, that silly face. Save a little of today for the two of you.</T></View>
      <Button title="Add our first photo" compact icon={Camera} onPress={add} />
    </View>}
    <Modal visible={!!selected} animationType="fade" transparent onRequestClose={() => setSelected(null)}>
      <View accessibilityViewIsModal style={{ flex: 1, backgroundColor: '#261C29F5', paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20, paddingHorizontal: 20 }}>
        <View style={[S.between, { width: '100%', maxWidth: 1000, alignSelf: 'center' }]}><T kind="serif" style={{ color: '#FFF9F4' }}>A little piece of us</T><IconButton icon={X} label="Close photo" onPress={() => setSelected(null)} color="#FFF9F4" /></View>
        {selected && <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 20 }}>
          <View style={{ width: '100%', maxWidth: 850 }}><PhotoImage key={`${selected.id}:${selected.image}`} photo={selected} height={Math.min(560, width * 0.9)} contain /></View>
          <T style={{ fontFamily: F.italic, fontSize: 21, color: '#FFF9F4', maxWidth: 650, textAlign: 'center' }}>{selected.text || 'A little piece of us'}</T>
          <T kind="small" style={{ color: '#D9C9D9' }}>Shared by {author(selected)} · {date(selected)}</T>
        </ScrollView>}
      </View>
    </Modal>
  </View>;
}

function PhotoImage({ photo, height, contain = false }: { photo: Moment; height: number; contain?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ height, backgroundColor: contain ? 'transparent' : '#EDE4EE', alignItems: 'center', justifyContent: 'center' }}>
    {photo.image && !failed ? <Image source={{ uri: photo.image }} accessibilityLabel={photo.text || 'A shared photo'} resizeMode={contain ? 'contain' : 'cover'} onError={() => setFailed(true)} style={{ width: '100%', height: '100%' }} /> : <View style={{ alignItems: 'center', gap: 10, padding: 15 }}><Camera size={24} color={contain ? '#D9C9D9' : C.lavender} /><T kind="small" style={{ textAlign: 'center', color: contain ? '#D9C9D9' : C.muted }}>Photo unavailable. Reopen the app to try again.</T></View>}
  </View>;
}
