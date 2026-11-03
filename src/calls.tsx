import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { client, supabase } from './lib/supabase';
import { rtc } from './lib/rtc';
import { usePeople, useSpace } from './store';
import { C, T } from './components/ui';

type Call = { id: string; caller_id: string; recipient_id: string; state: 'ringing' | 'accepted' | 'ended' | 'declined'; video: boolean; offer: RTCSessionDescriptionInit; answer: RTCSessionDescriptionInit | null; created_at: string };
type Phase = 'idle' | 'incoming' | 'preparing' | 'ringing' | 'connecting' | 'connected' | 'reconnecting' | 'ended';
type State = { phase: Phase; message: string; call: Call | null; local: MediaStream | null; remote: MediaStream | null; muted: boolean; cameraOff: boolean; seconds: number; start: (video: boolean) => Promise<void>; accept: () => Promise<void>; end: () => Promise<void>; toggleMic: () => void; toggleCamera: () => void };
const Context = createContext<State | null>(null);
const activePhases: Phase[] = ['incoming', 'preparing', 'ringing', 'connecting', 'connected', 'reconnecting'];

async function completeDescription(pc: RTCPeerConnection) {
  if (pc.iceGatheringState !== 'complete') await new Promise<void>((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); pc.removeEventListener('icegatheringstatechange', changed); pc.removeEventListener('connectionstatechange', closed); };
    const changed = () => { if (pc.iceGatheringState === 'complete') { cleanup(); resolve(); } };
    const closed = () => { if (pc.connectionState === 'closed') { cleanup(); reject(new Error('The call was cancelled.')); } };
    const timer = setTimeout(() => { cleanup(); resolve(); }, 12000);
    pc.addEventListener('icegatheringstatechange', changed); pc.addEventListener('connectionstatechange', closed); changed();
  });
  if (!pc.localDescription) throw new Error('Could not prepare the call. Try again.');
  return { type: pc.localDescription.type, sdp: pc.localDescription.sdp };
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { space, userId, demo, notify } = useSpace(); const { partner } = usePeople();
  const [phase, setPhase] = useState<Phase>('idle'); const [message, setMessage] = useState(''); const [call, setCall] = useState<Call | null>(null);
  const [local, setLocal] = useState<MediaStream | null>(null); const [remote, setRemote] = useState<MediaStream | null>(null); const [muted, setMuted] = useState(false); const [cameraOff, setCameraOff] = useState(false); const [seconds, setSeconds] = useState(0);
  const peer = useRef<RTCPeerConnection | null>(null); const stream = useRef<MediaStream | null>(null); const current = useRef<Call | null>(null); const preparing = useRef(false); const generation = useRef(0); const applyingAnswer = useRef(false); const connectedAt = useRef(0);
  const cleanup = useCallback(() => {
    generation.current++; preparing.current = false; applyingAnswer.current = false;
    const old = peer.current; peer.current = null; old?.close(); stream.current?.getTracks().forEach(track => track.stop()); stream.current = null;
    setLocal(null); setRemote(null); setMuted(false); setCameraOff(false); connectedAt.current = 0;
  }, []);
  const end = useCallback(async () => {
    const id = current.current?.id; const decline = current.current?.recipient_id === userId && current.current?.state === 'ringing';
    cleanup(); setPhase('ended'); setMessage(decline ? 'Maybe another moment.' : 'Until the next hello.'); current.current = null; setCall(null);
    if (id && supabase) { const { error } = await supabase.rpc('end_call', { call_id: id, decline }); if (error) throw error; }
  }, [cleanup, userId]);
  const endRef = useRef(end); useEffect(() => { endRef.current = end; }, [end]);
  const receive = useCallback(async (next: Call) => {
    if (current.current && next.id !== current.current.id) return;
    if (next.state === 'ended' || next.state === 'declined') {
      if (current.current?.id === next.id) { cleanup(); current.current = null; setCall(null); setPhase('ended'); setMessage(next.state === 'declined' ? 'They can’t talk right now. Send a little note?' : 'Until the next hello.'); }
      return;
    }
    if (next.state === 'ringing' && Date.now() - Date.parse(next.created_at) > 90000) { if (current.current?.id === next.id) await endRef.current(); return; }
    if (!current.current) {
      if (next.caller_id === userId || next.state === 'accepted') {
        // A reload cannot resume a WebRTC connection. Release the abandoned call.
        if (!preparing.current && !peer.current) await supabase?.rpc('end_call', { call_id: next.id, decline: false });
        return;
      }
      current.current = next; setCall(next); setPhase('incoming'); setMessage('Your person is calling.');
      return;
    }
    current.current = next; setCall(next);
    if (next.caller_id === userId && next.answer && peer.current && !peer.current.remoteDescription && !applyingAnswer.current) {
      const pc = peer.current; const version = generation.current;
      applyingAnswer.current = true; setPhase('connecting');
      try { await pc.setRemoteDescription(next.answer); }
      catch { if (version === generation.current) { await endRef.current().catch(() => undefined); setMessage('The call couldn’t connect. Please try again.'); } }
      finally { if (version === generation.current) applyingAnswer.current = false; }
    }
  }, [cleanup, userId]);
  const partnerId = partner?.id;
  useEffect(() => {
    if (demo || !space.id || !partnerId || !supabase) return;
    let active = true; let refreshing = false;
    const refresh = async () => {
      if (refreshing) return; refreshing = true;
      try { let query = supabase!.from('calls').select('*').eq('couple_id', space.id); if (current.current) query = query.eq('id', current.current.id); const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle(); if (error) throw error; if (active && data) await receive(data); }
      catch { if (active && current.current) notify('Call signaling is reconnecting.'); }
      finally { refreshing = false; }
    };
    const channel = supabase.channel(`calls-${space.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'calls', filter: `couple_id=eq.${space.id}` }, () => { void refresh(); }).subscribe(status => { if (status === 'SUBSCRIBED') void refresh(); });
    void refresh(); const timer = setInterval(() => { void refresh(); }, 5000);
    return () => { active = false; clearInterval(timer); void supabase!.removeChannel(channel); };
  }, [demo, space.id, partnerId, receive, notify]);
  useEffect(() => () => { cleanup(); current.current = null; setCall(null); setPhase('idle'); }, [cleanup, userId, space.id]);
  useEffect(() => {
    if (!activePhases.includes(phase)) return;
    const timer = setInterval(() => {
      if (connectedAt.current) setSeconds(Math.floor((Date.now() - connectedAt.current) / 1000));
      if (current.current?.state === 'ringing' && Date.now() - Date.parse(current.current.created_at) > 90000) { void endRef.current().catch(() => undefined); setMessage('No answer this time. Try a note instead?'); }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'connecting' && phase !== 'reconnecting') return;
    const timer = setTimeout(() => { void endRef.current().catch(() => undefined); setMessage('The network couldn’t connect this call. Please try again.'); }, 30000);
    return () => clearTimeout(timer);
  }, [phase]);

  const prepare = async (video: boolean) => {
    const api = rtc(); const version = generation.current; const media = await api.getMedia(video);
    if (version !== generation.current) { media.getTracks().forEach(track => track.stop()); throw new Error('The call was cancelled.'); }
    stream.current = media; setLocal(media);
    const { data, error } = await client().functions.invoke('call-ice');
    if (error || !Array.isArray(data?.iceServers)) throw new Error('The calling service is not ready yet. Please try again later.');
    if (version !== generation.current) throw new Error('The call was cancelled.');
    const pc = api.createPeer(data.iceServers); peer.current = pc;
    media.getTracks().forEach(track => pc.addTrack(track, media));
    pc.addEventListener('track', event => { if (peer.current === pc && event.streams?.[0]) setRemote(event.streams[0]); });
    pc.addEventListener('connectionstatechange', () => {
      if (peer.current !== pc) return;
      if (pc.connectionState === 'connected') { setPhase('connected'); if (!connectedAt.current) { connectedAt.current = Date.now(); setSeconds(0); } }
      else if (pc.connectionState === 'disconnected') setPhase('reconnecting');
      else if (pc.connectionState === 'failed') { void endRef.current().catch(() => undefined); setMessage('The network couldn’t connect this call. Please try again.'); }
    });
    return pc;
  };
  const start = async (video: boolean) => {
    if (demo || !partner || !space.id) throw new Error('Connect both accounts before calling your partner.');
    if (preparing.current || peer.current || current.current) return;
    const version = generation.current;
    preparing.current = true; setPhase('preparing'); setMessage(''); setSeconds(0);
    try {
      const pc = await prepare(video); await pc.setLocalDescription(await pc.createOffer()); const offer = await completeDescription(pc);
      if (peer.current !== pc) throw new Error('The call was cancelled.');
      const { data, error } = await client().rpc('start_call', { is_video: video, session_offer: offer }); if (error) throw error;
      if (peer.current !== pc) { await client().rpc('end_call', { call_id: data.id, decline: false }); return; }
      current.current = data; setCall(data); setPhase('ringing');
    } catch (error) { if (version === generation.current) { cleanup(); setPhase('ended'); setMessage('The call didn’t start.'); } throw error; }
    finally { if (version === generation.current) preparing.current = false; }
  };
  const accept = async () => {
    const incoming = current.current; if (!incoming || incoming.recipient_id !== userId || preparing.current) return;
    const version = generation.current;
    preparing.current = true; setPhase('preparing');
    try {
      const pc = await prepare(incoming.video); await pc.setRemoteDescription(incoming.offer); await pc.setLocalDescription(await pc.createAnswer()); const answer = await completeDescription(pc);
      if (peer.current !== pc) throw new Error('The call was cancelled.');
      const { error } = await client().rpc('answer_call', { call_id: incoming.id, session_answer: answer }); if (error) throw error;
      if (peer.current !== pc || current.current?.id !== incoming.id) { await client().rpc('end_call', { call_id: incoming.id, decline: false }); return; }
      current.current = { ...incoming, state: 'accepted', answer }; setCall(current.current); setPhase(pc.connectionState === 'connected' ? 'connected' : 'connecting');
    } catch (error) { if (version === generation.current) { await endRef.current().catch(() => undefined); setMessage('The call couldn’t connect.'); } throw error; }
    finally { if (version === generation.current) preparing.current = false; }
  };
  const toggleMic = () => { stream.current?.getAudioTracks().forEach(track => { track.enabled = muted; }); setMuted(value => !value); };
  const toggleCamera = () => { stream.current?.getVideoTracks().forEach(track => { track.enabled = cameraOff; }); setCameraOff(value => !value); };
  return <Context.Provider value={{ phase, message, call, local, remote, muted, cameraOff, seconds, start, accept, end, toggleMic, toggleCamera }}>{children}</Context.Provider>;
}

export function useCall() { const ctx = useContext(Context); if (!ctx) throw new Error('CallProvider is missing'); return ctx; }
export function CallBanner() {
  const { phase } = useCall(); const path = usePathname(); const { partner } = usePeople();
  if (path === '/call' || !activePhases.includes(phase)) return null;
  return <View style={{ position: 'absolute', top: 8, left: 16, right: 16, alignItems: 'center', zIndex: 90 }} pointerEvents="box-none"><Pressable accessibilityRole="button" accessibilityLabel="Open active call" onPress={() => router.push('/call')} style={{ backgroundColor: C.green, borderRadius: 24, paddingHorizontal: 22, paddingVertical: 13, flexDirection: 'row', gap: 12, alignItems: 'center' }}><Phone size={17} color="#fff" /><T style={{ color: '#fff', fontSize: 13 }}>{phase === 'incoming' ? `${partner?.name ?? 'Your partner'} is calling` : 'Back to our call'}</T></Pressable></View>;
}
