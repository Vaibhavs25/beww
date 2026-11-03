import React, { useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ImagePlus, Send, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Button, C, Card, Chip, Field, FormPage, S, T } from '../components/ui';
import { usePeople, useSpace } from '../store';

export default function Compose() {
  const params = useLocalSearchParams<{ kind?: string; text?: string }>(); const { partner } = usePeople(); const { run, sendMoment, busy, demo } = useSpace();
  const [kind, setKind] = useState<'note' | 'photo'>(params.kind === 'photo' ? 'photo' : 'note'); const [text, setText] = useState(String(Array.isArray(params.text) ? params.text[0] ?? '' : params.text ?? '').slice(0, 500)); const [photo, setPhoto] = useState<string>();
  const pick = async (camera: boolean) => {
    if (camera && Platform.OS !== 'web') { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) throw new Error('Camera permission is needed to take a photo. You can choose one from your library instead.'); }
    const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (result.canceled) return;
    const image = ImageManipulator.manipulate(result.assets[0].uri); image.resize({ width: Math.min(result.assets[0].width, 1000) });
    const rendered = await image.renderAsync(); const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
    if (!saved.base64) throw new Error('Could not prepare this photo. Please try another one.');
    setPhoto(saved.base64);
  };
  return <FormPage title={`A little something for ${partner?.name ?? 'your person'}.`} subtitle="An ordinary moment can be their favorite part of the day."><View style={S.row}><Chip title="Love note" icon={Heart} selected={kind === 'note'} onPress={() => setKind('note')} /><Chip title="Photo" icon={Camera} selected={kind === 'photo'} onPress={() => setKind('photo')} /></View>{kind === 'photo' && <Card style={{ gap: 15 }}>{photo ? <Image accessibilityLabel="Photo preview" source={{ uri: `data:image/jpeg;base64,${photo}` }} style={{ width: '100%', height: 280, borderRadius: 14 }} /> : <View style={{ height: 170, borderRadius: 14, backgroundColor: C.pale, alignItems: 'center', justifyContent: 'center', gap: 13 }}><Camera size={38} color={C.green} strokeWidth={1.2} /><T kind="small">Your day, through your eyes.</T></View>}<View style={S.row}><Button title="Take a photo" icon={Camera} compact secondary style={S.flex} disabled={busy} onPress={() => { void run(() => pick(true)); }} /><Button title="Choose photo" icon={ImagePlus} compact secondary style={S.flex} disabled={busy} onPress={() => { void run(() => pick(false)); }} /></View></Card>}<Field label={kind === 'photo' ? 'Add a caption (optional)' : 'Your note'} multiline placeholder={kind === 'photo' ? 'Thought you’d like to see this…' : 'Just wanted you to know…'} value={text} onChangeText={setText} maxLength={500} /><T kind="small">{text.length}/500 · {demo ? 'Saved to this device in demo mode' : 'Shared with your partner'}</T><Button title={demo ? 'Add to our demo space' : 'Send to our space'} icon={Send} loading={busy} disabled={kind === 'photo' ? !photo : !text.trim()} onPress={() => { void run(async () => { await sendMoment(kind, text, photo); router.back(); }); }} /></FormPage>;
}
