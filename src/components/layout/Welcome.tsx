import React, { useRef } from 'react';
import { Activity, Lock, Target, Trophy, Upload } from 'lucide-react';
import { Button } from '../ui/primitives';

interface WelcomeProps {
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
}

const features = [
  {
    icon: Target,
    title: 'Plateaus and deloads',
    text: 'Spot stalled exercises and see where you are in your mesocycle.',
  },
  {
    icon: Trophy,
    title: 'Personal records',
    text: 'Every e1RM record, rep max and the reps you need for the next one.',
  },
  {
    icon: Activity,
    title: 'Volume and consistency',
    text: 'Weekly tonnage, sets per muscle group and your training streak.',
  },
];

export const Welcome: React.FC<WelcomeProps> = ({ onFileUpload, onLoadDemo }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-3xl animate-fade-up py-10 sm:py-16">
      <p className="eyebrow">Strong workout history</p>
      <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        See what your training log has been trying to tell you.
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        Import the CSV export from the Strong app to find plateaus, track records and plan
        your next deload.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group mt-8 flex w-full flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center transition-colors hover:border-accent"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:-translate-y-0.5">
          <Upload className="h-5 w-5" />
        </span>
        <span className="mt-4 text-[15px] font-medium text-fg">
          Drop your Strong CSV here, or click to browse
        </span>
        <span className="mt-1 text-[13px] text-muted">
          In Strong: Profile → Settings → Export Strong Data
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileUpload(file);
          e.target.value = '';
        }}
      />

      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-1.5 text-[13px] text-muted">
          <Lock className="h-3.5 w-3.5 text-good" />
          Everything stays in your browser. Nothing is uploaded.
        </p>
        <Button variant="secondary" onClick={onLoadDemo}>
          Try it with demo data
        </Button>
      </div>

      <div className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon className="h-4 w-4 text-accent" />
            <h3 className="mt-2.5 text-sm font-medium text-fg">{title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
