import React from 'react';
import { View } from 'react-native';

export function CallVideo({ stream, local = false }: { stream: MediaStream | null; local?: boolean }) {
  if (!stream) return <View />;
  // A stream only exists after rtc() has verified the native module is available.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RTCView } = require('react-native-webrtc') as typeof import('react-native-webrtc');
  const streamURL = (stream as unknown as { toURL: () => string }).toURL();
  return <RTCView streamURL={streamURL} mirror={local} objectFit="cover" zOrder={local ? 1 : 0} style={{ width: '100%', height: '100%' }} />;
}
