import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { CircleAlert, CircleCheck, Upload, X } from 'lucide-react';
import { WorkoutSession, UserSettings } from './types/workout';
import { Header } from './components/layout/Header';
import { TabKey, TAB_KEYS } from './components/layout/TabsNav';
import { Welcome } from './components/layout/Welcome';
import { MesocycleBanner } from './components/dashboard/MesocycleBanner';
import { StatCardGrid } from './components/dashboard/StatCardGrid';
import { PlateauRadar } from './components/dashboard/PlateauRadar';
import { VolumeChart } from './components/dashboard/VolumeChart';
import { MuscleGroupChart } from './components/dashboard/MuscleGroupChart';
import { ConsistencyHeatmap } from './components/dashboard/ConsistencyHeatmap';
import { RecentRecords } from './components/dashboard/RecentRecords';
import { ExerciseSelector } from './components/exercises/ExerciseSelector';
import { ExerciseMetrics } from './components/exercises/ExerciseMetrics';
import { ProgressionChart } from './components/exercises/ProgressionChart';
import { RepRecords } from './components/exercises/RepRecords';
import { ExerciseHistory } from './components/exercises/ExerciseHistory';
import { SessionList } from './components/sessions/SessionList';
import { RecordsBoard } from './components/records/RecordsBoard';
import { SettingsModal } from './components/settings/SettingsModal';
import { cn } from './components/ui/primitives';
import { parseStrongCsv } from './lib/csvParser';
import { analyzeExercisePlateaus } from './lib/plateauDetector';
import { calculateMesocycleStatus } from './lib/mesocycle';
import { computeRecords, getExerciseHistory } from './lib/records';
import { buildWeeklyStats, calculateStreak, comparePeriods } from './lib/trends';
import { DEMO_STRONG_CSV } from './lib/demoData';
import {
  DatasetMeta,
  DEFAULT_SETTINGS,
  clearAllSessionsFromDB,
  getAllSessionsFromDB,
  getDatasetMetaFromDB,
  getUserSettingsFromDB,
  replaceSessionsInDB,
  saveDatasetMetaToDB,
  saveUserSettingsToDB,
} from './lib/db';

interface Toast {
  kind: 'success' | 'error';
  message: string;
}

