'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { session } from '@/lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [schoolName, setSchoolName] = useState<string | undefined>();

  useEffect(() => {
    if (!session.token()) {
      router.replace('/login');
      return;
    }
    setSchoolName(session.subdomain() ?? undefined);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center text-[var(--color-text-muted)] text-sm">
        Loading…
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      <Sidebar schoolName={schoolName} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
