'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, session } from '@/lib/api';
import { ArrowRight } from 'lucide-react';

type Mode = 'password' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('password');
  const [subdomain, setSubdomain] = useState('springfield');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === 'password') {
        const res = await api<{ accessToken: string; user: any }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ subdomain, email: identifier, password }),
        });
        session.set(res.accessToken, res.user, subdomain);
      } else if (!otpRequested) {
        await api('/auth/otp/request', {
          method: 'POST',
          body: JSON.stringify({ subdomain, identifier }),
        });
        setOtpRequested(true);
        setBusy(false);
        return;
      } else {
        const res = await api<{ accessToken: string; user: any }>('/auth/otp/verify', {
          method: 'POST',
          body: JSON.stringify({ subdomain, identifier, code }),
        });
        session.set(res.accessToken, res.user, subdomain);
      }
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(79,70,229,0.22), transparent)' }} />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[26rem] h-[26rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(20,184,166,0.20), transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-7 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <div
            className="h-9 w-9 rounded-xl grid place-items-center text-white font-bold"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #14b8a6 100%)',
              boxShadow: '0 6px 20px rgba(79,70,229,0.35)',
            }}
          >E</div>
          <span className="font-bold tracking-tight text-[var(--color-text)]">EduFlow</span>
        </Link>

        <Card variant="solid" className="p-7">
          <div className="ef-eyebrow mb-2">Sign in</div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Sign in to your school portal.
          </p>

          <div className="flex gap-1 p-1 mt-5 mb-5 bg-[var(--color-surface-muted)] rounded-xl text-sm">
            <button
              type="button"
              onClick={() => { setMode('password'); setOtpRequested(false); setErr(null); }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${mode === 'password' ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}
            >
              Email + Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setErr(null); }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${mode === 'otp' ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}
            >
              OTP (parents)
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="School subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="springfield"
              required
              hint="The part before .eduflow.app"
            />
            <Input
              label={mode === 'password' ? 'Email' : 'Phone or email'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === 'password' ? 'admin@school.edu' : '+91… or you@school.edu'}
              required
            />
            {mode === 'password' ? (
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            ) : otpRequested ? (
              <Input
                label="6-digit code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                hint="Check your email (or SMS in dev)"
              />
            ) : null}

            {err && (
              <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/8 border border-[var(--color-danger)]/15 rounded-xl px-3 py-2">
                {err}
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              {busy
                ? 'Working…'
                : mode === 'password'
                ? <>Sign in <ArrowRight className="h-4 w-4" /></>
                : otpRequested
                ? <>Verify code <ArrowRight className="h-4 w-4" /></>
                : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              New school? <Link href="/register" className="text-[var(--color-brand)] font-semibold hover:underline">Register</Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
