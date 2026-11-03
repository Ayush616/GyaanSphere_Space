import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Owner Dashboard | GyaanSphere Space',
  description: 'Manage members, plans, seating, cash flow, and library performance from the owner dashboard.',
};

export default function OwnerDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
