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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased bg-[#F3F4F8] text-slate-800 selection:bg-blue-100 selection:text-blue-900 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
