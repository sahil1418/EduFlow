import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduFlow — School Management',
  description: 'Run your school: attendance, marks, class wall, fees, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
