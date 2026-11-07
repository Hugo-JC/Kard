import type {Metadata} from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kard — Task & Productivity SaaS Dashboard',
  description: 'Modern, minimalist task management dashboard featuring interactive bento grid, time tracking, calendar, and team workflows.',
  openGraph: {
    title: 'Kard — Task & Productivity SaaS Dashboard',
    description: 'Modern, minimalist task management dashboard featuring interactive bento grid, time tracking, calendar, and team workflows.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kard — Task & Productivity SaaS Dashboard',
    description: 'Modern, minimalist task management dashboard featuring interactive bento grid, time tracking, calendar, and team workflows.',
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('kard-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-500 min-h-screen" suppressHydrationWarning>
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
