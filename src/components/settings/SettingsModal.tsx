import React, { useEffect, useState } from 'react';
import { addDays, format, isValid, parseISO, startOfWeek } from 'date-fns';
import { X } from 'lucide-react';
import { UserSettings } from '../../types/workout';
import { DatasetMeta } from '../../lib/db';
import { Button } from '../ui/primitives';

interface SettingsModalProps {
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
  sessionsCount: number;
  datasetMeta: DatasetMeta | null;
  onClearData: () => void;
}

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

const Field: React.FC<{
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-fg">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>}
  </div>
);

/**
 * Rendered only while open, so its form state always starts from the latest
 * saved settings.
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  settings,
  onSave,
  sessionsCount,
  datasetMeta,
  onClearData,
}) => {
  const [mesocycleWeeks, setMesocycleWeeks] = useState(String(settings.mesocycleWeeks || 6));
  const [plateauThreshold, setPlateauThreshold] = useState(
    String(settings.plateauThresholdSessions || 3)
  );
  const [lastDeloadDate, setLastDeloadDate] = useState(settings.lastDeloadDate || '');
  const [bodyweight, setBodyweight] = useState(
    settings.bodyweightKg ? settings.bodyweightKg.toString() : ''
  );
  const [ignored, setIgnored] = useState<string[]>(settings.ignoredExercises || []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBodyweight = parseFloat(bodyweight.replace(',', '.'));
    onSave({
      // Keep any settings this form does not edit
      ...settings,
      mesocycleWeeks: clamp(Number(mesocycleWeeks), 3, 12, 6),
      plateauThresholdSessions: clamp(Number(plateauThreshold), 2, 6, 3),
      lastDeloadDate: lastDeloadDate || undefined,
      bodyweightKg: parsedBodyweight > 0 ? parsedBodyweight : undefined,
      ignoredExercises: ignored,
    });
    onClose();
  };

  const deloadParsed = lastDeloadDate ? parseISO(lastDeloadDate) : null;
  const nextBlockStart =
    deloadParsed && isValid(deloadParsed)
      ? addDays(startOfWeek(deloadParsed, { weekStartsOn: 1 }), 7)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="flex max-h-[92vh] w-full max-w-lg animate-fade-up flex-col rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 id="settings-title" className="text-[15px] font-semibold text-fg">
            Settings
          </h3>
          <Button variant="ghost" size="sm" className="w-8 px-0" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <section className="space-y-4">
              <h4 className="eyebrow">Mesocycle</h4>
              <Field
                label="Last deload week"
                htmlFor="last-deload"
                hint={
                  nextBlockStart ? (
                    <>
                      Your current block is counted from{' '}
                      <span className="text-fg">{format(nextBlockStart, 'EEEE, MMM d, yyyy')}</span>
                      , the Monday after that week.
                    </>
                  ) : (
                    'Pick any day in your most recent deload week. Leave empty to detect it from sessions named or noted "deload".'
                  )
                }
              >
                <div className="flex gap-2">
                  <input
                    id="last-deload"
                    type="date"
                    value={lastDeloadDate}
                    onChange={(e) => setLastDeloadDate(e.target.value)}
                    className="input"
                  />
                  {lastDeloadDate && (
                    <Button variant="ghost" onClick={() => setLastDeloadDate('')}>
                      Auto-detect
                    </Button>
                  )}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Mesocycle length"
                  htmlFor="meso-weeks"
                  hint="Weeks per block, 3–12. The last week is the deload."
                >
                  <input
                    id="meso-weeks"
                    type="number"
                    min={3}
                    max={12}
                    value={mesocycleWeeks}
                    onChange={(e) => setMesocycleWeeks(e.target.value)}
                    className="input"
                  />
                </Field>
                <Field
                  label="Plateau threshold"
                  htmlFor="plateau-threshold"
                  hint="Sessions with a flat e1RM before an exercise is flagged, 2–6."
                >
                  <input
                    id="plateau-threshold"
                    type="number"
                    min={2}
                    max={6}
                    value={plateauThreshold}
                    onChange={(e) => setPlateauThreshold(e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="eyebrow">Athlete</h4>
              <Field
                label="Bodyweight (kg)"
                htmlFor="bodyweight"
                hint="Optional. Shows your e1RM as a multiple of bodyweight on each exercise."
              >
                <input
                  id="bodyweight"
                  type="number"
                  step="0.1"
                  min={0}
                  placeholder="e.g. 82.5"
                  value={bodyweight}
                  onChange={(e) => setBodyweight(e.target.value)}
                  className="input"
                />
              </Field>
            </section>

            {ignored.length > 0 && (
              <section className="space-y-2">
                <h4 className="eyebrow">Ignored exercises</h4>
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {ignored.map((name) => (
                    <li key={name} className="flex items-center justify-between gap-3 px-3 py-1.5">
                      <span className="truncate text-[13px] text-fg">{name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIgnored(ignored.filter((n) => n !== name))}
                      >
                        Restore
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-2">
              <h4 className="eyebrow">Data</h4>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-line px-3 py-2.5">
                <p className="min-w-0 text-[13px] text-muted">
                  {sessionsCount === 0 ? (
                    'No workout history stored.'
                  ) : (
                    <>
                      <span className="text-fg">{sessionsCount} sessions</span> stored in this
                      browser
                      {datasetMeta?.isDemo
                        ? ' (demo data)'
                        : datasetMeta?.fileName
                        ? ` from ${datasetMeta.fileName}`
                        : ''}
                      .
                    </>
                  )}
                </p>
                {sessionsCount > 0 && (
                  <Button variant="danger" size="sm" onClick={onClearData}>
                    Clear data
                  </Button>
                )}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
