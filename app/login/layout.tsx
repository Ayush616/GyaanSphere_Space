import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Login | GyaanSphere Space',
  description: 'Sign in to your GyaanSphere library dashboard to manage members, seats, and revenue.',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
