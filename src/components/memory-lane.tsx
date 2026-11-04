import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Camera, Heart, X } from 'lucide-react-native';
import { recentPhotoMoments, relativeTime, type Moment } from '../domain';
import { getCdnImageUri, prefetchDashboardImages } from '../lib/image-cdn';
import { useSpace } from '../store';
import { useNow } from '../use-now';
import { Avatar, Button, C, Card, F, IconButton, S, SectionTitle, T } from './ui';

export function MemoryLane() {
  const { space, userId, run, heart, busy } = useSpace();
  const now = useNow();
  const photos = recentPhotoMoments(space.moments, now, 30);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activePhoto: Moment | undefined = photos.find(p => p.id === selectedId);
  const authorFor = (authorId: string) => space.profiles.find(p => p.id === authorId)?.name ?? 'Your partner';

  useEffect(() => {
    prefetchDashboardImages(
      photos.map(p => p.image),
      'card'
    );
  }, [photos]);

  return (
    <View style={{ gap: 4 }}>
      <SectionTitle
        title="Memory Lane"
        link="Add photo"
        onPress={() => router.push('/compose?kind=photo')}
      />
      <T kind="small" style={{ marginTop: -10, marginBottom: 10 }}>
        Shared snapshots from your last 30 days together ({photos.length} {photos.length === 1 ? 'photo' : 'photos'})
      </T>

      {photos.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 26, backgroundColor: C.paper }}>
          <Camera size={26} color={C.muted} strokeWidth={1.4} />
          <T kind="sub" style={{ textAlign: 'center' }}>
            Your 30-day film strip is waiting
          </T>
          <T kind="small" style={{ textAlign: 'center', maxWidth: 300 }}>
            Snapshots you share with each other over the past month gather here for a quick look back.
          </T>
          <Button
            compact
            secondary
            title="Share a snapshot"
            icon={Camera}
            onPress={() => router.push('/compose?kind=photo')}
          />
        </Card>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingVertical: 4, paddingRight: 8 }}
        >
          {photos.map(item => {
            const author = authorFor(item.authorId);
            const liked = item.hearts.includes(userId);
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                style={({ pressed }) => ({
                  width: 205,
                  backgroundColor: C.paper,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: C.line,
                  padding: 10,
                  paddingBottom: 14,
                  gap: 10,
                  opacity: pressed ? 0.82 : 1,
                })}
              >
                <View style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: C.pale }}>
                  <Image
                    accessibilityLabel={item.text || `Photo shared by ${author}`}
                    source={{ uri: getCdnImageUri(item.image, 'card', { width: 410, height: 284, quality: 75 }) }}
                    style={{ width: '100%', height: 142 }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ gap: 4, paddingHorizontal: 2 }}>
                  <T numberOfLines={2} style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 20, minHeight: 40 }}>
                    {item.text || 'A quiet snapshot from our day.'}
                  </T>
                  <View style={[S.between, { marginTop: 2 }]}>
                    <T numberOfLines={1} kind="small" style={{ fontSize: 11, flex: 1 }}>
                      {author} · {relativeTime(item.createdAt)}
                    </T>
                    <View style={[S.row, { gap: 4 }]}>
                      <Heart
                        size={13}
                        color={liked ? C.green : C.muted}
                        fill={liked ? C.green : 'transparent'}
                        strokeWidth={1.6}
                      />
                      {item.hearts.length > 0 && (
                        <T kind="small" style={{ fontSize: 11, color: liked ? C.green : C.muted }}>
                          {item.hearts.length}
                        </T>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={Boolean(activePhoto)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#1E151299',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 22,
          }}
        >
          {activePhoto && (
            <Card style={{ maxWidth: 460, width: '100%', gap: 16, padding: 18 }}>
              <View style={S.between}>
                <View style={[S.row, { flex: 1, minWidth: 0 }]}>
                  <Avatar name={authorFor(activePhoto.authorId)} size={34} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 14 }}>
                      {authorFor(activePhoto.authorId)}
                    </T>
                    <T kind="small" style={{ fontSize: 11 }}>
                      {relativeTime(activePhoto.createdAt)} · Memory Lane
                    </T>
                  </View>
                </View>
                <IconButton icon={X} label="Close photo" onPress={() => setSelectedId(null)} />
              </View>

              <View style={{ backgroundColor: '#FAF5EE', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: C.line }}>
                <Image
                  accessibilityLabel={activePhoto.text || 'Shared photo'}
                  source={{ uri: getCdnImageUri(activePhoto.image, 'full', { width: 960, quality: 85 }) }}
                  style={{ width: '100%', height: 280, borderRadius: 10 }}
                  resizeMode="cover"
                />
              </View>

              {Boolean(activePhoto.text) && (
                <T style={{ fontFamily: F.serif, fontSize: 18, lineHeight: 27 }}>
                  “{activePhoto.text}”
                </T>
              )}

              <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
                <Button
                  compact
                  secondary
                  title={activePhoto.hearts.includes(userId) ? `Held close (${activePhoto.hearts.length})` : 'Hold close'}
                  icon={Heart}
                  disabled={busy}
                  onPress={() => {
                    void run(() => heart(activePhoto.id));
                  }}
                />
                <Button
                  compact
                  title="Open Our story"
                  onPress={() => {
                    setSelectedId(null);
                    router.push('/story');
                  }}
                />
              </View>
            </Card>
          )}
        </View>
      </Modal>
    </View>
  );
}
