import React, { useRef } from 'react';
import { UploadCloud, Settings, Trash2, Dumbbell, Sparkles } from 'lucide-react';

interface HeaderProps {
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
  onOpenSettings: () => void;
  onClearData: () => void;
  hasData: boolean;
  isDemoLoaded?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onFileUpload,
  onLoadDemo,
  onOpenSettings,
  onClearData,
  hasData,
  isDemoLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <header className="border-b border-white/10 bg-brand-surface/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand and Pill */}
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow-cyan">
            <Dumbbell className="w-6 h-6 text-brand-bg stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ATHLETE RADAR
              </span>
              {isDemoLoaded && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  DEMO DATASET
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading mt-0.5">
              STRONG <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">INTELLIGENCE</span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition text-sm font-semibold shadow-sm hover:border-cyan-400"
            title="Import Strong CSV"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>

          {!hasData && (
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-bg font-bold transition text-sm shadow-glow-gold"
            >
              <Sparkles className="w-4 h-4 fill-brand-bg" />
              <span>Load Demo Data</span>
            </button>
          )}

          {hasData && (
            <button
              onClick={onClearData}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20 text-sm"
              title="Clear Local Workouts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition border border-white/10 text-sm"
            title="Settings & Mesocycle Anchor"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