function tabFromHash(): TabKey {
  const hash = window.location.hash.replace('#', '') as TabKey;
  return TAB_KEYS.includes(hash) ? hash : 'overview';
}

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [datasetMeta, setDatasetMeta] = useState<DatasetMeta | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>(tabFromHash);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const dragDepth = useRef(0);

  // Hydrate from IndexedDB on initial mount
  useEffect(() => {
    async function initDB() {
      try {
        setSettings(await getUserSettingsFromDB());
        setDatasetMeta(await getDatasetMetaFromDB());
        const storedSessions = await getAllSessionsFromDB();
        if (storedSessions.length > 0) setSessions(storedSessions);
      } catch (err) {
        console.error('Failed to load from IndexedDB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDB();
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), toast.kind === 'error' ? 7000 : 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Keep the active tab in the URL hash so reloads and back/forward work
  const changeTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    if (window.location.hash !== `#${tab}`) {
      window.history.pushState(null, '', `#${tab}`);
    }
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onNavigate = () => setActiveTab(tabFromHash());
    window.addEventListener('popstate', onNavigate);
    window.addEventListener('hashchange', onNavigate);
    return () => {
      window.removeEventListener('popstate', onNavigate);
      window.removeEventListener('hashchange', onNavigate);
    };
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage unavailable (private mode): the choice lasts for this visit only
    }
    setIsDark(next);
  };

  /* ---------- Derived analytics ---------- */

  const plateauReports = useMemo(() => {
    return analyzeExercisePlateaus(sessions, {
      thresholdSessions: settings.plateauThresholdSessions || 3,
      ignoredExercises: settings.ignoredExercises || [],
    });
  }, [sessions, settings.plateauThresholdSessions, settings.ignoredExercises]);

  const mesocycleStatus = useMemo(() => {
    return calculateMesocycleStatus(sessions, plateauReports, settings);
  }, [sessions, plateauReports, settings]);

  const records = useMemo(() => computeRecords(sessions), [sessions]);
  const weekly = useMemo(() => buildWeeklyStats(sessions), [sessions]);
  const streak = useMemo(() => calculateStreak(weekly), [weekly]);
  const tonnageComparison = useMemo(
    () => comparePeriods(weekly, (w) => w.tonnage, 4),
    [weekly]
  );
  const recentTonnageKg = useMemo(
    () => weekly.slice(-4).reduce((sum, w) => sum + w.tonnage, 0),
    [weekly]
  );

  // Default selected exercise if not set or invalid
  useEffect(() => {
    if (plateauReports.length > 0) {
      const exists = plateauReports.some((r) => r.exerciseName === selectedExercise);
      if (!exists || !selectedExercise) {
        setSelectedExercise(plateauReports[0].exerciseName);
      }
    }
  }, [plateauReports, selectedExercise]);

  const totalTonnageKg = useMemo(
    () => sessions.reduce((sum, s) => sum + s.totalVolume, 0),
    [sessions]
  );

  const stalledLiftsCount = useMemo(() => {
    return plateauReports.filter(
      (r) =>
        r.isActive && !r.isIgnored && (r.status === 'plateaued' || r.status === 'regressing')
    ).length;
  }, [plateauReports]);

  const weeklyFrequency = useMemo(() => {
    if (sessions.length < 2) return sessions.length;
    const start = sessions[0].startTime;
    const end = sessions[sessions.length - 1].startTime;
    const days = Math.max(7, differenceInDays(end, start));
    return sessions.length / (days / 7);
  }, [sessions]);

  const selectedReport = plateauReports.find((r) => r.exerciseName === selectedExercise);
  const selectedHistory = useMemo(
    () => (selectedExercise ? getExerciseHistory(sessions, selectedExercise) : []),
    [sessions, selectedExercise]
  );

  /* ---------- Actions ---------- */

  const importSessions = async (parsed: WorkoutSession[], meta: DatasetMeta) => {
    await replaceSessionsInDB(parsed);
    await saveDatasetMetaToDB(meta);
    setSessions(parsed);
    setDatasetMeta(meta);
    setSelectedExercise('');
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsed = parseStrongCsv(await file.text());
      if (parsed.length === 0) {
        setToast({
          kind: 'error',
          message: `No workout sessions found in ${file.name}. Is it a Strong CSV export?`,
        });
        return;
      }
      await importSessions(parsed, {
        isDemo: false,
        importedAt: new Date().toISOString(),
        fileName: file.name,
      });
      setToast({ kind: 'success', message: `Imported ${parsed.length} sessions.` });
    } catch (err) {
      console.error('Failed to parse Strong CSV:', err);
      setToast({ kind: 'error', message: `Could not read ${file.name} as a Strong CSV export.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsLoading(true);
    try {
      await importSessions(parseStrongCsv(DEMO_STRONG_CSV), {
        isDemo: true,
        importedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to load demo data:', err);
      setToast({ kind: 'error', message: 'Could not load the demo data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Remove all imported sessions from this browser? Settings are kept.')) {
      return;
    }
    await clearAllSessionsFromDB();
    await saveDatasetMetaToDB(null);
    setSessions([]);
    setDatasetMeta(null);
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await saveUserSettingsToDB(newSettings);
  };

  const handleToggleIgnoreExercise = async (exerciseName: string) => {
    const current = settings.ignoredExercises || [];
    const updated = current.includes(exerciseName)
      ? current.filter((name) => name !== exerciseName)
      : [...current, exerciseName];
    await handleSaveSettings({ ...settings, ignoredExercises: updated });
  };

  const openExercise = (exerciseName: string) => {
    setSelectedExercise(exerciseName);
    changeTab('exercises');
  };

  /* ---------- Drag and drop import ---------- */

  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files');

  const dragHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileUpload(file);
    },
  };

  const hasData = sessions.length > 0;

  return (
    <div className="flex min-h-screen flex-col" {...dragHandlers}>
      <Header
        onFileUpload={handleFileUpload}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={toggleTheme}
        isDark={isDark}
        hasData={hasData}
        isDemoLoaded={hasData && !!datasetMeta?.isDemo}
        activeTab={activeTab}
        onTabChange={changeTab}
        plateauCount={stalledLiftsCount}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent"
              role="status"
              aria-label="Loading"
            />
          </div>
        ) : !hasData ? (
          <Welcome onFileUpload={handleFileUpload} onLoadDemo={handleLoadDemo} />
        ) : (
          <div key={activeTab} className="animate-fade-up">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <MesocycleBanner
                  mesocycle={mesocycleStatus}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
                <StatCardGrid
                  totalSessions={sessions.length}
                  stalledLiftsCount={stalledLiftsCount}
                  plateauThreshold={settings.plateauThresholdSessions || 3}
                  totalTonnageKg={totalTonnageKg}
                  weeklyFrequency={weeklyFrequency}
                  streak={streak}
                  tonnageComparison={tonnageComparison}
                  recentTonnageKg={recentTonnageKg}
                />
                <div className="grid items-start gap-4 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <PlateauRadar
                      plateauReports={plateauReports}
                      onSelectExercise={openExercise}
                      onToggleIgnore={handleToggleIgnoreExercise}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <RecentRecords
                      events={records.events}
                      onSelectExercise={openExercise}
                      onViewAll={() => changeTab('records')}
                    />
                  </div>
                </div>
                <VolumeChart weekly={weekly} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <MuscleGroupChart weekly={weekly} />
                  <ConsistencyHeatmap sessions={sessions} weeks={Math.min(26, Math.max(12, weekly.length))} />
                </div>
              </div>
            )}

            {activeTab === 'exercises' && (
              <div className="grid items-start gap-4 lg:grid-cols-[17rem_1fr]">
                <ExerciseSelector
                  plateauReports={plateauReports}
                  selectedExercise={selectedExercise}
                  onSelect={setSelectedExercise}
                />
                {selectedReport && (
                  <div className="min-w-0 space-y-4">
                    <ExerciseMetrics
                      report={selectedReport}
                      records={records.byExercise.get(selectedReport.exerciseName)}
                      bodyweightKg={settings.bodyweightKg}
                      onToggleIgnore={handleToggleIgnoreExercise}
                    />
                    <ProgressionChart history={selectedHistory} />
                    {records.byExercise.has(selectedReport.exerciseName) && (
                      <RepRecords
                        records={records.byExercise.get(selectedReport.exerciseName)!}
                        lastTopWeight={selectedReport.lastTopWeight}
                      />
                    )}
                    <ExerciseHistory
                      exerciseName={selectedReport.exerciseName}
                      history={selectedHistory}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <SessionList
                sessions={sessions}
                recordsBySession={records.eventsBySession}
                onSelectExercise={openExercise}
              />
            )}

            {activeTab === 'records' && (
              <RecordsBoard records={records} onSelectExercise={openExercise} />
            )}
          </div>
        )}
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-6 text-xs text-faint sm:px-6">
        Your data stays in this browser. Nothing is uploaded.
      </footer>

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={handleSaveSettings}
          sessionsCount={sessions.length}
          datasetMeta={datasetMeta}
          onClearData={handleClearData}
        />
      )}

      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-accent bg-surface px-10 py-12 text-center shadow-pop">
            <Upload className="h-7 w-7 text-accent" />
            <p className="mt-3 text-[15px] font-medium text-fg">Drop your Strong CSV to import</p>
            {hasData && (
              <p className="mt-1 text-[13px] text-muted">This replaces the current data.</p>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-fade-up items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 shadow-pop"
        >
          {toast.kind === 'success' ? (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-good" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          )}
          <p className={cn('flex-1 text-[13px] leading-relaxed text-fg')}>{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="text-faint transition-colors hover:text-fg"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
