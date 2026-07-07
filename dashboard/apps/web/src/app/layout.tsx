import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'AegisAI - Enterprise DevSecOps Control Center',
  description: 'Enterprise AI DevSecOps Control Center for NovaPay',
};

const FOUC_SCRIPT = `
  (function() {
    try {
      var theme = localStorage.getItem('aegisai-theme');
      if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      var root = document.documentElement;
      root.setAttribute('data-theme', theme);
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
