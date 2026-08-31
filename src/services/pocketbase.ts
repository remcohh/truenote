import PocketBase, { LocalAuthStore } from 'pocketbase';
import type { AuthRecord } from 'pocketbase';
import type { PracticeSession, Exercise, UserProfile } from '../types';

const DEFAULT_POCKETBASE_URL = 'http://127.0.0.1:8090';

// PocketBase's default localStorage key ("pocketbase_auth") is shared by every app on
// the same origin — on a shared dev port (e.g. localhost:5173), an unrelated project's
// login can silently leak into this one's authStore. Namespace it so truenote never
// reads or writes another app's session.
const AUTH_STORAGE_KEY = 'truenote_pb_auth';

let pbInstance: PocketBase | null = null;
let currentPbUrl = localStorage.getItem('truenote_pb_url') || DEFAULT_POCKETBASE_URL;

export function getPocketBaseClient(): PocketBase {
  if (!pbInstance) {
    pbInstance = new PocketBase(currentPbUrl, new LocalAuthStore(AUTH_STORAGE_KEY));
    // Disable auto-cancellation to avoid aborted requests in rapid UI changes
    pbInstance.autoCancellation(false);
  }
  return pbInstance;
}

export function updatePocketBaseUrl(url: string): PocketBase {
  currentPbUrl = url;
  localStorage.setItem('truenote_pb_url', url);
  pbInstance = new PocketBase(url, new LocalAuthStore(AUTH_STORAGE_KEY));
  pbInstance.autoCancellation(false);
  return pbInstance;
}

export function getPocketBaseUrl(): string {
  return currentPbUrl;
}

// Check PocketBase server status
export async function testPocketBaseConnection(url?: string): Promise<boolean> {
  const targetUrl = url || currentPbUrl;
  try {
    const testPb = new PocketBase(targetUrl);
    await testPb.health.check();
    return true;
  } catch (err) {
    console.warn('PocketBase connection check failed:', err);
    return false;
  }
}

// Authentication Helpers
function recordToUserProfile(record: AuthRecord): UserProfile | null {
  if (!record) return null;
  const pb = getPocketBaseClient();
  return {
    id: record.id,
    email: record.email || '',
    name: record.name || record.username || 'Musician',
    avatar: record.avatar ? pb.getFileUrl(record, record.avatar) : undefined,
  };
}

/** Current logged-in user, if any. Reflects the auth state PocketBase already persisted to localStorage. */
export function getCurrentUser(): UserProfile | null {
  const pb = getPocketBaseClient();
  return pb.authStore.isValid ? recordToUserProfile(pb.authStore.record) : null;
}

/** Subscribes to auth state changes (login/logout/token refresh). Returns an unsubscribe function. */
export function onAuthChange(callback: (user: UserProfile | null) => void): () => void {
  const pb = getPocketBaseClient();
  return pb.authStore.onChange((_token, record) => callback(recordToUserProfile(record)), true);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const pb = getPocketBaseClient();
  const authData = await pb.collection('users').authWithPassword(email, pass);
  return recordToUserProfile(authData.record)!;
}

export async function registerUser(email: string, pass: string, name: string): Promise<UserProfile> {
  const pb = getPocketBaseClient();
  const userData = {
    email,
    password: pass,
    passwordConfirm: pass,
    name,
  };
  await pb.collection('users').create(userData);
  return loginWithEmail(email, pass);
}

export function logoutUser(): void {
  const pb = getPocketBaseClient();
  pb.authStore.clear();
}

function toPracticeLogPayload(session: Omit<PracticeSession, 'id' | 'syncedToPocketBase'>, userId?: string) {
  return {
    user: userId,
    exercise_id: session.exerciseId,
    exercise_title: session.exerciseTitle,
    bpm: session.bpm,
    duration_seconds: session.durationSeconds,
    score: session.score,
    timestamp: session.timestamp,
  };
}

// Practice Sessions CRUD with Offline Fallback
export async function savePracticeSession(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
  const pb = getPocketBaseClient();
  const isConnected = await testPocketBaseConnection();

  const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const sessionData: PracticeSession = {
    ...session,
    id: newId,
    syncedToPocketBase: isConnected && pb.authStore.isValid,
  };

  // Always save locally to ensure zero data loss
  const localSessions = getLocalPracticeSessions();
  localSessions.unshift(sessionData);
  localStorage.setItem('truenote_practice_logs', JSON.stringify(localSessions));

  // Try to sync with PocketBase collection 'practice_logs'
  if (isConnected && pb.authStore.isValid) {
    try {
      const record = await pb.collection('practice_logs').create(toPracticeLogPayload(session, pb.authStore.record?.id));
      sessionData.id = record.id;
      sessionData.syncedToPocketBase = true;
    } catch (err) {
      console.warn('PocketBase sync failed, saved locally:', err);
    }
  }

  return sessionData;
}

export function getLocalPracticeSessions(): PracticeSession[] {
  try {
    const raw = localStorage.getItem('truenote_practice_logs');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse local practice logs:', err);
    return [];
  }
}

export async function fetchPracticeSessions(): Promise<PracticeSession[]> {
  const pb = getPocketBaseClient();
  const isConnected = await testPocketBaseConnection();

  if (isConnected && pb.authStore.isValid) {
    try {
      const records = await pb.collection('practice_logs').getFullList({
        sort: '-created',
      });
      const remoteSessions: PracticeSession[] = records.map((rec: any) => ({
        id: rec.id,
        exerciseId: rec.exercise_id || '',
        exerciseTitle: rec.exercise_title || 'Exercise',
        bpm: rec.bpm || 120,
        durationSeconds: rec.duration_seconds || 0,
        score: rec.score || 0,
        timestamp: rec.timestamp || rec.created,
        syncedToPocketBase: true,
      }));
      // Merge with local fallback
      return remoteSessions;
    } catch (err) {
      console.warn('Failed to fetch practice logs from PocketBase, returning local:', err);
    }
  }

  return getLocalPracticeSessions();
}

// Sync unsynced local practice logs to PocketBase
export async function syncOfflineSessions(): Promise<number> {
  const pb = getPocketBaseClient();
  const isConnected = await testPocketBaseConnection();

  if (!isConnected || !pb.authStore.isValid) return 0;

  const localSessions = getLocalPracticeSessions();
  let syncedCount = 0;

  const updatedSessions = await Promise.all(
    localSessions.map(async (session) => {
      if (!session.syncedToPocketBase) {
        try {
          const rec = await pb.collection('practice_logs').create(toPracticeLogPayload(session, pb.authStore.record?.id));
          syncedCount++;
          return { ...session, id: rec.id, syncedToPocketBase: true };
        } catch (err) {
          console.warn('Failed sync for session:', session.id, err);
        }
      }
      return session;
    })
  );

  localStorage.setItem('truenote_practice_logs', JSON.stringify(updatedSessions));
  return syncedCount;
}

// Custom Exercises handling
export function getLocalCustomExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem('truenote_custom_exercises');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveLocalCustomExercise(exercise: Omit<Exercise, 'id'>): Exercise {
  const customList = getLocalCustomExercises();
  const newEx: Exercise = {
    ...exercise,
    id: 'custom_' + Date.now(),
    isCustom: true,
  };
  customList.push(newEx);
  localStorage.setItem('truenote_custom_exercises', JSON.stringify(customList));
  return newEx;
}
