import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Register Library | GyaanSphere Space',
  description: 'List your library on GyaanSphere and start managing members, seat layouts, and payments in one place.',
};

export default function RegisterLibraryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
