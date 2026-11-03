import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { cleanText, createDemo, makeId, validDate, dropPiece, newGame, sharedDay, QUIZ, type MoodId, type Space, type Moment, type Plan, type Stroke, type PetKind, type CareAction } from './domain';
import { client, messageFrom, planFrom, readMessages, readSpace, supabase, writePhoto } from './lib/supabase';
import { adoptPet as newPet, careForPet, mergeMessages, reconcileMessages, validatePlan, type PlanDraft } from './shared-features';

const STORAGE_KEY = 'closer.demo.v2';
function blankSpace(): Space { return { ...createDemo(), id: '', startedOn: '', profiles: [], moments: [], plans: [], answers: [], canvas: [], games: [], quizzes: [], messages: [], pet: null, petCare: [], featuresReady: false }; }
type Connection = 'demo' | 'connecting' | 'live' | 'offline';
type State = {
  space: Space; userId: string; demo: boolean; ready: boolean; busy: boolean; error: string; toast: string; connection: Connection; session: Session | null;
  dismissError: () => void; notify: (text: string) => void; run: (fn: () => Promise<void>) => Promise<boolean>;
  setMood: (mood: MoodId, note: string, need: string) => Promise<void>;
  sendMoment: (kind: Moment['kind'], text: string, photo?: string) => Promise<void>;
  heart: (id: string) => Promise<void>; deleteMoment: (id: string) => Promise<void>;
  savePlan: (draft: PlanDraft, original?: Plan) => Promise<void>; togglePlan: (id: string) => Promise<void>; respondPlan: (plan: Plan, going: boolean) => Promise<void>;
  sendMessage: (text: string, id: string) => Promise<void>; loadEarlierMessages: () => Promise<void>;
  adoptPet: (name: string, kind: PetKind) => Promise<void>; carePet: (action: CareAction) => Promise<void>; renamePet: (name: string) => Promise<void>;
  answer: (text: string) => Promise<void>; updateProfile: (name: string, start: string) => Promise<void>;
  switchPartner: () => void; resetDemo: () => Promise<void>; refresh: () => Promise<void>; signOut: () => Promise<void>;
  onboarded: boolean; setup: (mode: Space['mode'], name: string, partnerName: string) => Promise<void>;
  setMode: (mode: Space['mode']) => Promise<void>; addStroke: (stroke: Stroke) => Promise<void>; undoStroke: () => Promise<void>; saveCanvas: (title: string) => Promise<void>;
  startGame: () => Promise<void>; playMove: (id: string, column: number) => Promise<void>; submitQuiz: (choices: number[]) => Promise<void>;
};
const Context = createContext<State | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [liveSpace, setLiveSpace] = useState<{ owner: string | null; space: Space }>(() => ({ owner: null, space: blankSpace() }));
  const [demoSpace, setDemoSpace] = useState<Space>(createDemo);
  const [demoUser, setDemoUser] = useState('alex');
  const [session, setSession] = useState<Session | null>(null);
  const [identityVersion, setIdentityVersion] = useState(0);
  const identity = useRef<string | null>(null);
  const identityEpoch = useRef(0);
  const realtimeConnected = useRef(false);
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [connection, setConnection] = useState<Connection>('demo');
  const demo = !session;
  const userId = session?.user.id ?? demoUser;
  const sessionId = session?.user.id ?? null;
  const space = liveSpace.owner === sessionId ? liveSpace.space : blankSpace();
  const refreshVersion = useRef(0);
  const setSpace = useCallback((change: (previous: Space) => Space) => {
    if (!sessionId || identity.current !== sessionId || identityEpoch.current !== identityVersion) return;
    // A completed mutation must not be overwritten by an older in-flight snapshot.
    refreshVersion.current++;
    setLiveSpace(previous => previous.owner === sessionId ? { owner: sessionId, space: change(previous.space) } : previous);
  }, [sessionId, identityVersion]);
  const refresh = useCallback(async () => {
    if (!sessionId || identityEpoch.current !== identityVersion) return;
    const version = ++refreshVersion.current;
    try {
      const loaded = await readSpace(sessionId);
      const next = loaded.id ? loaded : { ...loaded, mode: demoSpace.mode };
      if (version !== refreshVersion.current || identityEpoch.current !== identityVersion) return;
      setLiveSpace(previous => ({ owner: sessionId, space: previous.owner === sessionId && previous.space.id === next.id ? { ...next, ...reconcileMessages(previous.space, next) } : next }));
      if (realtimeConnected.current) setConnection('live');
    }
    catch (e) { if (version === refreshVersion.current) { setConnection('offline'); setError(e instanceof Error ? e.message : 'Could not refresh your space.'); } }
  }, [sessionId, identityVersion, demoSpace.mode]);

  useEffect(() => {
    let active = true; let authEventReceived = false;
    const receiveSession = (nextSession: Session | null) => {
      if (!active) return;
      const nextId = nextSession?.user.id ?? null;
      if (identity.current !== nextId) {
        identity.current = nextId; identityEpoch.current++; refreshVersion.current++;
        realtimeConnected.current = false;
        setIdentityVersion(identityEpoch.current);
        setLiveSpace({ owner: nextId, space: blankSpace() }); setError(''); setToast('');
        setConnection(nextSession ? 'connecting' : 'demo');
      }
      setSession(nextSession);
      if (nextSession) setOnboarded(true);
    };
    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => { authEventReceived = true; receiveSession(nextSession); });
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && active) {
          const parsed = JSON.parse(saved);
          if (parsed.space?.id === 'demo' && parsed.space.profiles?.length === 2 && Array.isArray(parsed.space.moments) && Array.isArray(parsed.space.plans) && Array.isArray(parsed.space.answers)) {
            setDemoSpace({ ...createDemo(), ...parsed.space }); setDemoUser(parsed.userId === 'jamie' ? 'jamie' : 'alex'); setOnboarded(Boolean(parsed.onboarded) || identity.current !== null);
          }
        }
      } catch { if (active) setError('Could not restore your demo changes.'); }
      try {
        if (supabase) { const result = await supabase.auth.getSession(); if (result.error) throw result.error; if (!authEventReceived) receiveSession(result.data.session); }
      } catch { if (active) setError('Could not restore your last session. You can still explore the demo.'); }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; subscription?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (demo) return;
    let active = true; let scheduled: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => { if (!scheduled) scheduled = setTimeout(() => { scheduled = undefined; if (active) void refresh(); }, 150); };
    // refresh() awaits the database before setting state; it is an external subscription load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const channel = supabase!.channel(`space-${sessionId}`);
    for (const table of ['profiles', 'couple_members', 'couples', 'moments', 'reactions', 'plans', 'daily_answers', 'canvas_strokes', 'games', 'quiz_answers', 'chat_messages', 'pets', 'pet_care']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh);
    }
    channel.subscribe(status => {
      if (!active) return;
      realtimeConnected.current = status === 'SUBSCRIBED';
      if (status === 'SUBSCRIBED') { setConnection('live'); void refresh(); }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setConnection('offline');
    });
    const timer = setInterval(() => { void refresh(); }, 60000);
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') { supabase!.auth.startAutoRefresh(); void refresh(); }
      else if (Platform.OS !== 'web') supabase!.auth.stopAutoRefresh();
    });
    return () => { active = false; realtimeConnected.current = false; clearTimeout(scheduled); void supabase!.removeChannel(channel); clearInterval(timer); listener.remove(); };
  }, [ready, demo, sessionId, refresh]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ space: demoSpace, userId: demoUser, onboarded })).catch(() => setError('This device could not save your demo changes. Try a smaller photo or remove older demo moments.'));
  }, [demoSpace, demoUser, ready, onboarded]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);

  const current = demo ? demoSpace : space;
  const requirePair = () => { if (!current.id || current.profiles.length < 2) throw new Error('Connect your partner in Our space before sharing.'); };
  const requireFeatures = () => { requirePair(); if (!current.featuresReady) throw new Error('These new features aren’t available in your live space yet. Please try again later.'); };
  const mutateDemo = (change: (space: Space) => Space) => setDemoSpace(change);
  const checked = async (operation: PromiseLike<{ error: { message: string } | null }>) => { const { error: apiError } = await operation; if (apiError) throw new Error(apiError.message); };
  const run = async (fn: () => Promise<void>) => {
    if (busyRef.current) return false;
    busyRef.current = true; setBusy(true); setError('');
    try { await fn(); return identityVersion === identityEpoch.current; } catch (e) { if (identityVersion === identityEpoch.current) setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); return false; }
    finally { busyRef.current = false; setBusy(false); }
  };
  const setMood = async (mood: MoodId, note: string, need: string) => {
    if (note.length > 200) throw new Error('Keep your mood note under 200 characters.');
    if (demo) mutateDemo(s => ({ ...s, profiles: s.profiles.map(p => p.id === userId ? { ...p, mood, moodNote: note.trim(), need, moodAt: new Date().toISOString() } : p) }));
    else { await checked(client().from('profiles').update({ mood, mood_note: note.trim(), need, mood_updated_at: new Date().toISOString() }).eq('id', userId)); await refresh(); }
    setToast(demo ? 'Mood updated in your demo space' : 'Your mood is shared');
  };
  const sendMoment = async (kind: Moment['kind'], text: string, photo?: string) => {
    requirePair();
    const body = kind === 'photo' ? text.trim().slice(0, 500) : cleanText(text);
    if (kind === 'photo' && !photo) throw new Error('Choose a photo first.');
    if (photo && photo.length > 7 * 1024 * 1024) throw new Error('This photo is too large. Try another one.');
    if (demo) mutateDemo(s => ({ ...s, moments: [{ id: makeId(), authorId: userId, kind, text: body, image: photo ? `data:image/jpeg;base64,${photo}` : undefined, createdAt: new Date().toISOString(), hearts: [] }, ...s.moments] }));
    else {
      if (kind === 'photo') await writePhoto(current.id, userId, photo!, body);
      else await checked(client().from('moments').insert({ couple_id: current.id, author_id: userId, kind, body }));
      await refresh();
    }
    setToast(demo ? 'Added to your demo space' : 'Sent to your shared space');
  };
  const heart = async (id: string) => {
    const item = current.moments.find(m => m.id === id); if (!item) return;
    const active = item.hearts.includes(userId);
    if (demo) mutateDemo(s => ({ ...s, moments: s.moments.map(m => m.id === id ? { ...m, hearts: active ? m.hearts.filter(h => h !== userId) : [...m.hearts, userId] } : m) }));
    else {
      if (active) await checked(client().from('reactions').delete().eq('moment_id', id).eq('user_id', userId));
      else await checked(client().from('reactions').insert({ moment_id: id, user_id: userId, couple_id: current.id }));
      await refresh();
    }
  };
  const deleteMoment = async (id: string) => {
    const item = current.moments.find(m => m.id === id && m.authorId === userId); if (!item) throw new Error('You can only delete your own moments.');
    if (demo) mutateDemo(s => ({ ...s, moments: s.moments.filter(m => m.id !== id) }));
    else {
      // Remove the photo first; never leave an inaccessible private upload behind.
      if (item.storagePath) await checked(client().storage.from('couple-photos').remove([item.storagePath]));
      await checked(client().from('moments').delete().eq('id', id).eq('author_id', userId)); await refresh();
    }
    setToast('Moment deleted');
  };
  const savePlan = async (input: PlanDraft, original?: Plan) => {
    requireFeatures(); const draft = validatePlan(input, sharedDay(current.timeZone));
    if (demo) {
      if (original && current.plans.find(p => p.id === original.id)?.revision !== original.revision) throw new Error('This plan changed. Open it again to edit.');
      const plan: Plan = { ...draft, id: original?.id ?? makeId(), authorId: original?.authorId ?? userId, done: false, revision: (original?.revision ?? 0) + 1, acceptedBy: draft.kind === 'date' ? [userId] : [] };
      mutateDemo(s => ({ ...s, plans: original ? s.plans.map(p => p.id === plan.id ? plan : p) : [plan, ...s.plans] }));
    } else { const { data, error: apiError } = await client().rpc('save_plan', { plan_id: original?.id ?? null, draft, expected_revision: original?.revision ?? null }); if (apiError) throw apiError; const plan = planFrom(data); setSpace(s => ({ ...s, plans: [plan, ...s.plans.filter(p => p.id !== plan.id)] })); }
    setToast(draft.kind === 'date' ? 'Your date is proposed. Your partner can confirm.' : 'Added to your someday list');
  };
  const respondPlan = async (plan: Plan, going: boolean) => {
    requireFeatures();
    if (demo) mutateDemo(s => ({ ...s, plans: s.plans.map(p => p.id === plan.id ? { ...p, acceptedBy: [...(p.acceptedBy ?? []).filter(id => id !== userId), ...(going ? [userId] : [])] } : p) }));
    else { const { data, error: apiError } = await client().rpc('respond_to_plan', { plan_id: plan.id, going, expected_revision: plan.revision ?? 1 }); if (apiError) throw apiError; setSpace(s => ({ ...s, plans: s.plans.map(p => p.id === plan.id ? planFrom(data) : p) })); }
    setToast(going ? 'A date to look forward to ♡' : 'Your response is updated');
  };
  const togglePlan = async (id: string) => {
    const plan = current.plans.find(p => p.id === id); if (!plan) return;
    if (demo) mutateDemo(s => ({ ...s, plans: s.plans.map(p => p.id === id ? { ...p, done: !p.done } : p) }));
    else {
      const result = await client().from('plans').update({ done: !plan.done }).eq('id', id).eq('revision', plan.revision ?? 1).select('id').maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) { await refresh(); throw new Error('This plan changed. Review it before marking it complete.'); }
      await refresh();
    }
  };
  const answer = async (text: string) => {
    requirePair(); const body = cleanText(text); const day = sharedDay(current.timeZone);
    if (current.answers.some(a => a.day === day && a.authorId === userId)) throw new Error('You’ve already answered today. Come back tomorrow for a new question.');
    if (demo) mutateDemo(s => ({ ...s, answers: [...s.answers, { id: makeId(), authorId: userId, day, text: body }] }));
    else { await checked(client().from('daily_answers').insert({ couple_id: current.id, author_id: userId, day, body })); await refresh(); }
    setToast('A little more understood');
  };
  const updateProfile = async (name: string, start: string) => {
    const cleaned = cleanText(name, 30);
    if (start && (!validDate(start) || start > sharedDay(current.timeZone))) throw new Error('Choose a valid date in the past or today in your shared time zone.');
    if (demo) mutateDemo(s => ({ ...s, startedOn: start || s.startedOn, profiles: s.profiles.map(p => p.id === userId ? { ...p, name: cleaned } : p) }));
    else {
      await checked(client().from('profiles').update({ display_name: cleaned }).eq('id', userId));
      if (current.id && start) await checked(client().from('couples').update({ started_on: start }).eq('id', current.id));
      await refresh();
    }
    setToast('Your space, a little more you');
  };
  const switchPartner = () => { if (demo) { setDemoUser(id => id === 'alex' ? 'jamie' : 'alex'); setToast('You’re now seeing the other side of your demo'); } };
  const resetDemo = async () => { const next = createDemo(); setDemoSpace(next); setDemoUser('alex'); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ space: next, userId: 'alex', onboarded: true })); setToast('Demo reset'); };
  const signOut = async () => { await checked(client().auth.signOut({ scope: 'local' })); };
  const setup = async (mode: Space['mode'], name: string, partnerName: string) => {
    if (!demo) { await setMode(mode); setOnboarded(true); return; }
    const myName = cleanText(name || 'Alex', 30); const theirName = cleanText(partnerName || 'Jamie', 30);
    const next = { ...demoSpace, mode, profiles: demoSpace.profiles.map(p => ({ ...p, name: p.id === demoUser ? myName : theirName })) };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ space: next, userId: demoUser, onboarded: true }));
    setDemoSpace(next); setOnboarded(true);
  };
  const setMode = async (mode: Space['mode']) => {
    if (demo) mutateDemo(s => ({ ...s, mode }));
    else if (!current.id) { mutateDemo(s => ({ ...s, mode })); setSpace(s => ({ ...s, mode })); }
    else { await checked(client().from('couples').update({ mode }).eq('id', current.id)); await refresh(); }
  };
  const addStroke = async (stroke: Stroke) => {
    if (stroke.authorId !== userId || stroke.points.length < 1 || stroke.points.length > 3000) throw new Error('Could not save this stroke.');
    if (current.canvas.length >= 500) throw new Error('This canvas has 500 strokes. Save it to your story before starting fresh.');
    if (demo) mutateDemo(s => ({ ...s, canvas: [...s.canvas.filter(x => x.id !== stroke.id), stroke] }));
    else { requirePair(); await checked(client().from('canvas_strokes').upsert({ id: stroke.id, couple_id: current.id, author_id: userId, stroke }, { onConflict: 'id' })); await refresh(); }
  };
  const undoStroke = async () => {
    const stroke = [...current.canvas].reverse().find(s => s.authorId === userId); if (!stroke) return;
    if (demo) mutateDemo(s => ({ ...s, canvas: s.canvas.filter(x => x.id !== stroke.id) }));
    else { await checked(client().from('canvas_strokes').delete().eq('id', stroke.id).eq('author_id', userId)); await refresh(); }
  };
  const saveCanvas = async (title: string) => {
    if (!current.canvas.length) throw new Error('Make a little mark first.');
    const text = cleanText(title || 'A little piece of us', 120);
    if (demo) mutateDemo(s => ({ ...s, moments: [{ id: makeId(), authorId: userId, kind: 'drawing', text, drawing: [...s.canvas], createdAt: new Date().toISOString(), hearts: [] }, ...s.moments] }));
    else { requirePair(); await checked(client().from('moments').insert({ couple_id: current.id, author_id: userId, kind: 'drawing', body: text, drawing: current.canvas })); await refresh(); }
    setToast('Drawing saved to your story');
  };
  const startGame = async () => {
    requirePair();
    if (current.games.some(g => g.status === 'playing')) return;
    if (demo) mutateDemo(s => ({ ...s, games: [newGame(s.profiles.map(p => p.id)), ...s.games] }));
    else { await checked(client().rpc('start_game')); await refresh(); }
  };
  const playMove = async (id: string, column: number) => {
    const game = current.games.find(g => g.id === id); if (!game) throw new Error('Start a game first.');
    if (demo) { const next = dropPiece(game, column, game.turn); mutateDemo(s => ({ ...s, games: s.games.map(g => g.id === id ? next : g) })); }
    else { await checked(client().rpc('play_move', { game_id: id, col: column })); await refresh(); }
  };
  const submitQuiz = async (choices: number[]) => {
    requirePair(); const day = sharedDay(current.timeZone);
    if (choices.length !== QUIZ.length || choices.some(x => x !== 0 && x !== 1)) throw new Error('Choose one answer for every question.');
    if (current.quizzes.some(q => q.authorId === userId && q.day === day)) throw new Error('Your choices are already saved for today.');
    if (demo) mutateDemo(s => ({ ...s, quizzes: [...s.quizzes, { authorId: userId, day, choices }] }));
    else { await checked(client().from('quiz_answers').insert({ couple_id: current.id, author_id: userId, day, choices })); await refresh(); }
    setToast('Your choices are saved');
  };

  const sendMessage = async (text: string, id: string) => {
    requireFeatures(); const body = cleanText(text, 2000);
    if (demo) mutateDemo(s => ({ ...s, messages: mergeMessages(s.messages, [{ id, authorId: userId, text: body, createdAt: s.messages.find(m => m.id === id)?.createdAt ?? new Date().toISOString() }]) }));
    else { const { data, error: apiError } = await client().rpc('send_chat_message', { message_id: id, message_body: body }); if (apiError) throw apiError; setSpace(s => ({ ...s, messages: mergeMessages(s.messages, [messageFrom(data)]) })); }
  };
  const loadEarlierMessages = async () => {
    if (demo || !current.hasOlderMessages || !current.messages.length) return;
    const cid = current.id; const messages = await readMessages(cid, current.messages[0]);
    setSpace(s => s.id === cid ? { ...s, messages: mergeMessages(messages, s.messages), hasOlderMessages: messages.length === 100 } : s);
  };
  const adoptPet = async (name: string, kind: PetKind) => {
    requireFeatures(); if (current.pet) throw new Error('You’ve already adopted your shared pet.');
    const pet = newPet(name, kind);
    if (demo) mutateDemo(s => ({ ...s, pet, petCare: [] }));
    else { await checked(client().rpc('adopt_pet', { pet_name: pet.name, pet_kind: kind })); await refresh(); }
    setToast(`Welcome to your little world, ${pet.name}!`);
  };
  const carePet = async (action: CareAction) => {
    requireFeatures(); if (!current.pet) throw new Error('Adopt a pet together first.');
    const next = careForPet(current.pet, current.petCare, userId, action, sharedDay(current.timeZone));
    if (demo) mutateDemo(s => ({ ...s, pet: next.pet, petCare: next.care }));
    else { await checked(client().rpc('care_for_pet', { care_action: action })); await refresh(); }
    setToast(`${current.pet.name} feels a little more loved ♡`);
  };
  const renamePet = async (name: string) => {
    requireFeatures(); const clean = cleanText(name, 24);
    if (!current.pet) throw new Error('Adopt a pet together first.');
    if (demo) mutateDemo(s => ({ ...s, pet: s.pet ? { ...s.pet, name: clean } : null }));
    else { await checked(client().rpc('rename_pet', { pet_name: clean })); await refresh(); }
    setToast('A lovely name for your little friend');
  };

  return <Context.Provider value={{ space: current, userId, demo, ready, busy, error, toast, connection, session, onboarded, setup, setMode, addStroke, undoStroke, saveCanvas, startGame, playMove, submitQuiz, dismissError: () => setError(''), notify: setToast, run, setMood, sendMoment, heart, deleteMoment, savePlan, togglePlan, respondPlan, sendMessage, loadEarlierMessages, adoptPet, carePet, renamePet, answer, updateProfile, switchPartner, resetDemo, refresh, signOut }}>{children}</Context.Provider>;
}
export function useSpace() { const value = useContext(Context); if (!value) throw new Error('SpaceProvider is missing'); return value; }
export function usePeople() {
  const { space, userId } = useSpace();
  const me = space.profiles.find(p => p.id === userId) ?? { id: userId, name: 'You', mood: 'calm' as const, moodNote: '', need: '', moodAt: new Date().toISOString() };
  return { me, partner: space.profiles.find(p => p.id !== userId) };
}
