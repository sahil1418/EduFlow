import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  'Multi-tenant by subdomain — every school is isolated',
  'Attendance, marks, timetable, fees — all in one portal',
  'Class wall: homework, announcements, comments, reactions',
  'Parent OTP login + automatic absence notifications',
  'Configurable grading scale, exam types, report-card PDF',
  'Bulk CSV import for teachers, students, and marks',
];

export default function Landing() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] grid place-items-center text-white font-bold text-sm">E</div>
            <span className="font-semibold">EduFlow</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="ef-btn ef-btn-ghost">Sign in</Link>
            <Link href="/register" className="ef-btn ef-btn-primary">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="ef-chip ef-chip-brand mb-5">School management, simplified</div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-[var(--color-text)]">
              Run your school from one calm dashboard.
            </h1>
            <p className="mt-4 text-lg text-[var(--color-text-muted)] max-w-xl">
              EduFlow gives every school its own portal — for teachers, students, and parents — with
              attendance, marks, timetable, fees, and a class wall that actually gets used.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="ef-btn ef-btn-primary">
                Create your school <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="ef-btn ef-btn-outline">Sign in</Link>
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-subtle)]">
              No credit card. CBSE / ICSE / State board ready.
            </p>
          </div>

          <div className="ef-card p-6">
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-success)]" />
                  <span className="text-[var(--color-text)]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
