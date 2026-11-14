import type {Metadata} from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kard — Task & Productivity SaaS Dashboard',
  icons: {
    icon: [
      {
        url: '/logo_light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo_dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
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
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-500 min-h-screen" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('kard-theme');if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(_){}`,
          }}
        />
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
