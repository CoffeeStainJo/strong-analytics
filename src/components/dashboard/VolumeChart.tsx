import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { WorkoutSession } from '../../types/workout';
import { formatKg } from '../../lib/metrics';

interface VolumeChartProps {
  sessions: WorkoutSession[];
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ sessions }) => {
  // Aggregate volume by week or by session chronologically
  const chartData = sessions.map((session) => ({
    date: session.dateStr,
    name: session.name,
    volume: session.totalVolume,
    duration: session.durationSeconds / 60,
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 mt-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight font-heading">
            TRAINING VOLUME & WORKLOAD
          </h3>
          <p className="text-xs text-slate-400">
            Session tonnage trend across historical workouts
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          TONNAGE (KG)
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-brand-surface/95 border border-white/20 p-3 rounded-xl shadow-xl backdrop-blur-md">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        {label} • {data.name}
                      </div>
                      <div className="text-lg font-extrabold text-white mt-1">
                        {formatKg(data.volume)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Duration: {Math.round(data.duration)} mins
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#00f2fe"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#cyanVolumeGradient)"
              activeDot={{ r: 6, fill: '#00f2fe', stroke: '#070b16', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
