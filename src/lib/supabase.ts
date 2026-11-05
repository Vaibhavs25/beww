import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import { normalizeLanguage } from '../locales';
import {
  isValidConnectionCode,
  normalizeConnectionCode,
  type Answer,
  type ChatMessage,
  type Moment,
  type Pet,
  type PetCare,
  type Plan,
  type Profile,
  type Space,
  type Game,
  type QuizAnswer,
  type Stroke,
} from '../domain';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
}) : null;

export function client() { if (!supabase) throw new Error('Live sharing is not connected in this preview yet.'); return supabase; }
function check(error: { message: string } | null) { if (error) throw new Error(error.message); }
export function profileFrom(row: Record<string, any>): Profile {
  return { id: row.id, name: row.display_name, language: normalizeLanguage(row.language), mood: row.mood, moodNote: row.mood_note ?? '', need: row.need ?? '', moodAt: row.mood_updated_at };
}
export function messageFrom(row: Record<string, any>): ChatMessage { return { id: row.id, authorId: row.author_id, text: row.body, createdAt: row.created_at }; }
export function planFrom(row: Record<string, any>): Plan { return { id: row.id, authorId: row.author_id, title: row.title, date: row.planned_on ?? '', kind: row.kind, done: row.done, time: row.planned_time ?? '', place: row.place ?? '', notes: row.notes ?? '', format: row.format ?? 'in-person', acceptedBy: row.accepted_by ?? [], revision: row.revision ?? 1 }; }
export function petFrom(row: Record<string, any>): Pet { return { name: row.name, kind: row.kind, points: row.care_points, adoptedAt: row.adopted_at }; }

export type SupabaseInvitation = {
  code: string;
  couple_id: string;
  expires_at: string;
};

export type VerifyAndLinkResult = {
  couple_id: string;
  linked: boolean;
  space?: Space;
};

/**
 * Generates a unique 6-digit invitation code in Supabase and initializes the creator's Space
 * (`couples` + seat 1 in `couple_members`).
 */
export async function generateSupabaseInvitationCode(
  relationshipMode: Space['mode'] = 'nearby',
  sharedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
): Promise<SupabaseInvitation> {
  const db = client();
  const primary = await db.rpc('generate_invitation_code', {
    relationship_mode: relationshipMode,
    shared_time_zone: sharedTimeZone,
  });
  if (!primary.error && primary.data) {
    return {
      code: String(primary.data.code || ''),
      couple_id: String(primary.data.couple_id || ''),
      expires_at: String(primary.data.expires_at || new Date(Date.now() + 10 * 60000).toISOString()),
    };
  }
  // Fallback to legacy create_invite RPC if the 6-digit migration has not been applied to remote DB yet
  if (primary.error && ['PGRST202', '42883'].includes(primary.error.code ?? '')) {
    const fallback = await db.rpc('create_invite', {
      relationship_mode: relationshipMode,
      shared_time_zone: sharedTimeZone,
    });
    check(fallback.error);
    return {
      code: String(fallback.data?.code || ''),
      couple_id: String(fallback.data?.couple_id || ''),
      expires_at: String(fallback.data?.expires_at || new Date(Date.now() + 10 * 60000).toISOString()),
    };
  }
  check(primary.error);
  throw new Error('Could not generate a 6-digit invitation code.');
}

/**
 * Verifies a 6-digit invitation code and links two user accounts in Supabase
 * (`couple_members` seat 1 & seat 2) to establish their shared Space.
 */
export async function verifyAndLinkSupabaseAccounts(
  rawInviteCode: string,
  userId?: string
): Promise<VerifyAndLinkResult> {
  if (!isValidConnectionCode(rawInviteCode)) {
    throw new Error('Enter a valid 6-digit invitation code.');
  }
  const normalized = normalizeConnectionCode(rawInviteCode).replace(/[^A-Z0-9]/g, '');
  const db = client();
  let resultData: Record<string, any> | null = null;

  const primary = await db.rpc('verify_and_link_space', { invite_code: normalized });
  if (!primary.error) {
    resultData = primary.data;
  } else if (['PGRST202', '42883'].includes(primary.error.code ?? '')) {
    const fallback = await db.rpc('join_couple', { invite_code: normalized });
    check(fallback.error);
    resultData = fallback.data;
  } else {
    check(primary.error);
  }

  if (resultData?.error) {
    throw new Error(String(resultData.error));
  }
  const coupleId = String(resultData?.couple_id || '');
  if (!coupleId) {
    throw new Error('Could not verify invitation code or establish your shared Space.');
  }

  let uid = userId;
  if (!uid) {
    const authUser = await db.auth.getUser();
    uid = authUser.data.user?.id;
  }
  const space = uid ? await readSpace(uid) : undefined;
  return {
    couple_id: coupleId,
    linked: true,
    space,
  };
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
  if (!coupleId) return { id: '', startedOn: '', mode: 'nearby', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, profiles: [profileFrom(profile.data!)], moments: [], plans: [], answers: [], canvas: [], games: [], quizzes: [], messages: [], hasOlderMessages: false, pet: null, petCare: [], featuresReady: false };
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
  ]);
  // Old live spaces remain usable while the additive migration is being deployed.
  results.forEach((result, index) => { if (index >= 8 && index < 11 && ['42P01', 'PGRST205'].includes(result.error?.code ?? '')) return; check(result.error); });
  const [couple, profiles, moments, plans, answers, canvas, games, quizzes, messages, pet, care, history] = results;
  const photoPaths = (moments.data ?? []).filter((row: any) => row.photo_path).map((row: any) => row.photo_path as string);
  const photoUrls = new Map<string, string>();
  if (photoPaths.length) {
    const signed = await db.storage.from('couple-photos').createSignedUrls(photoPaths, 3600); check(signed.error);
    signed.data?.forEach(item => { if (item.path && item.signedUrl) photoUrls.set(item.path, item.signedUrl); });
  }
  return {
    id: coupleId, startedOn: (couple.data as any).started_on, mode: (couple.data as any).mode, timeZone: (couple.data as any).time_zone,
    profiles: (profiles.data ?? []).map(profileFrom),
    moodLogs: (history.data?.entries ?? []).map((entry: any) => ({ authorId: entry.authorId, day: entry.day, mood: entry.mood, note: '', need: '', createdAt: entry.updatedAt })),
    moodStreaks: history.data?.streaks ?? [],
    moments: (moments.data ?? []).map((row: any): Moment => ({ id: row.id, authorId: row.author_id, kind: row.kind, text: row.body, drawing: row.drawing ?? undefined, createdAt: row.created_at, image: photoUrls.get(row.photo_path), storagePath: row.photo_path, hearts: row.reactions?.map((r: any) => r.user_id) ?? [] })),
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
  const cleanBase64 = base64.includes(',') ? base64.slice(base64.indexOf(',') + 1) : base64;
  const bytes = decode(cleanBase64);
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('This photo is too large. Please choose a smaller one.');
  const path = `${coupleId}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const uploaded = await db.storage
    .from('couple-photos')
    .upload(path, bytes, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
  check(uploaded.error);
  const inserted = await db.from('moments').insert({ couple_id: coupleId, author_id: userId, kind: 'photo', body: text, photo_path: path });
  if (inserted.error) { await db.storage.from('couple-photos').remove([path]); check(inserted.error); }
}
