import React, { useState } from 'react';
import { UserSettings } from '../../types/workout';
import { X, Save, Sliders, Scale, CalendarCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [mesocycleWeeks, setMesocycleWeeks] = useState(settings.mesocycleWeeks || 6);
  const [plateauThreshold, setPlateauThreshold] = useState(
    settings.plateauThresholdSessions || 3
  );
  const [lastDeloadDate, setLastDeloadDate] = useState(settings.lastDeloadDate || '');
  const [bodyweight, setBodyweight] = useState<string>(
    settings.bodyweightKg ? settings.bodyweightKg.toString() : ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      mesocycleWeeks: Number(mesocycleWeeks),
      plateauThresholdSessions: Number(plateauThreshold),
      lastDeloadDate: lastDeloadDate || undefined,
      bodyweightKg: bodyweight ? parseFloat(bodyweight) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-white/20 p-6 sm:p-7 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-heading">
              SETTINGS & DELOAD CADENCE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Last Deload Week */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Last Deload Week</span>
              </label>
              {lastDeloadDate && (
                <button
                  type="button"
                  onClick={() => setLastDeloadDate('')}
                  className="text-[10px] text-slate-400 hover:text-white transition underline"
                >
                  Clear (Auto-Detect)
                </button>
              )}
            </div>
            <input
              type="date"
              value={lastDeloadDate}
              onChange={(e) => setLastDeloadDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-amber-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-amber-200/80 mt-1.5 leading-relaxed">
              Pick any date in your last deload week (e.g. <strong>2026-09-07</strong> to <strong>2026-09-13</strong>). Your new 6-week training block automatically starts on Monday, Sep 14.
            </p>
          </div>

          {/* Mesocycle Length */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Mesocycle Length (Weeks)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="3"
                max="12"
                value={mesocycleWeeks}
                onChange={(e) => setMesocycleWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">Weeks per block</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Standard interval before systemic deload triggers (default: 6 weeks).
            </p>
          </div>

          {/* Plateau Threshold */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Plateau Detection Sensitivity
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="2"
                max="6"
                value={plateauThreshold}
                onChange={(e) => setPlateauThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">Stagnant sessions</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Consecutive sessions with flat e1RM before an exercise is flagged (default: 3).
            </p>
          </div>

          {/* Bodyweight */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Athlete Bodyweight (kg) - Optional
            </label>
            <div className="relative">
              <Scale className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 82.5"
                value={bodyweight}
                onChange={(e) => setBodyweight(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used to supplement volume calculations for bodyweight movements (Pull-ups, Dips).
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-brand-bg hover:bg-cyan-400 transition shadow-glow-cyan"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
