'use client';
import { Bell, Search, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { session } from '@/lib/api';

export function TopBar({ title }: { title: string }) {
  const router = useRouter();
  const user = session.user();

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur">
      <div className="flex items-center gap-4 px-6 h-14">
        <h1 className="text-base font-semibold text-[var(--color-text)]">{title}</h1>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] text-sm text-[var(--color-text-muted)] w-72">
            <Search className="h-4 w-4" />
            <input
              placeholder="Search students, classes, posts…"
              className="bg-transparent outline-none flex-1 placeholder:text-[var(--color-text-subtle)]"
            />
          </div>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-[var(--color-surface-muted)]">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
            <div className="h-8 w-8 rounded-full bg-[var(--color-brand-soft)] grid place-items-center text-[var(--color-brand)] font-semibold text-sm">
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-medium text-[var(--color-text)]">{user?.name ?? 'Guest'}</div>
              <div className="text-xs text-[var(--color-text-muted)] capitalize">
                {user?.role?.toLowerCase().replace('_', ' ') ?? '—'}
              </div>
            </div>
            <button
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--color-surface-muted)]"
              title="Sign out"
              onClick={() => {
                session.clear();
                router.push('/login');
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
