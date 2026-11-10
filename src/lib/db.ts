import { openDB, DBSchema } from 'idb';
import { UserSettings, WorkoutSession } from '../types/workout';

interface StrongDB extends DBSchema {
  sessions: {
    key: string;
    value: WorkoutSession;
    indexes: { 'by-date': Date };
  };
  settings: {
    key: string;
    value: any;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  plateauThresholdSessions: 3,
  mesocycleWeeks: 6,
};

/** Describes where the currently stored workout history came from. */
export interface DatasetMeta {
  isDemo: boolean;
  importedAt: string;
  fileName?: string;
}

const DB_NAME = 'StrongWorkoutIntelligenceDB';
const DB_VERSION = 1;

async function getDB() {
  return openDB<StrongDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by-date', 'startTime');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

export async function saveSessionsToDB(sessions: WorkoutSession[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sessions', 'readwrite');
  for (const session of sessions) {
    await tx.store.put(session);
  }
  await tx.done;
}

/**
 * Replaces the stored workout history with a new import. A Strong export always
 * contains the full history, so leftovers from a previous import (e.g. the demo
 * dataset) must not survive alongside it.
 */
export async function replaceSessionsInDB(sessions: WorkoutSession[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sessions', 'readwrite');
  await tx.store.clear();
  for (const session of sessions) {
    await tx.store.put(session);
  }
  await tx.done;
}

export async function getAllSessionsFromDB(): Promise<WorkoutSession[]> {
  const db = await getDB();
  const rawSessions = await db.getAllFromIndex('sessions', 'by-date');
  // Rehydrate Date objects
  return rawSessions.map((s) => ({
    ...s,
    startTime: new Date(s.startTime),
  }));
}

export async function clearAllSessionsFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('sessions');
}

export async function getUserSettingsFromDB(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user_settings');
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

export async function saveUserSettingsToDB(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'user_settings');
}

export async function getDatasetMetaFromDB(): Promise<DatasetMeta | null> {
  const db = await getDB();
  return (await db.get('settings', 'dataset_meta')) || null;
}

export async function saveDatasetMetaToDB(meta: DatasetMeta | null): Promise<void> {
  const db = await getDB();
  if (meta) await db.put('settings', meta, 'dataset_meta');
  else await db.delete('settings', 'dataset_meta');
}
