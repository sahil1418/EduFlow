'use client';
import { useEffect, useState } from 'react';

const PHASES = [
  'INITIALIZING SECURE CONNECTION',
  'LOADING SCHOOL CONFIGURATION',
  'SYNCING CLASSES & ROSTERS',
  'PREPARING EDUFLOW HUB',
];

export function PremiumLoader({ label }: { label?: string }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Three concentric rings — outer spinning, middle dashed counter-spin, core pulse */}
      <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-t-2 border-b-2 border-[var(--color-brand)] animate-spin"
          style={{ animationDuration: '3s', boxShadow: '0 0 30px rgba(79,70,229,0.25)' }}
        />
        <div
          className="absolute w-24 h-24 rounded-full border-l-2 border-r-2 border-dashed border-[var(--color-accent)] animate-spin"
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        <div className="absolute w-12 h-12 rounded-full bg-[var(--color-brand)] blur-[10px] animate-pulse opacity-60" />
        <div
          className="absolute w-8 h-8 rounded-full bg-[var(--color-brand)]"
          style={{ boxShadow: '0 0 30px rgba(79,70,229,0.55)' }}
        />
      </div>

      <h1 className="text-3xl font-bold tracking-[0.2em] text-[var(--color-text)] mb-2 uppercase">
        Edu<span className="text-[var(--color-brand)]">Flow</span>
      </h1>

      <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)] tracking-widest">
        <span className="w-1.5 h-4 bg-[var(--color-accent)] animate-pulse" />
        <p>{label ?? PHASES[phase]}</p>
      </div>
    </div>
  );
}

export default PremiumLoader;
