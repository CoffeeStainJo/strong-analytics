import React from 'react';
import { cn } from '../ui/primitives';

export type TabKey = 'overview' | 'exercises' | 'sessions' | 'records';

export const TAB_KEYS: TabKey[] = ['overview', 'exercises', 'sessions', 'records'];

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  plateauCount: number;
}

const labels: Record<TabKey, string> = {
  overview: 'Overview',
  exercises: 'Exercises',
  sessions: 'Sessions',
  records: 'Records',
};

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange, plateauCount }) => (
  <nav className="-mb-px flex gap-5 overflow-x-auto" aria-label="Sections">
    {TAB_KEYS.map((key) => {
      const isActive = activeTab === key;
      return (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors',
            isActive
              ? 'border-accent text-fg'
              : 'border-transparent text-muted hover:text-fg'
          )}
        >
          {labels[key]}
          {key === 'overview' && plateauCount > 0 && (
            <span
              className="rounded-full bg-warn/15 px-1.5 text-[11px] font-semibold tabular-nums text-warn"
              title={`${plateauCount} active ${plateauCount === 1 ? 'exercise needs' : 'exercises need'} attention`}
            >
              {plateauCount}
            </span>
          )}
        </button>
      );
    })}
  </nav>
);
