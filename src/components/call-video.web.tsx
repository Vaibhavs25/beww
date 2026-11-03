import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { T } from './ui';

export function CallVideo({ stream, local = false }: { stream: MediaStream | null; local?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null); const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.srcObject = stream; setBlocked(false);
    let active = true;
    if (stream) void el.play().catch(() => { if (active) setBlocked(true); });
    return () => { active = false; el.srcObject = null; };
  }, [stream]);
  return <View style={{ width: '100%', height: '100%' }}><video ref={ref} autoPlay playsInline muted aria-label={local ? 'Your camera' : 'Your partner’s call'} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: local ? 'scaleX(-1)' : undefined }} />{blocked && <Pressable accessibilityRole="button" onPress={() => { void ref.current?.play().then(() => setBlocked(false)).catch(() => setBlocked(true)); }} style={{ position: 'absolute', bottom: 16, alignSelf: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12 }}><T>Tap to show video</T></Pressable>}</View>;
}
