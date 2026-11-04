import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import type { Answer, ChatMessage, Moment, MoodHistory, Pet, PetCare, Plan, Profile, Space, Game, QuizAnswer, Stroke } from '../domain';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null;

export function client() { if (!supabase) throw new Error('Live sharing is not connected in this preview yet.'); return supabase; }
function check(error: { message: string } | null) { if (error) throw new Error(error.message); }
export function profileFrom(row: Record<string, any>): Profile {
  return { id: row.id, name: row.display_name, mood: row.mood, moodNote: row.mood_note ?? '', need: row.need ?? '', moodAt: row.mood_updated_at };
}
export function messageFrom(row: Record<string, any>): ChatMessage { return { id: row.id, authorId: row.author_id, text: row.body, createdAt: row.created_at }; }
export function planFrom(row: Record<string, any>): Plan { return { id: row.id, authorId: row.author_id, title: row.title, date: row.planned_on ?? '', kind: row.kind, done: row.done, time: row.planned_time ?? '', place: row.place ?? '', notes: row.notes ?? '', format: row.format ?? 'in-person', acceptedBy: row.accepted_by ?? [], revision: row.revision ?? 1 }; }
export function petFrom(row: Record<string, any>): Pet { return { name: row.name, kind: row.kind, points: row.care_points, adoptedAt: row.adopted_at }; }
function momentFrom(row: Record<string, any>, urls: Map<string, string>): Moment { return { id: row.id, authorId: row.author_id, kind: row.kind, text: row.body, drawing: row.drawing ?? undefined, createdAt: row.created_at, image: urls.get(row.photo_path), storagePath: row.photo_path, hearts: row.reactions?.map((r: any) => r.user_id) ?? [] }; }
async function photoUrlsFor(rows: Record<string, any>[]) {
  const paths = [...new Set(rows.filter(row => row.photo_path).map(row => row.photo_path as string))];
  const urls = new Map<string, string>();
  if (paths.length) {
    const signed = await client().storage.from('couple-photos').createSignedUrls(paths, 3600); check(signed.error);
    signed.data?.forEach(item => { if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl); });
  }
  return urls;
}
function memoryQuery(coupleId: string, now = Date.now()) {
  return client().from('moments').select('*').eq('couple_id', coupleId).eq('kind', 'photo')
    .gte('created_at', new Date(now - 30 * 86400000).toISOString()).lte('created_at', new Date(now).toISOString())
    .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(41);
}
export async function readMemoryPhotos(coupleId: string, before: Moment) {
  const { data, error } = await memoryQuery(coupleId).or(`created_at.lt.${before.createdAt},and(created_at.eq.${before.createdAt},id.lt.${before.id})`); check(error);
  const rows = (data ?? []).slice(0, 40); const urls = await photoUrlsFor(rows);
  return { photos: rows.map(row => momentFrom(row, urls)), hasMore: (data?.length ?? 0) > 40 };
}
export async function readMessages(coupleId: string, before?: ChatMessage) {
  let query = client().from('chat_messages').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(100);
  if (before) query = query.or(`created_at.lt.${before.createdAt},and(created_at.eq.${before.createdAt},id.lt.${before.id})`);
  const { data, error } = await query; check(error);
  return (data ?? []).map(messageFrom).reverse();
}
export async function readSpace(userId: string): Promise<Space> {
  const db = client();
  const profile = await db.from('profiles').select('*').eq('id', userId).single(); check(profile.error);
  const membership = await db.from('couple_members').select('couple_id').eq('user_id', userId).maybeSingle(); check(membership.error);
  const coupleId = membership.data?.couple_id;
  if (!coupleId) return { id: '', startedOn: '', mode: 'nearby', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, profiles: [profileFrom(profile.data!)], moments: [], memoryPhotos: [], hasMoreMemories: false, plans: [], answers: [], canvas: [], games: [], quizzes: [], messages: [], hasOlderMessages: false, pet: null, petCare: [], featuresReady: false, moodHistory: null };
  const results = await Promise.all([
    db.from('couples').select('*').eq('id', coupleId).single(),
    db.from('profiles').select('*'),
    db.from('moments').select('*, reactions(user_id)').eq('couple_id', coupleId).order('created_at', { ascending: false }).limit(200),
    db.from('plans').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }).limit(100),
    db.from('daily_answers').select('*').eq('couple_id', coupleId).order('day', { ascending: false }).limit(60),
    db.from('canvas_strokes').select('*').eq('couple_id', coupleId).order('created_at').limit(500),
    db.from('games').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }).limit(200),
    db.from('quiz_answers').select('*').eq('couple_id', coupleId).order('day', { ascending: false }).limit(60),
    db.from('chat_messages').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(100),
    db.from('pets').select('*').eq('couple_id', coupleId).maybeSingle(),
    db.from('pet_care').select('*').eq('couple_id', coupleId).order('day', { ascending: false }).order('created_at', { ascending: false }).limit(180),
    db.rpc('get_mood_history'),
    memoryQuery(coupleId),
  ]);
  // Old live spaces remain usable while the additive migration is being deployed.
  results.forEach((result, index) => {
    if (index >= 8 && index <= 10 && ['42P01', 'PGRST205'].includes(result.error?.code ?? '')) return;
    if (index === 11 && ['42883', 'PGRST202'].includes(result.error?.code ?? '')) return;
    check(result.error);
  });
  const [couple, profiles, moments, plans, answers, canvas, games, quizzes, messages, pet, care, moods, memories] = results;
  const memoryRows = (memories.data ?? []).slice(0, 40);
  const photoUrls = await photoUrlsFor([...(moments.data ?? []), ...memoryRows]);
  return {
    id: coupleId, startedOn: (couple.data as any).started_on, mode: (couple.data as any).mode, timeZone: (couple.data as any).time_zone,
    profiles: (profiles.data ?? []).map(profileFrom),
    moments: (moments.data ?? []).map((row: any) => momentFrom(row, photoUrls)),
    memoryPhotos: memoryRows.map((row: any) => momentFrom(row, photoUrls)), hasMoreMemories: (memories.data?.length ?? 0) > 40,
    moodHistory: moods.error ? null : moods.data as MoodHistory,
    plans: (plans.data ?? []).map(planFrom),
    answers: (answers.data ?? []).map((row: any): Answer => ({ id: row.id, authorId: row.author_id, day: row.day, text: row.body })),
    canvas: (canvas.data ?? []).map((row: any): Stroke => row.stroke),
    games: (games.data ?? []).map((row: any): Game => ({ id: row.id, players: row.players, board: row.board, turn: row.turn, winner: row.winner, status: row.status, createdAt: row.created_at, finishedAt: row.finished_at })),
    quizzes: (quizzes.data ?? []).map((row: any): QuizAnswer => ({ authorId: row.author_id, day: row.day, choices: row.choices })),
    messages: (messages.data ?? []).map(messageFrom).reverse(), hasOlderMessages: messages.data?.length === 100,
    pet: pet.data ? petFrom(pet.data) : null,
    petCare: (care.data ?? []).map((row: any): PetCare => ({ authorId: row.author_id, day: row.day, action: row.action, createdAt: row.created_at })),
    featuresReady: !messages.error && !pet.error && !care.error,
  };
}

export async function writePhoto(coupleId: string, userId: string, base64: string, text: string) {
  const db = client();
  const bytes = decode(base64);
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('This photo is too large. Please choose a smaller one.');
  const path = `${coupleId}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const uploaded = await db.storage.from('couple-photos').upload(path, bytes, { contentType: 'image/jpeg', upsert: false }); check(uploaded.error);
  const inserted = await db.from('moments').insert({ couple_id: coupleId, author_id: userId, kind: 'photo', body: text, photo_path: path });
  if (inserted.error) { await db.storage.from('couple-photos').remove([path]); check(inserted.error); }
}
