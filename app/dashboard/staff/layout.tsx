import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Staff Dashboard | GyaanSphere Space',
  description: 'Track daily attendance, member operations, payments, and seat activity from the staff dashboard.',
};

export default function StaffDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
