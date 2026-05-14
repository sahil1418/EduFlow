'use client';
import { RolePortalShell } from '@/components/layout/RolePortalShell';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <RolePortalShell role="PARENT">{children}</RolePortalShell>;
}
