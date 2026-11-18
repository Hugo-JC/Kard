import type {Metadata} from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FirebaseProvider } from '@/components/auth/FirebaseProvider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kard — Gestão de tarefas e produtividade',
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
  description: 'Plataforma de gestão de tarefas, projetos, tempo e produtividade para equipas.',
  openGraph: {
    title: 'Kard — Gestão de tarefas e produtividade',
    description: 'Plataforma de gestão de tarefas, projetos, tempo e produtividade para equipas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kard — Gestão de tarefas e produtividade',
    description: 'Plataforma de gestão de tarefas, projetos, tempo e produtividade para equipas.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-500 min-h-screen" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('kard-theme');if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(_){}`,
          }}
        />
        <ThemeProvider defaultTheme="light">
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
