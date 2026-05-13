'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, session } from '@/lib/api';

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
    <main className="min-h-screen grid place-items-center px-4 py-12 bg-[var(--color-bg)]">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-7 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] grid place-items-center text-white font-bold text-sm">E</div>
          <span className="font-semibold">EduFlow</span>
        </Link>

        <Card>
          <CardHeader title="Welcome back" subtitle="Sign in to your school portal." />
          <CardBody>
            <div className="flex gap-1 p-1 mb-5 bg-[var(--color-surface-muted)] rounded-lg text-sm">
              <button
                type="button"
                onClick={() => { setMode('password'); setOtpRequested(false); setErr(null); }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${mode === 'password' ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}
              >
                Email + Password
              </button>
              <button
                type="button"
                onClick={() => { setMode('otp'); setErr(null); }}
                className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${mode === 'otp' ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}
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
                placeholder={mode === 'password' ? 'admin@school.edu' : '+91…'}
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
                  hint="Check your SMS / email (or terminal in dev)"
                />
              ) : null}

              {err && <div className="text-sm text-[var(--color-danger)]">{err}</div>}

              <Button type="submit" disabled={busy} className="w-full">
                {busy
                  ? 'Working…'
                  : mode === 'password'
                  ? 'Sign in'
                  : otpRequested
                  ? 'Verify code'
                  : 'Send OTP'}
              </Button>
            </form>

            <p className="text-sm text-[var(--color-text-muted)] mt-5 text-center">
              New school? <Link href="/register" className="text-[var(--color-brand)] font-semibold">Register</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
