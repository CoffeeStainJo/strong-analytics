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
  return (
    settings || {
      plateauThresholdSessions: 3,
      mesocycleWeeks: 6,
    }
  );
}

export async function saveUserSettingsToDB(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'user_settings');
}
