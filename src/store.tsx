import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { answerTriviaQuestion, buildPartnerAlertForJournal, buildPartnerAlertForQuickNote, cleanText, clearCompletedErrands, createAdventureGoal, createDemo, createErrandItem, createJournalEntry, createQuickNote, createTriviaQuestion, dateKey, DEFAULT_PARTNER_ALERT_PREFS, diffNewPartnerActivities, generateSixDigitInviteCode, generateUniqueConnectionCode, isValidConnectionCode, makeId, normalizeConnectionCode, validDate, dropPiece, newGame, removeErrandItem, removeQuickNote, sharedDay, toggleAdventureArchived, toggleAdventureCompleted, toggleErrandItem, toggleJournalHeart, toggleQuickNoteHeart, toggleQuickNotePin, updateQuickNoteCaption, upsertMoodLog, QUIZ, type AdventureCategory, type AdventureGoal, type CoupleOriginStory, type ErrandCategory, type ErrandItem, type JournalEntry, type JournalTag, type MoodId, type MoodLog, type PartnerAlertKind, type PartnerAlertPreferences, type PartnerNotificationItem, type Space, type Moment, type Plan, type Stroke, type PetKind, type CareAction, type TriviaQuestion, type QuickNote, type QuickNoteColor } from './domain';
import { client, generateSupabaseInvitationCode, messageFrom, planFrom, readMessages, readSpace, supabase, verifyAndLinkSupabaseAccounts, writePhoto } from './lib/supabase';
import { configureExpoNotificationHandler, dispatchPartnerNotification, getNotificationPermissionStatus, requestNotificationPermissions, type NotificationPermissionState } from './notifications';
import { addBreadcrumb, captureException, setMonitoringUser } from './monitoring';
import { hapticError, hapticHeart, hapticInstantPic, hapticQuickNote, hapticSelection, hapticSuccess, hapticTaskToggle, hapticWarning, hydrateHapticsPreference } from './haptics';
import { adoptPet as newPet, careForPet, mergeMessages, reconcileMessages, validatePlan, type PlanDraft } from './shared-features';

