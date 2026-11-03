import React, { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { useCall } from '../calls';
import { C, T } from './ui';

// Keep audio mounted at the root so drawing or playing never removes playback.
export function CallAudio() {
  const { remote } = useCall();
  const ref = useRef<HTMLAudioElement>(null);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    element.srcObject = remote;
    setBlocked(false);
    if (remote) void element.play().catch(() => { if (active) setBlocked(true); });
    return () => { active = false; element.pause(); element.srcObject = null; };
  }, [remote]);
  const play = async () => {
    try { await ref.current?.play(); setBlocked(false); } catch { setBlocked(true); }
  };
  return <><audio ref={ref} autoPlay aria-label="Your partner’s audio" style={{ display: 'none' }} />{blocked && remote && <Pressable accessibilityRole="button" accessibilityLabel="Enable call audio" onPress={() => { void play(); }} style={{ position: 'absolute', bottom: 90, alignSelf: 'center', zIndex: 100, backgroundColor: C.green, borderRadius: 18, padding: 18 }}><T style={{ color: '#FFFFFF' }}>Tap to hear your partner</T></Pressable>}</>;
}
