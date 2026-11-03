import { NativeModules } from 'react-native';

// Loaded only when a call is started, so Expo Go can still explore the demo.
export function rtc() {
  if (!NativeModules.WebRTCModule) throw new Error('Calls need the Closer development build. This preview can still be used for photos, games, and drawing.');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const native = require('react-native-webrtc') as typeof import('react-native-webrtc');
  return {
    createPeer: (iceServers: RTCIceServer[]) => new native.RTCPeerConnection({ iceServers }) as unknown as RTCPeerConnection,
    getMedia: (video: boolean) => native.mediaDevices.getUserMedia({ audio: true, video: video ? { facingMode: 'user', width: 640, height: 480 } : false }) as unknown as Promise<MediaStream>,
  };
}
