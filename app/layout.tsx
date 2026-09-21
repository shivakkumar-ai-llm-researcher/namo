import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'Srivari Community Fund | Namo',
  description: 'Tirupati Balaji Devotees Financial Seva & Accounting — Namo Community Fund Management',
  keywords: 'community fund, Balaji, Tirupati, Srivari, Purattasi, Gokulaashdami',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
