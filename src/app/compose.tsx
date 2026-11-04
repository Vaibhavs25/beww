import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ImagePlus, Send, Heart } from 'lucide-react-native';
import { Button, C, Card, Chip, Field, FormPage, S, T } from '../components/ui';
import { pickAndOptimizeImage, type OptimizedImageUpload } from '../lib/image-cdn';
import { usePeople, useSpace } from '../store';

export default function Compose() {
  const params = useLocalSearchParams<{ kind?: string; text?: string }>();
  const { partner } = usePeople();
  const { run, sendMoment, busy } = useSpace();
  const [kind, setKind] = useState<'note' | 'photo'>(params.kind === 'photo' ? 'photo' : 'note');
  const [text, setText] = useState(
    String(Array.isArray(params.text) ? params.text[0] ?? '' : params.text ?? '').slice(0, 500)
  );
  const [photo, setPhoto] = useState<string>();
  const [photoMeta, setPhotoMeta] = useState<OptimizedImageUpload | null>(null);

  const pick = async (camera: boolean) => {
    const optimized = await pickAndOptimizeImage({ camera, preset: 'memory-lane' });
    if (!optimized) return;
    setPhoto(optimized.base64);
    setPhotoMeta(optimized);
  };

  return (
    <FormPage
      title={`A little something for ${partner?.name ?? 'your person'}.`}
      subtitle="An ordinary moment can be their favorite part of the day."
    >
      <View style={S.row}>
        <Chip title="Love note" icon={Heart} selected={kind === 'note'} onPress={() => setKind('note')} />
        <Chip title="Photo" icon={Camera} selected={kind === 'photo'} onPress={() => setKind('photo')} />
      </View>
      {kind === 'photo' && (
        <Card style={{ gap: 15 }}>
          {photo ? (
            <View style={{ gap: 8 }}>
              <Image
                accessibilityLabel="Photo preview"
                source={{ uri: `data:image/jpeg;base64,${photo}` }}
                style={{ width: '100%', height: 280, borderRadius: 14 }}
              />
              {photoMeta && (
                <T kind="small" style={{ fontSize: 11, color: C.green }}>
                  Optimized for Memory Lane CDN · {photoMeta.width}×{photoMeta.height}px · {photoMeta.sizeLabel}
                </T>
              )}
            </View>
          ) : (
            <View
              style={{
                height: 170,
                borderRadius: 14,
                backgroundColor: C.pale,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 13,
              }}
            >
              <Camera size={38} color={C.green} strokeWidth={1.2} />
              <T kind="small">Your day, through your eyes.</T>
            </View>
          )}
          <View style={S.row}>
            <Button
              title="Take a photo"
              icon={Camera}
              compact
              secondary
              style={S.flex}
              disabled={busy}
              onPress={() => {
                void run(() => pick(true));
              }}
            />
            <Button
              title="Choose photo"
              icon={ImagePlus}
              compact
              secondary
              style={S.flex}
              disabled={busy}
              onPress={() => {
                void run(() => pick(false));
              }}
            />
          </View>
        </Card>
      )}
      <Field
        label={kind === 'photo' ? 'Add a caption (optional)' : 'Your note'}
        multiline
        placeholder={kind === 'photo' ? 'Thought you’d like to see this…' : 'Just wanted you to know…'}
        value={text}
        onChangeText={setText}
        maxLength={500}
      />
      <T kind="small">{text.length}/500 · Shared with your partner</T>
      <Button
        title="Send to our space"
        icon={Send}
        loading={busy}
        disabled={kind === 'photo' ? !photo : !text.trim()}
        onPress={() => {
          void run(async () => {
            await sendMoment(kind, text, photo);
            router.back();
          });
        }}
      />
    </FormPage>
  );
}
