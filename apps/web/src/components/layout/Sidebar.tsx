'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, session } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageSquare,
  GraduationCap,
  Wallet,
  Bell,
  Settings,
  BookOpenCheck,
  FileText,
  MessagesSquare,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

const ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/classes',       label: 'Classes',      icon: Users },
  { href: '/attendance',    label: 'Attendance',   icon: CalendarCheck },
  { href: '/feed',          label: 'Class Wall',   icon: MessageSquare },
  { href: '/chat',          label: 'Chat',         icon: MessagesSquare },
  { href: '/assignments',   label: 'Assignments',  icon: ClipboardList },
  { href: '/marks',         label: 'Marks',        icon: BookOpenCheck },
  { href: '/report-cards',  label: 'Report cards', icon: FileText },
  { href: '/timetable',     label: 'Timetable',    icon: GraduationCap },
  { href: '/reports',       label: 'Reports',      icon: BarChart3 },
  { href: '/fees',          label: 'Fees',         icon: Wallet },
  { href: '/notifications', label: 'Inbox',        icon: Bell, badge: true },
];

export function Sidebar({ schoolName }: { schoolName?: string }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ count: number }>('/notifications/unread-count', {
      token: session.token(),
      subdomain: session.subdomain(),
    })
      .then((r) => setUnread(r.count))
      .catch(() => {});
    const t = setInterval(() => {
      api<{ count: number }>('/notifications/unread-count', {
        token: session.token(),
        subdomain: session.subdomain(),
      })
        .then((r) => setUnread(r.count))
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[var(--color-brand)] grid place-items-center text-white font-bold">
            E
          </div>
          <div>
            <div className="font-semibold text-[var(--color-text)] leading-tight">EduFlow</div>
            <div className="text-xs text-[var(--color-text-muted)] truncate max-w-[10rem]">
              {schoolName || 'School portal'}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'}`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              <span className="flex-1">{label}</span>
              {badge && unread > 0 && (
                <span className="text-[10px] font-bold bg-[var(--color-danger)] text-white rounded-full min-w-[18px] h-[18px] grid place-items-center px-1">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname.startsWith('/settings')
              ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
