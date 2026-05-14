import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  BookOpenCheck,
  MessagesSquare,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Users,
} from 'lucide-react';

const FEATURES = [
  { icon: Shield,         label: 'Multi-tenant — every school its own portal' },
  { icon: BookOpenCheck,  label: 'Attendance · Marks · Timetable · Fees in one place' },
  { icon: MessagesSquare, label: 'Class wall + real-time chat for teachers, students, parents' },
  { icon: BarChart3,      label: 'Reports & analytics — at-risk students flagged automatically' },
];

const PORTALS = [
  { href: '/login/principal', label: 'Principal', icon: ShieldAlert,    accent: '#dc2626', chipClass: 'ef-role-admin'   },
  { href: '/login/teacher',   label: 'Teacher',   icon: Shield,         accent: '#d97706', chipClass: 'ef-role-teacher' },
  { href: '/login/student',   label: 'Student',   icon: GraduationCap,  accent: '#2563eb', chipClass: 'ef-role-student' },
  { href: '/login/parent',    label: 'Parent',    icon: Users,          accent: '#0d9488', chipClass: 'ef-role-parent'  },
];

export default function Landing() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(79,70,229,0.25), transparent)' }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[26rem] h-[26rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(20,184,166,0.20), transparent)' }} />

      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center text-white font-bold"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)',
                boxShadow: '0 6px 20px rgba(79,70,229,0.35)',
              }}
            >E</div>
            <span className="font-bold tracking-tight">EduFlow</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="ef-btn ef-btn-ghost">Sign in</Link>
            <Link href="/register" className="ef-btn ef-btn-primary">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="ef-chip ef-chip-brand mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-current" /> School management, simplified
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[var(--color-text)]">
              Run your school from{' '}
              <span style={{
                background: 'linear-gradient(90deg, #4f46e5, #14b8a6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>one calm hub.</span>
            </h1>
            <p className="mt-5 text-lg text-[var(--color-text-muted)] max-w-xl leading-relaxed">
              EduFlow gives every school its own portal — for teachers, students, and parents — with
              attendance, marks, timetable, fees, and a class wall that actually gets used.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="ef-btn ef-btn-primary">
                Create your school <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="ef-btn ef-btn-outline">Sign in</Link>
            </div>
            <p className="mt-3 ef-eyebrow">No credit card · CBSE / ICSE / State board ready</p>

            {/* Role-tagged portal entry */}
            <div className="mt-10">
              <div className="ef-eyebrow mb-3">Sign in by role</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PORTALS.map(({ href, label, icon: Icon, accent, chipClass }) => (
                  <Link
                    key={href}
                    href={href}
                    className="ef-card flex flex-col items-center gap-1.5 py-3 group hover:border-[var(--color-brand)]/40 transition-all"
                  >
                    <span
                      className="h-9 w-9 rounded-xl grid place-items-center"
                      style={{ background: `${accent}14`, boxShadow: `0 0 18px ${accent}22` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2.2} />
                    </span>
                    <span className={`ef-chip ${chipClass}`}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="ef-card p-7 relative">
            <div className="absolute -top-px left-8 right-8 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.6), transparent)' }} />
            <div className="ef-eyebrow mb-4">What you get</div>
            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3 text-sm">
                  <span className="h-9 w-9 rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)] grid place-items-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[var(--color-text)] leading-snug pt-1.5">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
