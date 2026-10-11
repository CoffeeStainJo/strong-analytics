import React from 'react';
import { LayoutDashboard, TrendingUp, Calendar } from 'lucide-react';

export type TabKey = 'dashboard' | 'exercises' | 'sessions';

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  plateauCount: number;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  activeTab,
  onTabChange,
  plateauCount,
}) => {
  const tabs = [
    {
      key: 'dashboard' as TabKey,
      label: 'Dashboard & Deload Radar',
      icon: LayoutDashboard,
      badge: plateauCount > 0 ? `${plateauCount} Stalled` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      key: 'exercises' as TabKey,
      label: 'Exercise Deep Dive',
      icon: TrendingUp,
    },
    {
      key: 'sessions' as TabKey,
      label: 'Session Log',
      icon: Calendar,
    },
  ];

  return (
    <nav className="flex space-x-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              isActive
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full border ${tab.badgeColor}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