const STORAGE_KEY = 'closer.demo.v2';
const ONBOARDING_STORAGE_KEY = 'closer.onboardedSpace.v1';
const NOTIFICATION_PREFS_KEY = 'closer.notificationPrefs.v1';
const NOTIFICATIONS_LIST_KEY = 'closer.notifications.v1';
function blankSpace(): Space { return { ...createDemo(), id: '', startedOn: '', profiles: [], moodLogs: [], adventures: [], journal: [], trivia: [], quickNotes: [], errands: [], moments: [], plans: [], answers: [], canvas: [], games: [], quizzes: [], messages: [], pet: null, petCare: [], featuresReady: false }; }
type Connection = 'demo' | 'connecting' | 'live' | 'offline';
type State = {
  space: Space; userId: string; demo: boolean; ready: boolean; busy: boolean; error: string; toast: string; connection: Connection; session: Session | null;
  dismissError: () => void; notify: (text: string) => void; run: (fn: () => Promise<void>) => Promise<boolean>;
  setMood: (mood: MoodId, note: string, need: string) => Promise<void>;
  sendMoment: (kind: Moment['kind'], text: string, photo?: string) => Promise<void>;
  heart: (id: string) => Promise<void>; deleteMoment: (id: string) => Promise<void>;
  savePlan: (draft: PlanDraft, original?: Plan) => Promise<void>; togglePlan: (id: string) => Promise<void>; respondPlan: (plan: Plan, going: boolean) => Promise<void>;
  addAdventure: (title: string, category: AdventureCategory, notes?: string) => Promise<void>; toggleAdventure: (id: string) => Promise<void>; archiveAdventure: (id: string) => Promise<void>;
  addJournalEntry: (body: string, title?: string, tag?: JournalTag) => Promise<void>; heartJournalEntry: (id: string) => Promise<void>;
  addTriviaQuestion: (prompt: string, options: [string, string, string], correctIndex: number) => Promise<void>; guessTriviaQuestion: (questionId: string, choiceIndex: number) => Promise<void>;
  addQuickNote: (text: string, color?: QuickNoteColor, image?: string) => Promise<void>;
  updateQuickNoteText: (id: string, text: string) => Promise<void>;
  heartQuickNote: (id: string) => Promise<void>;
  pinQuickNote: (id: string) => Promise<void>;
  deleteQuickNote: (id: string) => Promise<void>;
  addErrand: (title: string, category?: ErrandCategory, assigneeId?: string) => Promise<void>;
  toggleErrand: (id: string) => Promise<void>;
  deleteErrand: (id: string) => Promise<void>;
  clearDoneErrands: () => Promise<void>;
  notifications: PartnerNotificationItem[];
  notificationPrefs: PartnerAlertPreferences;
  notificationPermission: NotificationPermissionState;
  enableNotifications: () => Promise<NotificationPermissionState>;
  updateNotificationPrefs: (patch: Partial<PartnerAlertPreferences>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  triggerPartnerAlertPreview: (kind: PartnerAlertKind) => Promise<void>;
  sendMessage: (text: string, id: string) => Promise<void>; loadEarlierMessages: () => Promise<void>;
  adoptPet: (name: string, kind: PetKind) => Promise<void>; carePet: (action: CareAction) => Promise<void>; renamePet: (name: string) => Promise<void>;
  answer: (text: string, displayedDay: string) => Promise<void>; updateProfile: (name: string, start: string) => Promise<void>;
  switchPartner: () => void; resetDemo: () => Promise<void>; refresh: () => Promise<void>; signOut: () => Promise<void>;
  onboarded: boolean;
  setup: (mode: Space['mode'], name: string, partnerName: string) => Promise<void>;
  completeOnboarding: (mode: Space['mode'], originStory: CoupleOriginStory) => Promise<void>;
  updateOriginStory: (patch: Partial<CoupleOriginStory>) => Promise<void>;
  generateConnectionCode: () => Promise<string>;
  redeemConnectionCode: (code: string, partnerNameOverride?: string) => Promise<void>;
  setMode: (mode: Space['mode']) => Promise<void>; addStroke: (stroke: Stroke) => Promise<void>; undoStroke: () => Promise<void>; clearCanvas: () => Promise<void>; saveCanvas: (title: string) => Promise<void>;
  startGame: () => Promise<void>; playMove: (id: string, column: number) => Promise<void>; submitQuiz: (choices: number[], displayedDay: string) => Promise<void>;
};
const Context = createContext<State | null>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [liveSpace, setLiveSpace] = useState<{ owner: string | null; space: Space }>(() => ({ owner: null, space: blankSpace() }));
  const [demoSpace, setDemoSpace] = useState<Space>(blankSpace);
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
  const [connection, setConnection] = useState<Connection>('connecting');
  const [notifications, setNotifications] = useState<PartnerNotificationItem[]>([]);
  const [notificationOwner, setNotificationOwner] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState<PartnerAlertPreferences>(DEFAULT_PARTNER_ALERT_PREFS);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>('undetermined');
  const notificationPrefsRef = useRef<PartnerAlertPreferences>(DEFAULT_PARTNER_ALERT_PREFS);
  useEffect(() => {
    notificationPrefsRef.current = notificationPrefs;
  }, [notificationPrefs]);
  const recordAndDispatchAlerts = useCallback((incoming: PartnerNotificationItem[]) => {
    if (!incoming.length) return;
    const owner = identity.current ?? 'local';
    setNotificationOwner(owner);
    setNotifications(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const fresh = incoming.filter(item => !existingIds.has(item.id));
      if (!fresh.length) return prev;
      for (const alert of fresh) {
        void dispatchPartnerNotification(alert, notificationPrefsRef.current);
      }
      const merged = [...fresh, ...prev].slice(0, 40);
      void AsyncStorage.setItem(`${NOTIFICATIONS_LIST_KEY}.${owner}`, JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  }, []);
  const demo = false;
  const sessionId = session?.user.id ?? null;
  const userId = session?.user.id ?? (demoSpace.profiles[0]?.id || 'me');
  const space = sessionId ? (liveSpace.owner === sessionId ? liveSpace.space : blankSpace()) : demoSpace;
  useEffect(() => {
    if (!ready) return;
    let active = true; const owner = sessionId ?? 'local';
    void AsyncStorage.getItem(`${NOTIFICATIONS_LIST_KEY}.${owner}`).then(raw => {
      if (!active) return;
      let saved: PartnerNotificationItem[] = [];
      try { const parsed = raw ? JSON.parse(raw) : []; if (Array.isArray(parsed)) saved = parsed; } catch {}
      setNotifications(saved); setNotificationOwner(owner);
    });
    return () => { active = false; };
  }, [ready, sessionId]);
  const refreshVersion = useRef(0);
  const setSpace = useCallback((change: (previous: Space) => Space) => {
    if (!sessionId) {
      setDemoSpace(previous => {
        const updated = change(previous);
        void AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ space: updated, onboarded: true })).catch(() => {});
        return updated;
      });
      return;
    }
    if (identity.current !== sessionId || identityEpoch.current !== identityVersion) return;
    // A completed mutation must not be overwritten by an older in-flight snapshot.
    refreshVersion.current++;
    setLiveSpace(previous => previous.owner === sessionId ? { owner: sessionId, space: change(previous.space) } : previous);
  }, [sessionId, identityVersion]);
  const refresh = useCallback(async () => {
    if (!sessionId || identityEpoch.current !== identityVersion) return;
    const version = ++refreshVersion.current;
    try {
      const loaded = await readSpace(sessionId);
      let storedLogs: MoodLog[] = [];
      let storedAdventures: AdventureGoal[] = [];
      let storedJournal: JournalEntry[] = [];
      let storedTrivia: TriviaQuestion[] = [];
      let storedQuickNotes: QuickNote[] = [];
      let storedErrands: ErrandItem[] = [];
      let storedOrigin: CoupleOriginStory | undefined = demoSpace.originStory;
      if (loaded.id) {
        try {
          storedLogs = loaded.moodLogs ?? [];
          const rawAdv = await AsyncStorage.getItem(`closer.adventures.${loaded.id}`);
          if (rawAdv) { const parsedAdv = JSON.parse(rawAdv); if (Array.isArray(parsedAdv)) storedAdventures = parsedAdv; }
          const rawJournal = await AsyncStorage.getItem(`closer.journal.${loaded.id}`);
          if (rawJournal) { const parsedJournal = JSON.parse(rawJournal); if (Array.isArray(parsedJournal)) storedJournal = parsedJournal; }
          const rawTrivia = await AsyncStorage.getItem(`closer.trivia.${loaded.id}`);
          if (rawTrivia) { const parsedTrivia = JSON.parse(rawTrivia); if (Array.isArray(parsedTrivia)) storedTrivia = parsedTrivia; }
          const rawQuickNotes = await AsyncStorage.getItem(`closer.quickNotes.${loaded.id}`);
          if (rawQuickNotes) { const parsedQN = JSON.parse(rawQuickNotes); if (Array.isArray(parsedQN)) storedQuickNotes = parsedQN; }
          const rawErrands = await AsyncStorage.getItem(`closer.errands.${loaded.id}`);
          if (rawErrands) { const parsedErr = JSON.parse(rawErrands); if (Array.isArray(parsedErr)) storedErrands = parsedErr; }
          const rawOrigin = await AsyncStorage.getItem(`closer.originStory.${loaded.id}`);
          if (rawOrigin) { const parsedOrigin = JSON.parse(rawOrigin); if (parsedOrigin && typeof parsedOrigin === 'object') storedOrigin = parsedOrigin; }
        } catch {}
      }
      const enrichedProfiles = loaded.profiles.map(p => {
        if (!storedOrigin) return p;
        if (p.id === sessionId) return { ...p, gender: storedOrigin.myGender, avatar: storedOrigin.myAvatar };
        return { ...p, nickname: storedOrigin.partnerNickname, gender: storedOrigin.partnerGender, avatar: storedOrigin.partnerAvatar };
      });
      const next = loaded.id
        ? { ...loaded, profiles: enrichedProfiles, originStory: storedOrigin, moodLogs: storedLogs, adventures: storedAdventures, journal: storedJournal, trivia: storedTrivia, quickNotes: storedQuickNotes, errands: storedErrands }
        : { ...loaded, mode: demoSpace.mode, originStory: storedOrigin, moodLogs: [], adventures: [], journal: [], trivia: [], quickNotes: [], errands: [] };
      if (version !== refreshVersion.current || identityEpoch.current !== identityVersion) return;
      setLiveSpace(previous => {
        if (previous.owner === sessionId && previous.space.id === next.id) {
          const mergedSpace: Space = {
            ...next,
            ...reconcileMessages(previous.space, next),
            originStory: next.originStory ?? previous.space.originStory,
            moodLogs: next.moodLogs?.length ? next.moodLogs : previous.space.moodLogs,
            adventures: next.adventures?.length ? next.adventures : previous.space.adventures,
            journal: next.journal?.length ? next.journal : previous.space.journal,
            trivia: next.trivia?.length ? next.trivia : previous.space.trivia,
            quickNotes: next.quickNotes?.length ? next.quickNotes : previous.space.quickNotes,
            errands: next.errands?.length ? next.errands : previous.space.errands,
          };
          const newPartnerAlerts = diffNewPartnerActivities(previous.space, mergedSpace, sessionId);
          if (newPartnerAlerts.length > 0) {
            recordAndDispatchAlerts(newPartnerAlerts);
          }
          return { owner: sessionId, space: mergedSpace };
        }
        return { owner: sessionId, space: next };
      });
      if (realtimeConnected.current) setConnection('live');
    }
    catch (e) { if (version === refreshVersion.current) { setConnection('offline'); setError(e instanceof Error ? e.message : 'Could not refresh your space.'); void captureException(e, { level: 'warning', handled: true, mechanism: 'space.refresh' }); } }
  }, [sessionId, identityVersion, demoSpace.mode, demoSpace.originStory, recordAndDispatchAlerts]);

  useEffect(() => {
    let active = true; let authEventReceived = false;
    configureExpoNotificationHandler();
    void hydrateHapticsPreference();
    const receiveSession = (nextSession: Session | null) => {
      if (!active) return;
      const nextId = nextSession?.user.id ?? null;
      setMonitoringUser(nextId);
      if (identity.current !== nextId) {
        identity.current = nextId; identityEpoch.current++; refreshVersion.current++;
        realtimeConnected.current = false;
        setIdentityVersion(identityEpoch.current);
        setLiveSpace({ owner: nextId, space: blankSpace() }); setError(''); setToast('');
        setNotifications([]); setNotificationOwner('');
        setConnection(nextSession ? 'connecting' : 'live');
        addBreadcrumb({ category: 'auth', level: 'info', message: nextId ? 'Authenticated session active' : 'Session signed out or local mode' });
      }
      setSession(nextSession);
      if (nextSession) setOnboarded(true);
    };
    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => { authEventReceived = true; receiveSession(nextSession); });
    (async () => {
      try {
        // Keep the previous version's local data when importing an update.
        const [savedOnboarding, savedPrefs, savedNotifs, permStatus] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
          AsyncStorage.getItem(NOTIFICATION_PREFS_KEY),
          Promise.resolve(null),
          getNotificationPermissionStatus(),
        ]);
        if (active) {
          setNotificationPermission(permStatus);
          if (savedPrefs) {
            try {
              const parsedPrefs = JSON.parse(savedPrefs);
              if (parsedPrefs && typeof parsedPrefs === 'object') {
                setNotificationPrefs({ ...DEFAULT_PARTNER_ALERT_PREFS, ...parsedPrefs });
              }
            } catch {}
          }
          if (savedNotifs) {
            try {
              const parsedNotifs = JSON.parse(savedNotifs);
              if (Array.isArray(parsedNotifs)) {
                setNotifications(parsedNotifs);
              }
            } catch {}
          }
        }
        if (savedOnboarding && active) {
          const parsed = JSON.parse(savedOnboarding);
          if (parsed?.space && Array.isArray(parsed.space.profiles) && parsed.space.profiles.length > 0) {
            setDemoSpace({ ...blankSpace(), ...parsed.space });
            setOnboarded(Boolean(parsed.onboarded));
          }
        }
      } catch { if (active) setError('Could not restore your saved local space.'); }
      try {
        if (supabase) {
          const result = await supabase.auth.getSession();
          if (result.error) throw result.error;
          if (!authEventReceived) receiveSession(result.data.session);
        } else {
          setConnection('live');
        }
      } catch { if (active) setError('Could not restore your last session.'); }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; subscription?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready || !sessionId || !supabase) return;
    const sb = supabase;
    let active = true; let scheduled: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => { if (!scheduled) scheduled = setTimeout(() => { scheduled = undefined; if (active) void refresh(); }, 150); };
    // refresh() awaits the database before setting state; it is an external subscription load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const channel = sb.channel(`space-${sessionId}`);
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
      if (state === 'active') { sb.auth.startAutoRefresh(); void refresh(); }
      else if (Platform.OS !== 'web') sb.auth.stopAutoRefresh();
    });
    return () => { active = false; realtimeConnected.current = false; clearTimeout(scheduled); void sb.removeChannel(channel); clearInterval(timer); listener.remove(); };
  }, [ready, sessionId, refresh]);

  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); }, [toast]);

  const current = space;
  const isLocalSpace = !sessionId && Boolean(current.id);
  const requirePair = () => { if (!current.id || current.profiles.length < 2) throw new Error('Connect your partner in Our space before sharing.'); };
  const requireFeatures = () => { requirePair(); if (!current.featuresReady) throw new Error('These new features aren’t available in your live space yet. Please try again later.'); };
  const mutateDemo = (change: (space: Space) => Space) => setSpace(change);
  const checked = async (operation: PromiseLike<{ error: { message: string } | null }>) => { const { error: apiError } = await operation; if (apiError) throw new Error(apiError.message); };
  const run = async (fn: () => Promise<void>) => {
    if (busyRef.current) return false;
    busyRef.current = true; setBusy(true); setError('');
    try { await fn(); return identityVersion === identityEpoch.current; } catch (e) { hapticError(); if (identityVersion === identityEpoch.current) setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); void captureException(e, { level: 'error', handled: true, mechanism: 'store.run' }); return false; }
    finally { busyRef.current = false; setBusy(false); }
  };
  const setMood = async (mood: MoodId, note: string, need: string) => {
    if (note.length > 200) throw new Error('Keep your mood note under 200 characters.');
    const nowIso = new Date().toISOString();
    const day = sharedDay(current.timeZone);
    const entry: MoodLog = { authorId: userId, day, mood, note: note.trim(), need, createdAt: nowIso };
    if (demo || isLocalSpace) {
      mutateDemo(s => ({
        ...s,
        profiles: s.profiles.map(p => p.id === userId ? { ...p, mood, moodNote: note.trim(), need, moodAt: nowIso } : p),
        moodLogs: upsertMoodLog(s.moodLogs ?? [], entry),
      }));
    } else {
      await checked(client().rpc('log_mood', { feeling: mood, note: note.trim(), support: need }));
      await refresh();
    }
    hapticSuccess();
    setToast('Your daily mood is logged');
  };
  const sendMoment = async (kind: Moment['kind'], text: string, photo?: string) => {
    requirePair();
    const body = kind === 'photo' ? text.trim().slice(0, 500) : cleanText(text);
    if (kind === 'photo' && !photo) throw new Error('Choose a photo first.');
    if (photo && photo.length > 7 * 1024 * 1024) throw new Error('This photo is too large. Try another one.');
    const imageUri = photo ? (photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`) : undefined;
    const createdMoment: Moment = { id: makeId(), authorId: userId, kind, text: body, image: imageUri, createdAt: new Date().toISOString(), hearts: [] };
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, moments: [createdMoment, ...s.moments] }));
    else {
      if (kind === 'photo') await writePhoto(current.id, userId, photo!, body);
      else await checked(client().from('moments').insert({ couple_id: current.id, author_id: userId, kind, body }));
      await refresh();
    }
    if (kind === 'photo') {
      hapticInstantPic();
      // Partner alerts are produced on the recipient's refresh, not on the sender.
    } else {
      hapticSuccess();
    }
    setToast('Sent to your shared space ♡');
  };
  const heart = async (id: string) => {
    const item = current.moments.find(m => m.id === id); if (!item) return;
    const active = item.hearts.includes(userId);
    hapticHeart();
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, moments: s.moments.map(m => m.id === id ? { ...m, hearts: active ? m.hearts.filter(h => h !== userId) : [...m.hearts, userId] } : m) }));
    else {
      if (active) await checked(client().from('reactions').delete().eq('moment_id', id).eq('user_id', userId));
      else await checked(client().from('reactions').insert({ moment_id: id, user_id: userId, couple_id: current.id }));
      await refresh();
    }
  };
  const deleteMoment = async (id: string) => {
    const item = current.moments.find(m => m.id === id && m.authorId === userId); if (!item) throw new Error('You can only delete your own moments.');
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, moments: s.moments.filter(m => m.id !== id) }));
    else {
      // Remove the photo first; never leave an inaccessible private upload behind.
      if (item.storagePath) await checked(client().storage.from('couple-photos').remove([item.storagePath]));
      await checked(client().from('moments').delete().eq('id', id).eq('author_id', userId)); await refresh();
    }
    hapticWarning();
    setToast('Moment deleted');
  };
  const savePlan = async (input: PlanDraft, original?: Plan) => {
    requireFeatures(); const draft = validatePlan(input, sharedDay(current.timeZone));
    if (demo || isLocalSpace) {
      if (original && current.plans.find(p => p.id === original.id)?.revision !== original.revision) throw new Error('This plan changed. Open it again to edit.');
      const plan: Plan = { ...draft, id: original?.id ?? makeId(), authorId: original?.authorId ?? userId, done: false, revision: (original?.revision ?? 0) + 1, acceptedBy: draft.kind === 'date' ? [userId] : [] };
      mutateDemo(s => ({ ...s, plans: original ? s.plans.map(p => p.id === plan.id ? plan : p) : [plan, ...s.plans] }));
    } else { const { data, error: apiError } = await client().rpc('save_plan', { plan_id: original?.id ?? null, draft, expected_revision: original?.revision ?? null }); if (apiError) throw apiError; const plan = planFrom(data); setSpace(s => ({ ...s, plans: [plan, ...s.plans.filter(p => p.id !== plan.id)] })); }
    setToast(draft.kind === 'date' ? 'Your date is proposed. Your partner can confirm.' : 'Added to your someday list');
  };
  const respondPlan = async (plan: Plan, going: boolean) => {
    requireFeatures();
    if (demo || isLocalSpace) {
      mutateDemo(s => ({ ...s, plans: s.plans.map(p => p.id === plan.id ? { ...p, acceptedBy: [...(p.acceptedBy ?? []).filter(id => id !== userId), ...(going ? [userId] : [])] } : p) }));
    } else if (plan.kind === 'date') {
      const { data, error: apiError } = await client().rpc('respond_to_plan', { plan_id: plan.id, going, expected_revision: plan.revision ?? 1 });
      if (apiError) throw apiError;
      setSpace(s => ({ ...s, plans: s.plans.map(p => p.id === plan.id ? planFrom(data) : p) }));
    } else {
      setSpace(s => ({ ...s, plans: s.plans.map(p => p.id === plan.id ? { ...p, acceptedBy: [...(p.acceptedBy ?? []).filter(id => id !== userId), ...(going ? [userId] : [])] } : p) }));
    }
    hapticTaskToggle(going);
    setToast(going ? 'Voted for this date idea ♡' : 'Your vote is updated');
  };
  const togglePlan = async (id: string) => {
    const plan = current.plans.find(p => p.id === id); if (!plan) return;
    hapticTaskToggle(!plan.done);
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, plans: s.plans.map(p => p.id === id ? { ...p, done: !p.done } : p) }));
    else {
      const result = await client().from('plans').update({ done: !plan.done }).eq('id', id).eq('revision', plan.revision ?? 1).select('id').maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) { await refresh(); throw new Error('This plan changed. Review it before marking it complete.'); }
      await refresh();
    }
  };
  const answer = async (text: string, displayedDay: string) => {
    requirePair(); const body = cleanText(text); const day = displayedDay;
    if (day !== sharedDay(current.timeZone)) throw new Error('A new day has started. Open today’s question and try again.');
    if (current.answers.some(a => a.day === day && a.authorId === userId)) throw new Error('You’ve already answered today. Come back tomorrow for a new question.');
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, answers: [...s.answers, { id: makeId(), authorId: userId, day, text: body }] }));
    else { await checked(client().from('daily_answers').insert({ couple_id: current.id, author_id: userId, day, body })); await refresh(); }
    setToast('A little more understood');
  };
  const updateProfile = async (name: string, start: string) => {
    const cleaned = cleanText(name, 30);
    if (start && (!validDate(start) || start > sharedDay(current.timeZone))) throw new Error('Choose a valid date in the past or today in your shared time zone.');
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, startedOn: start || s.startedOn, profiles: s.profiles.map(p => p.id === userId ? { ...p, name: cleaned } : p) }));
    else {
      await checked(client().from('profiles').update({ display_name: cleaned }).eq('id', userId));
      if (current.id && start) await checked(client().from('couples').update({ started_on: start }).eq('id', current.id));
      await refresh();
    }
    setToast('Your space, a little more you');
  };
  const switchPartner = () => {};
  const resetDemo = async () => { await AsyncStorage.multiRemove([STORAGE_KEY, ONBOARDING_STORAGE_KEY]); setDemoSpace(blankSpace()); setOnboarded(false); setToast('Space reset'); };
  const signOut = async () => { await checked(client().auth.signOut({ scope: 'local' })); };
  const applyOriginSpace = async (mode: Space['mode'], originStory: CoupleOriginStory, toastMessage?: string) => {
    const nowIso = new Date().toISOString();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const startDay = originStory.relationshipStartedAt.slice(0, 10);
    const validStart = validDate(startDay) ? startDay : dateKey();
    const myDisplayName = originStory.myName.trim() || 'Me';
    const partnerDisplayName = originStory.partnerNickname.trim() || originStory.partnerName.trim() || 'My Love';
    const normalizedJoined = originStory.joinedCode ? normalizeConnectionCode(originStory.joinedCode) : undefined;
    const finalizedOrigin: CoupleOriginStory = {
      ...originStory,
      inviteCode: originStory.inviteCode ? normalizeConnectionCode(originStory.inviteCode) : generateUniqueConnectionCode(myDisplayName),
      joinedCode: normalizedJoined,
      isLinked: Boolean(sessionId && originStory.isLinked),
      linkedAt: sessionId ? originStory.linkedAt : undefined,
      acceptedTerms: originStory.acceptedTerms ?? true,
      acceptedPrivacy: originStory.acceptedPrivacy ?? true,
      legalAcceptedAt: originStory.legalAcceptedAt || nowIso,
      legalVersion: originStory.legalVersion || '2026.11',
    };
    const firstChapterBody = [
      finalizedOrigin.whenWeMet ? `First met: ${finalizedOrigin.whenWeMet}.` : '',
      finalizedOrigin.partnerOutfit ? `Wearing: ${finalizedOrigin.partnerOutfit}.` : '',
      finalizedOrigin.whoProposed ? `Who proposed: ${finalizedOrigin.whoProposed}${finalizedOrigin.proposalNote ? ` (${finalizedOrigin.proposalNote})` : ''}.` : '',
      finalizedOrigin.whenRelationshipStarted ? `Together since: ${finalizedOrigin.whenRelationshipStarted}.` : '',
    ].filter(Boolean).join(' ');

    const builtSpace: Space = {
      ...(current.id ? current : blankSpace()),
      id: current.id || 'couple-space',
      mode,
      timeZone: tz,
      startedOn: validStart,
      originStory: finalizedOrigin,
      featuresReady: true,
      profiles: [
        {
          id: sessionId ?? 'me',
          name: myDisplayName,
          gender: finalizedOrigin.myGender,
          avatar: finalizedOrigin.myAvatar,
          mood: 'loved',
          moodNote: `So happy building our space with ${partnerDisplayName} ♡`,
          need: 'A hug',
          moodAt: nowIso,
        },
        {
          id: 'partner',
          name: partnerDisplayName,
          nickname: finalizedOrigin.partnerNickname.trim() || partnerDisplayName,
          gender: finalizedOrigin.partnerGender,
          avatar: finalizedOrigin.partnerAvatar,
          mood: 'happy',
          moodNote: firstChapterBody || `Counting every second together since ${validStart}.`,
          need: 'Something fun',
          moodAt: nowIso,
        },
      ],
      journal: current.journal?.length
        ? current.journal
        : firstChapterBody
          ? [createJournalEntry(sessionId ?? 'me', validStart, firstChapterBody, `How ${myDisplayName} & ${partnerDisplayName} began`, 'memory', nowIso)]
          : [],
    };

    if (!sessionId) await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ space: builtSpace, onboarded: true }));
    if (current.id) {
      await AsyncStorage.setItem(`closer.originStory.${current.id}`, JSON.stringify(finalizedOrigin)).catch(() => {});
    }
    if (!sessionId) setDemoSpace(builtSpace);
    if (sessionId) {
      setSpace(s => ({
        ...s,
        mode,
        startedOn: validStart,
        originStory: finalizedOrigin,
        profiles: s.profiles.length
          ? s.profiles.map(p =>
              p.id === sessionId
                ? { ...p, name: myDisplayName, gender: finalizedOrigin.myGender, avatar: finalizedOrigin.myAvatar }
                : { ...p, name: partnerDisplayName, nickname: finalizedOrigin.partnerNickname, gender: finalizedOrigin.partnerGender, avatar: finalizedOrigin.partnerAvatar }
            )
          : builtSpace.profiles,
      }));
    }
    setOnboarded(true);
    if (toastMessage) setToast(toastMessage);
  };
  const completeOnboarding = async (mode: Space['mode'], originStory: CoupleOriginStory) => {
    if (onboarded && current.originStory) {
      throw new Error('Initial love story onboarding is a one-time setup and is already complete.');
    }
    if (!originStory.acceptedTerms || !originStory.acceptedPrivacy) {
      throw new Error('Please accept both the Terms of Service and Privacy Policy before entering your main dashboard.');
    }
    await applyOriginSpace(mode, originStory, 'Welcome to your shared space ♡');
  };
  const updateOriginStory = async (patch: Partial<CoupleOriginStory>) => {
    const existing: CoupleOriginStory = current.originStory ?? {
      myName: current.profiles[0]?.name ?? 'Me',
      partnerName: current.profiles[1]?.name ?? 'Partner',
      partnerNickname: current.profiles[1]?.nickname ?? current.profiles[1]?.name ?? 'My Love',
      myGender: current.profiles[0]?.gender ?? 'boy',
      partnerGender: current.profiles[1]?.gender ?? 'girl',
      whenWeMet: '',
      partnerOutfit: '',
      whoProposed: 'Me',
      whenRelationshipStarted: current.startedOn || dateKey(),
      relationshipStartedAt: current.startedOn ? `${current.startedOn}T00:00:00` : new Date().toISOString(),
      myAvatar: current.profiles[0]?.avatar,
      partnerAvatar: current.profiles[1]?.avatar,
      inviteCode: generateUniqueConnectionCode(current.profiles[0]?.name || 'closer'),
      acceptedTerms: true,
      acceptedPrivacy: true,
    };
    const nextOrigin: CoupleOriginStory = { ...existing, ...patch };
    await applyOriginSpace(current.mode, nextOrigin);
  };
  const generateConnectionCode = async (): Promise<string> => {
    if (!sessionId || !supabase) throw new Error('Sign in to create a live invitation for your partner.');
    if (sessionId && supabase) {
      const invited = await generateSupabaseInvitationCode(
        current.mode,
        current.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      );
      await updateOriginStory({ inviteCode: invited.code });
      await refresh();
      return invited.code;
    }
    if (current.originStory?.inviteCode) {
      return current.originStory.inviteCode;
    }
    const seed = `${userId}-${current.profiles[0]?.name || 'closer'}`;
    const code = generateSixDigitInviteCode(seed);
    await updateOriginStory({ inviteCode: code });
    return code;
  };
  const redeemConnectionCode = async (rawCode: string, partnerNameOverride?: string) => {
    if (!sessionId || !supabase) throw new Error('Sign in before linking phones. A code must be verified with your partner’s account.');
    if (current.profiles.length === 2 && current.profiles.every(profile => profile.id !== 'partner')) {
      throw new Error('Your accounts are already linked. Partner code redemption is a one-time process.');
    }
    if (!isValidConnectionCode(rawCode)) {
      throw new Error('Enter a valid 6-digit partner invitation code (e.g., 482917).');
    }
    const normalized = normalizeConnectionCode(rawCode);
    const myCode = current.originStory?.inviteCode ? normalizeConnectionCode(current.originStory.inviteCode) : '';
    if (myCode && normalized === myCode) {
      throw new Error('That is your own invitation code. Enter the 6-digit code your partner shared with you.');
    }
    if (sessionId && supabase) {
      await verifyAndLinkSupabaseAccounts(normalized, sessionId);
      await refresh();
    }
    const nowIso = new Date().toISOString();
    const cleanedPartner = partnerNameOverride?.trim();
    const existing: CoupleOriginStory = current.originStory ?? {
      myName: current.profiles[0]?.name ?? 'Me',
      partnerName: cleanedPartner || current.profiles[1]?.name || 'Partner',
      partnerNickname: cleanedPartner || current.profiles[1]?.nickname || current.profiles[1]?.name || 'My Love',
      myGender: current.profiles[0]?.gender ?? 'boy',
      partnerGender: current.profiles[1]?.gender ?? 'girl',
      whenWeMet: 'Connected via 6-digit partner code',
      partnerOutfit: '',
      whoProposed: 'Both of us together ♡',
      whenRelationshipStarted: current.startedOn || dateKey(),
      relationshipStartedAt: current.startedOn ? `${current.startedOn}T00:00:00` : nowIso,
      myAvatar: current.profiles[0]?.avatar,
      partnerAvatar: current.profiles[1]?.avatar,
      inviteCode: generateSixDigitInviteCode(userId),
    };
    const nextOrigin: CoupleOriginStory = {
      ...existing,
      partnerName: cleanedPartner || existing.partnerName,
      partnerNickname: cleanedPartner || existing.partnerNickname,
      joinedCode: normalized,
      isLinked: true,
      linkedAt: nowIso,
      acceptedTerms: true,
      acceptedPrivacy: true,
      legalAcceptedAt: existing.legalAcceptedAt || nowIso,
      legalVersion: '2026.11',
    };
    await applyOriginSpace(
      current.mode,
      nextOrigin,
      `Accounts linked with code ${normalized}! One-time partner connection complete ♡`
    );
  };
  const setup = async (mode: Space['mode'], name: string, partnerName: string) => {
    await completeOnboarding(mode, {
      myName: name.trim() || 'Me',
      partnerName: partnerName.trim() || 'My Love',
      partnerNickname: partnerName.trim() || 'My Love',
      myGender: 'boy',
      partnerGender: 'girl',
      whenWeMet: '',
      partnerOutfit: '',
      whoProposed: 'Me',
      whenRelationshipStarted: dateKey(),
      relationshipStartedAt: new Date().toISOString(),
      inviteCode: generateUniqueConnectionCode(name),
      acceptedTerms: true,
      acceptedPrivacy: true,
    });
  };
  const setMode = async (mode: Space['mode']) => {
    if (demo || isLocalSpace || !current.id) mutateDemo(s => ({ ...s, mode }));
    else { await checked(client().from('couples').update({ mode }).eq('id', current.id)); await refresh(); }
  };
  const addStroke = async (stroke: Stroke) => {
    if (stroke.authorId !== userId || stroke.points.length < 1 || stroke.points.length > 3000) throw new Error('Could not save this stroke.');
    if (current.canvas.length >= 500) throw new Error('This canvas has 500 strokes. Save it to your story before starting fresh.');
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, canvas: [...s.canvas.filter(x => x.id !== stroke.id), stroke] }));
    else { requirePair(); await checked(client().from('canvas_strokes').upsert({ id: stroke.id, couple_id: current.id, author_id: userId, stroke }, { onConflict: 'id' })); await refresh(); }
  };
  const undoStroke = async ( ) => {
    const stroke = [...current.canvas].reverse().find(s => s.authorId === userId); if (!stroke) return;
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, canvas: s.canvas.filter(x => x.id !== stroke.id) }));
    else { await checked(client().from('canvas_strokes').delete().eq('id', stroke.id).eq('author_id', userId)); await refresh(); }
  };
  const clearCanvas = async () => {
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, canvas: [] }));
    else { requirePair(); await checked(client().from('canvas_strokes').delete().eq('couple_id', current.id).eq('author_id', userId)); await refresh(); }
    setToast('Your marks were cleared from the canvas');
  };
  const saveCanvas = async (title: string) => {
    if (!current.canvas.length) throw new Error('Make a little mark first.');
    const text = cleanText(title || 'A little piece of us', 120);
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, moments: [{ id: makeId(), authorId: userId, kind: 'drawing', text, drawing: [...s.canvas], createdAt: new Date().toISOString(), hearts: [] }, ...s.moments] }));
    else { requirePair(); await checked(client().from('moments').insert({ couple_id: current.id, author_id: userId, kind: 'drawing', body: text, drawing: current.canvas })); await refresh(); }
    setToast('Drawing saved to your story');
  };
  const startGame = async () => {
    requirePair();
    if (current.games.some(g => g.status === 'playing')) return;
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, games: [newGame(s.profiles.map(p => p.id)), ...s.games] }));
    else { await checked(client().rpc('start_game')); await refresh(); }
  };
  const playMove = async (id: string, column: number) => {
    const game = current.games.find(g => g.id === id); if (!game) throw new Error('Start a game first.');
    if (demo || isLocalSpace) { const next = dropPiece(game, column, game.turn); mutateDemo(s => ({ ...s, games: s.games.map(g => g.id === id ? next : g) })); }
    else { await checked(client().rpc('play_move', { game_id: id, col: column })); await refresh(); }
  };
  const submitQuiz = async (choices: number[], displayedDay: string) => {
    requirePair(); const day = displayedDay;
    if (day !== sharedDay(current.timeZone)) throw new Error('A new day has started. Open today’s quiz and try again.');
    if (choices.length !== QUIZ.length || choices.some(x => x !== 0 && x !== 1)) throw new Error('Choose one answer for every question.');
    if (current.quizzes.some(q => q.authorId === userId && q.day === day)) throw new Error('Your choices are already saved for today.');
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, quizzes: [...s.quizzes, { authorId: userId, day, choices }] }));
    else { await checked(client().from('quiz_answers').insert({ couple_id: current.id, author_id: userId, day, choices })); await refresh(); }
    setToast('Your choices are saved');
  };

  const sendMessage = async (text: string, id: string) => {
    requireFeatures(); const body = cleanText(text, 2000);
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, messages: mergeMessages(s.messages, [{ id, authorId: userId, text: body, createdAt: s.messages.find(m => m.id === id)?.createdAt ?? new Date().toISOString() }]) }));
    else { const { data, error: apiError } = await client().rpc('send_chat_message', { message_id: id, message_body: body }); if (apiError) throw apiError; setSpace(s => ({ ...s, messages: mergeMessages(s.messages, [messageFrom(data)]) })); }
  };
  const loadEarlierMessages = async () => {
    if (demo || isLocalSpace || !current.hasOlderMessages || !current.messages.length) return;
    const cid = current.id; const messages = await readMessages(cid, current.messages[0]);
    setSpace(s => s.id === cid ? { ...s, messages: mergeMessages(messages, s.messages), hasOlderMessages: messages.length === 100 } : s);
  };
  const adoptPet = async (name: string, kind: PetKind) => {
    requireFeatures(); if (current.pet) throw new Error('You’ve already adopted your shared pet.');
    const pet = newPet(name, kind);
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, pet, petCare: [] }));
    else { await checked(client().rpc('adopt_pet', { pet_name: pet.name, pet_kind: kind })); await refresh(); }
    setToast(`Welcome to your little world, ${pet.name}!`);
  };
  const carePet = async (action: CareAction) => {
    requireFeatures(); if (!current.pet) throw new Error('Adopt a pet together first.');
    const next = careForPet(current.pet, current.petCare, userId, action, sharedDay(current.timeZone));
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, pet: next.pet, petCare: next.care }));
    else { await checked(client().rpc('care_for_pet', { care_action: action })); await refresh(); }
    setToast(`${current.pet.name} feels a little more loved ♡`);
  };
  const renamePet = async (name: string) => {
    requireFeatures(); const clean = cleanText(name, 24);
    if (!current.pet) throw new Error('Adopt a pet together first.');
    if (demo || isLocalSpace) mutateDemo(s => ({ ...s, pet: s.pet ? { ...s.pet, name: clean } : null }));
    else { await checked(client().rpc('rename_pet', { pet_name: clean })); await refresh(); }
    setToast('A lovely name for your little friend');
  };
  const addAdventure = async (title: string, category: AdventureCategory, notes = '') => {
    requirePair();
    const goal = createAdventureGoal(userId, title, category, notes);
    const nextList = [goal, ...(current.adventures ?? [])];
    if (demo) {
      mutateDemo(s => ({ ...s, adventures: [goal, ...(s.adventures ?? [])] }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.adventures.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, adventures: nextList }));
    }
    setToast('Added to Future Adventures ♡');
  };
  const toggleAdventure = async (id: string) => {
    requirePair();
    const nextList = toggleAdventureCompleted(current.adventures ?? [], id);
    const item = nextList.find(g => g.id === id);
    if (demo) {
      mutateDemo(s => ({ ...s, adventures: toggleAdventureCompleted(s.adventures ?? [], id) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.adventures.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, adventures: nextList }));
    }
    hapticTaskToggle(Boolean(item?.completed));
    setToast(item?.completed ? 'Adventure completed together!' : 'Moved back to active goals');
  };
  const archiveAdventure = async (id: string) => {
    requirePair();
    const nextList = toggleAdventureArchived(current.adventures ?? [], id);
    const item = nextList.find(g => g.id === id);
    if (demo) {
      mutateDemo(s => ({ ...s, adventures: toggleAdventureArchived(s.adventures ?? [], id) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.adventures.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, adventures: nextList }));
    }
    setToast(item?.archived ? 'Goal archived' : 'Goal restored to your list');
  };
  const addJournalEntry = async (body: string, title = '', tag: JournalTag = 'reflection') => {
    requirePair();
    const entry = createJournalEntry(userId, sharedDay(current.timeZone), body, title, tag);
    const nextList = [entry, ...(current.journal ?? [])];
    if (demo) {
      mutateDemo(s => ({ ...s, journal: [entry, ...(s.journal ?? [])] }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.journal.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, journal: nextList }));
    }
    // This journal is stored on this device until shared journal syncing is added.
    hapticSuccess();
    setToast(
      'Journal entry saved on this device ♡'
    );
  };
  const heartJournalEntry = async (id: string) => {
    requirePair();
    hapticHeart();
    const nextList = toggleJournalHeart(current.journal ?? [], id, userId);
    if (demo) {
      mutateDemo(s => ({ ...s, journal: toggleJournalHeart(s.journal ?? [], id, userId) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.journal.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, journal: nextList }));
    }
  };
  const addTriviaQuestion = async (prompt: string, options: [string, string, string], correctIndex: number) => {
    requirePair();
    const question = createTriviaQuestion(userId, prompt, options, correctIndex);
    const nextList = [question, ...(current.trivia ?? [])];
    if (demo) {
      mutateDemo(s => ({ ...s, trivia: [question, ...(s.trivia ?? [])] }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.trivia.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, trivia: nextList }));
    }
    hapticSuccess();
    setToast('Trivia question added for your partner!');
  };
  const guessTriviaQuestion = async (questionId: string, choiceIndex: number) => {
    requirePair();
    const target = (current.trivia ?? []).find(q => q.id === questionId);
    if (!target) throw new Error('Could not find this trivia question.');
    const nextList = answerTriviaQuestion(current.trivia ?? [], questionId, userId, choiceIndex);
    if (demo) {
      mutateDemo(s => ({ ...s, trivia: answerTriviaQuestion(s.trivia ?? [], questionId, userId, choiceIndex) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.trivia.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, trivia: nextList }));
    }
    const right = choiceIndex === target.correctIndex;
    if (right) hapticSuccess();
    else hapticWarning();
    setToast(right ? 'Spot on! +10 trivia points ♡' : 'Good guess! Now you know each other even better.');
  };
  const addQuickNote = async (text: string, color: QuickNoteColor = 'butter', image?: string) => {
    requirePair();
    const imageUri = image ? (image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`) : undefined;
    const nowIso = new Date().toISOString();
    const note = createQuickNote(userId, text, color, nowIso, imageUri);
    const nextList = [note, ...(current.quickNotes ?? [])];
    if (demo) {
      mutateDemo(s => ({
        ...s,
        quickNotes: [note, ...(s.quickNotes ?? [])],
        moments: imageUri
          ? [{ id: makeId(), authorId: userId, kind: 'photo', text: note.text, image: imageUri, createdAt: nowIso, hearts: [] }, ...s.moments]
          : s.moments,
      }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.quickNotes.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({
        ...s,
        quickNotes: nextList,
        moments: imageUri
          ? [{ id: makeId(), authorId: userId, kind: 'photo', text: note.text, image: imageUri, createdAt: nowIso, hearts: [] }, ...s.moments]
          : s.moments,
      }));
    }
    if (imageUri) hapticInstantPic();
    else hapticQuickNote();
    // Saving a local note does not deliver a notification to another phone.
    setToast(
      imageUri
        ? 'Instant pic saved on this device ♡'
        : 'Sticky note saved on this device ♡'
    );
  };
  const updateQuickNoteText = async (id: string, text: string) => {
    requirePair();
    const nextList = updateQuickNoteCaption(current.quickNotes ?? [], id, userId, text);
    if (demo) {
      mutateDemo(s => ({ ...s, quickNotes: updateQuickNoteCaption(s.quickNotes ?? [], id, userId, text) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.quickNotes.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, quickNotes: nextList }));
    }
    hapticSuccess();
    setToast('Caption saved ♡');
  };
  const heartQuickNote = async (id: string) => {
    requirePair();
    hapticHeart();
    const nextList = toggleQuickNoteHeart(current.quickNotes ?? [], id, userId);
    if (demo) {
      mutateDemo(s => ({ ...s, quickNotes: toggleQuickNoteHeart(s.quickNotes ?? [], id, userId) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.quickNotes.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, quickNotes: nextList }));
    }
  };
  const pinQuickNote = async (id: string) => {
    requirePair();
    hapticSelection();
    const nextList = toggleQuickNotePin(current.quickNotes ?? [], id);
    const pinned = nextList.find(n => n.id === id)?.pinned;
    if (demo) {
      mutateDemo(s => ({ ...s, quickNotes: toggleQuickNotePin(s.quickNotes ?? [], id) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.quickNotes.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, quickNotes: nextList }));
    }
    setToast(pinned ? 'Pinned to top of sticky board' : 'Unpinned sticky note');
  };
  const deleteQuickNote = async (id: string) => {
    requirePair();
    const nextList = removeQuickNote(current.quickNotes ?? [], id, userId);
    if (demo) {
      mutateDemo(s => ({ ...s, quickNotes: removeQuickNote(s.quickNotes ?? [], id, userId) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.quickNotes.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, quickNotes: nextList }));
    }
    hapticWarning();
    setToast('Sticky note removed');
  };
  const addErrand = async (title: string, category: ErrandCategory = 'groceries', assigneeId?: string) => {
    requirePair();
    const item = createErrandItem(userId, title, category, assigneeId);
    const nextList = [item, ...(current.errands ?? [])];
    if (demo) {
      mutateDemo(s => ({ ...s, errands: [item, ...(s.errands ?? [])] }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.errands.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, errands: nextList }));
    }
    hapticSuccess();
    setToast('Added to shared Daily Errands ♡');
  };
  const toggleErrand = async (id: string) => {
    requirePair();
    const nextList = toggleErrandItem(current.errands ?? [], id, userId);
    const updated = nextList.find(item => item.id === id);
    hapticTaskToggle(Boolean(updated?.done));
    if (demo) {
      mutateDemo(s => ({ ...s, errands: toggleErrandItem(s.errands ?? [], id, userId) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.errands.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, errands: nextList }));
    }
    setToast(updated?.done ? 'Errand checked off!' : 'Moved back to active errands');
  };
  const deleteErrand = async (id: string) => {
    requirePair();
    const nextList = removeErrandItem(current.errands ?? [], id);
    if (demo) {
      mutateDemo(s => ({ ...s, errands: removeErrandItem(s.errands ?? [], id) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.errands.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, errands: nextList }));
    }
    hapticWarning();
    setToast('Errand removed');
  };
  const clearDoneErrands = async () => {
    requirePair();
    const nextList = clearCompletedErrands(current.errands ?? []);
    if (demo) {
      mutateDemo(s => ({ ...s, errands: clearCompletedErrands(s.errands ?? []) }));
    } else if (current.id) {
      await AsyncStorage.setItem(`closer.errands.${current.id}`, JSON.stringify(nextList)).catch(() => {});
      setSpace(s => ({ ...s, errands: nextList }));
    }
    hapticWarning();
    setToast('Cleared completed errands');
  };
  const enableNotifications = async (): Promise<NotificationPermissionState> => {
    const status = await requestNotificationPermissions();
    setNotificationPermission(status);
    if (status === 'granted') {
      const nextPrefs = { ...notificationPrefs, enabled: true };
      setNotificationPrefs(nextPrefs);
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(nextPrefs)).catch(() => {});
      setToast('Expo Notifications enabled for partner updates ♡');
    } else if (status === 'denied') {
      setToast('In-app partner alerts are active (system notifications disabled in browser/OS)');
    }
    return status;
  };
  const updateNotificationPrefs = async (patch: Partial<PartnerAlertPreferences>) => {
    const nextPrefs = { ...notificationPrefs, ...patch };
    setNotificationPrefs(nextPrefs);
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(nextPrefs)).catch(() => {});
    setToast('Partner alert preferences saved ♡');
  };
  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, read: true } : item));
      void AsyncStorage.setItem(`${NOTIFICATIONS_LIST_KEY}.${sessionId ?? 'local'}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };
  const markAllNotificationsRead = () => {
    setNotifications(prev => {
      const next = prev.map(item => ({ ...item, read: true }));
      void AsyncStorage.setItem(`${NOTIFICATIONS_LIST_KEY}.${sessionId ?? 'local'}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };
  const triggerPartnerAlertPreview = async (kind: PartnerAlertKind) => {
    const partnerProfile = current.profiles.find(p => p.id !== userId);
    const partnerName =
      partnerProfile?.nickname ||
      current.originStory?.partnerNickname ||
      partnerProfile?.name ||
      current.originStory?.partnerName ||
      'Your partner';
    const partnerId = partnerProfile?.id ?? 'partner';
    const nowIso = new Date().toISOString();

    let alert: PartnerNotificationItem;
    if (kind === 'journal') {
      alert = buildPartnerAlertForJournal(
        {
          id: makeId(),
          authorId: partnerId,
          day: sharedDay(current.timeZone),
          title: 'Thinking about our week together',
          body: 'Left a new reflection in our Shared Journal for you to read whenever you have a quiet minute.',
          tag: 'gratitude',
          hearts: [],
          createdAt: nowIso,
        },
        partnerName
      );
    } else if (kind === 'instant-pic') {
      alert = buildPartnerAlertForQuickNote(
        {
          id: makeId(),
          authorId: partnerId,
          text: 'A quick snapshot from my desk just for you ♡',
          color: 'peach',
          image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"/>',
          hearts: [],
          createdAt: nowIso,
        },
        partnerName
      );
    } else {
      alert = buildPartnerAlertForQuickNote(
        {
          id: makeId(),
          authorId: partnerId,
          text: 'Just a little sticky note to remind you how much I adore you ♡',
          color: 'butter',
          hearts: [],
          createdAt: nowIso,
        },
        partnerName
      );
    }

    recordAndDispatchAlerts([alert]);
    setToast(`Dispatched ${kind === 'journal' ? 'Shared Journal' : kind === 'instant-pic' ? 'Instant Pic' : 'Quick Note'} alert ♡`);
  };

  return <Context.Provider value={{ space: current, userId, demo, ready, busy, error, toast, connection, session, onboarded, setup, completeOnboarding, updateOriginStory, generateConnectionCode, redeemConnectionCode, setMode, addStroke, undoStroke, clearCanvas, saveCanvas, startGame, playMove, submitQuiz, dismissError: () => setError(''), notify: setToast, run, setMood, sendMoment, heart, deleteMoment, savePlan, togglePlan, respondPlan, addAdventure, toggleAdventure, archiveAdventure, addJournalEntry, heartJournalEntry, addTriviaQuestion, guessTriviaQuestion, addQuickNote, updateQuickNoteText, heartQuickNote, pinQuickNote, deleteQuickNote, addErrand, toggleErrand, deleteErrand, clearDoneErrands, notifications: notificationOwner === (sessionId ?? 'local') ? notifications : [], notificationPrefs, notificationPermission, enableNotifications, updateNotificationPrefs, markNotificationRead, markAllNotificationsRead, triggerPartnerAlertPreview, sendMessage, loadEarlierMessages, adoptPet, carePet, renamePet, answer, updateProfile, switchPartner, resetDemo, refresh, signOut }}>{children}</Context.Provider>;
}
export function useSpace() { const value = useContext(Context); if (!value) throw new Error('SpaceProvider is missing'); return value; }
export function usePeople() {
  const { space, userId, session } = useSpace();
  const rawName = String(session?.user.user_metadata?.display_name || session?.user.email?.split('@')[0] || 'You').trim();
  const fallbackName = rawName ? rawName.slice(0, 30) : 'You';
  const me = space.profiles.find(p => p.id === userId) ?? { id: userId, name: fallbackName, mood: 'calm' as const, moodNote: '', need: '', moodAt: new Date().toISOString() };
  return { me, partner: space.profiles.find(p => p.id !== userId) };
}
