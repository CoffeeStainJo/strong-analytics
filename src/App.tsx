import React, { useEffect, useState, useMemo } from 'react';
import { WorkoutSession, UserSettings } from './types/workout';
import { Header } from './components/layout/Header';
import { TabsNav, TabKey } from './components/layout/TabsNav';
import { MesocycleBanner } from './components/dashboard/MesocycleBanner';
import { StatCardGrid } from './components/dashboard/StatCardGrid';
import { PlateauRadar } from './components/dashboard/PlateauRadar';
import { VolumeChart } from './components/dashboard/VolumeChart';
import { ExerciseSelector } from './components/exercises/ExerciseSelector';
import { ExerciseMetrics } from './components/exercises/ExerciseMetrics';
import { ProgressionChart } from './components/exercises/ProgressionChart';
import { ExerciseHistory } from './components/exercises/ExerciseHistory';
import { SessionList } from './components/sessions/SessionList';
import { SettingsModal } from './components/settings/SettingsModal';
import { parseStrongCsv } from './lib/csvParser';
import { analyzeExercisePlateaus } from './lib/plateauDetector';
import { calculateMesocycleStatus } from './lib/mesocycle';
import { DEMO_STRONG_CSV } from './lib/demoData';
import {
  getAllSessionsFromDB,
  saveSessionsToDB,
  clearAllSessionsFromDB,
  getUserSettingsFromDB,
  saveUserSettingsToDB,
} from './lib/db';
import { UploadCloud, Sparkles, Dumbbell, ShieldAlert } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    plateauThresholdSessions: 3,
    mesocycleWeeks: 6,
  });
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoLoaded, setIsDemoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from IndexedDB on initial mount
  useEffect(() => {
    async function initDB() {
      try {
        const storedSettings = await getUserSettingsFromDB();
        setSettings(storedSettings);

        const storedSessions = await getAllSessionsFromDB();
        if (storedSessions.length > 0) {
          setSessions(storedSessions);
        }
      } catch (err) {
        console.error('Failed to load from IndexedDB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDB();
  }, []);

  // Compute plateau reports
  const plateauReports = useMemo(() => {
    return analyzeExercisePlateaus(sessions, {
      thresholdSessions: settings.plateauThresholdSessions || 3,
      ignoredExercises: settings.ignoredExercises || [],
    });
  }, [sessions, settings.plateauThresholdSessions, settings.ignoredExercises]);


  // Compute mesocycle deload report
  const mesocycleStatus = useMemo(() => {
    return calculateMesocycleStatus(sessions, plateauReports, settings);
  }, [sessions, plateauReports, settings]);

  // Default selected exercise if not set or invalid
  useEffect(() => {
    if (plateauReports.length > 0) {
      const exists = plateauReports.some((r) => r.exerciseName === selectedExercise);
      if (!exists || !selectedExercise) {
        // Default to first plateaued lift, or first lift
        setSelectedExercise(plateauReports[0].exerciseName);
      }
    }
  }, [plateauReports, selectedExercise]);

  // High-level aggregate metrics
  const totalTonnageKg = useMemo(() => {
    return sessions.reduce((sum, s) => sum + s.totalVolume, 0);
  }, [sessions]);

  const stalledLiftsCount = useMemo(() => {
    return plateauReports.filter(
      (r) => r.isActive && (r.status === 'plateaued' || r.status === 'regressing')
    ).length;
  }, [plateauReports]);

  const weeklyFrequency = useMemo(() => {
    if (sessions.length < 2) return sessions.length;
    const start = sessions[0].startTime;
    const end = sessions[sessions.length - 1].startTime;
    const days = Math.max(7, differenceInDays(end, start));
    const weeks = days / 7;
    return sessions.length / weeks;
  }, [sessions]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const parsedSessions = parseStrongCsv(text);
      if (parsedSessions.length === 0) {
        alert('No workout sessions found in CSV. Please ensure it is a valid Strong export.');
        return;
      }
      await saveSessionsToDB(parsedSessions);
      setSessions(parsedSessions);
      setIsDemoLoaded(false);
    } catch (err) {
      console.error('Failed to parse Strong CSV:', err);
      alert('Error parsing Strong CSV file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsLoading(true);
    try {
      const demoSessions = parseStrongCsv(DEMO_STRONG_CSV);
      await saveSessionsToDB(demoSessions);
      setSessions(demoSessions);
      setIsDemoLoaded(true);
    } catch (err) {
      console.error('Failed to load demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all imported workouts?')) {
      await clearAllSessionsFromDB();
      setSessions([]);
      setIsDemoLoaded(false);
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await saveUserSettingsToDB(newSettings);
  };

  const handleToggleIgnoreExercise = async (exerciseName: string) => {
    const current = settings.ignoredExercises || [];
    const isAlreadyIgnored = current.includes(exerciseName);
    const updated = isAlreadyIgnored
      ? current.filter((name) => name !== exerciseName)
      : [...current, exerciseName];

    const newSettings = { ...settings, ignoredExercises: updated };
    setSettings(newSettings);
    await saveUserSettingsToDB(newSettings);
  };

  const handleSelectExerciseFromRadar = (exerciseName: string) => {
    setSelectedExercise(exerciseName);
    setActiveTab('exercises');
  };

  const selectedReport = plateauReports.find(
    (r) => r.exerciseName === selectedExercise
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Header
        onFileUpload={handleFileUpload}
        onLoadDemo={handleLoadDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearData={handleClearData}
        hasData={sessions.length > 0}
        isDemoLoaded={isDemoLoaded}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-400">Loading workout data...</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State / Welcome Dropzone */
          <div className="max-w-2xl mx-auto my-12 text-center">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 shadow-glow-cyan">
                <Dumbbell className="w-10 h-10 text-cyan-400" />
              </div>

              <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight mb-3">
                ANALYZE YOUR STRONG LOGS
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                Discover lift plateaus, calculate true theoretical 1RMs, and automate your 6-week mesocycle deload schedule directly in your browser.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <label className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-brand-bg font-extrabold text-sm transition cursor-pointer shadow-glow-cyan">
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload Strong CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </label>

                <button
                  onClick={handleLoadDemo}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-sm transition shadow-glow-gold"
                >
                  <Sparkles className="w-4 h-4 fill-amber-300" />
                  <span>Explore Demo Dataset (8 Weeks)</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>100% Private & Local: All data stays in your browser's IndexedDB.</span>
              </div>
            </div>
          </div>
        ) : (
          /* Active Workout Explorer */
          <div>
            <TabsNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              plateauCount={stalledLiftsCount}
            />

            {/* TAB 1: DASHBOARD & DELOAD RADAR */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <MesocycleBanner
                  mesocycle={mesocycleStatus}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
                <StatCardGrid
                  totalSessions={sessions.length}
                  stalledLiftsCount={stalledLiftsCount}
                  totalTonnageKg={totalTonnageKg}
                  weeklyFrequency={weeklyFrequency}
                />
                <PlateauRadar
                  plateauReports={plateauReports}
                  onSelectExercise={handleSelectExerciseFromRadar}
                  onToggleIgnore={handleToggleIgnoreExercise}
                />
                <VolumeChart sessions={sessions} />
              </div>
            )}

            {/* TAB 2: EXERCISE DEEP DIVE */}
            {activeTab === 'exercises' && (
              <div>
                <ExerciseSelector
                  plateauReports={plateauReports}
                  selectedExercise={selectedExercise}
                  onSelect={setSelectedExercise}
                />
                {selectedReport && (
                  <>
                    <ExerciseMetrics
                      report={selectedReport}
                      onToggleIgnore={handleToggleIgnoreExercise}
                    />
                    <ProgressionChart report={selectedReport} />
                    <ExerciseHistory
                      exerciseName={selectedReport.exerciseName}
                      sessions={sessions}
                    />
                  </>
                )}
              </div>
            )}


            {/* TAB 3: SESSION LOG */}
            {activeTab === 'sessions' && <SessionList sessions={sessions} />}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};
