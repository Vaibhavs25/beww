export function rtc() {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) throw new Error('Calls need a browser with microphone access on HTTPS or localhost.');
  return {
    createPeer: (iceServers: RTCIceServer[]) => new RTCPeerConnection({ iceServers }),
    getMedia: (video: boolean) => navigator.mediaDevices.getUserMedia({ audio: true, video: video ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false }),
  };
}
