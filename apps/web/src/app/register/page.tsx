'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { api, session } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    schoolName: '',
    subdomain: '',
    board: 'CBSE',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await api<{ accessToken: string; school: any }>('/auth/register-school', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      session.set(res.accessToken, { name: form.adminName, role: 'SUPER_ADMIN' }, form.subdomain);
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-12">
      <div className="w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-7 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-brand)] grid place-items-center text-white font-bold text-sm">E</div>
          <span className="font-semibold">EduFlow</span>
        </Link>

        <Card>
          <CardHeader title="Create your school" subtitle="Phase 1: you’ll be the principal / super admin." />
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="School name" value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} required />
                <Input
                  label="Subdomain"
                  value={form.subdomain}
                  onChange={(e) => set('subdomain', e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase())}
                  required
                  hint="Lowercase, no spaces — e.g. springfield"
                />
              </div>
              <Select label="Board" value={form.board} onChange={(e) => set('board', e.target.value)}>
                <option>CBSE</option>
                <option>ICSE</option>
                <option>STATE</option>
                <option>IB</option>
                <option>OTHER</option>
              </Select>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <div className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-subtle)] mb-3">
                  Admin account
                </div>
                <div className="space-y-4">
                  <Input label="Full name" value={form.adminName} onChange={(e) => set('adminName', e.target.value)} required />
                  <Input label="Email" type="email" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} required />
                  <Input label="Password" type="password" value={form.adminPassword} onChange={(e) => set('adminPassword', e.target.value)} required minLength={6} />
                </div>
              </div>

              {err && <div className="text-sm text-[var(--color-danger)]">{err}</div>}
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? 'Creating…' : 'Create school'}
              </Button>
            </form>

            <p className="text-sm text-[var(--color-text-muted)] mt-5 text-center">
              Already have an account? <Link href="/login" className="text-[var(--color-brand)] font-semibold">Sign in</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
