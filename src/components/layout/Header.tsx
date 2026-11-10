import React, { useRef } from 'react';
import { Moon, Settings, Sun, Upload } from 'lucide-react';
import { Badge, Button } from '../ui/primitives';
import { TabsNav, TabKey } from './TabsNav';

interface HeaderProps {
  onFileUpload: (file: File) => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  hasData: boolean;
  isDemoLoaded?: boolean;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  plateauCount: number;
}

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="8" className="fill-accent" />
    <path
      d="M8 20l5-6 4 4 7-9"
      fill="none"
      className="stroke-accent-fg"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onFileUpload,
  onOpenSettings,
  onToggleTheme,
  isDark,
  hasData,
  isDemoLoaded,
  activeTab,
  onTabChange,
  plateauCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
    // Reset so picking the same file again still fires onChange
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo className="h-7 w-7 shrink-0" />
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-fg">
            Strong Analytics
          </h1>
          {isDemoLoaded && <Badge tone="accent">Demo data</Badge>}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <Button
            variant={hasData ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Import a Strong CSV export (replaces current data)"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 px-0"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light theme' : 'Dark theme'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 px-0"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasData && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <TabsNav activeTab={activeTab} onTabChange={onTabChange} plateauCount={plateauCount} />
        </div>
      )}
    </header>
  );
};
