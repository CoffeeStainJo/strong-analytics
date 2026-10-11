import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ExercisePlateauReport } from '../../types/workout';

interface ProgressionChartProps {
  report: ExercisePlateauReport;
}

export const ProgressionChart: React.FC<ProgressionChartProps> = ({ report }) => {
  const chartData = report.historySummary.map((item) => ({
    date: item.date,
    e1RM: item.e1RM,
    topWeight: item.weight,
    reps: item.reps,
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 mb-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight font-heading">
            STRENGTH PROGRESSION CURVE
          </h3>
          <p className="text-xs text-slate-400">
            Estimated 1RM vs Top Working Weight across sessions
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-slate-300">Estimated 1RM</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
            <span className="text-slate-300">Top Weight</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(val) => `${val}kg`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-brand-surface/95 border border-white/20 p-3.5 rounded-xl shadow-xl backdrop-blur-md">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                        {label}
                      </div>
                      <div className="text-sm font-semibold text-white">
                        e1RM:{' '}
                        <span className="font-extrabold text-cyan-400">{data.e1RM} kg</span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Top Set:{' '}
                        <span className="font-extrabold text-emerald-400">
                          {data.topWeight} kg × {data.reps} reps
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              name="Estimated 1RM (kg)"
              type="monotone"
              dataKey="e1RM"
              stroke="#00f2fe"
              strokeWidth={3}
              dot={{ r: 4, fill: '#00f2fe', stroke: '#070b16', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#00f2fe', stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              name="Top Set Weight (kg)"
              type="monotone"
              dataKey="topWeight"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
