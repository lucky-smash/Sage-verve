import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import '../src/styles/site.css';

/* General Sans (Indian Type Foundry, ITF Free Font License: free for commercial use), self-hosted. */
const generalSans = localFont({
  src: [
    { path: './fonts/GeneralSans-300.woff2', weight: '300', style: 'normal' },
    { path: './fonts/GeneralSans-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/GeneralSans-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/GeneralSans-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/GeneralSans-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

const description =
  'Rohit Johar, Fractional CHRO and Transformation Advisor, helps founders, CEOs and leadership teams turn people strategy into measurable business outcomes. 27+ years across Amazon India, Genpact and Syneos Health.';

export const metadata: Metadata = {
  metadataBase: new URL('https://sageverve.com'),
  title: 'SageVerve · Rohit Johar, Fractional CHRO & Transformation Advisor',
  description,
  keywords: [
    'Fractional CHRO',
    'Interim CHRO',
    'HR transformation',
    'organisation design',
    'people strategy',
    'M&A integration',
    'Rohit Johar',
    'SageVerve',
    'Gurugram',
  ],
  authors: [{ name: 'Rohit Johar' }],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SageVerve with Rohit Johar · Strategic People Leadership',
    description: 'Your people strategy should move your business forward.',
    url: 'https://sageverve.com',
    siteName: 'SageVerve',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/img/rohit-johar.png', width: 750, height: 750, alt: 'Rohit Johar' }],
  },
  twitter: {
    card: 'summary',
    title: 'SageVerve with Rohit Johar',
    description: 'Your people strategy should move your business forward.',
    images: ['/img/rohit-johar.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#F2F0E9',
  width: 'device-width',
  initialScale: 1,
};

/* Plays the intro curtain once per tab session (append ?intro to replay); never for reduced motion.
   `loader-dots` (the dot-portrait look) is the default; the on-page toggle can switch to the logo. src/client/intro.ts
   cues the exit and lifts the scroll lock; the timeout is a safety net if the client bundle never runs. */
const headScript = `var d=document.documentElement;d.classList.add('js');try{var dots=localStorage.getItem('sv-look')!=='logo';if(dots)d.classList.add('loader-dots');if((!sessionStorage.getItem('sv-intro')||/[?&]intro\\b/.test(location.search))&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro','intro-lock');sessionStorage.setItem('sv-intro','1');if(dots)setTimeout(function(){d.classList.add('intro-formed','intro-exit')},8000);setTimeout(function(){d.classList.remove('intro-lock')},dots?9000:4500)}}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // `js` (and `intro` on a first visit) is added before paint by the inline script, so the server markup can't match it.
    <html lang="en-IN" className={generalSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
